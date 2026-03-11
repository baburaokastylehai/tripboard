import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedbackOverlay from '@/components/FeedbackOverlay';

interface SavedTrip {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  subtitle: string;
}

const Landing = () => {
  const navigate = useNavigate();
  const [tripLink, setTripLink] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [myTrips, setMyTrips] = useState<SavedTrip[]>([]);
  const [recentTrips, setRecentTrips] = useState<SavedTrip[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleGoToTrip = () => {
    const trimmed = tripLink.trim();
    if (!trimmed) return;
    const match = trimmed.match(/\/t\/([^/?#]+)/);
    const slug = match ? match[1] : trimmed;
    navigate(`/t/${slug}`);
  };

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

  const TripCard = ({ trip, tag, index }: { trip: SavedTrip; tag?: string; index: number }) => (
    <button
      key={trip.slug}
      onClick={() => navigate(`/t/${trip.slug}`)}
      className="w-full flex items-center gap-3 p-4 rounded-[14px] text-left tap-scale"
      style={{
        backgroundColor: '#fff',
        border: '1px solid rgba(26,54,71,0.06)',
        boxShadow: '0 1px 4px rgba(26,54,71,0.07)',
        animation: `fadeSlideIn 0.3s ease ${index * 100}ms both`,
      }}
    >
      <span className="text-[28px] flex-shrink-0">{trip.emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-body text-[15px] font-semibold text-navy truncate">{trip.name}</span>
          {tag && (
            <span
              className="flex-shrink-0 font-body text-[10px] font-medium uppercase px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(193,124,78,0.1)', color: '#c17c4e', letterSpacing: '0.5px' }}
            >
              {tag}
            </span>
          )}
        </div>
        {trip.subtitle && (
          <div className="font-body text-[13px] text-text-muted truncate">{trip.subtitle}</div>
        )}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col items-center page-transition" style={{ backgroundColor: '#faf7f2' }}>
      <div className="w-full max-w-[480px] px-5 pt-24 pb-10 flex flex-col items-center flex-1">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-[60px] leading-none mb-4 animate-gentle-float">🗺</div>
          <h1 className="font-display text-[34px] font-extrabold text-navy leading-tight">TripBoard</h1>
          <p className="font-body text-[15px] text-text-muted mt-3 leading-relaxed">
            Your group plans trips in the chat. This is where the good links go.
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/new')}
            className="w-full py-4 rounded-[14px] font-body text-[16px] font-semibold tap-scale"
            style={{ backgroundColor: '#1a3647', color: '#faf7f2' }}
          >
            Create a Trip
          </button>

          {!showLinkInput ? (
            <button
              type="button"
              onClick={() => setShowLinkInput(true)}
              className="w-full py-4 rounded-[14px] font-body text-[16px] font-semibold tap-scale"
              style={{
                backgroundColor: 'transparent',
                color: '#1a3647',
                border: '1.5px solid rgba(26,54,71,0.12)',
              }}
            >
              I have a trip link
            </button>
          ) : (
            <div
              className="w-full flex gap-2 animate-fadeSlideIn"
            >
              <input
                type="text"
                placeholder="paste your trip link here..."
                value={tripLink}
                onChange={(e) => setTripLink(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGoToTrip()}
                className="flex-1 px-4 py-[14px] rounded-xl font-body text-[15px] text-navy placeholder:text-text-muted outline-none transition-colors"
                style={{
                  border: '1.5px solid rgba(26,54,71,0.12)',
                  backgroundColor: '#fff',
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={handleGoToTrip}
                disabled={!tripLink.trim()}
                className="px-5 py-[14px] rounded-xl font-body text-[14px] font-semibold tap-scale disabled:opacity-40"
                style={{ backgroundColor: '#c17c4e', color: '#fff' }}
              >
                Go
              </button>
            </div>
          )}
          <p className="font-body text-[12px] text-text-muted text-center mt-1">
            Or just open a shared trip link — it'll take you straight there.
          </p>
        </div>

        {/* My Trips */}
        {myTrips.length > 0 && (
          <div className="w-full mt-12">
            <div className="border-t border-dashed mb-5" style={{ borderColor: 'rgba(26,54,71,0.1)' }} />
            <h2 className="font-display text-[20px] font-bold text-navy mb-4">My Trips</h2>
            <div className="flex flex-col gap-3">
              {myTrips.map((trip, i) => (
                <TripCard key={trip.slug} trip={trip} tag="Created by you" index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Trips */}
        {recentTrips.length > 0 && (
          <div className="w-full mt-8">
            {myTrips.length === 0 && (
              <div className="border-t border-dashed mb-5" style={{ borderColor: 'rgba(26,54,71,0.1)' }} />
            )}
            <h2 className="font-display text-[18px] font-bold text-navy mb-4" style={{ opacity: 0.7 }}>Recent Trips</h2>
            <div className="flex flex-col gap-3">
              {recentTrips.map((trip, i) => (
                <TripCard key={trip.slug} trip={trip} index={i} />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* Footer */}
        <div className="pt-10 pb-4 flex flex-col items-center gap-2">
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

      {showFeedback && (
        <FeedbackOverlay onClose={() => setShowFeedback(false)} />
      )}
    </div>
  );
};

export default Landing;
