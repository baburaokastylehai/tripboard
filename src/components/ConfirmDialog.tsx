import { useState } from 'react';

interface Props {
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({ message, confirmLabel, cancelLabel = 'cancel', onConfirm, onCancel }: Props) => {
  const [leaving, setLeaving] = useState(false);

  const handleCancel = () => {
    setLeaving(true);
    setTimeout(onCancel, 200);
  };

  const handleConfirm = () => {
    setLeaving(true);
    setTimeout(onConfirm, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-5 ${leaving ? 'animate-fadeOut' : 'animate-fadeIn'}`}
      style={{ backgroundColor: 'rgba(26,54,71,0.3)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
    >
      <div
        className="w-full max-w-[320px]"
        style={{
          backgroundColor: '#faf7f2',
          borderRadius: '20px',
          padding: '24px 20px 20px',
          boxShadow: '0 8px 30px rgba(26,54,71,0.12)',
          transition: 'transform 0.2s ease, opacity 0.2s ease',
          transform: leaving ? 'scale(0.95)' : 'scale(1)',
          opacity: leaving ? 0 : 1,
        }}
      >
        <p className="font-body text-[15px] text-navy leading-relaxed text-center">
          {message}
        </p>

        <div className="flex gap-3 mt-5">
          {/* Cancel is the prominent option */}
          <button
            onClick={handleCancel}
            className="flex-1 py-[13px] rounded-[12px] font-body text-[15px] font-semibold active:opacity-80"
            style={{
              backgroundColor: '#1a3647',
              color: '#faf7f2',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-[13px] rounded-[12px] font-body text-[15px] font-medium active:opacity-80"
            style={{
              backgroundColor: 'transparent',
              color: '#e57373',
              border: '1.5px solid rgba(229,115,115,0.3)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
