import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Trip, TripItem, CATEGORIES, normalizeCategoryId } from '@/lib/supabase';
import { trackEvent } from '@/lib/posthog';
import { useOnlineStatus } from '@/hooks/use-online-status';
import WelcomePopup from '@/components/WelcomePopup';
import CategorySection from '@/components/CategorySection';
import DaySection from '@/components/DaySection';
import AddItemSheet from '@/components/AddItemSheet';
import ShareSheet from '@/components/ShareSheet';
import EditTripSheet from '@/components/EditTripSheet';
import ItemDetailSheet from '@/components/ItemDetailSheet';
import FeedbackOverlay from '@/components/FeedbackOverlay';
import OfflineBanner from '@/components/OfflineBanner';
import InstallPrompt from '@/components/InstallPrompt';
import SmartLinkInput from '@/components/SmartLinkInput';
import SharePromptBanner from '@/components/SharePromptBanner';

const formatDateRange = (start: string, end: string) => {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const sMonth = s.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const eMonth = e.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const sDay = s.getDate();
  const eDay = e.getDate();
  const year = e.getFullYear();
  if (sMonth === eMonth) {
    return `${sMonth} ${sDay}–${eDay}, ${year}`;
  }
  return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${year}`;
};

const formatDayLabel = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.toLocaleDateString('en-US', { weekday: 'short' });
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const date = d.getDate();
  return `${day}, ${month} ${date}`;
};

const getDaysInRange = (start: string, end: string) => {
  const days: string[] = [];
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const cur = new Date(s);
  while (cur <= e) {
    days.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

const TripBoard = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  // Skip welcome if user already has a name
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('tripboard-username');
  });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    CATEGORIES.forEach(c => { init[c.id] = true; });
    return init;
  });
  const [allCollapsed, setAllCollapsed] = useState(true);
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const pollingIntervalRef = useRef<number | null>(null);
  const [viewMode, setViewMode] = useState<'categories' | 'byday'>('categories');
  const [detailItem, setDetailItem] = useState<TripItem | null>(null);
  const [isJustCreated, setIsJustCreated] = useState(false);

  const clearPollingInterval = useCallback(() => {
    if (pollingIntervalRef.current !== null) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

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

    // Check if just created
    const justCreatedKey = `tripboard-just-created-${data.id}`;
    if (localStorage.getItem(justCreatedKey) === 'true') {
      setIsJustCreated(true);
      localStorage.removeItem(justCreatedKey);
    }

    return data;
  }, [slug]);

  const fetchItems = useCallback(async (tripId: string) => {
    const { data, error } = await supabase
      .from('trip_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });
    if (error) console.error('Fetch items failed:', error);
    if (data) {
      // Normalize legacy category IDs
      const normalized = data.map(item => ({
        ...item,
        category: normalizeCategoryId(item.category),
      }));
      setItems(normalized);
    }
  }, []);

  const startPolling = useCallback((tripId: string) => {
    clearPollingInterval();
    pollingIntervalRef.current = window.setInterval(() => {
      fetchItems(tripId);
    }, 10000);
  }, [clearPollingInterval, fetchItems]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const tripData = await fetchTrip();
      if (tripData && isMounted) {
        await fetchItems(tripData.id);
        startPolling(tripData.id);
        try {
          const visited = JSON.parse(localStorage.getItem('tripboard-visited-trips') || '[]');
          const entry = { id: tripData.id, slug: tripData.slug, name: tripData.name, emoji: tripData.emoji, subtitle: tripData.subtitle };
          const idx = visited.findIndex((t: any) => t.id === tripData.id);
          if (idx >= 0) visited[idx] = entry; else visited.unshift(entry);
          localStorage.setItem('tripboard-visited-trips', JSON.stringify(visited));
        } catch {}
      }
      if (isMounted) setLoading(false);
    };

    init();

    return () => {
      isMounted = false;
      clearPollingInterval();
    };
  }, [clearPollingInterval, fetchTrip, fetchItems, startPolling]);

  // Auto-refresh when coming back online
  useEffect(() => {
    if (isOnline && trip) {
      fetchItems(trip.id);
    }
  }, [isOnline, trip, fetchItems]);

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

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    if (!trip) return;

    const currentItem = items.find(item => item.id === itemId);
    if (!currentItem) return;

    const oldStatus = currentItem.status;

    if (pollingIntervalRef.current !== null) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, status: newStatus } : item
    ));

    const { error } = await supabase
      .from('trip_items')
      .update({ status: newStatus })
      .eq('id', itemId);

    if (error) {
      console.error('Status update failed:', error);
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, status: oldStatus } : item
      ));
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data } = await supabase
      .from('trip_items')
      .select('*')
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: false });

    if (data) {
      setItems(data.map(item => ({ ...item, category: normalizeCategoryId(item.category) })));
    }

    startPolling(trip.id);
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
    setAddingDate(null);
    trackEvent('item_added', { trip_id: trip?.id, category: item.category, type: item.type });
  };

  const handleSmartItemsAdded = (newItems: TripItem[]) => {
    setItems(prev => [...newItems, ...prev]);
    trackEvent('smart_links_added', { trip_id: trip?.id, count: newItems.length });
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

  // By Day view data
  const dayViewData = useMemo(() => {
    if (!trip) return [];

    const hasDates = trip.start_date && trip.end_date;
    const days = hasDates ? getDaysInRange(trip.start_date!, trip.end_date!) : [];

    const byDate: Record<string, TripItem[]> = {};
    const undated: TripItem[] = [];

    items.forEach(item => {
      if (item.item_date) {
        if (!byDate[item.item_date]) byDate[item.item_date] = [];
        byDate[item.item_date].push(item);
      } else {
        undated.push(item);
      }
    });

    const sections: { key: string; label: string; items: TripItem[]; date: string | null }[] = [];

    if (hasDates) {
      days.forEach(day => {
        sections.push({
          key: day,
          label: formatDayLabel(day),
          items: byDate[day] || [],
          date: day,
        });
        delete byDate[day];
      });
      Object.keys(byDate).sort().forEach(day => {
        sections.push({
          key: day,
          label: formatDayLabel(day),
          items: byDate[day],
          date: day,
        });
      });
    } else {
      Object.keys(byDate).sort().forEach(day => {
        sections.push({
          key: day,
          label: formatDayLabel(day),
          items: byDate[day],
          date: day,
        });
      });
    }

    if (undated.length > 0 || sections.length === 0) {
      sections.push({
        key: 'undated',
        label: 'Undated',
        items: undated,
        date: null,
      });
    }

    return sections;
  }, [trip, items]);

  const handleAddItemForDay = (date: string) => {
    setAddingDate(date);
    setAddingCategory(CATEGORIES[0].id);
  };

  const itemCount = items.length;
  const itemWord = itemCount === 1 ? 'item' : 'items';

  if (loading) {
    return (
      <div className="min-h-screen page-transition" style={{ backgroundColor: '#faf7f2' }}>
        <div className="max-w-[480px] mx-auto pb-10">
          <div
            style={{
              background: 'linear-gradient(180deg, #1a3647 0%, #24495e 100%)',
              borderRadius: '0 0 28px 28px',
              padding: '52px 20px 28px',
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 52px)',
              height: '180px',
            }}
          >
            <div className="animate-pulse-load" style={{ marginTop: '20px' }}>
              <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <div className="h-4 w-32 rounded mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} />
            </div>
          </div>
          <div className="px-4 pt-6 flex flex-col gap-3">
            {[0,1,2,3].map(i => (
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

  const hasDateRange = trip.start_date && trip.end_date;

  return (
    <div className="min-h-screen page-transition" style={{ backgroundColor: '#faf7f2' }}>
      {showWelcome && (
        <WelcomePopup
          tripName={trip.name}
          tripEmoji={trip.emoji}
          onDone={() => setShowWelcome(false)}
        />
      )}

      <div className="max-w-[480px] mx-auto" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 40px)' }}>
        {/* Header */}
        <div
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1a3647 0%, #24495e 100%)',
            borderRadius: '0 0 28px 28px',
            padding: '52px 20px 28px',
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 52px)',
          }}
        >
          <button
            onClick={() => navigate('/')}
            className="absolute font-body text-[13px] font-medium active:opacity-60"
            style={{ top: 'calc(env(safe-area-inset-top, 0px) + 20px)', left: '20px', color: 'rgba(255,255,255,0.5)' }}
          >
            ←
          </button>
          <div
            className="absolute select-none pointer-events-none"
            style={{ top: '10px', right: '10px', fontSize: '120px', opacity: 0.06, lineHeight: 1 }}
          >
            {trip.emoji}
          </div>

          {/* Share pill */}
          <button
            onClick={() => { setShowShare(true); trackEvent('share_opened', { trip_id: trip.id }); }}
            className="absolute font-body text-[13px] font-medium active:scale-95 transition-transform"
            style={{
              top: 'calc(env(safe-area-inset-top, 0px) + 20px)',
              right: '20px',
              color: '#fff',
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '20px',
              padding: '8px 16px',
              border: 'none',
            }}
          >
            share ↗
          </button>

          {/* Eyebrow: date range and/or subtitle */}
          {(hasDateRange || trip.subtitle) && (
            <div>
              {hasDateRange && (
                <div
                  className="font-body text-[12px] font-medium uppercase"
                  style={{ letterSpacing: '2.5px', color: 'rgba(255,255,255,0.45)', marginBottom: trip.subtitle ? '4px' : '12px' }}
                >
                  {formatDateRange(trip.start_date!, trip.end_date!)}
                </div>
              )}
              {trip.subtitle && (
                <div
                  className="font-body text-[12px] font-medium uppercase mb-3"
                  style={{ letterSpacing: '2.5px', color: 'rgba(255,255,255,0.45)' }}
                >
                  {trip.subtitle}
                </div>
              )}
            </div>
          )}

          {/* Trip name */}
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[34px] font-extrabold leading-[1.1]" style={{ color: '#fff' }}>
              {trip.name}
            </h1>
            {(
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
                className={`inline-block w-[6px] h-[6px] rounded-full ${isOnline ? 'animate-live-breathe' : ''}`}
                style={{ backgroundColor: isOnline ? '#5cbf8a' : '#9aacb5' }}
              />
              {isOnline ? 'live' : 'offline'}
            </span>
          </div>
        </div>

        {/* Offline banner */}
        <OfflineBanner isOnline={isOnline} />

        {/* Post-creation share prompt */}
        {isJustCreated && trip && (
          <div className="pt-4">
            <SharePromptBanner
              tripId={trip.id}
              slug={trip.slug}
              tripName={trip.name}
              onShare={() => setShowShare(true)}
            />
          </div>
        )}

        {/* Smart link input */}
        <div className="pt-4">
          <SmartLinkInput
            tripId={trip.id}
            onItemsAdded={handleSmartItemsAdded}
            isOnline={isOnline}
          />
        </div>

        {/* Visual connector */}
        <div className="text-center py-1">
          <span className="font-body text-[14px]" style={{ color: '#c8cfd3', letterSpacing: '4px' }}>···</span>
        </div>

        {/* View toggle + Collapse all */}
        <div className="flex items-center justify-between px-5 pb-1">
          {/* Left: view toggle */}
          <div className="flex items-center gap-1.5 font-body text-[13px]">
            <button
              onClick={() => setViewMode('categories')}
              className="active:opacity-70"
              style={{
                color: viewMode === 'categories' ? '#1a3647' : '#9aacb5',
                fontWeight: viewMode === 'categories' ? 600 : 400,
                background: 'none',
                border: 'none',
                padding: 0,
              }}
            >
              By Category
            </button>
            <span style={{ color: '#9aacb5' }}>·</span>
            <button
              onClick={() => setViewMode('byday')}
              className="active:opacity-70"
              style={{
                color: viewMode === 'byday' ? '#1a3647' : '#9aacb5',
                fontWeight: viewMode === 'byday' ? 600 : 400,
                background: 'none',
                border: 'none',
                padding: 0,
              }}
            >
              By Day
            </button>
          </div>

          {/* Right: collapse all (only in categories view) */}
          {viewMode === 'categories' && (
            <button
              onClick={handleToggleAll}
              className="font-body text-[13px] font-medium text-copper active:opacity-70"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              {allCollapsed ? 'Expand all' : 'Collapse all'}
            </button>
          )}
        </div>

        {/* Categories View */}
        {viewMode === 'categories' && (
          <div className="px-4 flex flex-col gap-[12px]">
            {CATEGORIES.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                items={items.filter(i => i.category === cat.id)}
                collapsed={collapsed[cat.id] || false}
                onToggle={() => setCollapsed(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                onAddItem={() => { setAddingCategory(cat.id); setAddingDate(null); }}
                onStatusChange={handleStatusChange}
                onItemTap={(item) => setDetailItem(item)}
              />
            ))}
          </div>
        )}

        {/* By Day View */}
        {viewMode === 'byday' && (
          <div className="px-4 flex flex-col gap-[12px]">
            {dayViewData.map((section) => (
              <DaySection
                key={section.key}
                label={section.label}
                items={section.items}
                onStatusChange={handleStatusChange}
                onItemTap={(item) => setDetailItem(item)}
                onAddItem={section.date ? () => handleAddItemForDay(section.date!) : undefined}
                emptyHint={section.date ? 'nothing planned yet' : undefined}
              />
            ))}
          </div>
        )}

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

        {/* Install prompt */}
        <div className="pt-6">
          <InstallPrompt />
        </div>

        {/* Footer */}
        <div className="text-center pt-7 pb-4 flex flex-col items-center gap-2">
          <button
            onClick={() => setShowFeedback(true)}
            className="font-body text-[11px] tap-scale"
            style={{ color: '#c17c4e', background: 'none', border: 'none', letterSpacing: '0.5px' }}
          >
            the story behind this ✦ share your thoughts
          </button>
          <a
            href="https://fortheplot.today"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[11px] tracking-[1px] active:opacity-100 tap-scale"
            style={{ color: '#c8cfd3', textDecoration: 'none', opacity: 0.7 }}
          >
            fortheplot.today
          </a>
        </div>
      </div>

      {/* Sheets */}
      {addingCategory && (
        <AddItemSheet
          tripId={trip.id}
          category={CATEGORIES.find(c => c.id === addingCategory)!}
          onClose={() => { setAddingCategory(null); setAddingDate(null); }}
          onItemAdded={handleItemAdded}
          tripStartDate={trip.start_date}
          tripEndDate={trip.end_date}
          prefilledDate={addingDate}
          isOnline={isOnline}
        />
      )}

      {showShare && (
        <ShareSheet
          slug={trip.slug}
          tripName={trip.name}
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

      {detailItem && (
        <ItemDetailSheet
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onStatusChange={(id, status) => {
            handleStatusChange(id, status);
            setDetailItem(prev => prev ? { ...prev, status } : null);
          }}
          onDelete={(id) => {
            handleDeleteItem(id);
            setDetailItem(null);
          }}
          onItemUpdated={(updated) => {
            setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
            setDetailItem(updated);
          }}
          tripStartDate={trip.start_date}
          tripEndDate={trip.end_date}
        />
      )}
    </div>
  );
};

export default TripBoard;
