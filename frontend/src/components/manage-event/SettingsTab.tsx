import { FormEvent } from 'react';
import { Event } from '../../types';

interface SettingsTabProps {
  event: Event;
  showGuestList: boolean;
  onShowGuestListChange: (value: boolean) => void;
  onSave: (e: FormEvent) => void;
  saveLoading: boolean;
  onShowCancelModal: () => void;
}

const SettingsTab = ({
  event,
  showGuestList,
  onShowGuestListChange,
  onSave,
  saveLoading,
  onShowCancelModal,
}: SettingsTabProps) => {
  return (
    <div className="card">
      <form onSubmit={onSave} className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Settings</h3>

        <div className="space-y-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showGuestList}
              onChange={(e) => onShowGuestListChange(e.target.checked)}
              className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">
              Show guest list publicly on event page
            </span>
          </label>
          <p className="text-xs text-gray-500 ml-8">
            When enabled, guests who RSVP&apos;d as &quot;Attending&quot; will be visible to everyone viewing your event page
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saveLoading} className="btn btn-primary">
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {!event?.cancelled && (
        <div className="mt-8 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-4">
            Once you cancel this event, all invited guests will be notified and the event will be marked as cancelled.
            This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={onShowCancelModal}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            ⚠️ Cancel Event
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;