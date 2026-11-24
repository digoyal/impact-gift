import type { ChangeEvent, ReactNode } from 'react';
import EventImageSelector from './EventImageSelector';
import type { EventImageCaption, EventImageValue } from '../utils/eventImageCaption';

export interface EventDetailsFormFields {
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  address: string;
  host_name: string;
  host_phone: string;
  cohosts_enabled: boolean;
  cohost_name: string;
  cohost_phone: string;
  rsvp_deadline: string;
}

const LABEL_CLASS = 'block text-sm font-semibold text-gray-700 mb-1';

export type EventDetailsFormMode = 'create' | 'edit';

interface EventDetailsFormProps {
  mode: EventDetailsFormMode;
  formData: EventDetailsFormFields;
  onFormDataChange: (data: EventDetailsFormFields) => void;
  eventImage: EventImageValue;
  onEventImageChange: (image: EventImageValue | ((prev: EventImageValue) => EventImageValue)) => void;
  /** Shown under Event Image on create only */
  eventImageHelpText?: string;
  /** Optional hint below RSVP deadline (create page) */
  rsvpDeadlineHint?: ReactNode;
}

const EventDetailsForm = ({
  mode,
  formData,
  onFormDataChange,
  eventImage,
  onEventImageChange,
  eventImageHelpText,
  rsvpDeadlineHint,
}: EventDetailsFormProps) => {
  const handleChange =
    (field: keyof EventDetailsFormFields) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onFormDataChange({ ...formData, [field]: e.target.value });
    };

  const cohostsOn = formData.cohosts_enabled;

  const titleField = (
    <div>
      <label htmlFor="title" className={LABEL_CLASS}>
        Event Title *
      </label>
      <input
        id="title"
        type="text"
        required
        className="input"
        placeholder={mode === 'create' ? "e.g., Sarah's 30th Birthday" : undefined}
        value={formData.title}
        onChange={handleChange('title')}
      />
    </div>
  );

  return (
    <>
      <div>
        <EventImageSelector
          currentImageUrl={eventImage.url}
          onImageUploaded={(url, publicId) =>
            onEventImageChange((prev) => ({ ...prev, url, publicId }))
          }
          imageCaption={eventImage.caption}
          onImageCaptionChange={(caption: EventImageCaption) =>
            onEventImageChange((prev) => ({ ...prev, caption }))
          }
          helpText={eventImageHelpText}
          libraryCategoryHeader={titleField}
        />
      </div>

      <div>
        <label htmlFor="description" className={LABEL_CLASS}>
          About This Event
        </label>
        <textarea
          id="description"
          className="input"
          rows={4}
          placeholder={
            mode === 'create'
              ? "Share details about your event - what's the occasion, what to expect, and any other info for your guests..."
              : 'Tell your guests about your event...'
          }
          value={formData.description}
          onChange={handleChange('description')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="min-w-0">
          <label htmlFor="event_date" className={LABEL_CLASS}>
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
          <label htmlFor="start_time" className={LABEL_CLASS}>
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
          <label htmlFor="end_time" className={LABEL_CLASS}>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="min-w-0 sm:col-span-1">
          <label htmlFor="venue_name" className={LABEL_CLASS}>
            Venue Name *
          </label>
          <input
            id="venue_name"
            type="text"
            required
            className="input"
            placeholder={
              mode === 'create'
                ? 'e.g., Golden Gate Park, The Smith Residence'
                : 'e.g., Our Home, Central Park'
            }
            value={formData.venue_name}
            onChange={handleChange('venue_name')}
          />
        </div>

        <div className="min-w-0 sm:col-span-2">
          <label htmlFor="address" className={LABEL_CLASS}>
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

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="min-w-0">
            <label htmlFor="host_name" className={LABEL_CLASS}>
              Host Name *
            </label>
            <input
              id="host_name"
              type="text"
              required
              className="input"
              placeholder={mode === 'create' ? 'Your name or organization' : 'Your name'}
              value={formData.host_name}
              onChange={handleChange('host_name')}
            />
          </div>

          <div className="min-w-0">
            <label htmlFor="host_phone" className={LABEL_CLASS}>
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

          <div className="min-w-0">
            <span id="cohosts_enabled_label" className={LABEL_CLASS}>
              Co-Hosts
            </span>
            <label
              htmlFor="cohosts_enabled"
              className="flex min-h-[40px] cursor-pointer items-center gap-2"
            >
              <input
                id="cohosts_enabled"
                type="checkbox"
                aria-labelledby="cohosts_enabled_label"
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                checked={cohostsOn}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  onFormDataChange({
                    ...formData,
                    cohosts_enabled: enabled,
                    ...(enabled ? {} : { cohost_name: '', cohost_phone: '' }),
                  });
                }}
              />
            </label>
          </div>
        </div>

        {cohostsOn && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="min-w-0">
              <label htmlFor="cohost_name" className={LABEL_CLASS}>
                Co-Host Name *
              </label>
              <input
                id="cohost_name"
                type="text"
                required
                className="input"
                placeholder="Co-host name"
                value={formData.cohost_name}
                onChange={handleChange('cohost_name')}
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="cohost_phone" className={LABEL_CLASS}>
                Co-Host Phone *
              </label>
              <input
                id="cohost_phone"
                type="tel"
                required
                className="input"
                placeholder="(555) 123-4567"
                value={formData.cohost_phone}
                onChange={handleChange('cohost_phone')}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="mb-4">
          <label htmlFor="rsvp_deadline" className={LABEL_CLASS}>
            RSVP Deadline (Optional)
          </label>
          <input
            id="rsvp_deadline"
            type="date"
            className="input"
            value={formData.rsvp_deadline}
            onChange={handleChange('rsvp_deadline')}
          />
          {rsvpDeadlineHint}
        </div>
      </div>
    </>
  );
};

export default EventDetailsForm;