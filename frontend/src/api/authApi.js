import axios from 'axios';

// Get base URL from environment variable.
// This should ONLY be the backend's domain, e.g., 'http://localhost:5000'
const API_BASE_DOMAIN = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5000';

const register = async (userData) => {
  // Construct the FULL correct path including /api/auth
  const response = await axios.post(
    `${API_BASE_DOMAIN}/api/auth/register`,
    userData,
    { withCredentials: true }             // <--- ADD THIS
  );
  return response.data;
};

const login = async (userData) => {
  // Construct the FULL correct path including /api/auth
  const response = await axios.post(
    `${API_BASE_DOMAIN}/api/auth/login`,
    userData,
    { withCredentials: true }             // <--- ADD THIS
  );
  return response.data;
};

// =====================================================================
// DUMMY LOGIN FOR DEVELOPMENT - REMOVE FOR PRODUCTION
// =====================================================================

const setDummyAuth = () => {
  const dummyUser = {
    _id: 'dev_user_123',
    username: 'Dev User',
    email: 'dev@example.com',
    token: 'dummy-development-token'
  };
  localStorage.setItem('user', JSON.stringify(dummyUser));
};

const authApi = {
  register,
  login,
  setDummyAuth, // Expose the dummy function
};

export default authApi;
