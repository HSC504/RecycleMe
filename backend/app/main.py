from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import python_auth, recycling, points
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
cred = credentials.Certificate(r"D:\student\midleproject\RecycleMe-2\recyleme-423ce-firebase-adminsdk-fbsvc-7c887c7d6e.json")  # Firebase 서비스 계정 키 파일 경로
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

# Include routes
app.include_router(python_auth.router, prefix="/auth")
app.include_router(recycling.router, prefix="/recycle")
app.include_router(points.router, prefix="/points")

# Add a root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to RecycleMe Backend"}