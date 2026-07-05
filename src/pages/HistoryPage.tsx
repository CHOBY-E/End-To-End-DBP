import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyTrips, getDriverTrips } from '../api/trips';
import type { Trip, TripStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { extractErrorMessage } from '../api/client';

const FILTERS: Array<TripStatus | 'ALL'> = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];
const FILTER_LABELS: Record<TripStatus | 'ALL', string> = {
  ALL: 'Todos',
  PENDING: 'Pendientes',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completados',
};

export function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filter, setFilter] = useState<TripStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetcher = user?.role === 'DRIVER' ? getDriverTrips : getMyTrips;
    fetcher()
      .then(setTrips)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user?.role]);

  const filtered = useMemo(
    () => (filter === 'ALL' ? trips : trips.filter((t) => t.status === filter)),
    [trips, filter]
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Historial</h1>
          <p className="muted">
            {user?.role === 'DRIVER' ? 'Tus viajes como conductor' : 'Tus viajes como pasajero'}
          </p>
        </div>
      </div>

      <div className="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f}
            data-testid={`filter-${f.toLowerCase()}`}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {loading && <p className="muted">Cargando…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && filtered.length === 0 && (
        <p className="empty-state">No hay viajes con este filtro.</p>
      )}

      <table className="history-table">
        <thead>
          <tr>
            <th>Ruta</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>{user?.role === 'DRIVER' ? 'Pasajero' : 'Conductor'}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((trip) => (
            <tr key={trip.id} onClick={() => navigate(`/trips/${trip.id}`)} className="clickable-row">
              <td className="route-line">
                {trip.pickupAddress} <span aria-hidden="true">→</span> {trip.dropoffAddress}
              </td>
              <td><StatusBadge status={trip.status} /></td>
              <td>{new Date(trip.requestedAt).toLocaleDateString()}</td>
              <td>
                {user?.role === 'DRIVER'
                  ? `${trip.passenger.firstName} ${trip.passenger.lastName}`
                  : trip.driver
                    ? `${trip.driver.firstName} ${trip.driver.lastName}`
                    : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
