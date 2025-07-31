import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5000/api';

const getAssets = async (token) => {
  const response = await axios.get(`${API_URL}/assets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getAssetById = async (id, token) => {
  const response = await axios.get(`${API_URL}/assets/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const createAsset = async (assetData, token) => {
  const response = await axios.post(`${API_URL}/assets`, assetData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const updateAsset = async (id, assetData, token) => {
  const response = await axios.put(`${API_URL}/assets/${id}`, assetData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const deleteAsset = async (id, token) => {
  const response = await axios.delete(`${API_URL}/assets/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const assetApi = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
};

export default assetApi;
