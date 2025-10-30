import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Navigation from '../Navigation';

function Matches() {
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
        <h2>Your Matches</h2>
        {matches.length === 0 ? (
          <div className="empty-matches-state">
            <div className="empty-state-icon"></div>
            <h2>No Matches Yet</h2>
            <p>Start discovering people and find your perfect match!</p>
          </div>
        ) : (
          <div className="matches-grid">
            {matches.map((match) => (
              <div key={match.user._id} className="match-card">
                {match.user.profilePicture ? (
                  <img src={match.user.profilePicture} alt={match.user.name} className="match-profile-picture" />
                ) : (
                  <div className="match-profile-placeholder">👤</div>
                )}
                <Link
                  to={`/chat/${match.user._id}`}
                >
                <h3>{match.user.name}</h3>
                </Link>
                <p className="age">{match.user.age} years old</p>
                {match.user.bio && <p className="bio">{match.user.bio}</p>}
                {match.user.interests && match.user.interests.length > 0 && (
                  <div className="interests">
                    {match.user.interests.map((interest, i) => (
                      <span key={i} className="interest-tag">{interest}</span>
                    ))}
                  </div>
                )}
                
                  
                
              </div>
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
        .empty-matches-state {
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
        .empty-matches-state h2 {
          font-size: 32px;
          margin-bottom: 16px;
          color: white;
        }
        .empty-matches-state p {
          font-size: 18px;
          margin-bottom: 40px;
          opacity: 0.95;
        }
        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .match-card {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
          text-align: center;
        }
        .match-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        .match-profile-picture {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          margin: 0 auto 20px;
          border: 4px solid #e8689f;
        }
        .match-profile-placeholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 60px;
          border: 4px solid #e8689f;
        }
        .match-card h3 {
          font-size: 24px;
          margin-bottom: 8px;
          color: #333;
        }
        .age {
          color: #666;
          margin-bottom: 16px;
        }
        .bio {
          color: #555;
          margin-bottom: 16px;
          line-height: 1.6;
        }
        .interests {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .interest-tag {
          background: #f3f4f6;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 14px;
          color: #333;
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

export default Matches;

