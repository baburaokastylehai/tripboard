import { useState } from 'react';
import { supabase, TripItem } from '@/lib/supabase';

interface Props {
  item: TripItem;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onItemUpdated: (item: TripItem) => void;
  tripStartDate?: string | null;
  tripEndDate?: string | null;
}

const extractHostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const formatItemDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ItemDetailSheet = ({ item, onClose, onStatusChange, onDelete, onItemUpdated, tripStartDate, tripEndDate }: Props) => {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState(item.title);
  const [editUrl, setEditUrl] = useState(item.url || '');
  const [editContent, setEditContent] = useState(item.content || '');
  const [editDate, setEditDate] = useState(item.item_date || '');
  const [saving, setSaving] = useState(false);

  const isBooked = item.status === 'booked';

  const handleToggleStatus = (status: string) => {
    onStatusChange(item.id, status);
  };

  const handleDelete = () => {
    onDelete(item.id);
    onClose();
  };

  const handleSave = async () => {
    if (!editTitle.trim() || saving) return;
    setSaving(true);

    const updates: Partial<TripItem> = {
      title: editTitle.trim(),
      item_date: editDate || null,
    };
    if (item.type === 'link') updates.url = editUrl.trim() || null;
    if (item.type === 'note') updates.content = editContent.trim() || null;

    const { error } = await supabase.from('trip_items').update(updates).eq('id', item.id);
    if (!error) {
      onItemUpdated({ ...item, ...updates });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(item.title);
    setEditUrl(item.url || '');
    setEditContent(item.content || '');
    setEditDate(item.item_date || '');
    setEditing(false);
  };

  const inputStyle = {
    border: '1.5px solid rgba(26,54,71,0.12)',
    borderRadius: '12px',
    backgroundColor: '#fff',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#c17c4e');
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = 'rgba(26,54,71,0.12)');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{
        backgroundColor: 'rgba(26,54,71,0.25)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[480px] animate-slideUp overflow-y-auto"
        style={{
          backgroundColor: '#fff',
          borderRadius: '24px 24px 0 0',
          padding: '24px 20px 40px',
          maxHeight: '85vh',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-5">
          <div style={{ width: '40px', height: '4px', backgroundColor: '#ccc', borderRadius: '2px' }} />
        </div>

        {/* Content */}
        <div style={{ transition: 'opacity 0.2s ease' }}>
          {!editing ? (
            /* ===== READ-ONLY VIEW ===== */
            <div>
              {/* Title */}
              <h2 className="font-display text-[22px] font-bold" style={{ color: '#1a3647' }}>
                {item.title}
              </h2>

              {/* By name + date pill */}
              <div className="flex items-center gap-2 mt-1">
                <span className="font-body text-[12px] flex items-center gap-1" style={{ color: '#9aacb5' }}>
                  {item.added_by_name === 'via WhatsApp' ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.5 }}>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      via WhatsApp
                    </>
                  ) : (
                    <>by {item.added_by_name}</>
                  )}
                </span>
                {item.item_date && (
                  <span
                    className="font-body text-[12px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#f5f0e8', color: '#1a3647' }}
                  >
                    {formatItemDate(item.item_date)}
                  </span>
                )}
              </div>

              {/* 16px gap */}
              <div style={{ height: '16px' }} />

              {/* Type-specific content */}
              {item.type === 'link' && item.url && (
                <div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-[14px] break-all active:opacity-70"
                    style={{ color: '#c17c4e', textDecoration: 'none' }}
                  >
                    {item.url} <span style={{ fontSize: '12px' }}>↗</span>
                  </a>
                  <div className="font-body text-[12px] mt-1" style={{ color: '#9aacb5' }}>
                    {extractHostname(item.url)}
                  </div>
                </div>
              )}

              {item.type === 'note' && item.content && (
                <div
                  className="font-body text-[15px]"
                  style={{ color: '#4a6572', lineHeight: 1.6 }}
                >
                  {item.content}
                </div>
              )}

              {item.type === 'file' && item.file_data && (
                <div>
                  {item.file_data.startsWith('data:image') && (
                    <img
                      src={item.file_data}
                      alt=""
                      className="w-full object-cover"
                      style={{ borderRadius: '12px', maxHeight: '300px' }}
                    />
                  )}
                  {item.file_name && (
                    <div className="font-body text-[12px] mt-2" style={{ color: '#9aacb5' }}>
                      {item.file_name}
                    </div>
                  )}
                </div>
              )}

              {/* 20px gap */}
              <div style={{ height: '20px' }} />

              {/* Status pills */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleStatus('considering')}
                  className="font-body text-[13px] px-4 py-2 rounded-full active:opacity-70"
                  style={{
                    border: `1.5px solid ${!isBooked ? '#c17c4e' : 'rgba(26,54,71,0.12)'}`,
                    color: !isBooked ? '#c17c4e' : '#9aacb5',
                    backgroundColor: 'transparent',
                    fontWeight: !isBooked ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  considering
                </button>
                <button
                  onClick={() => handleToggleStatus('booked')}
                  className="font-body text-[13px] px-4 py-2 rounded-full active:opacity-70"
                  style={{
                    border: `1.5px solid ${isBooked ? '#5cbf8a' : 'rgba(26,54,71,0.12)'}`,
                    color: isBooked ? '#5cbf8a' : '#9aacb5',
                    backgroundColor: 'transparent',
                    fontWeight: isBooked ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  booked ✓
                </button>
              </div>

              {/* Bottom actions */}
              <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid rgba(26,54,71,0.06)' }}>
                {/* Delete */}
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="font-body text-[13px] active:opacity-70"
                    style={{ color: '#e57373', background: 'none', border: 'none', padding: 0 }}
                  >
                    delete
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDelete}
                      className="font-body text-[13px] font-medium active:opacity-70"
                      style={{ color: '#e57373', background: 'none', border: 'none', padding: 0 }}
                    >
                      sure? remove
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="font-body text-[13px] active:opacity-70"
                      style={{ color: '#9aacb5', background: 'none', border: 'none', padding: 0 }}
                    >
                      cancel
                    </button>
                  </div>
                )}

                {/* Edit */}
                <button
                  onClick={() => { setEditing(true); setConfirmDelete(false); }}
                  className="font-body text-[13px] active:opacity-70"
                  style={{ color: '#c17c4e', background: 'none', border: 'none', padding: 0 }}
                >
                  edit ✦
                </button>
              </div>
            </div>
          ) : (
            /* ===== EDIT VIEW ===== */
            <div>
              {/* Title input */}
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-[14px] font-body text-[16px] text-navy placeholder:text-text-muted outline-none mb-3"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoFocus
              />

              {/* Type-specific edit */}
              {item.type === 'link' && (
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="URL"
                  className="w-full px-4 py-[14px] font-body text-[15px] text-navy placeholder:text-text-muted outline-none mb-3"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              )}

              {item.type === 'note' && (
                <textarea
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Note content..."
                  className="w-full px-4 py-[14px] font-body text-[15px] text-navy placeholder:text-text-muted outline-none resize-none mb-3"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              )}

              {item.type === 'file' && item.file_data && item.file_data.startsWith('data:image') && (
                <img
                  src={item.file_data}
                  alt=""
                  className="w-full object-cover mb-3"
                  style={{ borderRadius: '12px', maxHeight: '200px' }}
                />
              )}

              {/* Date */}
              <div className="mb-3">
                <div className="font-body text-[13px] mb-1.5" style={{ color: '#9aacb5' }}>when?</div>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  min={tripStartDate || undefined}
                  max={tripEndDate || undefined}
                  className="w-full px-4 py-[14px] font-body text-[14px] text-navy outline-none"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {/* Status pills (same as read-only) */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleToggleStatus('considering')}
                  className="font-body text-[13px] px-4 py-2 rounded-full active:opacity-70"
                  style={{
                    border: `1.5px solid ${!isBooked ? '#c17c4e' : 'rgba(26,54,71,0.12)'}`,
                    color: !isBooked ? '#c17c4e' : '#9aacb5',
                    backgroundColor: 'transparent',
                    fontWeight: !isBooked ? 600 : 400,
                  }}
                >
                  considering
                </button>
                <button
                  onClick={() => handleToggleStatus('booked')}
                  className="font-body text-[13px] px-4 py-2 rounded-full active:opacity-70"
                  style={{
                    border: `1.5px solid ${isBooked ? '#5cbf8a' : 'rgba(26,54,71,0.12)'}`,
                    color: isBooked ? '#5cbf8a' : '#9aacb5',
                    backgroundColor: 'transparent',
                    fontWeight: isBooked ? 600 : 400,
                  }}
                >
                  booked ✓
                </button>
              </div>

              {/* Bottom actions: cancel / save */}
              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(26,54,71,0.06)' }}>
                <button
                  onClick={handleCancelEdit}
                  className="font-body text-[13px] active:opacity-70"
                  style={{ color: '#9aacb5', background: 'none', border: 'none', padding: 0 }}
                >
                  cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editTitle.trim() || saving}
                  className="font-body text-[13px] font-medium active:opacity-70 disabled:opacity-40"
                  style={{ color: '#c17c4e', background: 'none', border: 'none', padding: 0 }}
                >
                  {saving ? 'saving...' : 'save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailSheet;
