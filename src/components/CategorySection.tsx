import { useMemo } from 'react';
import { TripItem, EMPTY_CATEGORY_LINES } from '@/lib/supabase';
import ItemCard from '@/components/ItemCard';

interface CategoryDef {
  id: string;
  emoji: string;
  name: string;
  subtitle: string;
}

interface Props {
  category: CategoryDef;
  items: TripItem[];
  collapsed: boolean;
  onToggle: () => void;
  onAddItem: () => void;
  onStatusChange: (id: string, status: string) => void;
  onItemTap: (item: TripItem) => void;
}

const CategorySection = ({ category, items, collapsed, onToggle, onAddItem, onStatusChange, onItemTap }: Props) => {
  const isEmpty = items.length === 0;
  const bookedCount = items.filter(i => i.status === 'booked').length;

  // Pick a random personality line on mount (stable per render cycle)
  const personalityLine = useMemo(() => {
    const lines = EMPTY_CATEGORY_LINES[category.id];
    if (!lines || lines.length === 0) return null;
    return lines[Math.floor(Math.random() * lines.length)];
  }, [category.id]);

  return (
    <div>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 tap-scale"
        style={{
          backgroundColor: '#fff',
          border: '1px solid rgba(26,54,71,0.06)',
          boxShadow: '0 1px 4px rgba(26,54,71,0.07)',
          borderRadius: collapsed ? '16px' : '16px 16px 0 0',
          transition: 'border-radius 0.2s',
        }}
      >
        <span className="text-[24px] flex-shrink-0">{category.emoji}</span>
        <div className="flex-1 text-left min-w-0">
          <div
            className="font-display text-[18px] font-bold text-navy"
            style={{ opacity: isEmpty ? 0.6 : 1 }}
          >
            {category.name}
          </div>
          <div className="font-body text-[12px] text-text-muted">
            {category.subtitle} · {items.length} item{items.length !== 1 ? 's' : ''}
            {bookedCount > 0 && (
              <span style={{ color: '#5cbf8a' }}> · {bookedCount} booked</span>
            )}
          </div>
        </div>
        <span
          className="text-[14px] text-text-muted flex-shrink-0 transition-transform duration-200"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      {/* Body */}
      {!collapsed && (
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderRadius: '0 0 16px 16px',
            padding: '12px 0 4px',
            borderLeft: '1px solid rgba(26,54,71,0.06)',
            borderRight: '1px solid rgba(26,54,71,0.06)',
            borderBottom: '1px solid rgba(26,54,71,0.06)',
          }}
        >
          {/* Personality line for empty categories */}
          {isEmpty && personalityLine && (
            <div
              className="font-body text-[13px] text-center italic px-4"
              style={{ color: '#9aacb5', paddingTop: '16px', paddingBottom: '8px' }}
            >
              {personalityLine}
            </div>
          )}

          {/* Horizontal scroll area */}
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

            {/* Add item card — smaller when empty */}
            {isEmpty ? (
              <button
                onClick={onAddItem}
                className="flex-shrink-0 flex items-center justify-center text-copper tap-scale"
                style={{
                  minWidth: '120px',
                  padding: '14px',
                  border: '1px dashed rgba(26,54,71,0.1)',
                  borderRadius: '16px',
                  backgroundColor: 'transparent',
                  fontSize: '20px',
                }}
              >
                +
              </button>
            ) : (
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
      )}
    </div>
  );
};

export default CategorySection;
