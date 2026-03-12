import { useState } from 'react';

interface Props {
  tripId: string;
  slug: string;
  tripName?: string;
  onShare: () => void;
}

const SharePromptBanner = ({ tripId, slug, tripName, onShare }: Props) => {
  const storageKey = `tripboard-share-prompted-${tripId}`;
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(storageKey) === 'true';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setDismissed(true);
  };

  const handleShare = async () => {
    localStorage.setItem(storageKey, 'true');

    if (navigator.share) {
      try {
        await navigator.share({
          title: tripName || 'TripBoard',
          text: 'Join our trip on TripBoard',
          url: `${window.location.origin}/t/${slug}`,
        });
        setDismissed(true);
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback: open share sheet
    onShare();
    setDismissed(true);
  };

  return (
    <div
      className="relative animate-fadeSlideIn"
      style={{
        backgroundColor: '#fff',
        borderRadius: '14px',
        boxShadow: '0 2px 8px rgba(26,54,71,0.06)',
        padding: '16px 20px',
        margin: '0 16px 16px',
      }}
    >
      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="absolute active:opacity-60"
        style={{ top: '8px', right: '12px', color: '#c8cfd3', fontSize: '16px', background: 'none', border: 'none' }}
      >
        ×
      </button>

      <p className="font-body text-[14px] pr-4" style={{ color: '#4a6572' }}>
        trip created! share this link with your crew so everyone can add their stuff.
      </p>

      <button
        onClick={handleShare}
        className="mt-3 font-body text-[13px] font-semibold active:opacity-70"
        style={{
          color: '#fff',
          backgroundColor: '#c17c4e',
          borderRadius: '20px',
          padding: '8px 16px',
          border: 'none',
        }}
      >
        share the link ↗
      </button>
    </div>
  );
};

export default SharePromptBanner;
