import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SavedTrip {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  subtitle: string;
}

const Landing = () => {
  const navigate = useNavigate();
  const [showLinkHelper, setShowLinkHelper] = useState(false);
  const [myTrips, setMyTrips] = useState<SavedTrip[]>([]);
  const [recentTrips, setRecentTrips] = useState<SavedTrip[]>([]);

  const loadTrips = () => {
    try {
      const savedMy = JSON.parse(localStorage.getItem('tripboard-my-trips') || '[]');
      const savedVisited = JSON.parse(localStorage.getItem('tripboard-visited-trips') || '[]');
      const myList = Array.isArray(savedMy) ? savedMy : [];
      const visitedList = Array.isArray(savedVisited) ? savedVisited : [];
      setMyTrips(myList);
      // Deduplicate: only show visited trips not in myTrips
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

  const TripCard = ({ trip, tag }: { trip: SavedTrip; tag?: string }) => (
    <button
      key={trip.slug}
      onClick={() => navigate(`/t/${trip.slug}`)}
      className="w-full flex items-center gap-3 p-4 rounded-[14px] text-left transition-opacity active:opacity-80"
      style={{
        backgroundColor: '#fff',
        border: '1px solid rgba(26,54,71,0.06)',
        boxShadow: '0 1px 4px rgba(26,54,71,0.07)',
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
    <div className="min-h-screen flex flex-col items-center" style={{ backgroundColor: '#faf7f2' }}>
      <div className="w-full max-w-[480px] px-5 pt-24 pb-10 flex flex-col items-center flex-1">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-[60px] leading-none mb-4">🗺</div>
          <h1 className="font-display text-[34px] font-extrabold text-navy leading-tight">TripBoard</h1>
          <p className="font-body text-[15px] text-text-muted mt-3 leading-relaxed">
            Your crew, one board, zero hassle.
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/new')}
            className="w-full py-4 rounded-[14px] font-body text-[16px] font-semibold transition-opacity active:opacity-80"
            style={{ backgroundColor: '#1a3647', color: '#faf7f2' }}
          >
            Create a Trip
          </button>
          <button
            type="button"
            onClick={() => setShowLinkHelper(!showLinkHelper)}
            className="w-full py-4 rounded-[14px] font-body text-[16px] font-semibold text-navy transition-opacity active:opacity-80"
            style={{ border: '1.5px solid rgba(26,54,71,0.15)', backgroundColor: 'transparent' }}
          >
            I have a trip link
          </button>
          {showLinkHelper && (
            <p className="font-body text-[13px] text-text-muted text-center animate-fadeSlideIn">
              Just open the link shared with you — it'll take you straight to the trip.
            </p>
          )}
        </div>

        {/* My Trips */}
        {myTrips.length > 0 && (
          <div className="w-full mt-12 animate-fadeSlideIn">
            <div className="border-t border-dashed mb-5" style={{ borderColor: 'rgba(26,54,71,0.1)' }} />
            <h2 className="font-display text-[20px] font-bold text-navy mb-4">My Trips</h2>
            <div className="flex flex-col gap-3">
              {myTrips.map((trip) => (
                <TripCard key={trip.slug} trip={trip} tag="Created by you" />
              ))}
            </div>
          </div>
        )}

        {/* Recent Trips */}
        {recentTrips.length > 0 && (
          <div className="w-full mt-8 animate-fadeSlideIn">
            {myTrips.length === 0 && (
              <div className="border-t border-dashed mb-5" style={{ borderColor: 'rgba(26,54,71,0.1)' }} />
            )}
            <h2 className="font-display text-[18px] font-bold text-navy mb-4" style={{ opacity: 0.7 }}>Recent Trips</h2>
            <div className="flex flex-col gap-3">
              {recentTrips.map((trip) => (
                <TripCard key={trip.slug} trip={trip} />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* Footer */}
        <div className="pt-10 pb-4">
          <span className="font-body text-[11px] tracking-[1px]" style={{ color: '#c8cfd3' }}>
            fortheplot.today
          </span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
