import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { retryGet } from '../utils/apiRetry';
import { useAuth } from '../contexts/AuthContext';
import CharityPageSetupCard from './CharityPageSetupCard';
import { isAxiosError } from '../utils/errors';

interface CharityPageStats {
  has_charity_page: boolean;
  charity_page_slug: string | null;
  total_commitments: number;
  total_amount: number;
}

const CharityPageCard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, refreshUser } = useAuth();
  const [slug, setSlug] = useState(user?.charity_page_slug || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSlug(user?.charity_page_slug || '');
  }, [user?.charity_page_slug]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['charity-page-stats'],
    queryFn: async () => {
      const response = await retryGet<CharityPageStats>('/charity-commitments/my-page/stats');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const savedSlug = user?.charity_page_slug || '';
  const slugDirty = slug !== savedSlug;
  const slugValid = slug.length >= 3 && /^[a-z0-9-]+$/.test(slug);

  const saveSlug = async () => {
    if (!slugValid) return;
    setSaving(true);
    try {
      await api.put('/users/profile', { charity_page_slug: slug });
      toast.success('Charity page URL saved!');
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ['charity-page-stats'] });
    } catch (error: unknown) {
      const data = isAxiosError(error) ? (error.response?.data as Record<string, unknown> | undefined) : undefined;
      const errorMsg = (data?.error as string) || 'Failed to save charity page URL';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const activeSlug = savedSlug || stats?.charity_page_slug || '';

  const copyPageUrl = () => {
    if (!activeSlug) return;
    const url = `${window.location.origin}/charity/${activeSlug}`;
    navigator.clipboard.writeText(url);
    toast.success('Charity page link copied!');
  };

  const viewPage = () => {
    if (activeSlug) {
      navigate(`/charity/${activeSlug}`);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const showStats = !!(savedSlug || stats?.has_charity_page);

  return (
    <div className="space-y-4">
      <CharityPageSetupCard
        slug={slug}
        onSlugChange={setSlug}
        inputId="dashboard-charity-page-slug"
      />
      {(slugDirty || !savedSlug) && (
        <button
          type="button"
          onClick={saveSlug}
          disabled={!slugValid || saving}
          className="btn btn-primary"
        >
          {saving ? 'Saving…' : savedSlug ? 'Update URL' : 'Save Charity Page URL'}
        </button>
      )}
      {showStats && (
        <div className="card">
          <h4 className="text-sm font-semibold text-neutral-700 mb-3">Page activity</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Total Commitments:</span>
              <span className="font-semibold">{stats?.total_commitments ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Total Amount:</span>
              <span className="font-semibold text-green-600">
                ${Number(stats?.total_amount ?? 0).toFixed(2)}
              </span>
            </div>
            {activeSlug && (
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={viewPage} className="btn btn-primary flex-1">
                  View Page
                </button>
                <button type="button" onClick={copyPageUrl} className="btn btn-secondary flex-1">
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharityPageCard;