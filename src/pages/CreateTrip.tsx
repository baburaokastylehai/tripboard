import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, EMOJI_OPTIONS } from '@/lib/supabase';
import { trackEvent } from '@/lib/posthog';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [emoji, setEmoji] = useState('🏝');
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          name: name.trim(),
          subtitle: subtitle.trim(),
          emoji,
          start_date: startDate || null,
          end_date: endDate || null,
        })
        .select()
        .single();

      if (error) throw error;

      const saved = JSON.parse(localStorage.getItem('tripboard-my-trips') || '[]');
      saved.push({ id: data.id, slug: data.slug, name: data.name, emoji: data.emoji, subtitle: data.subtitle });
      localStorage.setItem('tripboard-my-trips', JSON.stringify(saved));

      trackEvent('trip_created', { trip_id: data.id, trip_name: data.name, emoji: data.emoji });
      navigate(`/t/${data.slug}`);
    } catch (err) {
      console.error('Failed to create trip:', err);
      setSubmitting(false);
    }
  };

  const inputStyle = {
    border: '1.5px solid rgba(26,54,71,0.12)',
    backgroundColor: '#fff',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = '#c17c4e');
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'rgba(26,54,71,0.12)');

  return (
    <div className="min-h-screen flex justify-center page-transition" style={{ backgroundColor: '#faf7f2' }}>
      <div className="w-full max-w-[480px] px-5 pt-6 pb-10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="font-body text-[13px] font-medium text-copper mb-8 active:opacity-70"
        >
          ← Back
        </button>

        <h1 className="font-display text-[28px] font-bold text-navy mb-2">New Trip</h1>
        <p className="font-body text-[14px] text-text-muted mb-8">
          Set up your trip. Share the link. Everyone's in.
        </p>

        {/* Emoji picker */}
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-[48px] leading-none active:scale-110 transition-transform"
          >
            {emoji}
          </button>
          {showEmojiPicker && (
            <div className="mt-4 grid grid-cols-5 gap-2 animate-fadeSlideIn">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                  className="w-[44px] h-[44px] flex items-center justify-center text-[24px] rounded-xl transition-all active:scale-95"
                  style={{
                    border: emoji === e ? '2px solid #c17c4e' : '2px solid transparent',
                    backgroundColor: emoji === e ? 'rgba(193,124,78,0.08)' : 'transparent',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Catalina Weekend"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-[14px] rounded-xl font-body text-[16px] text-navy placeholder:text-text-muted outline-none transition-colors"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <input
            type="text"
            placeholder="March 2026 · 5 friends"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full px-4 py-[14px] rounded-xl font-body text-[15px] text-navy placeholder:text-text-muted outline-none transition-colors"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Date fields */}
          <div className="font-body text-[13px] mt-1" style={{ color: '#9aacb5' }}>when?</div>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-[14px] rounded-xl font-body text-[14px] text-navy outline-none transition-colors"
                style={inputStyle}
                placeholder="Start date"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div className="flex-1">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-[14px] rounded-xl font-body text-[14px] text-navy outline-none transition-colors"
                style={inputStyle}
                placeholder="End date"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={!name.trim() || submitting}
          className="w-full mt-6 py-4 rounded-[14px] font-body text-[16px] font-semibold transition-opacity active:opacity-80 disabled:cursor-not-allowed"
          style={{
            backgroundColor: name.trim() ? '#1a3647' : '#d0d5d8',
            color: name.trim() ? '#faf7f2' : '#fff',
          }}
        >
          {submitting ? 'Creating...' : 'Create Trip'}
        </button>
      </div>
    </div>
  );
};

export default CreateTrip;
