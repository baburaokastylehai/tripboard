import { useState, useEffect } from 'react';

interface Props {
  isOnline: boolean;
}

const OfflineBanner = ({ isOnline }: Props) => {
  const [show, setShow] = useState(!isOnline);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
      setFading(false);
    } else if (show) {
      setFading(true);
      const t = setTimeout(() => { setShow(false); setFading(false); }, 500);
      return () => clearTimeout(t);
    }
  }, [isOnline]);

  if (!show) return null;

  return (
    <div
      className="font-body text-[12px] text-center py-2 px-4 mx-4 mt-2 rounded-xl"
      style={{
        color: '#9aacb5',
        backgroundColor: '#faf7f2',
        boxShadow: '0 1px 4px rgba(26,54,71,0.08)',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      you're offline — things might be stale
    </div>
  );
};

export default OfflineBanner;
