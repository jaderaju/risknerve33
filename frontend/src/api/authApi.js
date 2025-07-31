import axios from 'axios';

// Get base URL from environment variable.
// This should ONLY be the backend's domain, e.g., 'http://localhost:5000'
const API_BASE_DOMAIN = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5000';

const register = async (userData) => {
  // Construct the FULL correct path including /api/auth
  const response = await axios.post(`${API_BASE_DOMAIN}/api/auth/register`, userData);
  return response.data;
};

const login = async (userData) => {
  // Construct the FULL correct path including /api/auth
  const response = await axios.post(`${API_BASE_DOMAIN}/api/auth/login`, userData);
  return response.data;
};

const authApi = {
  register,
  login,
};

export default authApi;
