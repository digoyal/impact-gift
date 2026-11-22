import { RSVPSummaryResponse } from '../../types';

interface RSVPTabProps {
  rsvpSummary: RSVPSummaryResponse | null;
}

const RSVPTab = ({ rsvpSummary }: RSVPTabProps) => {
  const extraGuests = rsvpSummary?.summary.total_additional_guests ?? 0;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2">
      <div className="card !p-2.5 sm:!p-3 bg-green-50 border-green-200 min-w-0">
        <div className="text-[11px] sm:text-xs text-green-700 font-medium leading-tight">Attending</div>
        <div className="text-lg sm:text-xl font-bold text-green-600 tabular-nums leading-tight">
          {rsvpSummary?.summary.attending_count || 0}
        </div>
        <div className="text-[10px] sm:text-xs text-green-600 mt-0.5 leading-snug truncate">
          Headcount: {rsvpSummary?.summary.total_attending_headcount || 0}
          {extraGuests > 0 ? ` · +${extraGuests} extra` : ''}
        </div>
      </div>
      <div className="card !p-2.5 sm:!p-3 bg-yellow-50 border-yellow-200 min-w-0">
        <div className="text-[11px] sm:text-xs text-yellow-700 font-medium leading-tight">Maybe</div>
        <div className="text-lg sm:text-xl font-bold text-yellow-600 tabular-nums leading-tight">
          {rsvpSummary?.summary.maybe_count || 0}
        </div>
        <div className="text-[10px] sm:text-xs text-yellow-600 mt-0.5 leading-snug truncate">
          Potential: {rsvpSummary?.summary.total_maybe_headcount || 0}
        </div>
      </div>
      <div className="card !p-2.5 sm:!p-3 bg-red-50 border-red-200 min-w-0">
        <div className="text-[11px] sm:text-xs text-red-700 font-medium leading-tight">Not Attending</div>
        <div className="text-lg sm:text-xl font-bold text-red-600 tabular-nums leading-tight">
          {rsvpSummary?.summary.not_attending_count || 0}
        </div>
      </div>
      <div className="card !p-2.5 sm:!p-3 bg-neutral-50 border-neutral-200 min-w-0">
        <div className="text-[11px] sm:text-xs text-neutral-700 font-medium leading-tight">No Response</div>
        <div className="text-lg sm:text-xl font-bold text-neutral-600 tabular-nums leading-tight">
          {rsvpSummary?.summary.no_response_count || 0}
        </div>
      </div>
    </div>
  );
};

export default RSVPTab;