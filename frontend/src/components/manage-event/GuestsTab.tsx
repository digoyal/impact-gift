import { Guest } from '../../types';
import GuestListTable from './GuestListTable';

const compactInputClass =
  'input !min-h-0 h-9 py-1.5 px-3 text-sm w-full';

interface GuestsTabProps {
  ownerEmail: string | null;
  guests: Guest[];
  impactGiftOn?: boolean;
  guestEmail: string;
  guestName: string;
  onGuestEmailChange: (value: string) => void;
  onGuestNameChange: (value: string) => void;
  onAddGuest: (e: React.FormEvent) => void;
  onRemoveGuest: (guestId: number) => void;
  onResendInvitation: (guestId: number) => void;
  onSendInvitations: () => void;
  onCSVUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenBulkImport: () => void;
  onOpenMasterList: () => void;
  pendingInvites: number;
  editingGuestId: number | null;
  editEmail: string;
  editName: string;
  onEditEmailChange: (value: string) => void;
  onEditNameChange: (value: string) => void;
  onStartEdit: (guest: Guest) => void;
  onUpdateGuest: (guestId: number) => void;
  onCancelEdit: () => void;
  editAdditionalGuests: number;
  onEditAdditionalGuestsChange: (value: number) => void;
  onUpdateAdditionalGuests: (guestId: number, value: number) => void;
  additionalGuestsSavingId: number | null;
}

const GuestsTab = ({
  ownerEmail,
  guests,
  impactGiftOn = false,
  guestEmail,
  guestName,
  onGuestEmailChange,
  onGuestNameChange,
  onAddGuest,
  onRemoveGuest,
  onResendInvitation,
  onSendInvitations,
  onCSVUpload,
  onOpenBulkImport,
  onOpenMasterList,
  pendingInvites,
  editingGuestId,
  editEmail,
  editName,
  onEditEmailChange,
  onEditNameChange,
  onStartEdit,
  onUpdateGuest,
  onCancelEdit,
  editAdditionalGuests,
  onEditAdditionalGuestsChange,
  onUpdateAdditionalGuests,
  additionalGuestsSavingId,
}: GuestsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="card !p-4 sm:!p-5 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h3 className="text-base font-semibold text-neutral-900 shrink-0">Add guests</h3>
          <div className="flex flex-wrap items-center gap-2">
            <label className="btn btn-secondary btn-sm cursor-pointer whitespace-nowrap">
              CSV
              <input type="file" accept=".csv" onChange={onCSVUpload} className="hidden" />
            </label>
            <button type="button" onClick={onOpenBulkImport} className="btn btn-secondary btn-sm whitespace-nowrap">
              Paste list
            </button>
            <button type="button" onClick={onOpenMasterList} className="btn btn-secondary btn-sm whitespace-nowrap">
              Past events
            </button>
          </div>
        </div>

        <form
          onSubmit={onAddGuest}
          className="flex flex-col gap-2 border-t border-neutral-200 pt-3 sm:flex-row sm:items-end sm:gap-2"
        >
          <div className="min-w-0 flex-1">
            <label htmlFor="guest-add-email" className="mb-0.5 block text-xs font-medium text-neutral-600">
              Email *
            </label>
            <input
              id="guest-add-email"
              type="email"
              required
              className={compactInputClass}
              placeholder="friend@example.com"
              value={guestEmail}
              onChange={(e) => onGuestEmailChange(e.target.value)}
            />
          </div>
          <div className="min-w-0 flex-1 sm:max-w-[12rem]">
            <label htmlFor="guest-add-name" className="mb-0.5 block text-xs font-medium text-neutral-600">
              Name
            </label>
            <input
              id="guest-add-name"
              type="text"
              className={compactInputClass}
              placeholder="Optional"
              value={guestName}
              onChange={(e) => onGuestNameChange(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm w-full shrink-0 sm:w-auto sm:min-w-[5.5rem]">
            Add
          </button>
        </form>
      </div>

      <GuestListTable
        ownerEmail={ownerEmail}
        guests={guests}
        impactGiftOn={impactGiftOn}
        pendingInvites={pendingInvites}
        onSendInvitations={onSendInvitations}
        editingGuestId={editingGuestId}
        editEmail={editEmail}
        editName={editName}
        editAdditionalGuests={editAdditionalGuests}
        onEditEmailChange={onEditEmailChange}
        onEditNameChange={onEditNameChange}
        onEditAdditionalGuestsChange={onEditAdditionalGuestsChange}
        onStartEdit={onStartEdit}
        onUpdateGuest={onUpdateGuest}
        onCancelEdit={onCancelEdit}
        onRemoveGuest={onRemoveGuest}
        onResendInvitation={onResendInvitation}
        onUpdateAdditionalGuests={onUpdateAdditionalGuests}
        additionalGuestsSavingId={additionalGuestsSavingId}
      />
    </div>
  );
};

export default GuestsTab;