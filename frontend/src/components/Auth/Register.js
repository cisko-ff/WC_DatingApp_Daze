import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    gender: '',
    preferredGender: 'all'
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/register', {
        ...formData,
        age: Number(formData.age)
      });
      login(response.data.token, response.data.user);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Daze</h1>
        <h4>Register</h4>
        <p>
          
        </p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="18"
              max="100"
            />
          </div>
          <div className="form-group">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <select
              name="preferredGender"
              value={formData.preferredGender}
              onChange={handleChange}
              required
            >
              <option value="all">Interested in: All</option>
              <option value="male">Interested in: Male</option>
              <option value="female">Interested in: Female</option>
              <option value="other">Interested in: Other</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
      <style>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg,rgb(234, 102, 133) 0%,rgb(198, 151, 19) 100%);
        }
        .auth-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        .auth-card h1 {
          text-align: center;
          color:rgb(241, 99, 196);
          margin-bottom: 10px;
        }
        .auth-card h2 {
          text-align: center;
          margin-bottom: 30px;
          color: #333;
        }
        .form-group {
          margin-bottom: 20px;
        }
        select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }
        .error-message {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .auth-card p {
          text-align: center;
          margin-top: 20px;
        }
        .auth-card a {
          color:rgb(241, 99, 196);
          text-decoration: none;
        }
        .auth-card a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export default Register;









