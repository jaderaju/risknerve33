import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import authApi from '../api/authApi';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee'); // Default role
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const data = await authApi.register({ username, email, password, role, department });
      login(data.token); // Store token and user info in context
      navigate('/'); // Redirect to home page
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Employee">Employee</option>
            <option value="ITManager">IT Manager</option>
            <option value="SecurityOfficer">Security Officer</option>
            <option value="RiskManager">Risk Manager</option>
            <option value="ComplianceOfficer">Compliance Officer</option>
            <option value="ControlOwner">Control Owner</option>
            <option value="AuditManager">Audit Manager</option>
            <option value="BCMManager">BCM Manager</option>
            <option value="SuperAdmin">SuperAdmin</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="department">Department (Optional):</label>
          <input
            type="text"
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterForm;
