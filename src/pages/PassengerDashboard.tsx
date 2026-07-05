import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyTrips } from '../api/trips';
import type { Trip } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { extractErrorMessage } from '../api/client';

export function PassengerDashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTrips()
      .then(setTrips)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const active = trips.find((t) => t.status !== 'COMPLETED');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Hola, {user?.firstName}</h1>
          <p className="muted">¿A dónde vamos hoy?</p>
        </div>
        <Link to="/passenger/new-trip" className="btn-primary" data-testid="request-trip-link">
          Pedir viaje
        </Link>
      </div>

      {active && (
        <Link to={`/trips/${active.id}`} className="active-trip-card">
          <div>
            <StatusBadge status={active.status} />
            <p className="route-line">
              {active.pickupAddress} <span aria-hidden="true">→</span> {active.dropoffAddress}
            </p>
          </div>
          <span className="chevron" aria-hidden="true">›</span>
        </Link>
      )}

      <section>
        <h2>Mis viajes</h2>
        {loading && <p className="muted">Cargando viajes…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && trips.length === 0 && (
          <p className="empty-state">Todavía no has pedido ningún viaje.</p>
        )}
        <ul className="trip-list">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link to={`/trips/${trip.id}`} className="trip-row" data-testid={`trip-row-${trip.id}`}>
                <StatusBadge status={trip.status} />
                <span className="route-line">
                  {trip.pickupAddress} <span aria-hidden="true">→</span> {trip.dropoffAddress}
                </span>
                <span className="chevron" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
