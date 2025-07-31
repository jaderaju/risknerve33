import React, { useContext, useEffect } from 'react'; // <-- Import useEffect here
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import authApi from './authApi'; // <-- Import authApi here

import HomePage from './pages/HomePage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AssetsPage from './pages/AssetsPage'; // <-- UNCOMMENT OR ADD THIS LINE

// ... other imports

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  // Add this useEffect hook to set the dummy user on app load
  useEffect(() => {
    authApi.setDummyAuth();
  }, []);

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">GRC Platform</Link>
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <span>Welcome, {user.username} ({user.role})</span>
              <Link to="/assets">Assets</Link>
              <Link to="/risks">Risks</Link>
              <Link to="/controls">Controls</Link>
              <Link to="/frameworks">Frameworks</Link>
              <Link to="/policies">Policies</Link>
              <Link to="/evidence">Evidence</Link>
              <Link to="/audits">Audits</Link>
              <Link to="/bcm">BCM</Link>
              {user.role === 'SuperAdmin' && <Link to="/users">Users</Link>}
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/unauthorized" element={<div><h1>403 - Unauthorized Access</h1><p>You do not have permission to view this page.</p></div>} />

          <Route
            path="/assets"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'ITManager', 'SecurityOfficer', 'Employee']}>
                <AssetsPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
