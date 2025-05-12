// src/components/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, fetchUserData } from 'frontend\src\services\authService.js';

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const validateAuth = async () => {
      if (isAuthenticated()) {
        try {
          // 서버에 토큰 유효성 검증 요청
          await fetchUserData();
          setIsValid(true);
        } catch (error) {
          console.error('Authentication validation failed:', error);
          setIsValid(false);
        }
      } else {
        setIsValid(false);
      }
      setIsLoading(false);
    };

    validateAuth();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isValid) {
    // 인증되지 않은 경우 로그인 페이지로 리디렉션
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;