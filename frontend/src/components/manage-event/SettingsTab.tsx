import { FormEvent } from 'react';

interface SettingsTabProps {
  showGuestList: boolean;
  onShowGuestListChange: (value: boolean) => void;
  onSave: (e: FormEvent) => void;
  saveLoading: boolean;
}

const SettingsTab = ({
  showGuestList,
  onShowGuestListChange,
  onSave,
  saveLoading,
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
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saveLoading} className="btn btn-primary">
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsTab;