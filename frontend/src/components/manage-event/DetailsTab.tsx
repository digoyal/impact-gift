import EventImageSelector from '../EventImageSelector';

interface FormData {
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  address: string;
  host_name: string;
  host_phone: string;
  rsvp_deadline: string;
  dress_code: string;
  show_guest_list: boolean;
  potluck_enabled: boolean;
}

interface DetailsTabProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  eventImage: { url: string; publicId: string };
  onEventImageChange: (url: string, publicId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  saveLoading: boolean;
}

const DetailsTab = ({
  formData,
  onFormDataChange,
  eventImage,
  onEventImageChange,
  onSubmit,
  saveLoading,
}: DetailsTabProps) => {
  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="card">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Event Image */}
        <div className="-mt-1 sm:-mt-2">
          <EventImageSelector
            currentImageUrl={eventImage.url}
            onImageUploaded={onEventImageChange}
          />
        </div>

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
            value={formData.title}
            onChange={handleChange('title')}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            About This Event
          </label>
          <textarea
            id="description"
            className="input"
            rows={4}
            placeholder="Tell your guests about your event..."
            value={formData.description}
            onChange={handleChange('description')}
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="min-w-0">
            <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              id="event_date"
              type="date"
              required
              className="input"
              value={formData.event_date}
              onChange={handleChange('event_date')}
            />
          </div>

          <div className="min-w-0">
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              id="start_time"
              type="time"
              required
              className="input"
              value={formData.start_time}
              onChange={handleChange('start_time')}
            />
          </div>

          <div className="min-w-0">
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
              End Time (Optional)
            </label>
            <input
              id="end_time"
              type="time"
              className="input"
              value={formData.end_time}
              onChange={handleChange('end_time')}
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="venue_name" className="block text-sm font-medium text-gray-700 mb-1">
              Venue Name *
            </label>
            <input
              id="venue_name"
              type="text"
              required
              className="input"
              placeholder="e.g., Our Home, Central Park"
              value={formData.venue_name}
              onChange={handleChange('venue_name')}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address (Optional)
            </label>
            <input
              id="address"
              type="text"
              className="input"
              placeholder="123 Main St, San Francisco, CA 94102"
              value={formData.address}
              onChange={handleChange('address')}
            />
          </div>
        </div>

        {/* Host Info */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Host Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0">
              <label htmlFor="host_name" className="block text-sm font-medium text-gray-700 mb-1">
                Host Name *
              </label>
              <input
                id="host_name"
                type="text"
                required
                className="input"
                placeholder="Your name"
                value={formData.host_name}
                onChange={handleChange('host_name')}
              />
            </div>

            <div className="min-w-0">
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
                onChange={handleChange('host_phone')}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="mb-4">
            <label htmlFor="rsvp_deadline" className="block text-sm font-medium text-gray-700 mb-1">
              RSVP Deadline (Optional)
            </label>
            <input
              id="rsvp_deadline"
              type="date"
              className="input"
              value={formData.rsvp_deadline}
              onChange={handleChange('rsvp_deadline')}
            />
          </div>

        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saveLoading}
            className="btn btn-primary"
          >
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DetailsTab;
