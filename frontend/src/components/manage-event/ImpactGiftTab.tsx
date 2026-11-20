import { FormEvent } from 'react';
import CharitiesTab from './CharitiesTab';
import { Charity } from '../../types';

interface ImpactGiftTabProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  charities: Charity[];
  selectedCharityIds: number[];
  onToggleCharity: (charityId: number) => void;
  onSave: (e: FormEvent) => void;
  saveLoading: boolean;
  onCharitiesRefresh: (charities: Charity[]) => void;
}

const ImpactGiftTab = ({
  enabled,
  onEnabledChange,
  charities,
  selectedCharityIds,
  onToggleCharity,
  onSave,
  saveLoading,
  onCharitiesRefresh,
}: ImpactGiftTabProps) => {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="manage_impact_gift_enabled"
              type="checkbox"
              checked={enabled}
              onChange={(e) => onEnabledChange(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="manage_impact_gift_enabled" className="font-medium text-gray-700">
              Enable Impact Gift
            </label>
            <p className="text-sm text-gray-500">
              Let guests donate to charities you choose instead of bringing traditional gifts.
            </p>
          </div>
        </div>
      </div>

      {enabled ? (
        <CharitiesTab
          charities={charities}
          selectedCharityIds={selectedCharityIds}
          onToggleCharity={onToggleCharity}
          onSave={onSave}
          saveLoading={saveLoading}
          onCharitiesRefresh={onCharitiesRefresh}
        />
      ) : (
        <div className="card text-sm text-gray-600">
          Turn on Impact Gift above to choose charities and track donations on the Progress tab.
        </div>
      )}
    </div>
  );
};

export default ImpactGiftTab;