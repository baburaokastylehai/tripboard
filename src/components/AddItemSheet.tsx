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
}

const AddItemSheet = ({ tripId, category, onClose, onItemAdded }: Props) => {
  const [type, setType] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
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

  const handleSubmit = async () => {
    if (!title.trim() || !type || submitting) return;
    setSubmitting(true);

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const addedByName = localStorage.getItem('tripboard-username') || 'Anonymous';
    const createdAt = Date.now();

    const newItem: TripItem = {
      id,
      trip_id: tripId,
      category: category.id,
      type,
      title: title.trim(),
      url: type === 'link' ? url.trim() : null,
      content: type === 'note' ? content.trim() : null,
      file_data: type === 'file' ? fileData : null,
      file_name: type === 'file' ? fileName : null,
      added_by_name: addedByName,
      created_at: createdAt,
      status: 'considering',
    };

    // Optimistic
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
          maxHeight: '85vh',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-5">
          <div style={{ width: '40px', height: '4px', backgroundColor: '#ccc', borderRadius: '2px' }} />
        </div>

        <h2 className="font-display text-[22px] font-bold text-navy">Add to {category.name}</h2>
        <p className="font-body text-[14px] mb-5" style={{ color: '#7a8f9a' }}>{category.subtitle}</p>

        {!type ? (
          /* Step 1: Pick type */
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
          /* Step 2: Form */
          <div>
            <button
              onClick={() => setType(null)}
              className="font-body text-[13px] font-medium text-copper mb-4 active:opacity-70"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              ← Back
            </button>

            <input
              type="text"
              placeholder="Give it a name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-[14px] font-body text-[16px] text-navy placeholder:text-text-muted outline-none mb-3"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#c17c4e')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(26,54,71,0.12)')}
              autoFocus
            />

            {type === 'link' && (
              <input
                type="url"
                placeholder="Paste URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-[14px] font-body text-[15px] text-navy placeholder:text-text-muted outline-none mb-3"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#c17c4e')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(26,54,71,0.12)')}
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
                onFocus={(e) => (e.target.style.borderColor = '#c17c4e')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(26,54,71,0.12)')}
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

            <button
              onClick={handleSubmit}
              disabled={!title.trim() || submitting}
              className="w-full py-4 rounded-[14px] font-body text-[16px] font-semibold mt-1 transition-opacity active:opacity-80 disabled:cursor-not-allowed"
              style={{
                backgroundColor: title.trim() ? '#1a3647' : '#d0d5d8',
                color: title.trim() ? '#faf7f2' : '#fff',
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
