import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <Navigation />
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome back, {user?.name}!</h2>
          <p>Ready to find your perfect match?</p>
          <div className="dashboard-buttons">
            <Link to="/discovery" className="btn-primary">Start Discovering</Link>
            <Link to="/matches" className="btn-outline">View Matches</Link>
          </div>
        </div>
      </div>
      <style>{`
        .dashboard-content {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
        }
        .welcome-card {
          background: white;
          border-radius: 16px;
          padding: 60px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        .welcome-card h2 {
          font-size: 36px;
          margin-bottom: 16px;
          color: #333;
        }
        .welcome-card p {
          font-size: 20px;
          color: #666;
          margin-bottom: 40px;
        }
        .dashboard-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
        }
        .dashboard-buttons a {
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;

