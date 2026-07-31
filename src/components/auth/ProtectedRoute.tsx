import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { LoadingState } from '../ui/LoadingState';

type ProtectedRouteProps = {
  requireAdmin?: boolean;
};

export function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Loading account…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/plans" replace />;
  }

  return <Outlet />;
}
