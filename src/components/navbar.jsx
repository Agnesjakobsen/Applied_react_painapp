import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart2 } from 'lucide-react';

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
          <Home size={22} />
        </NavLink>
        <NavLink
          to="/create-entry"
          className={`nav-button ${currentPath === '/create-entry' ? 'active' : ''}`}
        >
          <PlusCircle size={22} />
        </NavLink>
        <NavLink
          to="/reports"
          className={`nav-button ${currentPath === '/reports' ? 'active' : ''}`}
        >
          <BarChart2 size={22} />
        </NavLink>
      </nav>
    </div>
  );
}

export default NavBar;