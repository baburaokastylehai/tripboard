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

        <div className="font-body text-[10px] text-text-muted mt-1 truncate flex items-center gap-1">
          {item.added_by_name === 'via WhatsApp' ? (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.5, flexShrink: 0 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>via WhatsApp</span>
            </>
          ) : (
            <span>by {item.added_by_name}</span>
          )}
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
