import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTrip, completeTrip, rateTrip } from '../api/trips';
import type { Trip } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { StarRating } from '../components/StarRating';
import { extractErrorMessage } from '../api/client';

const POLL_MS = 4000;

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = Number(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');

  const fetchTrip = useCallback(async () => {
    try {
      const data = await getTrip(tripId);
      setTrip(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, [tripId]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  // Polling mientras el viaje esté PENDING o IN_PROGRESS.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (trip && (trip.status === 'PENDING' || trip.status === 'IN_PROGRESS')) {
      intervalRef.current = setInterval(fetchTrip, POLL_MS);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [trip, fetchTrip]);

  if (error) return <div className="page"><p className="form-error">{error}</p></div>;
  if (!trip) return <div className="page"><p className="muted">Cargando viaje…</p></div>;

  const isDriver = user?.role === 'DRIVER';
  const isPassenger = user?.role === 'PASSENGER';

  async function handleComplete() {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await completeTrip(tripId);
      setTrip(updated);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRate(e: React.FormEvent) {
    e.preventDefault();
    if (ratingValue === 0) return;
    setBusy(true);
    setActionError(null);
    try {
      const updated = await rateTrip(tripId, ratingValue, comment || undefined);
      setTrip(updated);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page-narrow">
      <button className="btn-ghost back-link" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <div className="trip-detail-card">
        <StatusBadge status={trip.status} />
        <p className="route-line big">
          {trip.pickupAddress} <span aria-hidden="true">→</span> {trip.dropoffAddress}
        </p>
        <p className="muted">Solicitado el {new Date(trip.requestedAt).toLocaleString()}</p>

        <div className="trip-detail-grid">
          <div>
            <h3>Pasajero</h3>
            <p>{trip.passenger.firstName} {trip.passenger.lastName}</p>
          </div>
          <div>
            <h3>Conductor</h3>
            {trip.driver ? (
              <p>{trip.driver.firstName} {trip.driver.lastName} · ★ {trip.driver.rating.toFixed(1)}</p>
            ) : (
              <p className="muted">Buscando conductor…</p>
            )}
          </div>
        </div>

        {actionError && <p className="form-error">{actionError}</p>}

        {/* Vista conductor: completar viaje en curso */}
        {isDriver && trip.status === 'IN_PROGRESS' && (
          <button className="btn-primary" data-testid="complete-trip-button" onClick={handleComplete} disabled={busy}>
            {busy ? 'Completando…' : 'Completar viaje'}
          </button>
        )}

        {isDriver && trip.status === 'COMPLETED' && (
          <p className="empty-state">Viaje completado el {trip.completedAt ? new Date(trip.completedAt).toLocaleString() : ''}.</p>
        )}

        {/* Vista pasajero: calificar viaje completado */}
        {isPassenger && trip.status === 'COMPLETED' && trip.passengerRating === null && (
          <form className="rating-form" onSubmit={handleRate} data-testid="rating-form">
            <h3>Califica tu viaje</h3>
            <StarRating value={ratingValue} onChange={setRatingValue} />
            <label>
              Comentario (opcional)
              <textarea
                data-testid="rating-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </label>
            <button className="btn-primary" type="submit" disabled={busy || ratingValue === 0} data-testid="submit-rating">
              {busy ? 'Enviando…' : 'Enviar calificación'}
            </button>
          </form>
        )}

        {isPassenger && trip.status === 'COMPLETED' && trip.passengerRating !== null && (
          <div className="rating-summary">
            <h3>Tu calificación</h3>
            <StarRating value={trip.passengerRating} readOnly />
            {trip.ratingComment && <p className="muted">"{trip.ratingComment}"</p>}
          </div>
        )}
      </div>
    </div>
  );
}
