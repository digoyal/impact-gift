import { FormEvent } from 'react';
import EventPhotosUploader, { EventPhoto } from '../EventPhotosUploader';

interface DressCodeTabProps {
  dressCode: string;
  onDressCodeChange: (value: string) => void;
  attirePhotos: EventPhoto[];
  onAttirePhotosChange: (photos: EventPhoto[]) => void;
  eventId?: number;
  onSave: (e: FormEvent) => void;
  saveLoading: boolean;
}

const DressCodeTab = ({
  dressCode,
  onDressCodeChange,
  attirePhotos,
  onAttirePhotosChange,
  eventId,
  onSave,
  saveLoading,
}: DressCodeTabProps) => {
  return (
    <div className="card">
      <form onSubmit={onSave} className="space-y-6">
        <div>
          <label htmlFor="manage_dress_code" className="block text-sm font-medium text-gray-700 mb-1">
            What to wear
          </label>
          <input
            id="manage_dress_code"
            type="text"
            className="input"
            placeholder="e.g., Western Casual, Indian Ethnic, Formal"
            value={dressCode}
            onChange={(e) => onDressCodeChange(e.target.value)}
          />
        </div>

        <EventPhotosUploader
          eventId={eventId}
          photos={attirePhotos}
          onChange={onAttirePhotosChange}
          category="attire"
          maxPhotos={6}
          label="Example photos"
          helpText="Upload outfit examples, color schemes, or theme inspiration so guests can see what to wear"
        />

        <button type="submit" disabled={saveLoading} className="btn btn-primary">
          {saveLoading ? 'Saving...' : 'Save Dress Code'}
        </button>
      </form>
    </div>
  );
};

export default DressCodeTab;