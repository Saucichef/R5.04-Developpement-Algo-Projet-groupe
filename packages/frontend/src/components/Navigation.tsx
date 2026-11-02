import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { logout } from '../services/api';

const Navigation = ({ onLogout }) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    logout();
    onLogout();
    navigate('/login');
  };

  const greeting = (() => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const randomEmoji = ['👋', '😊', '🌟', '✨'][Math.floor(Math.random() * 4)];
    return `Good ${timeOfDay}, ${user.firstname || 'User'} ${randomEmoji}`;
  })();

  return (
    <nav
      style={{
        alignItems: 'center',
        backgroundColor: '#333',
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '10px'
      }}
    >
      <div>
        <Link
          to="/users"
          style={{
            color: 'white',
            marginRight: '20px',
            textDecoration: 'none'
          }}
        >
          Users
        </Link>
        <Link
          to="/products"
          style={{
            color: 'white',
            textDecoration: 'none'
          }}
        >
          Products
        </Link>
      </div>
      <div
        style={{
          alignItems: 'center',
          display: 'flex'
        }}
      >
        <span
          style={{
            color: 'white',
            marginRight: '20px'
          }}
        >
          {greeting}
        </span>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#f44336',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            padding: '8px 16px'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
