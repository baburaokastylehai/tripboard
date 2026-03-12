import { useState, useRef, useEffect } from 'react';

interface Props {
  onClose: () => void;
}

const HowItWorksOverlay = ({ onClose }: Props) => {
  const [leaving, setLeaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(onClose, 400);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-5"
      style={{
        backgroundColor: '#1a3647',
        animation: leaving ? 'feedbackFadeOut 0.4s ease forwards' : 'feedbackFadeIn 0.4s ease forwards',
      }}
      onClick={handleBackdropClick}
    >
      <button
        onClick={handleClose}
        className="absolute font-body text-[18px] active:opacity-60"
        style={{ top: '20px', right: '20px', color: 'rgba(255,255,255,0.3)' }}
      >
        ×
      </button>

      <div ref={contentRef} className="w-full max-w-[360px]" style={{ padding: '32px 24px' }}>
        <div className="text-center">
          <div style={{ color: '#c17c4e', fontSize: '24px', marginBottom: '16px' }}>✦</div>
          <p className="font-body text-[16px] font-medium" style={{ color: '#fff' }}>
            here's the idea.
          </p>
        </div>

        <div className="text-center flex flex-col gap-4" style={{ marginTop: '28px' }}>
          <p className="font-body text-[14px]" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            you create a trip and share the link with your group.
          </p>
          <p className="font-body text-[14px]" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            everyone drops their bookings, restaurant finds, and activity links.
          </p>
          <p className="font-body text-[14px]" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            paste a link — tripboard auto-sorts it into the right category.
          </p>
        </div>

        <div className="text-center" style={{ marginTop: '24px' }}>
          <p className="font-body text-[14px]" style={{ color: '#c17c4e' }}>
            one board. the whole trip. ✦
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksOverlay;
