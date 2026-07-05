export function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`star-rating ${readOnly ? 'read-only' : ''}`} role="radiogroup" aria-label="Calificación">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          className={`star ${n <= value ? 'filled' : ''}`}
          aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
          onClick={() => onChange?.(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
