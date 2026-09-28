-- The original live table exposed encrypted phone data and hashes through the
-- anonymous API. WhatsApp Edge Functions use the service role and do not need
-- public table policies.

ALTER TABLE public.whatsapp_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_subscribers_select"
  ON public.whatsapp_subscribers;
DROP POLICY IF EXISTS "whatsapp_subscribers_insert"
  ON public.whatsapp_subscribers;
DROP POLICY IF EXISTS "whatsapp_subscribers_update"
  ON public.whatsapp_subscribers;
DROP POLICY IF EXISTS "whatsapp_subscribers_delete"
  ON public.whatsapp_subscribers;
