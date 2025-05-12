from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import auth, recycling, points
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth
import os
from typing import Optional
import jwt
from datetime import datetime, timedelta

# Firebase 초기화
cred = credentials.Certificate("path/to/your/firebase-adminsdk.json")  # Firebase 서비스 계정 키 파일 경로
firebase_admin.initialize_app(cred)

app = FastAPI()

# CORS to allow frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT 설정
SECRET_KEY = "your_secret_key"  # 안전한 비밀 키로 변경해야 함
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 모델 정의
class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenData(BaseModel):
    uid: Optional[str] = None
    
class UserData(BaseModel):
    email: str
    uid: str
    
class FirebaseToken(BaseModel):
    id_token: str

# 사용자 인증 함수
async def verify_firebase_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# 내부용 JWT 토큰 생성
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid = payload.get("sub")
        if uid is None:
            raise credentials_exception
        token_data = TokenData(uid=uid)
    except jwt.PyJWTError:
        raise credentials_exception
        
    return token_data

# API 엔드포인트
@app.post("/api/login", response_model=Token)
async def login(firebase_token: FirebaseToken):
    # Firebase 토큰 검증
    decoded_token = await verify_firebase_token(firebase_token.id_token)
    
    # JWT 토큰 생성
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": decoded_token["uid"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/user", response_model=UserData)
async def get_user_data(current_user: TokenData = Depends(get_current_user)):
    try:
        # Firebase에서 사용자 정보 가져오기
        user = auth.get_user(current_user.uid)
        return {"email": user.email, "uid": user.uid}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )


# Include routes
app.include_router(auth.router, prefix="/auth")
app.include_router(recycling.router, prefix="/recycle")
app.include_router(points.router, prefix="/points")

# Serve React build files
app.mount("/", StaticFiles(directory="../frontend/build", html=True), name="static")

# Add a root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to RecycleMe Backend"}