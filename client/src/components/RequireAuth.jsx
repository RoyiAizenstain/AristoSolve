import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../services/api';

export default function RequireAuth({ children }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
