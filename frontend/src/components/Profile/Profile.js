import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Navigation from '../Navigation';

function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    interests: '',
    gender: '',
    preferredGender: 'all'
  });
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || '',
        bio: user.bio || '',
        interests: (user.interests || []).join(', '),
        gender: user.gender || '',
        preferredGender: user.preferredGender || 'all'
      });
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile/picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        updateUser(data.user);
        setMessage('Profile picture updated successfully!');
      } else {
        setMessage(data.error || 'Failed to upload image');
      }
    } catch (err) {
      setMessage('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const updateData = {
        ...formData,
        age: Number(formData.age),
        interests: formData.interests.split(',').map(i => i.trim()).filter(i => i)
      };

      const response = await api.put('/users/profile', updateData);
      updateUser(response.data);
      setMessage('Profile updated successfully!');
      
      setTimeout(() => {
        navigate('/discovery');
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update profile');
    }
  };

  return (
    <div>
      <Navigation />
      <div className="app-container">
        <div className="profile-header-card">
          <div className="profile-picture-section">
            <div className="profile-picture-wrapper">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="profile-picture-large" />
              ) : (
                <div className="profile-picture-placeholder">
                  <span className="placeholder-icon">👤</span>
                </div>
              )}
              <button 
                type="button"
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : '📷 Upload Photo'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <h1>Edit Your Profile</h1>
          <p>Make your profile stand out!</p>
        </div>

        <div className="card">
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="18"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="form-group">
              <label>Interests (comma-separated)</label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="e.g., Reading, Travel, Music"
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Gender</label>
              <select name="preferredGender" value={formData.preferredGender} onChange={handleChange}>
                <option value="all">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Profile</button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        .profile-header-card {
          background: linear-gradient(1135deg,rgb(234, 102, 133) 0%,rgb(198, 151, 19) 100%);
          border-radius: 20px;
          padding: 50px;
          text-align: center;
          margin-bottom: 30px;
          color: white;
        }
        .profile-picture-section {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        .profile-picture-wrapper {
          position: relative;
        }
        .profile-picture-large {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 5px solid white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        .profile-picture-placeholder {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 5px solid white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        .placeholder-icon {
          font-size: 60px;
        }
        .upload-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          background: white;
          color:  #e8689f;
          border: none;
          padding: 10px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: all 0.3s;
        }
        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
        }
        .upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .profile-header-card h1 {
          font-size: 36px;
          margin-bottom: 10px;
        }
        .profile-header-card p {
          font-size: 18px;
          opacity: 0.9;
        }
        .message {
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .message.success {
          background:rgb(249, 209, 250);
          color:rgb(95, 6, 74);
        }
        .message.error {
          background: #fee;
          color: #c33;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }
        select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }
        textarea {
          resize: vertical;
        }
        .form-actions {
          margin-top: 30px;
        }
      `}</style>
    </div>
  );
}

export default Profile;

