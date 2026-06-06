import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../services/api';

export default function RequireRole({ roles, children }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.userRole)) return <Navigate to="/dashboard" replace />;
  return children;
}
