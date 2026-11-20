import { Guest } from '../../types';
import GuestListTable from './GuestListTable';

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
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Add Guests</h3>
            <p className="text-sm text-gray-600 mt-1">Upload a CSV, paste emails, or import from past events</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="btn btn-secondary cursor-pointer">
              Upload CSV
              <input type="file" accept=".csv" onChange={onCSVUpload} className="hidden" />
            </label>
            <button type="button" onClick={onOpenBulkImport} className="btn btn-secondary">
              Paste Email List
            </button>
            <button type="button" onClick={onOpenMasterList} className="btn btn-secondary">
              Import from Past Events
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Add Guest</h3>
        <form onSubmit={onAddGuest} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                className="input"
                placeholder="friend@example.com"
                value={guestEmail}
                onChange={(e) => onGuestEmailChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
              <input
                type="text"
                className="input"
                placeholder="John Doe"
                value={guestName}
                onChange={(e) => onGuestNameChange(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Add Guest
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