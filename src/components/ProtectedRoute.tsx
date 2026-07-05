import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

export function ProtectedRoute({ children, role }: { children: ReactNode; role?: Role }) {
  const { user, token, loading } = useAuth();

  if (loading) return <div className="page-loading">Cargando…</div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'PASSENGER' ? '/passenger' : '/driver'} replace />;
  }
  return <>{children}</>;
}
