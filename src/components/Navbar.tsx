import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const home = user!.role === 'PASSENGER' ? '/passenger' : '/driver';

  return (
    <header className="navbar">
      <Link to={home} className="navbar-brand">
        <span className="brand-mark" aria-hidden="true" />
        Ruta
      </Link>
      <nav className="navbar-links">
        <Link to={home}>Dashboard</Link>
        <Link to="/history">Historial</Link>
      </nav>
      <div className="navbar-user">
        <span className="user-chip">
          {user!.firstName} · {user!.role === 'PASSENGER' ? 'Pasajero' : 'Conductor'}
        </span>
        <button className="btn-ghost" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </header>
  );
}
