import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableDrivers } from '../api/users';
import { createTrip } from '../api/trips';
import type { User } from '../types';
import { extractErrorMessage } from '../api/client';

export function RequestTripPage() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<User[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAvailableDrivers()
      .then(setDrivers)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setDriversLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const trip = await createTrip(pickup, dropoff);
      navigate(`/trips/${trip.id}`, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page-narrow">
      <h1>Pedir un viaje</h1>

      <section>
        <h2>Conductores disponibles ahora</h2>
        {driversLoading && <p className="muted">Buscando conductores…</p>}
        {!driversLoading && drivers.length === 0 && (
          <p className="empty-state">No hay conductores disponibles en este momento.</p>
        )}
        <ul className="driver-list">
          {drivers.map((d) => (
            <li key={d.id} className="driver-chip">
              <span className="avatar-dot" aria-hidden="true" />
              {d.firstName} {d.lastName} · ★ {d.rating.toFixed(1)}
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={handleSubmit} className="trip-form">
        <label>
          Origen
          <input
            data-testid="pickup-input"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            required
            placeholder="Av. Javier Prado 100"
          />
        </label>
        <label>
          Destino
          <input
            data-testid="dropoff-input"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            required
            placeholder="Miraflores, Lima"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="btn-primary" type="submit" disabled={submitting} data-testid="confirm-trip-submit">
          {submitting ? 'Solicitando…' : 'Confirmar viaje'}
        </button>
      </form>
    </div>
  );
}
