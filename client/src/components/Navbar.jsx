import { NavLink, useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/api';
import { logout } from '../services/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getStoredUser();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const role = user?.userRole;

  return (
    <nav className="navbar" aria-label="Main navigation">
      <NavLink to="/dashboard" className="navbar-brand">
        ◆ AristoSolve
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
