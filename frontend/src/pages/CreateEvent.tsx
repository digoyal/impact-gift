import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { CreateEventInput } from '../types';
import toast from 'react-hot-toast';
import EventImageSelector from '../components/EventImageSelector';
import { isAxiosError, getErrorMessage } from '../utils/errors';

const CreateEvent = () => {
  const [loading, setLoading] = useState(false);
  const [eventImage, setEventImage] = useState<{ url: string; publicId: string }>({ url: '', publicId: '' });
  const [formData, setFormData] = useState({
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
    rsvp_deadline: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
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
            publicId: eventImage.publicId
          });
        } catch (imgError) {
          console.error('Failed to save event image:', imgError);
        }
      }

      toast.success('Event created successfully!');

      // Navigate to manage event page with Guest List tab active
      navigate(`/event/${response.data.slug}/manage`, { state: { tab: 'guests' } });
    } catch (error: unknown) {
      console.error('Event creation error:', error);
      if (isAxiosError(error)) {
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
      }

      const data = isAxiosError(error) ? (error.response?.data as Record<string, unknown> | undefined) : undefined;
      const errors = data?.errors as Array<{ msg: string }> | undefined;
      const errorMessage = (data?.error as string) || errors?.[0]?.msg || getErrorMessage(error) || 'Failed to create event';

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
          {/* Basic Info */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              id="title"
              type="text"
              required
              className="input"
              placeholder="e.g., Sarah's 30th Birthday"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="input"
              placeholder="Share details about your event - what's the occasion, what to expect, and any other info for your guests..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Event Image Selection */}
          <EventImageSelector
            onImageUploaded={(url, publicId) => setEventImage({ url, publicId })}
            currentImageUrl={eventImage.url}
            label="Event Image"
            helpText="Choose from our library of beautiful event images or upload your own photo!"
          />

          {/* Event Date and Time */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-1">
                Event Date *
              </label>
              <input
                id="event_date"
                type="date"
                required
                className="input"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                id="start_time"
                type="time"
                required
                className="input"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                End Time (Optional)
              </label>
              <input
                id="end_time"
                type="time"
                className="input"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          {/* Event Location */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Location</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="venue_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Name *
                </label>
                <input
                  id="venue_name"
                  type="text"
                  required
                  className="input"
                  placeholder="e.g., Golden Gate Park, The Smith Residence"
                  value={formData.venue_name}
                  onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <textarea
                  id="address"
                  rows={2}
                  className="input"
                  placeholder="123 Main St, San Francisco, CA 94102"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

            </div>
          </div>

          {/* Host Contact Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Host Information</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="host_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Host Name *
                </label>
                <input
                  id="host_name"
                  type="text"
                  required
                  className="input"
                  placeholder="Your name or organization"
                  value={formData.host_name}
                  onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="host_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Host Phone *
                </label>
                <input
                  id="host_phone"
                  type="tel"
                  required
                  className="input"
                  placeholder="(555) 123-4567"
                  value={formData.host_phone}
                  onChange={(e) => setFormData({ ...formData, host_phone: e.target.value })}
                />
              </div>
            </div>

          </div>

          {/* RSVP Deadline */}
          <div className="border-t pt-6">
            <label htmlFor="rsvp_deadline" className="block text-sm font-medium text-gray-700 mb-1">
              RSVP Deadline (Optional)
            </label>
            <input
              id="rsvp_deadline"
              type="date"
              className="input"
              value={formData.rsvp_deadline}
              onChange={(e) => setFormData({ ...formData, rsvp_deadline: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Set a date by which guests should respond
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? 'Creating Event...' : 'Create, Manage Guests & More'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default CreateEvent;
