import type { TripStatus } from '../types';

const LABELS: Record<TripStatus, string> = {
  PENDING: 'Buscando conductor',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
};

export function StatusBadge({ status }: { status: TripStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span className="status-dot" />
      {LABELS[status]}
    </span>
  );
}
