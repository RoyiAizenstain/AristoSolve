import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProblemDetail from './pages/ProblemDetail';
import Settings from './pages/Settings';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Guarded */}
        <Route path="/dashboard"    element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/problems/:id" element={<RequireAuth><ProblemDetail /></RequireAuth>} />
        <Route path="/settings"     element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="/users"        element={<RequireRole roles={['admin']}><UsersPage /></RequireRole>} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
