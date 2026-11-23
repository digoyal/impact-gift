import type { FormEvent } from 'react';
import EventDetailsForm, { type EventDetailsFormFields } from '../EventDetailsForm';
import type { EventImageValue } from '../../utils/eventImageCaption';

interface FormData extends EventDetailsFormFields {
  event_type: string;
  dress_code: string;
  show_guest_list: boolean;
  potluck_enabled: boolean;
  allow_additional_guests: boolean;
}

interface DetailsTabProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  eventImage: EventImageValue;
  onEventImageChange: (image: EventImageValue) => void;
  onSubmit: (e: FormEvent) => void;
  saveLoading: boolean;
}

const pickDetailsFields = (data: FormData): EventDetailsFormFields => ({
  title: data.title,
  description: data.description,
  event_date: data.event_date,
  start_time: data.start_time,
  end_time: data.end_time,
  venue_name: data.venue_name,
  address: data.address,
  host_name: data.host_name,
  host_phone: data.host_phone,
  rsvp_deadline: data.rsvp_deadline,
});

const DetailsTab = ({
  formData,
  onFormDataChange,
  eventImage,
  onEventImageChange,
  onSubmit,
  saveLoading,
}: DetailsTabProps) => (
  <div className="card">
    <form onSubmit={onSubmit} className="space-y-6">
      <EventDetailsForm
        mode="edit"
        formData={pickDetailsFields(formData)}
        onFormDataChange={(fields) => onFormDataChange({ ...formData, ...fields })}
        eventImage={eventImage}
        onEventImageChange={onEventImageChange}
      />

      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={saveLoading} className="btn btn-primary">
          {saveLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  </div>
);

export default DetailsTab;