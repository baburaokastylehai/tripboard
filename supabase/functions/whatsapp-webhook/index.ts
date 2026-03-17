import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

// --- Config ---

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SESSION_EXPIRY_DAYS = 30;
const MAX_URLS_PER_MESSAGE = 10;

// --- Categories (mirrors src/lib/supabase.ts) ---

const CATEGORIES: Record<string, { emoji: string; name: string }> = {
  stay: { emoji: "🏠", name: "Stay" },
  transport: { emoji: "🚀", name: "Getting There" },
  thingstodo: { emoji: "🎯", name: "Things to Do" },
  food: { emoji: "🍽", name: "Eat & Drink" },
};

// --- URL extraction & categorization (mirrors SmartLinkInput.tsx) ---

const URL_REGEX =
  /https?:\/\/[^\s,]+|(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}[^\s,]*/g;

function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) || [];
  return matches.map((u) => (u.startsWith("http") ? u : `https://${u}`));
}

function categorizeDomain(url: string): { category: string; title: string } {
  let hostname = "";
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    hostname = url.toLowerCase();
  }

  if (
    /airbnb|vrbo|booking\.com|hotels\.com|expedia|hostelworld|agoda|trivago|marriott|hilton|hyatt|ihg/.test(
      hostname,
    )
  ) {
    return { category: "stay", title: hostname.split(".")[0] };
  }
  if (
    /airlines|united|delta|southwest|jetblue|ryanair|kayak|skyscanner|google\.com\/flights|flightradar|amtrak|ferry|flixbus|uber|lyft|rome2rio/.test(
      hostname,
    )
  ) {
    return { category: "transport", title: hostname.split(".")[0] };
  }
  if (
    /yelp|opentable|resy|doordash|ubereats|grubhub|tripadvisor.*restaurant|eater\.com|infatuation|michelin/.test(
      hostname,
    )
  ) {
    return { category: "food", title: hostname.split(".")[0] };
  }
  if (
    /viator|getyourguide|klook|fareharbor|tripadvisor|alltrails|eventbrite|meetup|musement/.test(
      hostname,
    )
  ) {
    return { category: "thingstodo", title: hostname.split(".")[0] };
  }

  return { category: "thingstodo", title: hostname.split(".")[0] };
}

// --- Helpers ---

async function hashPhone(phone: string): Promise<string> {
  const data = new TextEncoder().encode(phone);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

function categoryLabel(catId: string): string {
  const cat = CATEGORIES[catId];
  return cat ? `${cat.emoji} ${cat.name}` : catId;
}

// --- Intent classification ---

const CONNECT_REGEX = /^connect\s+(.+)$/i;

function classifyIntent(
  body: string,
): { type: "connect"; slug: string } | { type: "link" } | { type: "switch" } {
  const trimmed = body.trim();
  const connectMatch = trimmed.match(CONNECT_REGEX);
  if (connectMatch) {
    return { type: "connect", slug: connectMatch[1].trim().toLowerCase() };
  }

  const urls = extractUrls(trimmed);
  if (urls.length > 0) {
    return { type: "link" };
  }

  return { type: "switch" };
}

// --- Flow handlers ---

async function handleConnect(
  phoneHash: string,
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

  // Upsert whatsapp_links
  await supabase.from("whatsapp_links").upsert(
    { phone_hash: phoneHash, trip_id: trip.id, linked_at: new Date().toISOString() },
    { onConflict: "phone_hash,trip_id" },
  );

  // Upsert whatsapp_sessions — set this trip as active
  await supabase.from("whatsapp_sessions").upsert(
    {
      phone_hash: phoneHash,
      active_trip_id: trip.id,
      last_active_at: new Date().toISOString(),
      pending_urls: null,
    },
    { onConflict: "phone_hash" },
  );

  await sendWhatsAppReply(
    from,
    `✓ connected to *${trip.name}* ${trip.emoji}\n\nForward me links and I'll add them to the board.`,
  );
}

async function handleLink(
  phoneHash: string,
  from: string,
  body: string,
): Promise<void> {
  // Get session
  const { data: session } = await supabase
    .from("whatsapp_sessions")
    .select("active_trip_id, last_active_at, pending_urls")
    .eq("phone_hash", phoneHash)
    .single();

  // No session at all — never connected
  if (!session) {
    await sendWhatsAppReply(
      from,
      "Hey! To get started, tap *Connect WhatsApp* on your trip page. I'll be ready to save links after that.",
    );
    return;
  }

  // Check session expiry
  const lastActive = new Date(session.last_active_at);
  const daysSince =
    (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSince > SESSION_EXPIRY_DAYS) {
    // Expire: clear active trip
    await supabase
      .from("whatsapp_sessions")
      .update({ active_trip_id: null })
      .eq("phone_hash", phoneHash);
    session.active_trip_id = null;
  }

  // No active trip — ask them to pick
  if (!session.active_trip_id) {
    const { data: links } = await supabase
      .from("whatsapp_links")
      .select("trip_id")
      .eq("phone_hash", phoneHash);

    if (!links || links.length === 0) {
      await sendWhatsAppReply(
        from,
        "You haven't connected any trips yet. Tap *Connect WhatsApp* on your trip page to get started.",
      );
      return;
    }

    // Get trip details
    const tripIds = links.map((l: { trip_id: string }) => l.trip_id);
    const { data: trips } = await supabase
      .from("trips")
      .select("id, name, emoji, start_date")
      .in("id", tripIds);

    if (!trips || trips.length === 0) {
      await sendWhatsAppReply(
        from,
        "Your connected trips seem to have been deleted. Connect a new one from the trip page.",
      );
      return;
    }

    // Store pending URLs so we don't lose them
    const urls = extractUrls(body);
    await supabase
      .from("whatsapp_sessions")
      .update({ pending_urls: urls.slice(0, MAX_URLS_PER_MESSAGE) })
      .eq("phone_hash", phoneHash);

    const list = trips
      .map(
        (t: { name: string; emoji: string; start_date: string | null }, i: number) => {
          const dateHint = t.start_date
            ? ` (${new Date(t.start_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
            : "";
          return `${i + 1}. ${t.name} ${t.emoji}${dateHint}`;
        },
      )
      .join("\n");

    await sendWhatsAppReply(
      from,
      `Which trip should I add this to?\n\n${list}\n\nReply with the number.`,
    );
    return;
  }

  // Happy path: active trip exists
  const { data: trip } = await supabase
    .from("trips")
    .select("id, name, emoji")
    .eq("id", session.active_trip_id)
    .single();

  if (!trip) {
    // Trip was deleted
    await supabase
      .from("whatsapp_sessions")
      .update({ active_trip_id: null })
      .eq("phone_hash", phoneHash);
    await sendWhatsAppReply(
      from,
      "That trip seems to have been deleted. Type a trip name to switch, or connect a new one from the trip page.",
    );
    return;
  }

  const urls = extractUrls(body).slice(0, MAX_URLS_PER_MESSAGE);
  const skipped = extractUrls(body).length - urls.length;

  await insertLinksAndReply(phoneHash, from, trip, urls, skipped);
}

async function handleSwitch(
  phoneHash: string,
  from: string,
  body: string,
): Promise<void> {
  const trimmed = body.trim();

  // Check if it's a number (replying to a disambiguation list)
  const num = parseInt(trimmed, 10);
  if (!isNaN(num) && num > 0) {
    await handleNumberReply(phoneHash, from, num);
    return;
  }

  // Search for trip by name among connected trips
  const { data: links } = await supabase
    .from("whatsapp_links")
    .select("trip_id")
    .eq("phone_hash", phoneHash);

  if (!links || links.length === 0) {
    await sendWhatsAppReply(
      from,
      "You haven't connected any trips yet. Tap *Connect WhatsApp* on your trip page to get started.",
    );
    return;
  }

  const tripIds = links.map((l: { trip_id: string }) => l.trip_id);
  const { data: trips } = await supabase
    .from("trips")
    .select("id, name, emoji, start_date")
    .in("id", tripIds)
    .ilike("name", `%${trimmed}%`);

  if (!trips || trips.length === 0) {
    await sendWhatsAppReply(
      from,
      `No trip found matching "${trimmed}". Connect from the trip page first, or try a different name.`,
    );
    return;
  }

  if (trips.length === 1) {
    const trip = trips[0];

    // Read pending URLs before upsert clears them
    const { data: session } = await supabase
      .from("whatsapp_sessions")
      .select("pending_urls")
      .eq("phone_hash", phoneHash)
      .single();

    const pendingUrls: string[] = session?.pending_urls || [];

    await supabase.from("whatsapp_sessions").upsert(
      {
        phone_hash: phoneHash,
        active_trip_id: trip.id,
        last_active_at: new Date().toISOString(),
        pending_urls: null,
      },
      { onConflict: "phone_hash" },
    );

    if (pendingUrls.length > 0) {
      await insertLinksAndReply(phoneHash, from, trip, pendingUrls, 0);
    } else {
      await sendWhatsAppReply(
        from,
        `✓ now adding to *${trip.name}* ${trip.emoji}`,
      );
    }
    return;
  }

  // Multiple matches — disambiguate
  const list = trips
    .map(
      (t: { name: string; emoji: string; start_date: string | null }, i: number) => {
        const dateHint = t.start_date
          ? ` (${new Date(t.start_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
          : "";
        return `${i + 1}. ${t.name} ${t.emoji}${dateHint}`;
      },
    )
    .join("\n");

  await sendWhatsAppReply(
    from,
    `Which one?\n\n${list}\n\nReply with the number.`,
  );
}

async function handleNumberReply(
  phoneHash: string,
  from: string,
  num: number,
): Promise<void> {
  // Get all connected trips for this phone to map the number
  const { data: links } = await supabase
    .from("whatsapp_links")
    .select("trip_id")
    .eq("phone_hash", phoneHash);

  if (!links || links.length === 0) {
    await sendWhatsAppReply(
      from,
      "I didn't find a link or a trip name. Forward me a link to save it, or type a trip name to switch.",
    );
    return;
  }

  const tripIds = links.map((l: { trip_id: string }) => l.trip_id);
  const { data: trips } = await supabase
    .from("trips")
    .select("id, name, emoji")
    .in("id", tripIds);

  if (!trips || num > trips.length) {
    await sendWhatsAppReply(
      from,
      "That number doesn't match any trip. Try again.",
    );
    return;
  }

  const trip = trips[num - 1];

  // Get pending URLs before overwriting session
  const { data: session } = await supabase
    .from("whatsapp_sessions")
    .select("pending_urls")
    .eq("phone_hash", phoneHash)
    .single();

  const pendingUrls: string[] = session?.pending_urls || [];

  // Set active trip, clear pending
  await supabase.from("whatsapp_sessions").upsert(
    {
      phone_hash: phoneHash,
      active_trip_id: trip.id,
      last_active_at: new Date().toISOString(),
      pending_urls: null,
    },
    { onConflict: "phone_hash" },
  );

  // If there were pending URLs, process them now
  if (pendingUrls.length > 0) {
    await insertLinksAndReply(phoneHash, from, trip, pendingUrls, 0);
  } else {
    await sendWhatsAppReply(
      from,
      `✓ now adding to *${trip.name}* ${trip.emoji}`,
    );
  }
}

// --- Shared: insert links into trip_items and reply ---

async function insertLinksAndReply(
  phoneHash: string,
  from: string,
  trip: { id: string; name: string; emoji: string },
  urls: string[],
  skipped: number,
): Promise<void> {
  // Look up display name: check if this phone has a stored name
  // For now, use "WhatsApp" — Step 4 will refine attribution
  const addedByName = "via WhatsApp";

  const items = urls.map((url, i) => {
    const { category, title } = categorizeDomain(url);
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + i,
      trip_id: trip.id,
      category,
      type: "link",
      title,
      url,
      content: null,
      file_data: null,
      file_name: null,
      added_by_name: addedByName,
      created_at: Date.now() + i,
      status: "considering",
      item_date: null,
    };
  });

  const { error } = await supabase.from("trip_items").insert(items);

  if (error) {
    console.error("Insert failed:", error);
    await sendWhatsAppReply(
      from,
      "Something went wrong saving that. Try again in a minute.",
    );
    return;
  }

  // Update session activity
  await supabase
    .from("whatsapp_sessions")
    .update({ last_active_at: new Date().toISOString(), pending_urls: null })
    .eq("phone_hash", phoneHash);

  // Build reply
  let reply: string;
  if (items.length === 1) {
    reply = `✓ added to ${categoryLabel(items[0].category)} in *${trip.name}* ${trip.emoji}`;
  } else {
    const summary: Record<string, number> = {};
    for (const item of items) {
      const label = CATEGORIES[item.category]?.name || item.category;
      summary[label] = (summary[label] || 0) + 1;
    }
    const details = Object.entries(summary)
      .map(([name, count]) => `${count} → ${name}`)
      .join(", ");
    reply = `✓ ${items.length} links added to *${trip.name}* ${trip.emoji}\n${details}`;
  }

  if (skipped > 0) {
    reply += `\n(${skipped} extra links skipped — max ${MAX_URLS_PER_MESSAGE} per message)`;
  }

  await sendWhatsAppReply(from, reply);
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

    console.log(`[whatsapp] MessageSid=${messageSid} From=${from} Body="${body.slice(0, 100)}"`);

    // Hash the phone number (strip "whatsapp:" prefix first)
    const rawPhone = from.replace("whatsapp:", "");
    const phoneHash = await hashPhone(rawPhone);

    // Classify intent and route
    const intent = classifyIntent(body);

    switch (intent.type) {
      case "connect":
        await handleConnect(phoneHash, from, intent.slug);
        break;
      case "link":
        await handleLink(phoneHash, from, body);
        break;
      case "switch":
        await handleSwitch(phoneHash, from, body);
        break;
    }

    // Return empty TwiML — Twilio expects XML but we reply via API instead
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      },
    );
  } catch (err) {
    console.error("[whatsapp] Unhandled error:", err);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200, // Still return 200 so Twilio doesn't retry
        headers: { "Content-Type": "text/xml" },
      },
    );
  }
});
