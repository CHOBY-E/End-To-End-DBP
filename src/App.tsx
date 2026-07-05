import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { PassengerDashboard } from './pages/PassengerDashboard';
import { RequestTripPage } from './pages/RequestTripPage';
import { DriverDashboard } from './pages/DriverDashboard';
import { TripDetailPage } from './pages/TripDetailPage';
import { HistoryPage } from './pages/HistoryPage';

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'PASSENGER' ? '/passenger' : '/driver'} replace />;
}

function Shell() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleRedirect />} />

          <Route
            path="/passenger"
            element={
              <ProtectedRoute role="PASSENGER">
                <PassengerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passenger/new-trip"
            element={
              <ProtectedRoute role="PASSENGER">
                <RequestTripPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver"
            element={
              <ProtectedRoute role="DRIVER">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <TripDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
