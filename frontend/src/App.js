import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import authApi from './api/authApi';

import HomePage from './pages/HomePage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AssetsPage from './pages/AssetsPage';

// Placeholder Pages (These would be your actual page components)
const RisksPage = () => <h1>Risks Management</h1>;
const ControlsPage = () => <h1>Controls Library</h1>;
const FrameworksPage = () => <h1>Compliance Frameworks</h1>;
const PoliciesPage = () => <h1>Policy Management</h1>;
const EvidencePage = () => <h1>Evidence Repository</h1>;
const AuditsPage = () => <h1>Audit Management</h1>;
const BcmPage = () => <h1>Business Continuity Management</h1>;
const UsersPage = () => <h1>User Management</h1>;

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

  useEffect(() => {
    // Set the dummy user for development
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

          {/* Protected Routes with Role-Based Access Control */}
          <Route
            path="/assets"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'ITManager', 'SecurityOfficer', 'Employee']}>
                <AssetsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/risks"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'RiskManager', 'SecurityOfficer']}>
                <RisksPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/controls"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'ITManager', 'SecurityOfficer']}>
                <ControlsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/frameworks"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'RiskManager', 'SecurityOfficer']}>
                <FrameworksPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/policies"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'RiskManager', 'SecurityOfficer', 'Employee']}>
                <PoliciesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/evidence"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'SecurityOfficer', 'Employee']}>
                <EvidencePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/audits"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'Auditor']}>
                <AuditsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/bcm"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'BCMManager']}>
                <BcmPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin']}>
                <UsersPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
