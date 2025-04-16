import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function NavBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="nav-container">
      <nav className="bottom-nav">
        <NavLink 
          to="/" 
          className={`nav-button ${currentPath === '/' ? 'active' : ''}`}
        >
          🏠
        </NavLink>
        <NavLink 
          to="/create-entry" 
          className={`nav-button ${currentPath === '/create-entry' ? 'active' : ''}`}
        >
          ➕
        </NavLink>
        <NavLink 
          to="/reports" 
          className={`nav-button ${currentPath === '/reports' ? 'active' : ''}`}
        >
          📊
        </NavLink>
      </nav>
    </div>
  );
}

export default NavBar;