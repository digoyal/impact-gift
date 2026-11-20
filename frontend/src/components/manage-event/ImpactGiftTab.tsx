import { FormEvent } from 'react';
import CharitiesTab from './CharitiesTab';
import { Charity } from '../../types';

interface ImpactGiftTabProps {
  charities: Charity[];
  selectedCharityIds: number[];
  onToggleCharity: (charityId: number) => void;
  onSave: (e: FormEvent) => void;
  saveLoading: boolean;
  onCharitiesRefresh: (charities: Charity[]) => void;
}

const ImpactGiftTab = ({
  charities,
  selectedCharityIds,
  onToggleCharity,
  onSave,
  saveLoading,
  onCharitiesRefresh,
}: ImpactGiftTabProps) => {
  return (
    <CharitiesTab
      charities={charities}
      selectedCharityIds={selectedCharityIds}
      onToggleCharity={onToggleCharity}
      onSave={onSave}
      saveLoading={saveLoading}
      onCharitiesRefresh={onCharitiesRefresh}
    />
  );
};

export default ImpactGiftTab;