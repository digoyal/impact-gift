import { FormEvent } from 'react';
import { Event } from '../../types';
import PotluckManagement from '../PotluckManagement';

interface PotluckTabProps {
  event: Event;
  potluckEnabled: boolean;
  onPotluckEnabledChange: (enabled: boolean) => void;
  onSaveSettings: (e: FormEvent) => void;
  saveLoading: boolean;
}

const PotluckTab = ({
  event,
  potluckEnabled,
  onPotluckEnabledChange,
  onSaveSettings,
  saveLoading,
}: PotluckTabProps) => {
  return (
    <div className="space-y-6">
      <div className="card">
        <form onSubmit={onSaveSettings} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Potluck</h3>
          <p className="text-sm text-gray-600">
            Let guests sign up to bring food, drinks, or other items.
          </p>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={potluckEnabled}
              onChange={(e) => onPotluckEnabledChange(e.target.checked)}
              className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">Enable potluck for this event</span>
          </label>
          <button type="submit" disabled={saveLoading} className="btn btn-primary">
            {saveLoading ? 'Saving...' : 'Save Potluck Settings'}
          </button>
        </form>
      </div>

      {potluckEnabled ? (
        <PotluckManagement eventId={event.id} />
      ) : (
        <div className="card text-sm text-gray-600">
          Enable potluck above to manage suggested items and guest sign-ups.
        </div>
      )}
    </div>
  );
};

export default PotluckTab;