# 토큰 검증 유틸 함수---------------------------------------------------------------------------
from firebase_admin import auth as firebase_auth
from fastapi import HTTPException, status, Depends, Request

def verify_firebase_token(request: Request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    
    parts = auth_header.split()
    if parts[0].lower() != "bearer" or len(parts) != 2:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header format")
    
    id_token = parts[1]
    
    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        return decoded_token  # includes uid, email, etc.
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
# --------------------------------------------------------------------------------------------

from fastapi import APIRouter, Depends, Request

router = APIRouter()

@router.get("/me")
async def get_current_user(user=Depends(verify_firebase_token)):
    return {"uid": user["uid"], "email": user["email"]}
