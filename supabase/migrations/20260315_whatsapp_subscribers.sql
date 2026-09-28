-- WhatsApp notification subscribers
-- Users opt in to receive a WhatsApp message when a new item is added to a trip.
-- Phone numbers are AES-256-GCM encrypted (decryptable for sending notifications).
-- Phone hashes are SHA-256 for deduplication lookups only.

CREATE TABLE whatsapp_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_encrypted text NOT NULL,
  phone_hash text NOT NULL,
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true,
  UNIQUE (phone_hash, trip_id)
);

-- Fast lookup by phone hash (dedup check on subscribe)
CREATE INDEX idx_whatsapp_subscribers_phone_hash ON whatsapp_subscribers (phone_hash);

-- Fast query for all active subscribers on a trip (used by notify-send)
CREATE INDEX idx_whatsapp_subscribers_trip_active ON whatsapp_subscribers (trip_id) WHERE active = true;

-- RLS: access is restricted to trusted server-side clients using the service role.
-- Phone identifiers must never be readable or writable through the public API.
ALTER TABLE whatsapp_subscribers ENABLE ROW LEVEL SECURITY;
