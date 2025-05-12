// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { fetchUserData, logout } from 'frontend\src\services\authService.js';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await fetchUserData();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        handleLogout(); // 에러 발생 시 로그아웃 처리
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const handleLogout = () => {
    logout();
    onLogout();
    navigate('/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading user data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300"
        >
          Logout
        </button>
      </div>

      {userData && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>User ID:</strong> {userData.uid}</p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Welcome to your Dashboard</h2>
        <p className="text-gray-700">
          You have successfully logged in using Firebase authentication with FastAPI backend integration.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;