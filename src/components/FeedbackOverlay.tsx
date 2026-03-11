import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/posthog';

interface Props {
  tripSlug?: string | null;
  onClose: () => void;
}

const FeedbackOverlay = ({ tripSlug, onClose }: Props) => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userName = localStorage.getItem('tripboard-username') || '';

  const handleClose = () => {
    setLeaving(true);
    setTimeout(onClose, 400);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;

    const { error } = await supabase.from('feedback').insert({
      trip_slug: tripSlug || null,
      name: userName || 'Anonymous',
      email: email.trim() || null,
      message: message.trim(),
    });

    if (error) console.error('Feedback insert failed:', error);
    trackEvent('feedback_submitted', { trip_slug: tripSlug, has_email: !!email.trim() });

    setSubmitted(true);
    setTimeout(() => {
      setLeaving(true);
      setTimeout(onClose, 400);
    }, 2000);
  };

  // Auto-grow textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
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
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute font-body text-[18px] active:opacity-60"
        style={{ top: '20px', right: '20px', color: 'rgba(255,255,255,0.3)' }}
      >
        ×
      </button>

      <div ref={contentRef} className="w-full max-w-[360px]" style={{ padding: '32px 24px' }}>
        {/* Top section */}
        <div className="text-center">
          <div style={{ color: '#c17c4e', fontSize: '24px', marginBottom: '16px' }}>✦</div>
          <p className="font-body text-[15px] font-normal" style={{ color: '#fff' }}>
            hey, i'm atharva.
          </p>
          <p className="font-body text-[14px] mt-3" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
            i built this over a weekend with ai tools — no code, just intent and iteration. tripboard is an experiment in making trip planning less scattered for friend groups.
          </p>
          <p className="font-body text-[14px] mt-3" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
            if you made it here, you're curious, and i appreciate that. if something felt off, or felt great, or you have an idea — i'd love to hear it.
          </p>
        </div>

        {/* Feedback section */}
        <div style={{ marginTop: '28px' }}>
          {submitted ? (
            <p className="font-body text-[14px] text-center" style={{ color: 'rgba(255,255,255,0.65)' }}>
              thank you. this means a lot. ✦
            </p>
          ) : (
            <>
              {userName && (
                <p className="font-body text-[13px] mb-3" style={{ color: '#c17c4e' }}>
                  from {userName}
                </p>
              )}

              <textarea
                ref={textareaRef}
                rows={2}
                value={message}
                onChange={handleTextareaChange}
                placeholder="whatever's on your mind..."
                className="w-full font-body text-[15px] outline-none resize-none"
                style={{
                  backgroundColor: 'transparent',
                  color: '#fff',
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  padding: '8px 0',
                }}
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email (only if you want me to reply)"
                className="w-full font-body text-[13px] outline-none mt-4"
                style={{
                  backgroundColor: 'transparent',
                  color: '#fff',
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  padding: '8px 0',
                }}
              />

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim()}
                  className="font-body text-[14px] font-medium active:opacity-60 disabled:opacity-30 transition-opacity"
                  style={{ color: '#c17c4e', background: 'none', border: 'none' }}
                >
                  send ✦
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackOverlay;
