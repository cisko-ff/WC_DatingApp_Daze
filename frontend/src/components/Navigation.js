import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const location = useLocation();
  // const { user, logout } = useAuth(); // user was unused, commented for lint clean
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/discovery" className="nav-brand">
          <span className="brand-name">Daze</span>
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/discovery" 
            className={`nav-link ${isActive('/discovery') ? 'active' : ''}`}
          >
            <span className="nav-text">Discover</span>
          </Link>
          <Link 
            to="/matches" 
            className={`nav-link ${isActive('/matches') ? 'active' : ''}`}
          >
            <span className="nav-text">Flirts</span>
          </Link>
          <Link 
            to="/messages" 
            className={`nav-link ${isActive('/messages') ? 'active' : ''}`}
          >
            <span className="nav-text">Get to Know</span>
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
          >
            <span className="nav-text">You</span>
          </Link>
        </div>

        <div className="nav-user">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
      <style>{`
        .main-nav {
          background: linear-gradient(135deg,rgb(226, 69, 203) 0%,rgb(162, 75, 89) 100%);
          padding: 0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 70px;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: white;
          font-family: lucida handwriting;
          font-size: 24px;
          font-weight: bold;
        }
        .nav-links {
          display: flex;
          gap: 8px;
          flex: 1;
          justify-content: center;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          text-decoration: none;
          color: white;
          transition: all 0.3s;
          font-weight: 500;
          font-size: 15px;
        }
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }
        .nav-link.active {
          background: rgba(255, 255, 255, 0.25);
          font-weight: 600;
        }
        .nav-icon {
          font-size: 20px;
        }
        .nav-text {
          display: inline-block;
        }
        .nav-user {
          display: flex;
          align-items: center;
        }
        .logout-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid white;
          color: white;
          padding: 10px 20px;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .logout-btn:hover {
          background: white;
          color:rgb(234, 102, 166);
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .nav-text {
            display: none;
          }
          .nav-brand .brand-name {
            display: none;
          }
          .nav-links {
            gap: 4px;
          }
          .nav-link {
            padding: 12px 16px;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navigation;








