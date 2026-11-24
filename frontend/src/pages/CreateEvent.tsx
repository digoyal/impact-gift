import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { CreateEventInput } from '../types';
import toast from 'react-hot-toast';
import EventDetailsForm, { type EventDetailsFormFields } from '../components/EventDetailsForm';
import {
  captionForApi,
  createEmptyEventImage,
  type EventImageValue,
} from '../utils/eventImageCaption';
import { isAxiosError, getErrorMessage } from '../utils/errors';

const CreateEvent = () => {
  const [loading, setLoading] = useState(false);
  const [eventImage, setEventImage] = useState<EventImageValue>(createEmptyEventImage());
  const [formData, setFormData] = useState<
    EventDetailsFormFields & { event_type: string }
  >({
    title: '',
    description: '',
    event_type: 'birthday',
    event_date: '',
    start_time: '',
    end_time: '',
    venue_name: '',
    address: '',
    host_name: '',
    host_phone: '',
    cohosts_enabled: false,
    cohost_name: '',
    cohost_phone: '',
    rsvp_deadline: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const eventData: CreateEventInput = {
        ...formData,
        start_date: formData.event_date,
        end_date: formData.event_date,
      };

      const response = await api.post('/events', eventData);
      const eventId = response.data.id;

      if (eventImage.url) {
        try {
          await api.put(`/event-images/event/${eventId}`, {
            imageUrl: eventImage.url,
            publicId: eventImage.publicId,
            caption: captionForApi(eventImage.caption),
          });
        } catch (imgError) {
          console.error('Failed to save event image:', imgError);
        }
      }

      toast.success('Event created successfully!');

      navigate(`/event/${response.data.slug}/manage`, { state: { tab: 'guests' } });
    } catch (error: unknown) {
      console.error('Event creation error:', error);
      if (isAxiosError(error)) {
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
      }

      const data = isAxiosError(error) ? (error.response?.data as Record<string, unknown> | undefined) : undefined;
      const errors = data?.errors as Array<{ msg: string }> | undefined;
      const errorMessage =
        (data?.error as string) || errors?.[0]?.msg || getErrorMessage(error) || 'Failed to create event';

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Your Event</h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <EventDetailsForm
            mode="create"
            formData={formData}
            onFormDataChange={(fields) => setFormData((prev) => ({ ...prev, ...fields }))}
            eventImage={eventImage}
            onEventImageChange={setEventImage}
            eventImageHelpText="Choose from our library of beautiful event images or upload your own photo!"
            rsvpDeadlineHint={
              <p className="text-xs text-gray-500 mt-1">Set a date by which guests should respond</p>
            }
          />

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? 'Creating Event...' : 'Create, Manage Guests & More'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;