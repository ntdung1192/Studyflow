import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

function AuthLoadingScreen() {
  return (
    <main className="auth-loading" aria-busy="true">
      <p>Đang kiểm tra phiên đăng nhập...</p>
    </main>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoadingScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <AuthLoadingScreen />;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
