import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api/auth';
import { extractErrorMessage } from '../api/client';
import type { Role } from '../types';


type Mode = 'login' | 'register';

export function LoginPage() {
  const { token, loading, setSession } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('PASSENGER');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Si ya hay sesión activa, no mostramos el login.
  if (!loading && token) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token: newToken } =
        mode === 'login'
          ? await login({ email, password })
          : await register({ firstName, lastName, email, password, role });

      // Guardamos el token, pedimos el perfil y redirigimos según rol.
      const me = await setSession(newToken);
      if (me) {
        navigate(me.role === 'PASSENGER' ? '/passenger' : '/driver', { replace: true });
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-mark" aria-hidden="true" />
          <h1>Ruta</h1>
          <p>Pide un viaje o acepta uno como conductor.</p>
        </div>

        <div className="auth-tabs">
          <button
            data-testid="tab-login"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
            type="button"
          >
            Iniciar sesión
          </button>
          <button
            data-testid="tab-register"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
            type="button"
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="field-row">
                <label>
                  Nombre
                  <input
                    data-testid="firstname-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="Ana"
                  />
                </label>
                <label>
                  Apellido
                  <input
                    data-testid="lastname-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="García"
                  />
                </label>
              </div>
              <label>
                Quiero registrarme como
                <div className="role-toggle">
                  <button
                    type="button"
                    data-testid="role-passenger"
                    className={role === 'PASSENGER' ? 'active' : ''}
                    onClick={() => setRole('PASSENGER')}
                  >
                    Pasajero
                  </button>
                  <button
                    type="button"
                    data-testid="role-driver"
                    className={role === 'DRIVER' ? 'active' : ''}
                    onClick={() => setRole('DRIVER')}
                  >
                    Conductor
                  </button>
                </div>
              </label>
            </>
          )}

          <label>
            Correo
            <input
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ana@uber.com"
            />
          </label>
          <label>
            Contraseña
            <input
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="mínimo 6 caracteres"
            />
          </label>

          {error && <p className="form-error" data-testid="auth-error">{error}</p>}

          <button className="btn-primary" type="submit" disabled={submitting} data-testid="auth-submit">
            {submitting ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-hint">
          Prueba con <code>ana@uber.com</code> / <code>pass123</code> (pasajero) o{' '}
          <code>carlos@uber.com</code> / <code>pass123</code> (conductor).
        </p>
      </div>
    </div>
  );
}
