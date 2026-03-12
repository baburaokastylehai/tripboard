import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import FeedbackOverlay from '@/components/FeedbackOverlay';
import HowItWorksOverlay from '@/components/HowItWorksOverlay';

interface SavedTrip {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  subtitle: string;
}

const Landing = () => {
  const navigate = useNavigate();
  const [myTrips, setMyTrips] = useState<SavedTrip[]>([]);
  const [recentTrips, setRecentTrips] = useState<SavedTrip[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [tripCount, setTripCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [showCounter, setShowCounter] = useState(false);
  const [sparkleAnimating, setSparkleAnimating] = useState(false);
  const sparkleRef = useRef<HTMLSpanElement>(null);

  const loadTrips = () => {
    try {
      const savedMy = JSON.parse(localStorage.getItem('tripboard-my-trips') || '[]');
      const savedVisited = JSON.parse(localStorage.getItem('tripboard-visited-trips') || '[]');
      const myList = Array.isArray(savedMy) ? savedMy : [];
      const visitedList = Array.isArray(savedVisited) ? savedVisited : [];
      setMyTrips(myList);
      const myIds = new Set(myList.map((t: SavedTrip) => t.id));
      setRecentTrips(visitedList.filter((t: SavedTrip) => !myIds.has(t.id)));
    } catch {}
  };

  // Fetch trip count
  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null && count >= 5) {
        setTripCount(count);
        setShowCounter(true);
      }
    };
    fetchCount();
  }, []);

  // Animate counter
  useEffect(() => {
    if (!showCounter || tripCount === 0) return;
    const duration = 500;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.floor(eased * tripCount));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [showCounter, tripCount]);

  useEffect(() => {
    loadTrips();
    const handleFocus = () => loadTrips();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handleFocus);
    };
  }, []);

  // Sparkle animation for new users
  useEffect(() => {
    const hasTrips = localStorage.getItem('tripboard-my-trips');
    const sparklePlayed = localStorage.getItem('tripboard-sparkle-played');
    const parsedTrips = hasTrips ? JSON.parse(hasTrips) : [];
    if (sparklePlayed || parsedTrips.length > 0) return;

    const timeout = setTimeout(() => {
      setSparkleAnimating(true);
      // Stop after 3 pulses (2s each = 6s)
      setTimeout(() => {
        setSparkleAnimating(false);
        localStorage.setItem('tripboard-sparkle-played', 'true');
      }, 6000);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const allTrips = [...myTrips, ...recentTrips.filter(t => !myTrips.some(m => m.id === t.id))];

  const TripCard = ({ trip, index }: { trip: SavedTrip; index: number }) => (
    <button
      key={trip.slug}
      onClick={() => navigate(`/t/${trip.slug}`)}
      className="w-full flex items-center gap-3 text-left tap-scale"
      style={{
        backgroundColor: '#fff',
        border: '1px solid rgba(26,54,71,0.06)',
        boxShadow: '0 1px 4px rgba(26,54,71,0.07)',
        borderRadius: '14px',
        padding: '12px 16px',
        animation: `fadeSlideIn 0.3s ease ${index * 100}ms both`,
      }}
    >
      <span className="text-[24px] flex-shrink-0">{trip.emoji}</span>
      <div className="min-w-0 flex-1 flex items-center gap-0">
        <span className="font-body text-[14px] font-semibold text-navy truncate flex-shrink-0">{trip.name}</span>
        {trip.subtitle && (
          <>
            <span className="font-body text-[12px] mx-1.5 flex-shrink-0" style={{ color: '#c8cfd3' }}>·</span>
            <span className="font-body text-[12px] truncate" style={{ color: '#9aacb5' }}>{trip.subtitle}</span>
          </>
        )}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col items-center page-transition" style={{ backgroundColor: '#faf7f2' }}>
      <div
        className="w-full max-w-[480px] px-5 flex flex-col items-center"
        style={{
          minHeight: '100dvh',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
        }}
      >
        {/* GROUP 1 — IDENTITY: upper-center, not dead-center */}
        <div
          className="w-full flex flex-col items-center"
          style={{ paddingTop: '15vh' }}
        >
          <div className="text-center">
            <div className="text-[60px] leading-none animate-gentle-float">🗺</div>
            <h1 className="font-display text-[34px] font-extrabold text-navy leading-tight mt-2">TripBoard</h1>
            <p className="font-body text-[15px] text-text-muted mt-1.5 leading-relaxed whitespace-nowrap max-[400px]:text-[13px]">
              group chats are for banter. trip links belong here.
            </p>
          </div>
        </div>

        {/* 48px gap between Group 1 and Group 2 */}
        {/* GROUP 2 — ACTION */}
        <div className="w-full flex flex-col items-center mt-12">
          <button
            type="button"
            onClick={() => navigate('/new')}
            className="w-full py-4 rounded-[14px] font-body text-[16px] font-semibold tap-scale"
            style={{ backgroundColor: '#1a3647', color: '#faf7f2' }}
          >
            Create a Trip
          </button>

          <button
            onClick={() => setShowHowItWorks(true)}
            className="font-body text-[12px] tap-scale"
            style={{ color: '#c17c4e', background: 'none', border: 'none', font: 'inherit', cursor: 'pointer', marginTop: '14px' }}
          >
            how it works ↗
          </button>
        </div>

        {/* 48px gap between Group 2 and Group 3 */}
        {/* GROUP 3 — CONTEXT */}
        <div className="w-full flex flex-col items-center mt-12">
          {/* Your Trips — only when trips exist */}
          {allTrips.length > 0 && (
            <>
              <h2 className="font-display text-[16px] font-bold text-navy w-full">Your Trips</h2>
              <div
                className="w-full flex flex-col gap-2.5 overflow-y-auto mt-2.5"
                style={{
                  maxHeight: allTrips.length > 3 ? '200px' : 'none',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {allTrips.map((trip, i) => (
                  <TripCard key={trip.slug} trip={trip} index={i} />
                ))}
              </div>
              <div style={{ height: '24px' }} />
            </>
          )}

          {/* Trip counter — only show when count > 10 */}
          {showCounter && tripCount > 10 && (
            <p className="font-body text-[11px] text-center" style={{ color: '#5cbf8a' }}>
              · {displayCount} trips created ·
            </p>
          )}

          {/* Footer items */}
          <button
            onClick={() => setShowFeedback(true)}
            className="font-body text-[11px] tap-scale"
            style={{ color: '#c17c4e', background: 'none', border: 'none', letterSpacing: '0.5px', marginTop: showCounter && tripCount > 10 ? '10px' : '0px' }}
          >
            the story behind this{' '}
            <span
              ref={sparkleRef}
              style={{
                display: 'inline-block',
                animation: sparkleAnimating ? 'sparklePulse 2s ease-in-out 3' : 'none',
              }}
            >
              ✦
            </span>
            {' '}share your thoughts
          </button>
          <a
            href="https://fortheplot.today"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[10px] tracking-[1px] active:opacity-100 tap-scale"
            style={{ color: '#c8cfd3', textDecoration: 'none', opacity: 0.7, marginTop: '6px' }}
          >
            fortheplot.today
          </a>
        </div>
      </div>

      {showFeedback && (
        <FeedbackOverlay onClose={() => setShowFeedback(false)} />
      )}
      {showHowItWorks && (
        <HowItWorksOverlay onClose={() => setShowHowItWorks(false)} />
      )}
    </div>
  );
};

export default Landing;
