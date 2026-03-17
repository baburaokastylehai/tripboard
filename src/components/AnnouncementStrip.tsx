import { useState } from 'react';
import { ANNOUNCEMENTS, LATEST_ANNOUNCEMENT_DATE } from '@/lib/announcements';

const STORAGE_KEY = 'tripboard-last-seen-announcement';

interface Props {
  hasVisitedBefore: boolean;
}

const AnnouncementStrip = ({ hasVisitedBefore }: Props) => {
  const [dismissed, setDismissed] = useState(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY) || '';
    return lastSeen >= LATEST_ANNOUNCEMENT_DATE;
  });

  if (!hasVisitedBefore || dismissed || ANNOUNCEMENTS.length === 0) {
    return null;
  }

  const latest = ANNOUNCEMENTS[0];

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, LATEST_ANNOUNCEMENT_DATE);
    setDismissed(true);
  };

  return (
    <div
      className="mx-4 mt-3"
      style={{
        backgroundColor: '#faf7f2',
        borderRadius: '12px',
        padding: '10px 14px',
        borderLeft: '3px solid rgba(193,124,78,0.4)',
        boxShadow: '0 1px 4px rgba(26,54,71,0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <p
        className="font-body text-[12px] leading-relaxed flex-1"
        style={{ color: '#1a3647', margin: 0 }}
      >
        {latest.text}
      </p>
      <button
        onClick={handleDismiss}
        className="font-body text-[14px] active:opacity-60 shrink-0"
        style={{
          color: '#9aacb5',
          background: 'none',
          border: 'none',
          padding: '0 2px',
          lineHeight: 1,
          cursor: 'pointer',
        }}
        aria-label="Dismiss announcement"
      >
        &times;
      </button>
    </div>
  );
};

export default AnnouncementStrip;
