import toast from 'react-hot-toast';

interface CharityPageSetupCardProps {
  slug: string;
  onSlugChange: (slug: string) => void;
  inputId?: string;
}

const CharityPageSetupCard = ({
  slug,
  onSlugChange,
  inputId = 'charity_page_slug',
}: CharityPageSetupCardProps) => {
  return (
    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border border-accent-200">
      <h3 className="text-lg font-bold text-gray-900 mb-2">💝 My Charity Page</h3>
      <p className="text-sm text-gray-600 mb-4">
        Create a shareable page with your favorite charities. Share this instead of a gift registry for
        birthdays, holidays, or any occasion!
      </p>

      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          My Charity Page URL
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 whitespace-nowrap">giftwithimpact.com/charity/</span>
          <input
            id={inputId}
            type="text"
            className="input flex-1 min-w-[8rem]"
            placeholder="charity-love"
            value={slug}
            onChange={(e) =>
              onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
            }
            pattern="[a-z0-9-]+"
            minLength={3}
            maxLength={50}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Only lowercase letters, numbers, and hyphens. Min 3 characters.
        </p>
        {slug && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-accent-200">
            <p className="text-xs text-gray-600 mb-1">Your shareable link:</p>
            <a
              href={`/charity/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent-600 hover:text-accent-700 font-medium break-all"
            >
              {window.location.origin}/charity/{slug}
            </a>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/charity/${slug}`);
                toast.success('Link copied!');
              }}
              className="ml-2 text-xs text-accent-600 hover:text-accent-700"
            >
              📋 Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharityPageSetupCard;