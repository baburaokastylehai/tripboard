import { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [show, setShow] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Only on mobile
    if (window.innerWidth >= 768) return;
    // Not in standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) return;
    // Already dismissed
    if (localStorage.getItem('tripboard-install-dismissed')) return;
    // Must have visited at least one trip
    try {
      const visited = JSON.parse(localStorage.getItem('tripboard-visited-trips') || '[]');
      if (!Array.isArray(visited) || visited.length === 0) return;
    } catch { return; }

    setShow(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('tripboard-install-dismissed', '1');
    setShow(false);
    setShowInstructions(false);
  };

  if (!show) return null;

  if (showInstructions) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ backgroundColor: 'rgba(26,54,71,0.3)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowInstructions(false); }}
      >
        <div
          className="w-full max-w-[480px] animate-slideUp"
          style={{
            backgroundColor: '#faf7f2',
            borderRadius: '24px 24px 0 0',
            padding: '24px 20px 40px',
          }}
        >
          <div className="flex justify-center mb-5">
            <div style={{ width: '40px', height: '4px', backgroundColor: '#ccc', borderRadius: '2px' }} />
          </div>

          <h2 className="font-display text-[22px] font-bold text-navy mb-6">Add to Home Screen</h2>

          <div className="flex flex-col gap-4">
            <p className="font-body text-[14px] text-navy">
              1. tap the share button in Safari (the square with arrow)
            </p>
            <p className="font-body text-[14px] text-navy">
              2. scroll down and tap "Add to Home Screen"
            </p>
            <p className="font-body text-[14px] text-navy">
              3. tap "Add" — that's it
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="font-body text-[14px] font-semibold mt-8 active:opacity-70"
            style={{ color: '#c17c4e', background: 'none', border: 'none' }}
          >
            got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mx-4 mb-4"
      style={{
        backgroundColor: '#fff',
        borderRadius: '14px',
        boxShadow: '0 1px 6px rgba(26,54,71,0.08)',
        padding: '14px 20px',
      }}
    >
      <button
        onClick={handleDismiss}
        className="absolute active:opacity-60"
        style={{ top: '8px', right: '10px', color: '#b0bec5', background: 'none', border: 'none', fontSize: '16px', lineHeight: 1 }}
      >
        ×
      </button>
      <div className="flex items-center justify-between gap-3 pr-4">
        <span className="font-body text-[13px]" style={{ color: '#4a6572' }}>
          add tripboard to your home screen for the full experience
        </span>
        <button
          onClick={() => setShowInstructions(true)}
          className="font-body text-[13px] font-semibold shrink-0 active:opacity-70"
          style={{ color: '#c17c4e', background: 'none', border: 'none' }}
        >
          show me
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
