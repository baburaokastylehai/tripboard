import { useState, useRef, useEffect } from 'react';
import { supabase, TripItem, CATEGORIES } from '@/lib/supabase';
import { toast } from 'sonner';

interface Props {
  tripId: string;
  onItemsAdded: (items: TripItem[]) => void;
  isOnline: boolean;
}

const URL_REGEX = /https?:\/\/[^\s,]+|(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}[^\s,]*/g;

// Simple domain-based categorization heuristic
const categorizeDomain = (url: string): { category: string; title: string } => {
  let hostname = '';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    hostname = url.toLowerCase();
  }

  // Stay
  if (/airbnb|vrbo|booking\.com|hotels\.com|expedia|hostelworld|agoda|trivago|marriott|hilton|hyatt|ihg/.test(hostname)) {
    return { category: 'stay', title: hostname.split('.')[0] };
  }
  // Transport
  if (/airlines|united|delta|southwest|jetblue|ryanair|kayak|skyscanner|google\.com\/flights|flightradar|amtrak|ferry|flixbus|uber|lyft|rome2rio/.test(hostname)) {
    return { category: 'transport', title: hostname.split('.')[0] };
  }
  // Food
  if (/yelp|opentable|resy|doordash|ubereats|grubhub|tripadvisor.*restaurant|eater\.com|infatuation|michelin/.test(hostname)) {
    return { category: 'food', title: hostname.split('.')[0] };
  }
  // Things to do (default for travel/activity sites)
  if (/viator|getyourguide|klook|fareharbor|tripadvisor|alltrails|eventbrite|meetup|musement/.test(hostname)) {
    return { category: 'thingstodo', title: hostname.split('.')[0] };
  }

  // Default to thingstodo
  return { category: 'thingstodo', title: hostname.split('.')[0] };
};

const extractUrls = (text: string): string[] => {
  const matches = text.match(URL_REGEX) || [];
  return matches.map(u => {
    if (!u.startsWith('http')) return `https://${u}`;
    return u;
  });
};

const SmartLinkInput = ({ tripId, onItemsAdded, isOnline }: Props) => {
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const detectedUrls = text.trim() ? extractUrls(text) : [];

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  // Auto-dismiss error
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleSubmit = async () => {
    if (!text.trim() || processing || !isOnline) return;

    const urls = extractUrls(text);
    if (urls.length === 0) {
      setError("couldn't find any links — try pasting a URL");
      return;
    }

    setProcessing(true);
    setError(null);

    const addedByName = localStorage.getItem('tripboard-username') || 'Anonymous';
    const newItems: TripItem[] = [];
    const errors: string[] = [];

    // Try edge function first, fall back to local heuristics
    let results: { url: string; category: string; title: string; date: string | null }[] | null = null;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('smart-categorize', {
        body: { urls },
      });
      if (!fnError && data?.results) {
        results = data.results;
      }
    } catch {
      // Edge function not available, use local heuristics
    }

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        let category: string;
        let title: string;
        let date: string | null = null;

        if (results && results[i]) {
          category = results[i].category;
          title = results[i].title;
          date = results[i].date;
        } else {
          const heuristic = categorizeDomain(url);
          category = heuristic.category;
          title = heuristic.title;
        }

        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        const item: TripItem = {
          id,
          trip_id: tripId,
          category,
          type: 'link',
          title,
          url,
          content: null,
          file_data: null,
          file_name: null,
          added_by_name: addedByName,
          created_at: Date.now() + i, // offset to avoid collisions
          status: 'considering',
          item_date: date,
        };

        newItems.push(item);
      } catch {
        errors.push(url);
      }
    }

    // Insert all items
    if (newItems.length > 0) {
      const { error: insertError } = await supabase.from('trip_items').insert(newItems);
      if (insertError) {
        console.error('Smart link insert failed:', insertError);
        setError("something went wrong — try adding manually");
      } else {
        onItemsAdded(newItems);
        setText('');

        // Show success toast
        if (newItems.length === 1) {
          const cat = CATEGORIES.find(c => c.id === newItems[0].category);
          toast(`${cat?.emoji || '✦'} added to ${cat?.name || 'board'}`);
        } else {
          const summary = newItems.reduce((acc, item) => {
            const cat = CATEGORIES.find(c => c.id === item.category);
            const name = cat?.name || 'Other';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          const details = Object.entries(summary).map(([name, count]) => `${count} → ${name}`).join(', ');
          toast(`✦ ${newItems.length} links sorted — ${details}`);
        }
      }
    }

    if (errors.length > 0) {
      setError(`couldn't process ${errors.join(', ')} — try adding manually`);
    }

    setProcessing(false);
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(26,54,71,0.06)',
        border: '1.5px solid rgba(26,54,71,0.08)',
        borderLeft: '3px solid rgba(193,124,78,0.3)',
        margin: '0 16px 16px',
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="paste a link - or a few, we'll sort them out"
        rows={1}
        className="w-full font-body text-[15px] text-navy placeholder:text-[#9aacb5] outline-none resize-none"
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          minHeight: '24px',
          maxHeight: '120px',
          lineHeight: '1.5',
        }}
      />

      {/* Detected count */}
      {detectedUrls.length > 1 && (
        <div className="font-body text-[11px] mt-1" style={{ color: '#9aacb5' }}>
          {detectedUrls.length} links detected
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="font-body text-[12px] mt-2" style={{ color: '#e57373' }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || processing || !isOnline}
          className="font-body text-[14px] font-semibold active:opacity-60 disabled:opacity-30 transition-opacity"
          style={{ color: '#c17c4e', background: 'none', border: 'none', padding: 0 }}
        >
          {processing ? (
            <span className="animate-pulse" style={{ color: '#9aacb5' }}>sorting...</span>
          ) : (
            'add ✦'
          )}
        </button>
      </div>
    </div>
  );
};

export default SmartLinkInput;
