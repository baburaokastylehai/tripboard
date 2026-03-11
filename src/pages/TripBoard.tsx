import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Trip, TripItem, CATEGORIES } from '@/lib/supabase';
import { trackEvent } from '@/lib/posthog';
import WelcomePopup from '@/components/WelcomePopup';
import CategorySection from '@/components/CategorySection';
import AddItemSheet from '@/components/AddItemSheet';
import ShareSheet from '@/components/ShareSheet';
import EditTripSheet from '@/components/EditTripSheet';
import FeedbackOverlay from '@/components/FeedbackOverlay';

const TripBoard = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const isCreator = useCallback(() => {
    if (!trip) return false;
    try {
      const saved = JSON.parse(localStorage.getItem('tripboard-my-trips') || '[]');
      return saved.some((t: any) => t.id === trip.id);
    } catch { return false; }
  }, [trip]);

  const fetchTrip = useCallback(async () => {
    if (!slug) return;
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) console.error('Fetch trip failed:', error);
    if (error || !data) { setNotFound(true); setLoading(false); return; }
    setTrip(data);
    return data;
  }, [slug]);

  const fetchItems = useCallback(async (tripId: string) => {
    const { data, error } = await supabase
      .from('trip_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });
    if (error) console.error('Fetch items failed:', error);
    if (data) setItems(data);
  }, []);

  useEffect(() => {
    const init = async () => {
      const tripData = await fetchTrip();
      if (tripData) {
        await fetchItems(tripData.id);
        try {
          const visited = JSON.parse(localStorage.getItem('tripboard-visited-trips') || '[]');
          const entry = { id: tripData.id, slug: tripData.slug, name: tripData.name, emoji: tripData.emoji, subtitle: tripData.subtitle };
          const idx = visited.findIndex((t: any) => t.id === tripData.id);
          if (idx >= 0) visited[idx] = entry; else visited.unshift(entry);
          localStorage.setItem('tripboard-visited-trips', JSON.stringify(visited));
        } catch {}
        const hasName = localStorage.getItem('tripboard-username');
        if (!hasName) setShowWelcome(true);
      }
      setLoading(false);
    };
    init();
  }, [fetchTrip, fetchItems]);

  useEffect(() => {
    if (!trip) return;
    const interval = setInterval(() => {
      if (Date.now() - lastToggleTime > 5000) {
        fetchItems(trip.id);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [trip, fetchItems, lastToggleTime]);

  const handleToggleAll = () => {
    const next = !allCollapsed;
    setAllCollapsed(next);
    const newCollapsed: Record<string, boolean> = {};
    CATEGORIES.forEach(c => { newCollapsed[c.id] = next; });
    setCollapsed(newCollapsed);
  };

  const handleDeleteItem = async (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
    await supabase.from('trip_items').delete().eq('id', itemId);
  };

  const handleStatusChange = async (itemId: string, status: string) => {
    const prevItems = items;
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i));
    setLastToggleTime(Date.now());
    const { error } = await supabase.from('trip_items').update({ status }).eq('id', itemId);
    if (error) {
      console.error('Status update failed:', error);
      setItems(prevItems);
    }
  };

  const handleClearAll = async () => {
    if (!trip) return;
    if (!window.confirm("Clear all items? This can't be undone.")) return;
    setItems([]);
    await supabase.from('trip_items').delete().eq('trip_id', trip.id);
  };

  const handleItemAdded = (item: TripItem) => {
    setItems(prev => [item, ...prev]);
    setAddingCategory(null);
    trackEvent('item_added', { trip_id: trip?.id, category: item.category, type: item.type });
  };

  const handleTripUpdated = (updated: Trip) => {
    setTrip(updated);
    try {
      const saved = JSON.parse(localStorage.getItem('tripboard-my-trips') || '[]');
      const idx = saved.findIndex((t: any) => t.id === updated.id);
      if (idx >= 0) {
        saved[idx] = { id: updated.id, slug: updated.slug, name: updated.name, emoji: updated.emoji, subtitle: updated.subtitle };
        localStorage.setItem('tripboard-my-trips', JSON.stringify(saved));
      }
    } catch {}
  };

  const itemCount = items.length;
  const itemWord = itemCount === 1 ? 'item' : 'items';

  if (loading) {
    return (
      <div className="min-h-screen page-transition" style={{ backgroundColor: '#faf7f2' }}>
        <div className="max-w-[480px] mx-auto pb-10">
          {/* Header skeleton */}
          <div
            style={{
              background: 'linear-gradient(180deg, #1a3647 0%, #24495e 100%)',
              borderRadius: '0 0 28px 28px',
              padding: '52px 20px 28px',
              height: '180px',
            }}
          >
            <div className="animate-pulse-load" style={{ marginTop: '20px' }}>
              <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <div className="h-4 w-32 rounded mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} />
            </div>
          </div>
          {/* Category skeletons */}
          <div className="px-4 pt-6 flex flex-col gap-3">
            {[0,1,2,3,4].map(i => (
              <div
                key={i}
                className="rounded-2xl animate-pulse-load"
                style={{
                  height: '72px',
                  backgroundColor: '#e8e4df',
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center page-transition" style={{ backgroundColor: '#faf7f2' }}>
        <div className="text-center px-5">
          <div className="text-[48px] mb-4">🗺</div>
          <h1 className="font-display text-[22px] font-bold text-navy mb-2">Trip not found</h1>
          <p className="font-body text-[14px] text-text-muted mb-6">Check your link and try again.</p>
          <button onClick={() => navigate('/')} className="font-body text-[14px] font-medium text-copper active:opacity-70">
            ← Back to TripBoard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-transition" style={{ backgroundColor: '#faf7f2' }}>
      {showWelcome && (
        <WelcomePopup
          tripName={trip.name}
          tripEmoji={trip.emoji}
          onDone={() => setShowWelcome(false)}
        />
      )}

      <div className="max-w-[480px] mx-auto pb-10">
        {/* Header */}
        <div
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1a3647 0%, #24495e 100%)',
            borderRadius: '0 0 28px 28px',
            padding: '52px 20px 28px',
          }}
        >
          {/* Back arrow only */}
          <button
            onClick={() => navigate('/')}
            className="absolute font-body text-[13px] font-medium active:opacity-60"
            style={{ top: '20px', left: '20px', color: 'rgba(255,255,255,0.5)' }}
          >
            ←
          </button>
          {/* Decorative emoji */}
          <div
            className="absolute select-none pointer-events-none"
            style={{ top: '10px', right: '10px', fontSize: '120px', opacity: 0.06, lineHeight: 1 }}
          >
            {trip.emoji}
          </div>

          {/* Share button */}
          <button
            onClick={() => { setShowShare(true); trackEvent('share_opened', { trip_id: trip.id }); }}
            className="absolute font-body text-[13px] font-medium active:opacity-60 flex items-center gap-1"
            style={{ top: '20px', right: '20px', color: 'rgba(255,255,255,0.7)' }}
          >
            <span style={{ fontSize: '12px' }}>↗</span> Share
          </button>

          {/* Eyebrow */}
          {trip.subtitle && (
            <div
              className="font-body text-[12px] font-medium uppercase mb-3"
              style={{ letterSpacing: '2.5px', color: 'rgba(255,255,255,0.45)' }}
            >
              {trip.subtitle}
            </div>
          )}

          {/* Trip name */}
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[34px] font-extrabold leading-[1.1]" style={{ color: '#fff' }}>
              {trip.name}
            </h1>
            {isCreator() && (
              <button
                onClick={() => setShowEdit(true)}
                className="active:opacity-60 mt-1"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 mt-3 font-body text-[14px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <span>{itemCount} {itemWord} saved</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block w-[6px] h-[6px] rounded-full animate-live-breathe"
                style={{ backgroundColor: '#5cbf8a' }}
              />
              live
            </span>
          </div>
        </div>

        {/* Collapse/expand all — right aligned */}
        <div className="flex justify-end px-5 pt-4 pb-1">
          <button
            onClick={handleToggleAll}
            className="font-body text-[13px] font-medium text-copper active:opacity-70"
          >
            {allCollapsed ? 'Expand all' : 'Collapse all'}
          </button>
        </div>

        {/* Categories */}
        <div className="px-4 flex flex-col gap-3">
          {CATEGORIES.map((cat) => (
             <CategorySection
              key={cat.id}
              category={cat}
              items={items.filter(i => i.category === cat.id)}
              collapsed={collapsed[cat.id] || false}
              onToggle={() => setCollapsed(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
              onAddItem={() => setAddingCategory(cat.id)}
              onDeleteItem={handleDeleteItem}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        {/* Clear all */}
        {items.length > 0 && (
          <div className="flex justify-center pt-6">
            <button
              onClick={handleClearAll}
              className="font-body text-[13px] active:opacity-70"
              style={{ color: '#b0bec5', border: 'none', background: 'none' }}
            >
              Clear all items
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-7 pb-4 flex flex-col items-center gap-2">
          <a
            href="https://fortheplot.today"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[11px] tracking-[1px] active:opacity-100 tap-scale"
            style={{ color: '#c8cfd3', textDecoration: 'none', opacity: 0.7 }}
          >
            fortheplot.today
          </a>
          <button
            onClick={() => setShowFeedback(true)}
            className="font-body text-[11px] tap-scale"
            style={{ color: '#c17c4e', background: 'none', border: 'none', letterSpacing: '0.5px' }}
          >
            got thoughts? ✦
          </button>
        </div>
      </div>

      {/* Sheets */}
      {addingCategory && (
        <AddItemSheet
          tripId={trip.id}
          category={CATEGORIES.find(c => c.id === addingCategory)!}
          onClose={() => setAddingCategory(null)}
          onItemAdded={handleItemAdded}
        />
      )}

      {showShare && (
        <ShareSheet
          slug={trip.slug}
          onClose={() => setShowShare(false)}
        />
      )}

      {showEdit && (
        <EditTripSheet
          trip={trip}
          onClose={() => setShowEdit(false)}
          onUpdated={handleTripUpdated}
        />
      )}

      {showFeedback && (
        <FeedbackOverlay
          tripSlug={slug}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
};

export default TripBoard;
