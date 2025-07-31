import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import HomePage from './pages/HomePage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AssetsPage from './pages/AssetsPage'; // <-- UNCOMMENT OR ADD THIS LINE

// Import pages for other modules (will be created later)
// import RisksPage from './pages/RisksPage';
// import ControlsPage from './pages/ControlsPage';
// import FrameworksPage from './pages/FrameworksPage';
// import PoliciesPage from './pages/PoliciesPage';
// import EvidencePage from './pages/EvidencePage';
// import AuditsPage from './pages/AuditsPage';
// import BCMPage from './pages/BCMPage';
// import UsersPage from './pages/UsersPage'; // For SuperAdmin to manage users

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading authentication...</div>; // Or a spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />; // Redirect to an unauthorized page
  }

  return children;
};

function App() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">GRC Platform</Link>
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <span>Welcome, {user.username} ({user.role})</span>
              <Link to="/assets">Assets</Link> {/* <-- UNCOMMENT OR ADD THIS LINE */}
              <Link to="/risks">Risks</Link>
              <Link to="/controls">Controls</Link>
              <Link to="/frameworks">Frameworks</Link>
              <Link to="/policies">Policies</Link>
              <Link to="/evidence">Evidence</Link>
              <Link to="/audits">Audits</Link>
              <Link to="/bcm">BCM</Link>
              {user.role === 'SuperAdmin' && <Link to="/users">Users</Link>} {/* Admin user management */}
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

          {/* Protected Routes - Examples */}
          <Route // <-- UNCOMMENT OR ADD THIS BLOCK
            path="/assets"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'ITManager', 'SecurityOfficer', 'Employee']}>
                <AssetsPage />
              </PrivateRoute>
            }
          />
          {/* <Route
            path="/risks"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'RiskManager', 'ComplianceOfficer', 'AuditManager']}>
                <RisksPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/controls"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'ComplianceOfficer', 'ControlOwner', 'AuditManager']}>
                <ControlsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/frameworks"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'ComplianceOfficer', 'AuditManager']}>
                <FrameworksPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/policies"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'ComplianceOfficer', 'Employee']}>
                <PoliciesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/evidence"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'AuditManager', 'ComplianceOfficer', 'Employee']}>
                <EvidencePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/audits"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'AuditManager', 'ComplianceOfficer']}>
                <AuditsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/bcm"
            element={
              <PrivateRoute allowedRoles={['SuperAdmin', 'BCMManager', 'Employee']}>
                <BCMPage />
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
          /> */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
