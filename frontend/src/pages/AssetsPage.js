import React, { useState, useEffect, useContext } from 'react';
import assetApi from '../api/assetApi';
import { AuthContext } from '../AuthContext';
import UsersList from '../components/UsersList'; // We'll assume this exists or create a simple one.

function AssetsPage() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);

  // Form states for new/edit asset
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Hardware');
  const [classification, setClassification] = useState('Confidential');
  const [owner, setOwner] = useState(''); // User ID
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('Operational');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAssets();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await assetApi.getAssets(localStorage.getItem('token'));
      setAssets(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assets');
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await assetApi.createAsset(
        { name, description, type, classification, owner, location, status },
        localStorage.getItem('token')
      );
      setShowAddForm(false);
      resetForm();
      fetchAssets(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add asset');
      console.error('Error adding asset:', err);
    }
  };

  const handleEditAsset = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await assetApi.updateAsset(
        currentAsset._id,
        { name, description, type, classification, owner, location, status },
        localStorage.getItem('token')
      );
      setShowEditForm(false);
      resetForm();
      fetchAssets(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update asset');
      console.error('Error updating asset:', err);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      setError('');
      try {
        await assetApi.deleteAsset(id, localStorage.getItem('token'));
        fetchAssets(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete asset');
        console.error('Error deleting asset:', err);
      }
    }
  };

  const openEditForm = (asset) => {
    setCurrentAsset(asset);
    setName(asset.name);
    setDescription(asset.description);
    setType(asset.type);
    setClassification(asset.classification);
    setOwner(asset.owner?._id || ''); // Populate owner ID if available
    setLocation(asset.location);
    setStatus(asset.status);
    setShowEditForm(true);
    setShowAddForm(false); // Close add form if open
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setType('Hardware');
    setClassification('Confidential');
    setOwner('');
    setLocation('');
    setStatus('Operational');
    setCurrentAsset(null);
    setError('');
  };

  if (!isAuthenticated) {
    return <p>Please log in to view assets.</p>;
  }

  if (loading) {
    return <p>Loading assets...</p>;
  }

  return (
    <div className="page-container">
      <h1>Asset Management</h1>

      <button className="btn btn-primary" onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); resetForm(); }}>
        {showAddForm ? 'Cancel Add Asset' : 'Add New Asset'}
      </button>

      {error && <p className="error-message">{error}</p>}

      {(showAddForm || showEditForm) && (
        <div className="form-card">
          <h2>{showEditForm ? 'Edit Asset' : 'Add Asset'}</h2>
          <form onSubmit={showEditForm ? handleEditAsset : handleAddAsset}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="type">Type:</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Data">Data</option>
                <option value="Network">Network</option>
                <option value="Personnel">Personnel</option>
                <option value="Physical">Physical</option>
                <option value="Document">Document</option>
                <option value="Service">Service</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="classification">Classification:</label>
              <select id="classification" value={classification} onChange={(e) => setClassification(e.target.value)}>
                <option value="Confidential">Confidential</option>
                <option value="Internal">Internal</option>
                <option value="Public">Public</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="owner">Owner:</label>
              {/* This is the updated part, using the UsersList component */}
              <UsersList onSelectUser={(selectedUser) => setOwner(selectedUser ? selectedUser._id : '')} currentSelectedUserId={owner} />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location:</label>
              <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status:</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Operational">Operational</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Decommissioned">Decommissioned</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>
            <button type="submit">{showEditForm ? 'Update Asset' : 'Add Asset'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { showEditForm ? setShowEditForm(false) : setShowAddForm(false); resetForm(); }}>
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        {assets.length === 0 ? (
          <p>No assets found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Classification</th>
                <th>Owner</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset._id}>
                  <td>{asset.name}</td>
                  <td>{asset.type}</td>
                  <td>{asset.classification}</td>
                  <td>{asset.owner ? asset.owner.username : 'N/A'}</td>
                  <td>{asset.location}</td>
                  <td>{asset.status}</td>
                  <td className="actions">
                    <button className="btn btn-sm btn-edit" onClick={() => openEditForm(asset)}>Edit</button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDeleteAsset(asset._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AssetsPage;
