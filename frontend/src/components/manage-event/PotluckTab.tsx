import { Event } from '../../types';
import PotluckManagement from '../PotluckManagement';

interface PotluckTabProps {
  event: Event;
}

const PotluckTab = ({ event }: PotluckTabProps) => {
  return <PotluckManagement eventId={event.id} />;
};

export default PotluckTab;