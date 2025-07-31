import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5000/api';

function UsersList({ onSelectUser, currentSelectedUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <p>Login to view users.</p>;
  }

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="users-list-selector">
      <select
        value={currentSelectedUserId || ''}
        onChange={(e) => {
          const selectedUser = users.find(u => u._id === e.target.value);
          onSelectUser(selectedUser);
        }}
        required
      >
        <option value="">-- Select an Owner --</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.username} ({user.email})
          </option>
        ))}
      </select>
    </div>
  );
}

export default UsersList;
