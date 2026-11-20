interface AdditionalGuestsControlProps {
  value: number;
  disabled?: boolean;
  saving?: boolean;
  onChange: (value: number) => void;
  /** Show party total (1 + additional) in the input; +/- still adjust additional_guests */
  displayMode?: 'additional' | 'partySize';
  /** Tighter stepper for table cells */
  compact?: boolean;
}

const MAX_ADDITIONAL_GUESTS = 20;

const AdditionalGuestsControl = ({
  value,
  disabled = false,
  saving = false,
  onChange,
  displayMode = 'additional',
  compact,
}: AdditionalGuestsControlProps) => {
  const isCompact = compact ?? displayMode === 'partySize';
  const safeValue = Math.min(MAX_ADDITIONAL_GUESTS, Math.max(0, value));
  const partyTotal = 1 + safeValue;

  const setAdditional = (additional: number) => {
    const clamped = Math.min(MAX_ADDITIONAL_GUESTS, Math.max(0, additional));
    if (clamped !== safeValue) {
      onChange(clamped);
    }
  };

  const displayNumber = displayMode === 'partySize' ? partyTotal : safeValue;
  const minDisplay = displayMode === 'partySize' ? 1 : 0;
  const maxDisplay = displayMode === 'partySize' ? 1 + MAX_ADDITIONAL_GUESTS : MAX_ADDITIONAL_GUESTS;

  const decrease = () => setAdditional(safeValue - 1);
  const increase = () => setAdditional(safeValue + 1);

  if (disabled) {
    return (
      <span className="text-gray-500 text-sm">
        {displayMode === 'partySize' ? partyTotal : safeValue > 0 ? `+${safeValue}` : '—'}
      </span>
    );
  }

  const btnClass = isCompact
    ? 'flex h-7 w-7 shrink-0 items-center justify-center border-0 bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 leading-none p-0'
    : 'w-8 h-8 rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50';

  const inputClass = isCompact
    ? 'input input-no-spinner h-7 min-h-0 w-10 shrink-0 rounded-none border-0 px-0.5 py-0 text-center text-xs leading-none shadow-none focus:ring-0 focus:border-neutral-300'
    : 'input input-no-spinner w-14 text-center text-sm py-1 px-1';

  const wrapClass = isCompact
    ? 'inline-flex items-stretch divide-x divide-neutral-300 overflow-hidden rounded-md border border-neutral-300'
    : 'inline-flex items-center gap-1';

  return (
    <div className={wrapClass}>
      <button
        type="button"
        className={btnClass}
        disabled={saving || safeValue <= 0}
        onClick={decrease}
        aria-label={displayMode === 'partySize' ? 'Decrease party size' : 'Decrease additional guests'}
      >
        −
      </button>
      <input
        type="number"
        min={minDisplay}
        max={maxDisplay}
        className={inputClass}
        value={displayNumber}
        disabled={saving}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10);
          if (Number.isNaN(parsed)) {
            onChange(0);
            return;
          }
          if (displayMode === 'partySize') {
            setAdditional(parsed - 1);
          } else {
            setAdditional(parsed);
          }
        }}
        aria-label={displayMode === 'partySize' ? 'Party size' : 'Additional guests count'}
      />
      <button
        type="button"
        className={`${btnClass}${isCompact ? ' rounded-r-md border-l-0' : ''}`}
        disabled={saving || safeValue >= MAX_ADDITIONAL_GUESTS}
        onClick={increase}
        aria-label={displayMode === 'partySize' ? 'Increase party size' : 'Increase additional guests'}
      >
        +
      </button>
    </div>
  );
};

export default AdditionalGuestsControl;