import { useState } from 'react';
import { TripItem } from '@/lib/supabase';

interface Props {
  item: TripItem;
  onDelete: () => void;
}

const extractHostname = (url: string) => {
  try {
    const h = new URL(url).hostname;
    return h.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const ItemCard = ({ item, onDelete }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const isLongContent = item.content && item.content.length > 120;

  return (
    <div
      className="mb-[10px] animate-fadeSlideIn"
      style={{
        backgroundColor: '#fff',
        borderRadius: '14px',
        padding: '14px 16px',
        boxShadow: '0 1px 4px rgba(26,54,71,0.07)',
        border: '1px solid rgba(26,54,71,0.06)',
      }}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-body text-[15px] font-semibold text-navy mb-1">{item.title}</div>
          <div className="font-body text-[11px] text-text-muted">added by {item.added_by_name}</div>
        </div>
        <button
          onClick={onDelete}
          className="flex-shrink-0 text-[18px] leading-none active:opacity-50"
          style={{ color: '#b0bec5', background: 'none', border: 'none', padding: '0 2px' }}
        >
          ×
        </button>
      </div>

      {/* Type-specific content */}
      {item.type === 'link' && item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 font-body text-[13px] text-navy active:opacity-70"
          style={{
            backgroundColor: 'rgba(26,54,71,0.06)',
            borderRadius: '20px',
            textDecoration: 'none',
          }}
        >
          <span style={{ opacity: 0.5 }}>↗</span>
          {extractHostname(item.url)}
        </a>
      )}

      {item.type === 'note' && item.content && (
        <div className="mt-3">
          <div
            className="font-body text-[13.5px] leading-relaxed whitespace-pre-wrap"
            style={{
              color: '#4a6572',
              maxHeight: expanded ? 'none' : '60px',
              overflow: 'hidden',
            }}
          >
            {item.content}
          </div>
          {isLongContent && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="font-body text-[13px] font-medium text-copper mt-1 active:opacity-70"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              ...more
            </button>
          )}
        </div>
      )}

      {item.type === 'file' && item.file_data && (
        <div className="mt-3">
          {item.file_data.startsWith('data:image') ? (
            <img
              src={item.file_data}
              alt={item.file_name || 'uploaded image'}
              className="w-full object-cover"
              style={{ maxHeight: '220px', borderRadius: '10px' }}
            />
          ) : (
            <div
              className="font-body text-[13px] px-3 py-2 rounded-lg"
              style={{ color: '#4a6572', backgroundColor: 'rgba(26,54,71,0.04)' }}
            >
              📄 {item.file_name || 'File'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemCard;
