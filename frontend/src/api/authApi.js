import axios from 'axios';

// Get base URL from environment variable
const API_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5000/api/auth';

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/api/register`, userData);
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(`${API_URL}/api/login`, userData);
  return response.data;
};

const authApi = {
  register,
  login,
};

export default authApi;
