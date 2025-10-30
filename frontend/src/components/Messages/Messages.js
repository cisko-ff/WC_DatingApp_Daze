import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Navigation from '../Navigation';

function Messages() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await api.get('/users/matches');
      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading matches:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <Navigation />
      <div className="app-container">
        <h2>Your Conversations</h2>
        {matches.length === 0 ? (
          <div className="empty-messages-state">
            <div className="empty-state-icon">💬</div>
            <h2>No Conversations Yet</h2>
            <p>Start discovering and get matched to start chatting!</p>
            <Link to="/discovery" className="btn-primary">Start Discovering</Link>
          </div>
        ) : (
          <div className="matches-list">
            {matches.map((match) => (
              <Link
                key={match.user._id}
                to={`/chat/${match.user._id}`}
                className="match-item"
              >
                {match.user.profilePicture ? (
                  <img src={match.user.profilePicture} alt={match.user.name} className="message-avatar" />
                ) : (
                  <div className="message-avatar-placeholder">👤</div>
                )}
                <div className="match-info">
                  <h3>{match.user.name}</h3>
                  <p className="age">{match.user.age} years old</p>
                  {match.user.bio && <p className="bio">{match.user.bio}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <style>{`
        h2 {
          font-size: 36px;
          margin-bottom: 30px;
          color: #333;
        }
        .empty-messages-state {
          text-align: center;
          padding: 80px 40px;
          background: linear-gradient(135deg,rgb(234, 102, 133) 0%,rgb(198, 151, 19) 100%);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          color: white;
        }
        .empty-state-icon {
          font-size: 100px;
          margin-bottom: 20px;
        }
        .empty-messages-state h2 {
          font-size: 32px;
          margin-bottom: 16px;
          color: white;
        }
        .empty-messages-state p {
          font-size: 18px;
          margin-bottom: 40px;
          opacity: 0.95;
        }
        .matches-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .match-item {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s, box-shadow 0.2s;
          gap: 20px;
        }
        .match-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .message-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e8689f;
          flex-shrink: 0;
        }
        .message-avatar-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          flex-shrink: 0;
          border: 2px solid #e8689f;
        }
        .match-info {
          flex: 1;
        }
        .match-info h3 {
          font-size: 20px;
          margin-bottom: 4px;
          color: #333;
        }
        .age {
          color: #666;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .bio {
          color: #888;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 500px;
        }
        .loading {
          text-align: center;
          padding: 40px;
          font-size: 20px;
        }
      `}</style>
    </div>
  );
}

export default Messages;

