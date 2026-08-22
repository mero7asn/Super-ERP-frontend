import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects unauthenticated users to /login
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isSuperAdmin =
    !user.role ||
    user.role === 'CRM core Administrator' ||
    user.role === 'Core 360 Administrator' ||
    user.role === 'System Architect' ||
    user.role === 'Executive User';

  if (isSuperAdmin) {
    return children;
  }

  if (allowedRoles) {
    const flat = allowedRoles.flatMap(r => Array.isArray(r) ? r : [r]);
    if (flat.includes('CRM core Administrator') && !flat.includes('Core 360 Administrator')) {
      flat.push('Core 360 Administrator');
    }
    if (flat.includes('Core 360 Administrator') && !flat.includes('CRM core Administrator')) {
      flat.push('CRM core Administrator');
    }
    if (!flat.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

// Redirects already-authenticated users away from /login
export const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};
