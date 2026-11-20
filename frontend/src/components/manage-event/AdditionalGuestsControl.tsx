interface AdditionalGuestsControlProps {
  value: number;
  disabled?: boolean;
  saving?: boolean;
  onChange: (value: number) => void;
}

const MAX_ADDITIONAL_GUESTS = 20;

const AdditionalGuestsControl = ({
  value,
  disabled = false,
  saving = false,
  onChange,
}: AdditionalGuestsControlProps) => {
  const safeValue = Math.min(MAX_ADDITIONAL_GUESTS, Math.max(0, value));

  const setValue = (next: number) => {
    const clamped = Math.min(MAX_ADDITIONAL_GUESTS, Math.max(0, next));
    if (clamped !== safeValue) {
      onChange(clamped);
    }
  };

  if (disabled) {
    return (
      <span className="text-gray-500 text-sm">
        {safeValue > 0 ? `+${safeValue}` : '—'}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        className="w-8 h-8 rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        disabled={saving || safeValue <= 0}
        onClick={() => setValue(safeValue - 1)}
        aria-label="Decrease additional guests"
      >
        −
      </button>
      <input
        type="number"
        min={0}
        max={MAX_ADDITIONAL_GUESTS}
        className="input w-14 text-center text-sm py-1 px-1"
        value={safeValue}
        disabled={saving}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10);
          if (Number.isNaN(parsed)) {
            onChange(0);
            return;
          }
          setValue(parsed);
        }}
        aria-label="Additional guests count"
      />
      <button
        type="button"
        className="w-8 h-8 rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        disabled={saving || safeValue >= MAX_ADDITIONAL_GUESTS}
        onClick={() => setValue(safeValue + 1)}
        aria-label="Increase additional guests"
      >
        +
      </button>
    </div>
  );
};

export default AdditionalGuestsControl;