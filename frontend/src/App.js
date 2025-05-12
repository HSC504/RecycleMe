import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import StartPage from './components/StartPage';
import Scanner from './components/Scanner';
import Results from './components/Results';
import Login from './components/Login';
import BatteryRedirect from './components/BatteryRedirect';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 앱 초기화 시 인증 상태 확인
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      if (isAuth) {
        // 사용자 정보는 필요할 때 fetchUserData로 가져올 수 있음
        setUser({ isLoggedIn: true });
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (user) => {
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const App = () => {
    const [currentPage, setCurrentPage] = useState('start');
    const [scanResult, setScanResult] = useState(null);

    const handleStart = () => {
      setCurrentPage('scanner');
    };

    const handleScanResults = (result) => {
      setScanResult(result);
      setCurrentPage('results');
    };

    const handleLogin = () => {
      setCurrentPage('login');
    };

    const handleLoginSuccess = (user) => {
      // TODO: Implement point tracking or further user actions
      console.log('Logged in user:', user);
      // For now, just go back to start
      setCurrentPage('start');
    };

    const handleScanAgain = () => {
      setCurrentPage('scanner');
    };

    const handleBatteryBack = () => {
      setCurrentPage('scanner');
    };

    // Render the appropriate page based on current state
    const renderPage = () => {
      switch (currentPage) {
        case 'start':
          return <StartPage onStart={handleStart} />;
        case 'scanner':
          return <Scanner onResults={handleScanResults} />;
        case 'results':
          return (
            <Results 
              result={scanResult} 
              onLogin={handleLogin} 
              onScanAgain={handleScanAgain} 
            />
          );
        case 'login':
          return <Login onLoginSuccess={handleLoginSuccess} />;
        case 'battery':
          return <BatteryRedirect onBack={handleBatteryBack} />;
        default:
          return <StartPage onStart={handleStart} />;
      }
    };
    


    return (
      <>
        <Router>
          <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/results" element={<Results />} />
            <Route path="/login" element={<Login />} />
            <Route path="/battery" element={<BatteryRedirect />} />
            <Route path="/recycle" element={<StartPage />} />
            <Route path="/login" element={
                user ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </Router>
        
        <div className="App">
          {renderPage()}
        </div>
      </>
    );
  };
}

export default App;