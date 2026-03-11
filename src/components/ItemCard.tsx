import { useState } from 'react';
import { supabase, TripItem } from '@/lib/supabase';

interface Props {
  item: TripItem;
  onDelete: () => void;
  onStatusChange: (id: string, status: string) => void;
}

const extractHostname = (url: string) => {
  try {
    const h = new URL(url).hostname;
    return h.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const ItemCard = ({ item, onDelete, onStatusChange }: Props) => {
  const isBooked = item.status === 'booked';

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = isBooked ? 'considering' : 'booked';
    onStatusChange(item.id, newStatus);
  };

  return (
    <div
      className="relative flex-shrink-0 animate-fadeSlideIn flex flex-col justify-between"
      style={{
        width: '148px',
        height: '148px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '14px',
        boxShadow: '0 1px 4px rgba(26,54,71,0.07)',
        border: '1px solid rgba(26,54,71,0.06)',
        borderLeft: isBooked ? '3px solid #5cbf8a' : '1px solid rgba(26,54,71,0.06)',
      }}
    >
      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-2 right-2 w-[22px] h-[22px] flex items-center justify-center rounded-full text-[12px] leading-none active:opacity-50"
        style={{ color: '#b0bec5', backgroundColor: 'rgba(26,54,71,0.04)' }}
      >
        ×
      </button>

      {/* Top: title */}
      <div className="min-w-0">
        <div className="font-body text-[13px] font-semibold text-navy leading-snug line-clamp-2">
          {item.title}
        </div>
      </div>

      {/* Bottom: meta + status */}
      <div className="min-w-0">
        {item.type === 'link' && item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[11px] text-copper truncate block active:opacity-70"
            style={{ textDecoration: 'none' }}
          >
            {extractHostname(item.url)}
          </a>
        )}
        {item.type === 'note' && item.content && (
          <div
            className="font-body text-[11px] leading-snug line-clamp-2"
            style={{ color: '#4a6572' }}
          >
            {item.content}
          </div>
        )}
        {item.type === 'file' && item.file_data && item.file_data.startsWith('data:image') && (
          <div
            className="w-full h-[32px] rounded-md overflow-hidden mt-0.5"
            style={{ backgroundColor: 'rgba(26,54,71,0.04)' }}
          >
            <img src={item.file_data} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="font-body text-[10px] text-text-muted mt-1 truncate">
          by {item.added_by_name}
        </div>

        {/* Status toggle */}
        <button
          onClick={handleToggleStatus}
          className="font-body text-[10px] mt-1 flex items-center gap-1 active:opacity-70"
          style={{
            color: isBooked ? '#5cbf8a' : '#c17c4e',
            background: 'none',
            border: 'none',
            padding: 0,
            transition: 'color 0.15s',
          }}
        >
          <span>{isBooked ? '✓' : '○'}</span>
          {isBooked ? 'booked' : 'considering'}
        </button>
      </div>
    </div>
  );
};

export default ItemCard;
