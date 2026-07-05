import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPendingTrips, getDriverTrips, acceptTrip, completeTrip } from '../api/trips';
import type { Trip } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { extractErrorMessage } from '../api/client';

export function DriverDashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [pending, setPending] = useState<Trip[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [p, mine] = await Promise.all([getPendingTrips(), getDriverTrips()]);
      setPending(p);
      setMyTrips(mine);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const activeTrip = myTrips.find((t) => t.status === 'IN_PROGRESS');
  const completed = myTrips.filter((t) => t.status === 'COMPLETED');

  async function handleAccept(id: number) {
    setAcceptingId(id);
    setError(null);
    try {
      const updated = await acceptTrip(id);
      await refreshUser();
      navigate(`/trips/${updated.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
      setAcceptingId(null);
    }
  }

  async function handleComplete(id: number) {
    setCompletingId(id);
    setError(null);
    try {
      await completeTrip(id);
      await refreshUser();
      await loadAll();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Hola, {user?.firstName}</h1>
          <p className="muted">
            Tu rating: <strong>★ {user?.rating.toFixed(1)}</strong> ·{' '}
            {user?.available ? 'Disponible' : 'En viaje'}
          </p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p className="muted">Cargando…</p>}

      {activeTrip && (
        <section>
          <h2>Viaje activo</h2>
          <div className="active-trip-card">
            <div
              onClick={() => navigate(`/trips/${activeTrip.id}`)}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer', flex: 1 }}
            >
              <StatusBadge status={activeTrip.status} />
              <p className="route-line">
                {activeTrip.pickupAddress} <span aria-hidden="true">→</span> {activeTrip.dropoffAddress}
              </p>
            </div>
            <button
              className="btn-primary btn-small"
              data-testid="dashboard-complete-trip"
              onClick={() => handleComplete(activeTrip.id)}
              disabled={completingId === activeTrip.id}
            >
              {completingId === activeTrip.id ? 'Completando…' : 'Completar viaje'}
            </button>
          </div>
        </section>
      )}

      {!activeTrip && (
        <section>
          <h2>Viajes disponibles</h2>
          {!loading && pending.length === 0 && (
            <p className="empty-state">No hay viajes pendientes por ahora.</p>
          )}
          <ul className="trip-list">
            {pending.map((trip) => (
              <li key={trip.id} className="trip-row">
                <span className="route-line">
                  {trip.pickupAddress} <span aria-hidden="true">→</span> {trip.dropoffAddress}
                </span>
                <button
                  className="btn-primary btn-small"
                  data-testid={`accept-trip-${trip.id}`}
                  onClick={() => handleAccept(trip.id)}
                  disabled={acceptingId === trip.id}
                >
                  {acceptingId === trip.id ? 'Aceptando…' : 'Aceptar'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>Viajes completados</h2>
        {!loading && completed.length === 0 && (
          <p className="empty-state">Aún no has completado ningún viaje.</p>
        )}
        <ul className="trip-list">
          {completed.map((trip) => (
            <li key={trip.id}>
              <button className="trip-row link-row" onClick={() => navigate(`/trips/${trip.id}`)}>
                <StatusBadge status={trip.status} />
                <span className="route-line">
                  {trip.pickupAddress} <span aria-hidden="true">→</span> {trip.dropoffAddress}
                </span>
                <span className="chevron" aria-hidden="true">›</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
