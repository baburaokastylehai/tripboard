import { useState } from 'react';
import { supabase, Trip, EMOJI_OPTIONS } from '@/lib/supabase';
import TripDatePicker from '@/components/TripDatePicker';

interface Props {
  trip: Trip;
  onClose: () => void;
  onUpdated: (trip: Trip) => void;
}

const EditTripSheet = ({ trip, onClose, onUpdated }: Props) => {
  const [emoji, setEmoji] = useState(trip.emoji);
  const [name, setName] = useState(trip.name);
  const [subtitle, setSubtitle] = useState(trip.subtitle || '');
  const [startDate, setStartDate] = useState(trip.start_date || '');
  const [endDate, setEndDate] = useState(trip.end_date || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || saving) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('trips')
        .update({
          name: trimmedName,
          subtitle: subtitle.trim(),
          emoji,
          start_date: startDate || null,
          end_date: endDate || null,
        })
        .eq('id', trip.id);

      if (error) {
        console.error('Trip update failed:', error);
        setSaving(false);
        return;
      }

      // Re-fetch fresh data
      const { data } = await supabase
        .from('trips')
        .select('*')
        .eq('id', trip.id)
        .single();

      if (data) {
        onUpdated(data);
      } else {
        onUpdated({ ...trip, name: trimmedName, subtitle: subtitle.trim(), emoji, start_date: startDate || null, end_date: endDate || null });
      }
      onClose();
    } catch (err) {
      console.error('Trip update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = '#c17c4e');
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'rgba(26,54,71,0.12)');
  const inputStyle = { border: '1.5px solid rgba(26,54,71,0.12)', backgroundColor: '#fff' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(26,54,71,0.3)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[480px] animate-slideUp overflow-y-auto"
        style={{
          backgroundColor: '#faf7f2',
          borderRadius: '24px 24px 0 0',
          padding: '24px 20px 40px',
          maxHeight: '85vh',
        }}
      >
        <div className="flex justify-center mb-5">
          <div style={{ width: '40px', height: '4px', backgroundColor: '#ccc', borderRadius: '2px' }} />
        </div>

        <h2 className="font-display text-[22px] font-bold text-navy mb-5">Edit Trip</h2>

        {/* Emoji picker */}
        <div className="flex flex-col items-center mb-5">
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
                  className="w-[44px] h-[44px] flex items-center justify-center text-[24px] rounded-xl active:scale-95"
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

        <div className="flex flex-col gap-3 mb-5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-[14px] rounded-xl font-body text-[16px] text-navy outline-none"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle"
            className="w-full px-4 py-[14px] rounded-xl font-body text-[15px] text-navy placeholder:text-text-muted outline-none"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          <TripDatePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="w-full py-4 rounded-[14px] font-body text-[16px] font-semibold transition-opacity active:opacity-80 disabled:cursor-not-allowed"
          style={{
            backgroundColor: name.trim() ? '#1a3647' : '#d0d5d8',
            color: name.trim() ? '#faf7f2' : '#fff',
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default EditTripSheet;
