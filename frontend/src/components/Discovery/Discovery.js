import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import Navigation from '../Navigation';

function Discovery() {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchPopup, setMatchPopup] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const deltaRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users/discovery');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setLoading(false);
    }
  };

  const handleLike = async (userId) => {
    try {
      const response = await api.post(`/users/${userId}/like`);
      if (response.data.match) {
        setMatchPopup(true);
      }
      nextUser();
    } catch (error) {
      console.error('Error liking user:', error);
    }
  };

  const handlePass = async (userId) => {
    try {
      await api.post(`/users/${userId}/pass`);
      nextUser();
    } catch (error) {
      console.error('Error passing user:', error);
    }
  };

  const nextUser = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      loadUsers();
      setCurrentIndex(0);
    }
    // reset drag state when advancing
    setDragX(0);
    setDragY(0);
    setIsDragging(false);
  };

  const currentUser = users[currentIndex];

  const swipeThreshold = 100; // px horizontal movement to trigger action

  const onTouchStart = (e) => {
    const touch = e.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
  };

  const onTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPosRef.current.x;
    const deltaY = touch.clientY - startPosRef.current.y;
    setDragX(deltaX);
    setDragY(deltaY);
    deltaRef.current = { x: deltaX, y: deltaY };
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    handleRelease(deltaRef.current.x);
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    startPosRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    // attach listeners to window to capture outside the card
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp, { once: true });
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    setDragX(deltaX);
    setDragY(deltaY);
    deltaRef.current = { x: deltaX, y: deltaY };
  };

  const onMouseUp = (e) => {
    if (!isDragging) return;
    window.removeEventListener('mousemove', onMouseMove);
    const deltaX = (e && typeof e.clientX === 'number')
      ? e.clientX - startPosRef.current.x
      : deltaRef.current.x;
    handleRelease(deltaX);
  };

  const handleRelease = (releaseDeltaX) => {
    setIsDragging(false);
    const effectiveDx = typeof releaseDeltaX === 'number' ? releaseDeltaX : dragX;
    if (effectiveDx > swipeThreshold && currentUser) {
      // swipe right -> like
      animateOffScreen('right');
      handleLike(currentUser._id);
      return;
    }
    if (effectiveDx < -swipeThreshold && currentUser) {
      // swipe left -> pass
      animateOffScreen('left');
      handlePass(currentUser._id);
      return;
    }
    // not enough swipe, snap back
    setDragX(0);
    setDragY(0);
  };

  const animateOffScreen = (direction) => {
    if (!cardRef.current) return;
    const node = cardRef.current;
    const distance = direction === 'right' ? window.innerWidth : -window.innerWidth;
    node.style.transition = 'transform 300ms ease-out, opacity 300ms ease-out';
    node.style.transform = `translate(${distance}px, ${dragY}px) rotate(${distance > 0 ? 20 : -20}deg)`;
    node.style.opacity = '0';
    // reset after animation for next card
    setTimeout(() => {
      if (node) {
        node.style.transition = '';
        node.style.transform = '';
        node.style.opacity = '';
      }
      setDragX(0);
      setDragY(0);
    }, 320);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!currentUser) {
    return (
      <div>
        <Navigation />
        <div className="discovery-empty">
          <div className="empty-state-card">
            <div className="empty-icon"></div>
            <h2>No More Users</h2>
            <p>You've seen everyone! Check back later.</p>
          </div>
        </div>
        <style>{`
          .discovery-empty {
            padding: 40px 20px;
            min-height: calc(100vh - 70px);
            background: linear-gradient(135deg,rgb(234, 102, 133) 0%,rgb(198, 151, 19) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .empty-state-card {
            background: white;
            border-radius: 24px;
            padding: 60px 40px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          }
          .empty-icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          .empty-state-card h2 {
            font-size: 32px;
            margin-bottom: 16px;
            color: #333;
          }
          .empty-state-card p {
            font-size: 18px;
            color: #666;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="discovery">
      <div
        className="discovery-card"
        ref={cardRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        style={{
          cursor: 'grab',
          transform: `translate(${dragX}px, ${dragY}px) rotate(${dragX * 0.05}deg)`,
          transition: isDragging ? 'none' : 'transform 180ms ease',
          userSelect: 'none'
        }}
      >
        <div className="profile-picture-section">
          {currentUser.profilePicture ? (
            <img src={currentUser.profilePicture} alt={currentUser.name} className="discovery-profile-picture" draggable={false} />
          ) : (
            <div className="discovery-profile-placeholder">👤</div>
          )}
        </div>
        <div className="user-info">
          <h2>{currentUser.name}</h2>
          <p className="age">{currentUser.age} years old</p>
          {currentUser.bio && <p className="bio">{currentUser.bio}</p>}
          {currentUser.interests && currentUser.interests.length > 0 && (
            <div className="interests">
              {currentUser.interests.map((interest, i) => (
                <span key={i} className="interest-tag">{interest}</span>
              ))}
            </div>
          )}
        </div>
        {/* Swipe left to pass, right to like */}
      </div>
      </div>

      {matchPopup && (
        <div className="match-popup" onClick={() => setMatchPopup(false)}>
          <div className="match-popup-content">
            <h2>🎉 It's a Match!</h2>
            <p>You both liked each other!</p>
            <button className="btn-primary" onClick={() => setMatchPopup(false)}>
              Continue
            </button>
          </div>
        </div>
      )}

      <style>{`
        .discovery {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 70px);
          padding: 20px;
          background: linear-gradient(135deg,rgb(234, 102, 133) 0%,rgb(198, 151, 19) 100%);
        }
        .discovery-card {
          background: white;
          border-radius: 24px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          touch-action: pan-y; /* allow vertical scroll, we handle horizontal */
        }
        .profile-picture-section {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }
        .discovery-profile-picture {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          object-fit: cover;
          border: 5px solid #e8689f;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        .discovery-profile-placeholder {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 100px;
          border: 5px solid #e8689f;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        .user-info {
          text-align: center;
        }
        .user-info h2 {
          font-size: 32px;
          margin-bottom: 8px;
          color: #333;
        }
        .age {
          font-size: 20px;
          color: #666;
          margin-bottom: 16px;
        }
        .bio {
          color: #555;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .interests {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 30px;
        }
        .interest-tag {
          background: #f3f4f6;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          color: #333;
        }
        /* buttons removed in favor of swipe */
        .match-popup {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .match-popup-content {
          background: white;
          border-radius: 24px;
          padding: 60px 40px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        .match-popup-content h2 {
          font-size: 48px;
          color:rgb(190, 22, 126);
          margin-bottom: 16px;
        }
        .no-more-users {
          text-align: center;
          color: white;
        }
        .loading {
          text-align: center;
          color: white;
          font-size: 24px;
        }
      `}</style>
    </div>
  );
}

export default Discovery;

