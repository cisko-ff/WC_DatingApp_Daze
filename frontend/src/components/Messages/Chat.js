import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Navigation from '../Navigation';

function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    loadOtherUser();
    
    if (!user || !user.id) {
      console.error('User not available');
      return;
    }
    
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected, joining room:', user.id);
      newSocket.emit('join-room', user.id);
    });

    newSocket.on('receive-message', (message) => {
      console.log('Received message:', message);
      // Only add message if it's for this conversation
      if (message.sender._id === userId || message.receiver._id === userId) {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some(m => m._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });

    return () => {
      newSocket.close();
    };
  }, [userId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await api.get(`/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadOtherUser = async () => {
    try {
      const response = await api.get(`/users/matches`);
      const match = response.data.find(m => m.user._id === userId);
      if (match) {
        setOtherUser(match.user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // Send message via API
      const response = await api.post(`/messages/${userId}`, {
        content: messageText
      });
      
      // Add message to local state immediately
      setMessages((prev) => [...prev, response.data]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setNewMessage(messageText);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="chat-container">
        {otherUser && (
          <div className="chat-header">
            <button onClick={() => navigate('/messages')} className="back-button">
              ← Back
            </button>
            <div className="chat-header-user">
              {otherUser.profilePicture ? (
                <img src={otherUser.profilePicture} alt={otherUser.name} className="chat-header-avatar" />
              ) : (
                <div className="chat-header-avatar-placeholder">👤</div>
              )}
              <div>
                <h3>{otherUser.name}</h3>
                <p>{otherUser.age} years old</p>
              </div>
            </div>
          </div>
        )}
        <div className="messages-container">
          {messages.map((message, index) => {
            const isOwn = message.sender._id === user?._id;
            return (
              <div key={message._id || index} className={`message ${isOwn ? 'own-message' : 'other-message'}`}>
                {!isOwn && (
                  <div className="sender-info">
                    {message.sender.profilePicture ? (
                      <img src={message.sender.profilePicture} alt={message.sender.name} className="sender-avatar" />
                    ) : (
                      <div className="sender-avatar-placeholder">👤</div>
                    )}
                    <span className="sender-name">{message.sender.name}</span>
                  </div>
                )}
                <div className="message-content">{message.content}</div>
                <div className="message-time">
                  {message.createdAt && new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form className="message-form" onSubmit={sendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" className="btn-primary">Send</button>
        </form>
      </div>
      <style>{`
        .chat-container {
          max-width: 900px;
          margin: 20px auto;
          height: calc(100vh - 90px);
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .chat-header {
          background: linear-gradient(135deg,rgb(234, 102, 133) 0%,rgb(198, 151, 19) 100%);
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        .back-button {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid white;
          color: white;
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .back-button:hover {
          background: white;
          color: #e89368;
;
        }
        .chat-header-user {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }
        .chat-header-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .chat-header-avatar-placeholder {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .chat-header-user h3 {
          color: white;
          font-size: 20px;
          margin-bottom: 4px;
        }
        .chat-header-user p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
        }
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #f9fafb;
        }
        .message {
          display: flex;
          flex-direction: column;
          max-width: 70%;
          margin-bottom: 16px;
        }
        .own-message {
          align-self: flex-end;
          align-items: flex-end;
        }
        .own-message .message-content {
          background: linear-gradient(135deg,rgb(234, 102, 133) 0%,rgb(198, 151, 19) 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .other-message {
          align-self: flex-start;
          align-items: flex-start;
        }
        .other-message .message-content {
          background: white;
          color: #333;
          border: 2px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .sender-info {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .sender-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e89368;
        }
        .sender-avatar-placeholder {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          border: 2px solid #e8689f;
        }
        .sender-name {
          font-weight: 600;
          font-size: 14px;
          color: #000000;
        }
        .message-content {
          padding: 12px 16px;
          border-radius: 18px;
          word-wrap: break-word;
          position: relative;
        }
        .message-time {
          font-size: 12px;
          color: #888;
          margin-top: 4px;
          padding: 0 4px;
        }
        .message-form {
          display: flex;
          padding: 16px;
          border-top: 1px solid #e0e0e0;
          gap: 12px;
        }
        .message-form input {
          flex: 1;
        }
      `}</style>
    </div>
  );
}

export default Chat;

