import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // 1. Firebase 인증
      const userCredential = isNewUser
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Firebase에서 ID 토큰 가져오기
      const idToken = await userCredential.user.getIdToken();
      
      // 3. FastAPI 백엔드에 ID 토큰 전송하여 서버 세션 설정
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: idToken,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Server authentication failed');
      }
      
      // 4. 서버에서 반환한 토큰 저장
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      
      // 5. 로그인 성공 처리
      onLoginSuccess(userCredential.user);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isNewUser ? 'Create Account' : 'Login'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
        >
          {isLoading ? 'Processing...' : (isNewUser ? 'Create Account' : 'Login')}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsNewUser(!isNewUser)}
          className="text-blue-500 hover:underline"
        >
          {isNewUser
            ? 'Already have an account? Login'
            : 'Need an account? Create one'}
        </button>
      </div>
    </div>
  );
};

export default Login;