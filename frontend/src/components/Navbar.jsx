import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/api';
import { logout } from '../services/auth';

function getInitialTheme() {
  return localStorage.getItem('aristosolve_theme') || 'dark';
}

export default function Navbar() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aristosolve_theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const role = user?.userRole;

  return (
    <nav className="navbar" aria-label="Main navigation">
      <NavLink to="/dashboard" className="navbar-brand">
        🤖 AristoSolve
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Dashboard
        </NavLink>
        {role === 'admin' && (
          <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Users
          </NavLink>
        )}
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Settings
        </NavLink>
      </div>

      <div className="navbar-right">
        <button className="btn btn-ghost theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span className="navbar-user">
          {user?.firstName} {user?.lastName}
        </span>
        <button className="btn btn-ghost" onClick={handleLogout} aria-label="Log out">
          Logout
        </button>
      </div>
    </nav>
  );
}
