import { TripItem } from '@/lib/supabase';
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
  onDeleteItem: (id: string) => void;
}

const CategorySection = ({ category, items, collapsed, onToggle, onAddItem, onDeleteItem }: Props) => {
  return (
    <div>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 active:opacity-80"
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
          <div className="font-display text-[18px] font-bold text-navy">{category.name}</div>
          <div className="font-body text-[12px] text-text-muted">
            {category.subtitle} · {items.length} item{items.length !== 1 ? 's' : ''}
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
              <ItemCard key={item.id} item={item} onDelete={() => onDeleteItem(item.id)} />
            ))}

            {/* Add item card */}
            <button
              onClick={onAddItem}
              className="flex-shrink-0 flex flex-col items-center justify-center font-body text-[13px] font-medium text-copper active:opacity-70"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySection;