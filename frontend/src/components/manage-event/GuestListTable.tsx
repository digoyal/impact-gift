import { Fragment, useMemo, useState } from 'react';
import { Guest } from '../../types';
import { isOrganizerGuest } from '../../utils/eventOrganizerGuest';
import AdditionalGuestsControl from './AdditionalGuestsControl';

function rsvpBadge(guest: Guest): { text: string; className: string } {
  switch (guest.rsvp_status) {
    case 'attending':
      return { text: 'Attending', className: 'bg-green-100 text-green-800' };
    case 'not_attending':
      return { text: 'Declined', className: 'bg-red-100 text-red-800' };
    case 'maybe':
      return { text: 'Maybe', className: 'bg-yellow-100 text-yellow-900' };
    default:
      return { text: 'No reply', className: 'bg-neutral-100 text-neutral-600' };
  }
}

type GuestSortKey = 'name' | 'email' | 'status';
type GuestSortDir = 'asc' | 'desc';

const RSVP_STATUS_SORT_ORDER: Record<Guest['rsvp_status'], number> = {
  attending: 0,
  maybe: 1,
  not_attending: 2,
  no_response: 3,
};

function SortableGuestHeader({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  column: GuestSortKey;
  sortKey: GuestSortKey | null;
  sortDir: GuestSortDir;
  onSort: (column: GuestSortKey) => void;
}) {
  const active = sortKey === column;
  const sortTitle = !active
    ? `Sort by ${label}`
    : sortDir === 'asc'
      ? `Sorted by ${label} ascending — click for descending`
      : `Sorted by ${label} descending — click to clear sort`;

  return (
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
      <button
        type="button"
        onClick={() => onSort(column)}
        title={sortTitle}
        aria-label={sortTitle}
        className={`inline-flex items-center gap-1 rounded-sm -ml-1 px-1 py-0.5 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
          active ? 'text-gray-900' : ''
        }`}
      >
        <span>{label}</span>
        <span className="inline-flex flex-col leading-none text-gray-300" aria-hidden="true">
          <svg
            className={`w-3 h-3 ${active && sortDir === 'asc' ? 'text-primary-600' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 5l4 6H6l4-6z" />
          </svg>
          <svg
            className={`-mt-1.5 w-3 h-3 ${active && sortDir === 'desc' ? 'text-primary-600' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 15l-4-6h8l-4 6z" />
          </svg>
        </span>
      </button>
    </th>
  );
}

function GuestStatusInline({ guest }: { guest: Guest }) {
  const rsvp = rsvpBadge(guest);

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-xs font-medium leading-none whitespace-nowrap ${rsvp.className}`}
    >
      {rsvp.text}
    </span>
  );
}

export interface GuestListTableProps {
  ownerEmail: string | null;
  guests: Guest[];
  allowAdditionalGuests?: boolean;
  showDonatedColumn?: boolean;
  pendingInvites?: number;
  onSendInvitations?: () => void;
  editingGuestId: number | null;
  editEmail: string;
  editName: string;
  editAdditionalGuests: number;
  onEditEmailChange: (value: string) => void;
  onEditNameChange: (value: string) => void;
  onEditAdditionalGuestsChange: (value: number) => void;
  onStartEdit: (guest: Guest) => void;
  onUpdateGuest: (guestId: number) => void;
  onCancelEdit: () => void;
  onRemoveGuest: (guestId: number) => void;
  onResendInvitation: (guestId: number) => void;
  onUpdateAdditionalGuests: (guestId: number, value: number) => void;
  additionalGuestsSavingId: number | null;
  emptyMessage?: string;
}

const GuestListTable = ({
  ownerEmail,
  guests,
  allowAdditionalGuests = true,
  showDonatedColumn = false,
  pendingInvites = 0,
  onSendInvitations,
  editingGuestId,
  editEmail,
  editName,
  editAdditionalGuests,
  onEditEmailChange,
  onEditNameChange,
  onEditAdditionalGuestsChange,
  onStartEdit,
  onUpdateGuest,
  onCancelEdit,
  onRemoveGuest,
  onResendInvitation,
  onUpdateAdditionalGuests,
  additionalGuestsSavingId,
  emptyMessage = 'No guests added yet. Add some above!',
}: GuestListTableProps) => {
  const [sortKey, setSortKey] = useState<GuestSortKey | null>(null);
  const [sortDir, setSortDir] = useState<GuestSortDir>('asc');

  const handleSort = (column: GuestSortKey) => {
    if (sortKey !== column) {
      setSortKey(column);
      setSortDir('asc');
      return;
    }
    if (sortDir === 'asc') {
      setSortDir('desc');
      return;
    }
    setSortKey(null);
    setSortDir('asc');
  };

  const sortedGuests = useMemo(() => {
    if (!sortKey) return guests;

    const next = [...guests];
    next.sort((a, b) => {
      const aHost = isOrganizerGuest(a, ownerEmail);
      const bHost = isOrganizerGuest(b, ownerEmail);
      if (aHost !== bHost) return aHost ? -1 : 1;

      let cmp = 0;
      if (sortKey === 'name') {
        cmp = (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
      } else if (sortKey === 'email') {
        cmp = (a.email || '').localeCompare(b.email || '', undefined, { sensitivity: 'base' });
      } else {
        const aRank = RSVP_STATUS_SORT_ORDER[a.rsvp_status] ?? 99;
        const bRank = RSVP_STATUS_SORT_ORDER[b.rsvp_status] ?? 99;
        cmp = aRank - bRank;
      }

      return sortDir === 'asc' ? cmp : -cmp;
    });
    return next;
  }, [guests, sortKey, sortDir, ownerEmail]);

  return (
  <div className="card">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <h3 className="text-lg font-semibold">Guests ({guests.length})</h3>
      {pendingInvites > 0 && onSendInvitations && (
        <button type="button" onClick={onSendInvitations} className="btn btn-primary">
          Send {pendingInvites} Pending Invitation{pendingInvites !== 1 ? 's' : ''}
        </button>
      )}
    </div>

    {guests.length === 0 ? (
      <p className="text-gray-500 text-center py-8">{emptyMessage}</p>
    ) : (
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="min-w-[720px] w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <SortableGuestHeader
                label="Name"
                column="name"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortableGuestHeader
                label="Email"
                column="email"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortableGuestHeader
                label="Status"
                column="status"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Num guests</th>
              {showDonatedColumn && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Donated</th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {sortedGuests.map((guest) => {
              const organizer = isOrganizerGuest(guest, ownerEmail);
              const isEditing = editingGuestId === guest.id;

              if (isEditing) {
                return (
                  <tr key={guest.id} className="bg-primary-50 border-b border-gray-200">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        className="input text-sm py-1 w-full min-w-[120px]"
                        value={editName}
                        onChange={(e) => onEditNameChange(e.target.value)}
                        placeholder="Name"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="email"
                        className="input text-sm py-1 w-full min-w-[160px]"
                        value={editEmail}
                        onChange={(e) => onEditEmailChange(e.target.value)}
                        placeholder="Email"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <GuestStatusInline guest={guest} />
                    </td>
                    <td className="px-4 py-3">
                      <AdditionalGuestsControl
                        displayMode="partySize"
                        value={editAdditionalGuests}
                        disabled={!allowAdditionalGuests}
                        saving={additionalGuestsSavingId === guest.id}
                        onChange={onEditAdditionalGuestsChange}
                      />
                    </td>
                    {showDonatedColumn && <td className="px-4 py-3 text-sm text-gray-400">—</td>}
                    <td className="px-4 py-3 text-left text-sm whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => onUpdateGuest(guest.id)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Save
                      </button>
                      <button type="button" onClick={onCancelEdit} className="text-gray-600 hover:text-gray-800">
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              }

              const comment = guest.rsvp_comment?.trim();
              const rowClass = organizer ? 'bg-neutral-50' : undefined;
              const columnCount = showDonatedColumn ? 6 : 5;

              const nameCell = (
                <td className="px-4 py-3 align-top text-sm whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span>{guest.name || '—'}</span>
                    {organizer && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800">Host</span>
                    )}
                  </div>
                </td>
              );

              const emailCell = (
                <td className="px-4 py-3 align-top text-sm text-neutral-700 max-w-[12rem] w-[12rem] min-w-0">
                  <span className="block truncate" title={guest.email}>
                    {guest.email}
                  </span>
                </td>
              );

              const statusCell = (
                <td className="px-4 py-3 align-top whitespace-nowrap">
                  <GuestStatusInline guest={guest} />
                </td>
              );

              const numGuestsCell = (
                <td className="px-4 py-3 align-top">
                  <AdditionalGuestsControl
                    displayMode="partySize"
                    value={guest.additional_guests ?? 0}
                    disabled={!allowAdditionalGuests}
                    saving={additionalGuestsSavingId === guest.id}
                    onChange={(next) => onUpdateAdditionalGuests(guest.id, next)}
                  />
                </td>
              );

              const donatedCell = showDonatedColumn ? (
                <td className="px-4 py-3 align-top text-sm whitespace-nowrap">
                  {guest.has_donated ? (
                    <span className="text-green-600 font-medium">${Number(guest.donated_amount || 0).toFixed(2)}</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              ) : null;

              const actionsCell = (
                <td className="px-4 py-3 align-top text-left text-sm whitespace-nowrap space-x-2">
                  {!organizer && guest.invitation_sent && (
                    <button
                      type="button"
                      onClick={() => onResendInvitation(guest.id)}
                      className="text-primary-600 hover:text-primary-800"
                      title="Resend invitation"
                    >
                      Resend
                    </button>
                  )}
                  {!organizer && (
                    <>
                      <button
                        type="button"
                        onClick={() => onStartEdit(guest)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveGuest(guest.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </td>
              );

              const dataRowClass = [rowClass, comment ? undefined : 'border-b border-gray-200']
                .filter(Boolean)
                .join(' ');

              const dataRow = (
                <tr className={dataRowClass || undefined}>
                  {nameCell}
                  {emailCell}
                  {statusCell}
                  {numGuestsCell}
                  {donatedCell}
                  {actionsCell}
                </tr>
              );

              if (comment) {
                return (
                  <Fragment key={guest.id}>
                    {dataRow}
                    <tr className={[rowClass, 'border-b border-gray-200 border-t-0'].filter(Boolean).join(' ')}>
                      <td colSpan={columnCount} className="px-4 pt-1 pb-2.5 align-top">
                        <p className="text-xs text-neutral-500 italic whitespace-normal leading-snug">
                          &ldquo;{comment}&rdquo;
                        </p>
                      </td>
                    </tr>
                  </Fragment>
                );
              }

              return (
                <tr key={guest.id} className={dataRowClass || undefined}>
                  {nameCell}
                  {emailCell}
                  {statusCell}
                  {numGuestsCell}
                  {donatedCell}
                  {actionsCell}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
  );
};

export default GuestListTable;