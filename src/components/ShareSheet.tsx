import { useState } from 'react';

interface Props {
  slug: string;
  onClose: () => void;
}

const ShareSheet = ({ slug, onClose }: Props) => {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/t/${slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(26,54,71,0.3)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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

        <h2 className="font-display text-[22px] font-bold text-navy mb-4">Share this trip</h2>

        <div
          className="w-full px-4 py-3 rounded-xl font-body text-[14px] text-navy mb-3 select-all break-all"
          style={{ backgroundColor: 'rgba(26,54,71,0.04)', border: '1px solid rgba(26,54,71,0.06)' }}
        >
          {url}
        </div>

        <button
          onClick={handleCopy}
          className="w-full py-4 rounded-[14px] font-body text-[16px] font-semibold transition-opacity active:opacity-80"
          style={{ backgroundColor: '#c17c4e', color: '#fff' }}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        <p className="font-body text-[13px] text-text-muted text-center mt-3">
          Anyone with this link can add and see everything.
        </p>
      </div>
    </div>
  );
};

export default ShareSheet;
