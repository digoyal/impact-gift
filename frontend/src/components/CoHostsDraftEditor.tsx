import { useState } from 'react';
import toast from 'react-hot-toast';

export interface DraftCoHost {
  id: string;
  name: string;
  email: string;
}

interface CoHostsDraftEditorProps {
  coHosts: DraftCoHost[];
  onChange: (next: DraftCoHost[]) => void;
}

const CoHostsDraftEditor = ({ coHosts, onChange }: CoHostsDraftEditorProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleAdd = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      toast.error("Please enter the co-host's name");
      return;
    }
    if (!trimmedEmail) {
      toast.error('Please enter the co-host email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (coHosts.some((c) => c.email.toLowerCase() === trimmedEmail)) {
      toast.error('That email is already in the co-host list');
      return;
    }

    onChange([
      ...coHosts,
      { id: crypto.randomUUID(), name: trimmedName, email: trimmedEmail },
    ]);
    setName('');
    setEmail('');
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h4 className="text-base font-semibold text-gray-900 mb-1">Co-hosts (optional)</h4>
      <p className="text-sm text-gray-600 mb-4">
        Add people who can help manage this event. They&apos;ll get an email to accept after you
        create the event.
      </p>

      {coHosts.length > 0 && (
        <ul className="space-y-2 mb-4">
          {coHosts.map((coHost) => (
            <li
              key={coHost.id}
              className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{coHost.name}</p>
                <p className="text-sm text-gray-600 truncate">{coHost.email}</p>
              </div>
              <button
                type="button"
                onClick={() => onChange(coHosts.filter((c) => c.id !== coHost.id))}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex-shrink-0"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-4 rounded-lg border border-dashed border-gray-300 p-4 bg-white">
        <div>
          <label htmlFor="cohost_draft_name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            id="cohost_draft_name"
            type="text"
            className="input"
            placeholder="e.g., John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <p className="text-xs text-gray-500 mt-1">Used in the co-host list and in the notification email</p>
        </div>

        <div>
          <label htmlFor="cohost_draft_email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            id="cohost_draft_email"
            type="email"
            className="input"
            placeholder="e.g., john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            They&apos;ll get an email with a link to accept co-host access for this event
          </p>
        </div>

        <button type="button" onClick={handleAdd} className="btn btn-secondary">
          Add Co-host
        </button>
      </div>
    </div>
  );
};

export default CoHostsDraftEditor;