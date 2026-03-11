import { TripItem } from '@/lib/supabase';
import ItemCard from '@/components/ItemCard';

interface Props {
  label: string;
  items: TripItem[];
  onStatusChange: (id: string, status: string) => void;
  onItemTap: (item: TripItem) => void;
  onAddItem?: () => void;
  emptyHint?: string;
}

const DaySection = ({ label, items, onStatusChange, onItemTap, onAddItem, emptyHint }: Props) => {
  const isEmpty = items.length === 0;
  const bookedCount = items.filter(i => i.status === 'booked').length;

  return (
    <div>
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="font-display text-[18px] font-bold text-navy">{label}</div>
        {!isEmpty && bookedCount > 0 && (
          <div className="font-body text-[12px] text-text-muted">
            {items.length} item{items.length !== 1 ? 's' : ''}
            <span style={{ color: '#5cbf8a' }}> · {bookedCount} booked</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.5)',
          borderRadius: '16px',
          padding: '12px 0 4px',
          border: '1px solid rgba(26,54,71,0.06)',
        }}
      >
        {isEmpty && (
          <p className="font-body text-[12px] text-center mb-2" style={{ color: '#c8cfd3' }}>
            {emptyHint || 'nothing planned yet'}
          </p>
        )}

        <div
          className="flex gap-3 overflow-x-auto pb-3 px-3"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onStatusChange={onStatusChange}
              onTap={onItemTap}
            />
          ))}

          {onAddItem && (
            <button
              onClick={onAddItem}
              className="flex-shrink-0 flex flex-col items-center justify-center font-body text-[13px] font-medium text-copper tap-scale"
              style={{
                width: '148px',
                height: '148px',
                border: '2px dashed rgba(26,54,71,0.1)',
                borderRadius: '16px',
                backgroundColor: 'transparent',
              }}
            >
              <span className="text-[24px] mb-1 opacity-40">+</span>
              Add item
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DaySection;
