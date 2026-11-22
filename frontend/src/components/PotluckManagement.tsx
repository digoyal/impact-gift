import { useState, useEffect } from 'react';
import api from '../utils/api';
import { PotluckItem } from '../types';
import toast from 'react-hot-toast';
import { isAxiosError } from '../utils/errors';

interface PotluckManagementProps {
  eventId: number;
}

type PotluckTableVariant = 'unclaimed' | 'claimed' | 'guest';

const formatCategory = (category?: string) => (category?.trim() ? category : '—');

const formatItemWithQty = (item: PotluckItem) =>
  item.quantity > 1 ? `${item.item_name} × ${item.quantity}` : item.item_name;

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

const PotluckItemsTable = ({
  items,
  variant,
  onEdit,
  onDelete,
}: {
  items: PotluckItem[];
  variant: PotluckTableVariant;
  onEdit?: (item: PotluckItem) => void;
  onDelete?: (id: number) => void;
}) => {
  const personLabel = variant === 'claimed' ? 'Claimed by' : 'Added by';
  const rowTint =
    variant === 'unclaimed'
      ? 'bg-yellow-50/60'
      : variant === 'claimed'
        ? 'bg-green-50/40'
        : 'bg-blue-50/30';
  const compactRows = variant !== 'unclaimed';

  return (
    <div className="overflow-x-auto -mx-1 sm:mx-0">
      <table className="min-w-[520px] w-full border-collapse text-sm">
        <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
          <tr>
            {compactRows ? (
              <>
                <th className="px-3 py-2 text-left">Item</th>
                <th className="px-3 py-2 text-left w-32">Category</th>
                <th className="px-3 py-2 text-left w-36">{personLabel}</th>
                <th className="px-3 py-2 text-left">Notes</th>
              </>
            ) : (
              <>
                <th className="px-3 py-2 text-left w-32">Category</th>
                <th className="px-3 py-2 text-left">Item</th>
                <th className="px-3 py-2 text-left w-14">Qty</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Notes</th>
              </>
            )}
            {(onEdit || onDelete) && <th className="px-3 py-2 text-left w-24">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((item) => (
            <tr key={item.id} className={`${rowTint}${compactRows ? ' whitespace-nowrap' : ''}`}>
              {compactRows ? (
                <>
                  <td className="px-3 py-2 text-xs font-medium text-gray-900 whitespace-nowrap align-middle">
                    <span className="truncate max-w-[14rem] inline-block" title={formatItemWithQty(item)}>
                      {formatItemWithQty(item)}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle whitespace-nowrap">
                    <span className="inline-flex text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      {formatCategory(item.category)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-800 align-middle whitespace-nowrap">
                    <span
                      className="font-medium truncate max-w-[9rem] inline-block align-bottom"
                      title={
                        item.guest_email
                          ? `${item.guest_name || ''} (${item.guest_email})`.trim()
                          : item.guest_name || undefined
                      }
                    >
                      {item.guest_name || '—'}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2 text-xs text-gray-600 align-middle max-w-[10rem] truncate italic"
                    title={item.notes || undefined}
                  >
                    {item.notes?.trim() ? item.notes : '—'}
                  </td>
                </>
              ) : (
                <>
                  <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap align-middle">
                    {formatCategory(item.category)}
                  </td>
                  <td className="px-3 py-2 text-xs font-medium text-gray-900 whitespace-nowrap align-middle">
                    {item.item_name}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700 align-middle">{item.quantity}</td>
                  <td className="px-3 py-2 whitespace-nowrap align-middle">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                      Waiting for guest
                    </span>
                  </td>
                  <td
                    className="px-3 py-2 text-xs text-gray-600 max-w-[10rem] truncate italic align-middle"
                    title={item.notes || undefined}
                  >
                    {item.notes?.trim() ? item.notes : '—'}
                  </td>
                </>
              )}
              {(onEdit || onDelete) && (
                <td className="px-3 py-2 text-left whitespace-nowrap align-middle">
                  <div className="inline-flex items-center gap-0">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        aria-label={`Edit ${item.item_name}`}
                        title="Edit"
                        className="inline-flex items-center justify-center min-h-9 min-w-9 rounded text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        aria-label={`Delete ${item.item_name}`}
                        title="Delete"
                        className="inline-flex items-center justify-center min-h-9 min-w-9 -ml-1 rounded text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PotluckManagement = ({ eventId }: PotluckManagementProps) => {
  const [items, setItems] = useState<PotluckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: 1,
    category: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [eventId]);

  const fetchItems = async () => {
    try {
      const response = await api.get<PotluckItem[]>(`/potluck/event/${eventId}`);
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load potluck items');
    } finally {
      setLoading(false);
    }
  };

  const resetSuggestForm = () => {
    setEditingItemId(null);
    setFormData({
      item_name: '',
      quantity: 1,
      category: '',
      notes: '',
    });
  };

  const openSuggestModal = () => {
    resetSuggestForm();
    setShowAddModal(true);
  };

  const openEditSuggestedItem = (item: PotluckItem) => {
    setEditingItemId(item.id);
    setFormData({
      item_name: item.item_name,
      quantity: item.quantity,
      category: item.category || '',
      notes: item.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSaveSuggestedItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingItemId !== null) {
        await api.put(`/potluck/event/${eventId}/suggested-items/${editingItemId}`, formData);
        toast.success('Item updated');
      } else {
        await api.post(`/potluck/event/${eventId}/suggested-items`, formData);
        toast.success('Suggested item added!');
      }
      setShowAddModal(false);
      resetSuggestForm();
      fetchItems();
    } catch (error: unknown) {
      const data = isAxiosError(error) ? (error.response?.data as Record<string, unknown> | undefined) : undefined;
      const errorMsg =
        (data?.error as string) ||
        (editingItemId !== null ? 'Failed to update item' : 'Failed to add suggested item');
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSuggestedItem = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to delete this suggested item?')) return;

    try {
      await api.delete(`/potluck/event/${eventId}/suggested-items/${itemId}`);
      toast.success('Suggested item deleted');
      fetchItems();
    } catch (error: unknown) {
      const data = isAxiosError(error) ? (error.response?.data as Record<string, unknown> | undefined) : undefined;
      const errorMsg = (data?.error as string) || 'Failed to delete item';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">Loading suggested items...</p>
      </div>
    );
  }

  const suggestedUnclaimed = items.filter(item => item.is_suggested && !item.guest_email);
  const suggestedClaimed = items.filter(item => item.is_suggested && item.guest_email);
  const guestAdded = items.filter(item => !item.is_suggested);

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="card !p-4 sm:!p-5">
        <div className="flex flex-nowrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold min-w-0 truncate" title="Suggest items for guests to bring">
              Suggest items for guests to bring
            </h3>
            <button
              type="button"
              onClick={openSuggestModal}
              className="btn btn-primary btn-sm shrink-0 whitespace-nowrap"
            >
              + Suggest Item
            </button>
        </div>
      </div>

      {/* Unclaimed Suggested Items */}
      {suggestedUnclaimed.length > 0 && (
        <div className="card !p-4 sm:!p-5">
          <h3 className="text-sm font-semibold mb-2 text-yellow-700">
            Unclaimed ({suggestedUnclaimed.length})
          </h3>
          <PotluckItemsTable
            items={suggestedUnclaimed}
            variant="unclaimed"
            onEdit={openEditSuggestedItem}
            onDelete={handleDeleteSuggestedItem}
          />
        </div>
      )}

      {/* Claimed Suggested Items */}
      {suggestedClaimed.length > 0 && (
        <div className="card !p-4 sm:!p-5">
          <h3 className="text-sm font-semibold mb-2 text-green-700">
            Claimed ({suggestedClaimed.length})
          </h3>
          <PotluckItemsTable
            items={suggestedClaimed}
            variant="claimed"
            onEdit={openEditSuggestedItem}
            onDelete={handleDeleteSuggestedItem}
          />
        </div>
      )}

      {/* Guest-Added Items */}
      {guestAdded.length > 0 && (
        <div className="card !p-4 sm:!p-5">
          <h3 className="text-sm font-semibold mb-2 text-blue-700">
            Guest added ({guestAdded.length})
          </h3>
          <PotluckItemsTable items={guestAdded} variant="guest" />
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="card !p-4 sm:!p-5">
          <div className="text-center py-5 text-sm">
            <p className="text-gray-500">
              No items yet. Use &ldquo;Suggest Item&rdquo; above to get started.
            </p>
          </div>
        </div>
      )}

      {/* Add Suggested Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{editingItemId !== null ? 'Edit Item' : 'Suggest Item'}</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetSuggestForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {editingItemId === null && (
              <p className="text-sm text-gray-600 mb-4">
                Add items you&apos;d like guests to bring. Guests can claim these items from the event page.
              </p>
            )}

            <form onSubmit={handleSaveSuggestedItem} className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select category...</option>
                  <option value="Appetizer">Appetizer</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Side Dish">Side Dish</option>
                  <option value="Salad">Salad</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  id="item_name"
                  type="text"
                  required
                  className="input"
                  placeholder="e.g., Chocolate chip cookies, Salad, Drinks"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max="99"
                  className="input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  className="input"
                  placeholder="e.g., Should serve 10-12 people"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1"
                >
                  {submitting ? 'Saving...' : editingItemId !== null ? 'Save' : 'Suggest Item'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetSuggestForm();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PotluckManagement;
