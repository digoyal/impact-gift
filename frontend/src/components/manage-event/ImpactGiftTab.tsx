import { FormEvent } from 'react';
import CharitiesTab from './CharitiesTab';
import ProgressTab from './ProgressTab';
import { Charity, Donation, Event } from '../../types';

interface ImpactGiftTabProps {
  event: Event;
  charities: Charity[];
  selectedCharityIds: number[];
  onToggleCharity: (charityId: number) => void;
  onSave: (e: FormEvent) => void;
  saveLoading: boolean;
  onCharitiesRefresh: (charities: Charity[]) => void;
  donations: Donation[];
  pendingCommitments: number;
  sendingReminders: boolean;
  onSendReminders: () => void;
  showDonationProgress: boolean;
}

const ImpactGiftTab = ({
  event,
  charities,
  selectedCharityIds,
  onToggleCharity,
  onSave,
  saveLoading,
  onCharitiesRefresh,
  donations,
  pendingCommitments,
  sendingReminders,
  onSendReminders,
  showDonationProgress,
}: ImpactGiftTabProps) => {
  return (
    <div className="space-y-6">
      <CharitiesTab
        charities={charities}
        selectedCharityIds={selectedCharityIds}
        onToggleCharity={onToggleCharity}
        onSave={onSave}
        saveLoading={saveLoading}
        onCharitiesRefresh={onCharitiesRefresh}
      />
      {showDonationProgress ? (
        <ProgressTab
          event={event}
          donations={donations}
          pendingCommitments={pendingCommitments}
          sendingReminders={sendingReminders}
          onSendReminders={onSendReminders}
        />
      ) : (
        <div className="card text-sm text-gray-600">
          Select and save at least one charity above to track donations and send reminders.
        </div>
      )}
    </div>
  );
};

export default ImpactGiftTab;