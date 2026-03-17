import { useState } from 'react';
import { identifyUser, trackEvent } from '@/lib/posthog';

interface Props {
  onDone: (name: string) => void;
  onClose: () => void;
}

const NamePromptSheet = ({ onDone, onClose }: Props) => {
  const [name, setName] = useState('');
  const [leaving, setLeaving] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    localStorage.setItem('tripboard-username', name.trim());
    identifyUser(name.trim());
    trackEvent('name_prompt_completed');
    setLeaving(true);
    setTimeout(() => onDone(name.trim()), 250);
  };

  const handleClose = () => {
    setLeaving(true);
    setTimeout(onClose, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center ${leaving ? 'animate-fadeOut' : 'animate-fadeIn'}`}
      style={{ backgroundColor: 'rgba(26,54,71,0.3)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`w-full max-w-[480px] ${leaving ? '' : 'animate-slideUp'}`}
        style={{
          backgroundColor: '#1a3647',
          borderRadius: '24px 24px 0 0',
          padding: '28px 24px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
          transition: 'transform 0.25s ease, opacity 0.25s ease',
          transform: leaving ? 'translateY(100%)' : 'translateY(0)',
          opacity: leaving ? 0 : 1,
        }}
      >
        <div className="flex justify-center mb-5">
          <div style={{ width: '40px', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
        </div>

        <h2
          className="font-body text-[18px] font-medium"
          style={{ color: '#faf7f2' }}
        >
          hey, what should we call you?
        </h2>
        <p
          className="font-body text-[13px] mt-1"
          style={{ color: 'rgba(250,247,242,0.5)' }}
        >
          so your friends know who added what
        </p>

        <input
          type="text"
          placeholder="your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full mt-5 px-4 py-[14px] rounded-xl font-body text-[16px] text-navy placeholder:text-text-muted outline-none"
          style={{
            border: '1.5px solid rgba(250,247,242,0.15)',
            backgroundColor: '#faf7f2',
          }}
          autoFocus
        />

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full mt-4 py-4 rounded-[14px] font-body text-[16px] font-semibold tap-scale disabled:cursor-not-allowed"
          style={{
            backgroundColor: name.trim() ? '#c17c4e' : 'rgba(250,247,242,0.15)',
            color: name.trim() ? '#faf7f2' : 'rgba(250,247,242,0.3)',
            transition: 'background-color 0.2s, color 0.2s',
          }}
        >
          let's go
        </button>
      </div>
    </div>
  );
};

export default NamePromptSheet;
