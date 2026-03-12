import { useState, useRef } from 'react';
import { supabase, TripItem } from '@/lib/supabase';

interface CategoryDef {
  id: string;
  emoji: string;
  name: string;
  subtitle: string;
}

interface Props {
  tripId: string;
  category: CategoryDef;
  onClose: () => void;
  onItemAdded: (item: TripItem) => void;
  tripStartDate?: string | null;
  tripEndDate?: string | null;
  prefilledDate?: string | null;
  isOnline?: boolean;
}

const extractHostnameTitle = (url: string): string => {
  try {
    const h = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return h.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const AddItemSheet = ({ tripId, category, onClose, onItemAdded, tripStartDate, tripEndDate, prefilledDate, isOnline = true }: Props) => {
  const [type, setType] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [itemDate, setItemDate] = useState(prefilledDate || '');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileData(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // For links, URL is required; title is optional (auto-fills from domain)
  const canSubmitLink = type === 'link' && url.trim();
  const canSubmitOther = type && type !== 'link' && title.trim();
  const canSubmit = (canSubmitLink || canSubmitOther) && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const addedByName = localStorage.getItem('tripboard-username') || 'Anonymous';
    const createdAt = Date.now();

    // For links, auto-generate title from domain if not provided
    const finalTitle = type === 'link'
      ? (title.trim() || extractHostnameTitle(url.trim()))
      : title.trim();

    const newItem: TripItem = {
      id,
      trip_id: tripId,
      category: category.id,
      type: type!,
      title: finalTitle,
      url: type === 'link' ? url.trim() : null,
      content: type === 'note' ? content.trim() : null,
      file_data: type === 'file' ? fileData : null,
      file_name: type === 'file' ? fileName : null,
      added_by_name: addedByName,
      created_at: createdAt,
      status: 'considering',
      item_date: itemDate || null,
    };

    onItemAdded(newItem);

    const { error } = await supabase.from('trip_items').insert(newItem);
    if (error) console.error('Insert failed:', error);
    setSubmitting(false);
  };

  const types = [
    { id: 'link', emoji: '🔗', label: 'Link' },
    { id: 'note', emoji: '📝', label: 'Note' },
    { id: 'file', emoji: '📎', label: 'File' },
  ];

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
      style={{ backgroundColor: 'rgba(26,54,71,0.3)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[480px] animate-slideUp overflow-y-auto"
        style={{
          backgroundColor: '#faf7f2',
          borderRadius: '24px 24px 0 0',
          padding: '24px 20px 40px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 40px)',
          maxHeight: '85vh',
        }}
      >
        <div className="flex justify-center mb-5">
          <div style={{ width: '40px', height: '4px', backgroundColor: '#ccc', borderRadius: '2px' }} />
        </div>

        <h2 className="font-display text-[22px] font-bold text-navy">Add to {category.name}</h2>
        <p className="font-body text-[14px] mb-5" style={{ color: '#7a8f9a' }}>{category.subtitle}</p>

        {/* Offline message */}
        {!isOnline && (
          <div
            className="font-body text-[13px] text-center py-3 px-4 rounded-xl mb-4"
            style={{ color: '#9aacb5', backgroundColor: 'rgba(154,172,181,0.1)' }}
          >
            you're offline right now — try again in a bit
          </div>
        )}

        {!type ? (
          <div className="flex gap-[10px]">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className="flex-1 flex flex-col items-center gap-2 py-[18px] px-[10px] active:opacity-80"
                style={{
                  backgroundColor: '#fff',
                  border: '1.5px solid rgba(26,54,71,0.1)',
                  borderRadius: '14px',
                }}
              >
                <span className="text-[26px]">{t.emoji}</span>
                <span className="font-body text-[14px] font-medium text-navy">{t.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setType(null)}
              className="font-body text-[13px] font-medium text-copper mb-4 active:opacity-70"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              ← Back
            </button>

            {/* LINK: URL first, then optional title */}
            {type === 'link' && (
              <>
                <input
                  type="url"
                  placeholder="paste your link"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-[14px] font-body text-[15px] text-navy placeholder:text-text-muted outline-none mb-3"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="give it a name (optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-[14px] font-body text-[15px] text-navy placeholder:text-text-muted outline-none mb-3"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </>
            )}

            {/* NOTE & FILE: title first */}
            {type !== 'link' && (
              <input
                type="text"
                placeholder="Give it a name..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-[14px] font-body text-[16px] text-navy placeholder:text-text-muted outline-none mb-3"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoFocus
              />
            )}

            {type === 'note' && (
              <textarea
                rows={5}
                placeholder="Add details, confirmations, notes..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-[14px] font-body text-[15px] text-navy placeholder:text-text-muted outline-none resize-none mb-3"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            )}

            {type === 'file' && (
              <div className="mb-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {!fileData ? (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-7 font-body text-[14px] font-medium text-copper active:opacity-70"
                    style={{
                      border: '2px dashed rgba(26,54,71,0.1)',
                      borderRadius: '12px',
                      backgroundColor: 'transparent',
                    }}
                  >
                    Tap to upload screenshot or file
                  </button>
                ) : (
                  <div>
                    <p className="font-body text-[13px] text-copper font-medium mb-2">✓ {fileName}</p>
                    {fileData.startsWith('data:image') && (
                      <img
                        src={fileData}
                        alt="preview"
                        className="w-full object-cover"
                        style={{ maxHeight: '180px', borderRadius: '12px' }}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Date field */}
            <div className="mb-3">
              <div className="font-body text-[13px] mb-1.5" style={{ color: '#9aacb5' }}>when?</div>
              <input
                type="date"
                value={itemDate}
                onChange={(e) => setItemDate(e.target.value)}
                min={tripStartDate || undefined}
                max={tripEndDate || undefined}
                className="w-full px-4 py-[14px] font-body text-[14px] text-navy outline-none"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || !isOnline}
              className="w-full py-4 rounded-[14px] font-body text-[16px] font-semibold mt-1 transition-opacity active:opacity-80 disabled:cursor-not-allowed"
              style={{
                backgroundColor: (canSubmit && isOnline) ? '#1a3647' : '#d0d5d8',
                color: (canSubmit && isOnline) ? '#faf7f2' : '#fff',
              }}
            >
              {submitting ? 'Adding...' : `Add to ${category.name}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddItemSheet;
