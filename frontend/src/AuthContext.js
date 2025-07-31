import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // To handle initial token check

  // Function to save token and user info
  const login = (token) => {
    localStorage.setItem('token', token);
    const decodedUser = jwt_decode(token);
    setUser(decodedUser);
    setIsAuthenticated(true);
    // Set axios default header for all subsequent requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Function to clear token and user info
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Check for token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwt_decode(token);
        // Check if token is expired
        if (decodedUser.exp * 1000 < Date.now()) {
          logout(); // Token expired
        } else {
          setUser(decodedUser);
          setIsAuthenticated(true);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
    setLoading(false); // Finished checking for token
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
