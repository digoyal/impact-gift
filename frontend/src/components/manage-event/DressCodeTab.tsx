import { FormEvent } from 'react';
import EventPhotosUploader, { EventPhoto } from '../EventPhotosUploader';

interface DressCodeTabProps {
  includeDressCode: boolean;
  onIncludeDressCodeChange: (enabled: boolean) => void;
  dressCode: string;
  onDressCodeChange: (value: string) => void;
  attirePhotos: EventPhoto[];
  onAttirePhotosChange: (photos: EventPhoto[]) => void;
  eventId?: number;
  onSave: (e: FormEvent) => void;
  saveLoading: boolean;
}

const DressCodeTab = ({
  includeDressCode,
  onIncludeDressCodeChange,
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
        <h3 className="text-xl font-semibold text-gray-900">Dress Code</h3>
        <p className="text-sm text-gray-600">
          Share what guests should wear, with optional example photos.
        </p>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="manage_include_dress_code"
              type="checkbox"
              checked={includeDressCode}
              onChange={(e) => onIncludeDressCodeChange(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="manage_include_dress_code" className="font-medium text-gray-700">
              Include dress code on the event page
            </label>
          </div>
        </div>

        {includeDressCode && (
          <div className="space-y-6">
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
          </div>
        )}

        <button type="submit" disabled={saveLoading} className="btn btn-primary">
          {saveLoading ? 'Saving...' : 'Save Dress Code'}
        </button>
      </form>
    </div>
  );
};

export default DressCodeTab;