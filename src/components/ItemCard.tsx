import { TripItem } from '@/lib/supabase';

interface Props {
  item: TripItem;
  onStatusChange: (id: string, status: string) => void;
  onTap: (item: TripItem) => void;
}

const extractHostname = (url: string) => {
  try {
    const h = new URL(url).hostname;
    return h.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const formatItemDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ItemCard = ({ item, onStatusChange, onTap }: Props) => {
  const isBooked = item.status === 'booked';

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = isBooked ? 'considering' : 'booked';
    onStatusChange(item.id, newStatus);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open detail sheet if clicking the link pill or status toggle
    // Those have their own stopPropagation
    onTap(item);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative flex-shrink-0 animate-fadeSlideIn flex flex-col justify-between cursor-pointer active:opacity-80"
      style={{
        width: '148px',
        height: '148px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '14px',
        boxShadow: '0 1px 4px rgba(26,54,71,0.07)',
        border: '1px solid rgba(26,54,71,0.06)',
        borderLeft: isBooked ? '3px solid #5cbf8a' : '1px solid rgba(26,54,71,0.06)',
        transition: 'opacity 0.1s',
      }}
    >
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
            onClick={handleLinkClick}
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

        {/* Item date */}
        {item.item_date && (
          <div className="font-body text-[10px] mt-0.5" style={{ color: 'rgba(26,54,71,0.5)' }}>
            {formatItemDate(item.item_date)}
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
