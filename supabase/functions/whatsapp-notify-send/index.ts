import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

// --- Config ---

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER")!;
const PHONE_ENCRYPTION_KEY = Deno.env.get("PHONE_ENCRYPTION_KEY")!; // hex-encoded 32 bytes

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- Categories (mirrors src/lib/supabase.ts) ---

const CATEGORIES: Record<string, { emoji: string; name: string }> = {
  stay: { emoji: "\u{1F3E0}", name: "Stay" },
  transport: { emoji: "\u{1F680}", name: "Getting There" },
  thingstodo: { emoji: "\u{1F3AF}", name: "Things to Do" },
  food: { emoji: "\u{1F37D}", name: "Eat & Drink" },
};

// --- Crypto helpers ---

async function getDecryptionKey(): Promise<CryptoKey> {
  const keyBytes = new Uint8Array(
    PHONE_ENCRYPTION_KEY.match(/.{2}/g)!.map((b) => parseInt(b, 16)),
  );
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
    "decrypt",
  ]);
}

async function decryptPhone(encrypted: string): Promise<string> {
  const key = await getDecryptionKey();

  // Decode base64 → combined (IV + ciphertext)
  const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));

  // First 12 bytes = IV, rest = ciphertext
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(decrypted);
}

// --- Twilio helper ---

async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const params = new URLSearchParams({
    From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
    To: `whatsapp:${to}`,
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
    return false;
  }

  return true;
}

// --- Main handler ---

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const { trip_id, item_title, item_category, count } = await req.json();

    if (!trip_id) {
      return new Response(
        JSON.stringify({ error: "trip_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get trip details
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, name, emoji, slug")
      .eq("id", trip_id)
      .single();

    if (tripError || !trip) {
      return new Response(
        JSON.stringify({ error: "Trip not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get active subscribers for this trip
    const { data: subscribers, error: subError } = await supabase
      .from("whatsapp_subscribers")
      .select("phone_encrypted")
      .eq("trip_id", trip_id)
      .eq("active", true);

    if (subError) {
      console.error("Failed to fetch subscribers:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Build notification message
    let message: string;
    const itemCount = count || 1;

    if (itemCount === 1) {
      const cat = CATEGORIES[item_category];
      const categoryName = cat ? `${cat.emoji} ${cat.name}` : item_category;
      message = `new link added to *${trip.name}* ${trip.emoji}\n${item_title} in ${categoryName}\n\ntripboard.fortheplot.today/t/${trip.slug}`;
    } else {
      message = `${itemCount} new links added to *${trip.name}* ${trip.emoji}\n\ntripboard.fortheplot.today/t/${trip.slug}`;
    }

    // Decrypt phones and send notifications in parallel
    let sent = 0;
    const sendPromises = subscribers.map(async (sub) => {
      try {
        const phone = await decryptPhone(sub.phone_encrypted);
        const ok = await sendWhatsApp(phone, message);
        if (ok) sent++;
      } catch (err) {
        console.error("Failed to notify subscriber:", err);
      }
    });

    await Promise.all(sendPromises);

    console.log(
      `[notify-send] trip=${trip.slug} subscribers=${subscribers.length} sent=${sent}`,
    );

    return new Response(
      JSON.stringify({ sent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[notify-send] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
