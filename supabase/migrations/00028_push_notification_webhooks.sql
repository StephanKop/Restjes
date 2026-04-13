-- ============================================================
-- Push-notification webhooks
-- Triggers edge functions on message, reservation and review
-- changes via pg_net (async, non-blocking HTTP).
--
-- PREREQUISITE — store your service role key in Supabase Vault:
--
--   SELECT vault.create_secret(
--     'YOUR_SERVICE_ROLE_KEY',
--     'service_role_key',
--     'Service role key used by database webhooks'
--   );
--
-- You can do this from the SQL Editor in the Supabase Dashboard.
-- ============================================================

-- pg_net: async HTTP requests from inside Postgres
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Ensure the private schema exists for internal helper functions
CREATE SCHEMA IF NOT EXISTS private;

-- ============================================================
-- Generic trigger function: POST a webhook payload to an edge
-- function URL passed as the first trigger argument.
-- ============================================================
CREATE OR REPLACE FUNCTION private.trigger_edge_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _url         text := TG_ARGV[0];
  _service_key text;
  _payload     jsonb;
BEGIN
  -- Read service role key from Supabase Vault
  SELECT decrypted_secret INTO _service_key
    FROM vault.decrypted_secrets
   WHERE name = 'service_role_key'
   LIMIT 1;

  IF _service_key IS NULL THEN
    RAISE WARNING 'trigger_edge_function: vault secret "service_role_key" not found — skipping webhook';
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Build the same payload shape Supabase Dashboard webhooks use
  _payload := jsonb_build_object(
    'type',       TG_OP,
    'table',      TG_TABLE_NAME,
    'schema',     TG_TABLE_SCHEMA,
    'record',     row_to_json(NEW)::jsonb,
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END
  );

  PERFORM net.http_post(
    url     := _url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || _service_key
    ),
    body    := _payload
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================
-- 1. Messages — notify recipient on new message
-- ============================================================
CREATE TRIGGER on_message_insert_push
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION private.trigger_edge_function(
    'https://hvewcizjvolijbjiqyfx.supabase.co/functions/v1/push-notification'
  );

-- ============================================================
-- 2. Reservations — notify on create or status change
-- ============================================================
CREATE TRIGGER on_reservation_change_push
  AFTER INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION private.trigger_edge_function(
    'https://hvewcizjvolijbjiqyfx.supabase.co/functions/v1/on-reservation-change'
  );

-- ============================================================
-- 3. Reviews — notify on new review or merchant reply
-- ============================================================
CREATE TRIGGER on_review_event_push
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION private.trigger_edge_function(
    'https://hvewcizjvolijbjiqyfx.supabase.co/functions/v1/on-review-event'
  );
