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

-- RLS: open access (same pattern as other tables)
ALTER TABLE whatsapp_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whatsapp_subscribers_select"
  ON whatsapp_subscribers FOR SELECT
  USING (true);

CREATE POLICY "whatsapp_subscribers_insert"
  ON whatsapp_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "whatsapp_subscribers_update"
  ON whatsapp_subscribers FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "whatsapp_subscribers_delete"
  ON whatsapp_subscribers FOR DELETE
  USING (true);
