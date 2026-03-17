import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

// --- Config ---

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER")!;
const PHONE_ENCRYPTION_KEY = Deno.env.get("PHONE_ENCRYPTION_KEY")!; // hex-encoded 32 bytes

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Intent classification ---

const NOTIFY_REGEX = /^notify\s+(.+)$/i;
const STOP_REGEX = /^stop\s+(.+)$/i;

function classifyIntent(
  body: string,
): { type: "notify"; slug: string } | { type: "stop"; slug: string } | { type: "unknown" } {
  const trimmed = body.trim();

  const notifyMatch = trimmed.match(NOTIFY_REGEX);
  if (notifyMatch) {
    return { type: "notify", slug: notifyMatch[1].trim().toLowerCase() };
  }

  const stopMatch = trimmed.match(STOP_REGEX);
  if (stopMatch) {
    return { type: "stop", slug: stopMatch[1].trim().toLowerCase() };
  }

  return { type: "unknown" };
}

// --- Crypto helpers ---

async function getEncryptionKey(): Promise<CryptoKey> {
  // PHONE_ENCRYPTION_KEY is hex-encoded 32 bytes (64 hex chars)
  const keyBytes = new Uint8Array(
    PHONE_ENCRYPTION_KEY.match(/.{2}/g)!.map((b) => parseInt(b, 16)),
  );
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
    "encrypt",
  ]);
}

async function encryptPhone(phone: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encoded = new TextEncoder().encode(phone);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );

  // Prepend IV to ciphertext, encode as base64
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

async function hashPhone(phone: string): Promise<string> {
  const data = new TextEncoder().encode(phone);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// --- Twilio helpers ---

async function sendWhatsAppReply(to: string, body: string): Promise<void> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const params = new URLSearchParams({
    From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
    To: to,
    Body: body,
  });

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error("Twilio send failed:", resp.status, err);
  }
}

// --- Flow handlers ---

async function handleNotify(
  rawPhone: string,
  from: string,
  slug: string,
): Promise<void> {
  // Look up trip by slug
  const { data: trip, error } = await supabase
    .from("trips")
    .select("id, name, emoji")
    .eq("slug", slug)
    .single();

  if (error || !trip) {
    await sendWhatsAppReply(
      from,
      "I couldn't find that trip. Double-check the link and try again from the trip page.",
    );
    return;
  }

  // Encrypt phone & hash phone
  const [phoneEncrypted, phoneHash] = await Promise.all([
    encryptPhone(rawPhone),
    hashPhone(rawPhone),
  ]);

  // Upsert subscriber (reactivate if previously stopped)
  const { error: upsertError } = await supabase
    .from("whatsapp_subscribers")
    .upsert(
      {
        phone_encrypted: phoneEncrypted,
        phone_hash: phoneHash,
        trip_id: trip.id,
        subscribed_at: new Date().toISOString(),
        active: true,
      },
      { onConflict: "phone_hash,trip_id" },
    );

  if (upsertError) {
    console.error("Subscriber upsert failed:", upsertError);
    await sendWhatsAppReply(
      from,
      "Something went wrong subscribing. Try again in a minute.",
    );
    return;
  }

  await sendWhatsAppReply(
    from,
    `${trip.emoji} you'll get a message whenever someone adds something new to *${trip.name}*.\n\nto stop, send: stop ${slug}`,
  );
}

async function handleStop(
  rawPhone: string,
  from: string,
  slug: string,
): Promise<void> {
  // Look up trip by slug
  const { data: trip, error } = await supabase
    .from("trips")
    .select("id, name, emoji")
    .eq("slug", slug)
    .single();

  if (error || !trip) {
    await sendWhatsAppReply(
      from,
      "I couldn't find that trip. Double-check the slug and try again.",
    );
    return;
  }

  const phoneHash = await hashPhone(rawPhone);

  // Set active = false
  const { error: updateError, count } = await supabase
    .from("whatsapp_subscribers")
    .update({ active: false })
    .eq("phone_hash", phoneHash)
    .eq("trip_id", trip.id);

  if (updateError) {
    console.error("Subscriber stop failed:", updateError);
    await sendWhatsAppReply(
      from,
      "Something went wrong. Try again in a minute.",
    );
    return;
  }

  if (count === 0) {
    await sendWhatsAppReply(
      from,
      `You weren't subscribed to *${trip.name}*. No changes made.`,
    );
    return;
  }

  await sendWhatsAppReply(
    from,
    `Done — you won't get notifications for *${trip.name}* anymore.\n\nTo re-subscribe, send: notify ${slug}`,
  );
}

// --- Main handler ---

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Twilio sends form-encoded POST
    const formData = await req.formData();
    const from = formData.get("From") as string; // "whatsapp:+1234567890"
    const body = formData.get("Body") as string;
    const messageSid = formData.get("MessageSid") as string;

    if (!from || !body) {
      return new Response("Missing From or Body", { status: 400 });
    }

    console.log(
      `[notify-subscribe] MessageSid=${messageSid} From=${from} Body="${body.slice(0, 100)}"`,
    );

    // Strip "whatsapp:" prefix for crypto operations
    const rawPhone = from.replace("whatsapp:", "");

    // Classify intent and route
    const intent = classifyIntent(body);

    switch (intent.type) {
      case "notify":
        await handleNotify(rawPhone, from, intent.slug);
        break;
      case "stop":
        await handleStop(rawPhone, from, intent.slug);
        break;
      case "unknown":
        await sendWhatsAppReply(
          from,
          'To subscribe to trip updates, send: notify <trip-code>\nTo unsubscribe, send: stop <trip-code>',
        );
        break;
    }

    // Return empty TwiML — Twilio expects XML but we reply via API
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      },
    );
  } catch (err) {
    console.error("[notify-subscribe] Unhandled error:", err);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200, // Still return 200 so Twilio doesn't retry
        headers: { "Content-Type": "text/xml" },
      },
    );
  }
});
