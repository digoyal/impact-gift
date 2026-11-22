import { RSVPSummaryResponse } from '../../types';

interface RSVPTabProps {
  rsvpSummary: RSVPSummaryResponse | null;
}

const RSVPTab = ({ rsvpSummary }: RSVPTabProps) => {
  const extraGuests = rsvpSummary?.summary.total_additional_guests ?? 0;

  return (
    <div className="min-w-0 overflow-x-auto">
      <div className="grid grid-cols-4 gap-1 min-w-[min(100%,20rem)]">
        <div className="card !p-2 bg-green-50 border-green-200 min-w-0">
          <div className="text-xs text-green-700 font-medium leading-tight truncate">Attending</div>
          <div className="text-lg font-bold text-green-600 tabular-nums leading-tight">
            {rsvpSummary?.summary.attending_count || 0}
          </div>
          <div className="text-[10px] text-green-600 mt-0.5 leading-snug truncate">
            HC: {rsvpSummary?.summary.total_attending_headcount || 0}
            {extraGuests > 0 ? ` · +${extraGuests}` : ''}
          </div>
        </div>
        <div className="card !p-2 bg-yellow-50 border-yellow-200 min-w-0">
          <div className="text-xs text-yellow-700 font-medium leading-tight truncate">Maybe</div>
          <div className="text-lg font-bold text-yellow-600 tabular-nums leading-tight">
            {rsvpSummary?.summary.maybe_count || 0}
          </div>
          <div className="text-[10px] text-yellow-600 mt-0.5 leading-snug truncate">
            HC: {rsvpSummary?.summary.total_maybe_headcount || 0}
          </div>
        </div>
        <div className="card !p-2 bg-red-50 border-red-200 min-w-0">
          <div className="text-xs text-red-700 font-medium leading-tight truncate">Not going</div>
          <div className="text-lg font-bold text-red-600 tabular-nums leading-tight">
            {rsvpSummary?.summary.not_attending_count || 0}
          </div>
        </div>
        <div className="card !p-2 bg-neutral-50 border-neutral-200 min-w-0">
          <div className="text-xs text-neutral-700 font-medium leading-tight truncate">No reply</div>
          <div className="text-lg font-bold text-neutral-600 tabular-nums leading-tight">
            {rsvpSummary?.summary.no_response_count || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSVPTab;