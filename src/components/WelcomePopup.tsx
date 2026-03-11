import { useState } from 'react';
import { identifyUser, trackEvent } from '@/lib/posthog';

interface Props {
  tripName: string;
  tripEmoji: string;
  onDone: () => void;
}

const WelcomePopup = ({ tripName, tripEmoji, onDone }: Props) => {
  const [name, setName] = useState('');
  const [leaving, setLeaving] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    localStorage.setItem('tripboard-username', name.trim());
    setLeaving(true);
    setTimeout(onDone, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-5 ${leaving ? 'animate-fadeOut' : 'animate-fadeIn'}`}
      style={{ backgroundColor: 'rgba(26,54,71,0.3)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-[340px] text-center"
        style={{
          backgroundColor: '#faf7f2',
          borderRadius: '24px',
          padding: '32px 24px',
          boxShadow: '0 8px 30px rgba(26,54,71,0.12)',
        }}
      >
        <div className="text-[48px] leading-none mb-4">{tripEmoji}</div>
        <h2 className="font-display text-[22px] font-bold text-navy">
          Welcome to {tripName}!
        </h2>
        <p className="font-body text-[14px] text-text-muted mt-1">What should we call you?</p>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full mt-5 px-4 py-[14px] rounded-xl font-body text-[16px] text-navy text-center placeholder:text-text-muted outline-none"
          style={{ border: '1.5px solid rgba(26,54,71,0.12)', backgroundColor: '#fff' }}
          onFocus={(e) => (e.target.style.borderColor = '#c17c4e')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(26,54,71,0.12)')}
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full mt-4 py-4 rounded-[14px] font-body text-[16px] font-semibold transition-opacity active:opacity-80 disabled:cursor-not-allowed"
          style={{
            backgroundColor: name.trim() ? '#1a3647' : '#d0d5d8',
            color: name.trim() ? '#faf7f2' : '#fff',
          }}
        >
          Let's go
        </button>
      </div>
    </div>
  );
};

export default WelcomePopup;
