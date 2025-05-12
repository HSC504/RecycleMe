// src/services/authService.js

// API 요청에 인증 토큰을 추가하는 헤더 생성
export const authHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 사용자 정보 가져오기
export const fetchUserData = async () => {
  const response = await fetch('http://localhost:8000/api/user', {
    method: 'GET',
    headers: {
      ...authHeader(),
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }

  return await response.json();
};

// 로그아웃
export const logout = () => {
  // 로컬 스토리지에서 토큰 제거
  localStorage.removeItem('access_token');
};

// 인증 여부 확인
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};