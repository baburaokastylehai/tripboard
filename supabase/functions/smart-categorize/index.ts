const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const STAY_PATTERNS = /airbnb|vrbo|booking\.com|hotels\.com|expedia|hostelworld|agoda|trivago|marriott|hilton|hyatt|ihg|getaway|hipcamp|glamping/i;
const TRANSPORT_PATTERNS = /airlines|united\.com|delta\.com|southwest|jetblue|ryanair|kayak|skyscanner|google\.com\/flights|amtrak|ferry|flixbus|uber|lyft|rome2rio|waze|citymapper|transit/i;
const FOOD_PATTERNS = /yelp|opentable|resy|doordash|ubereats|grubhub|tripadvisor.*restaurant|eater\.com|infatuation|michelin|zagat|seamless|caviar/i;
const THINGSTODO_PATTERNS = /viator|getyourguide|klook|fareharbor|tripadvisor|alltrails|eventbrite|meetup|musement|tiqets|headout/i;

function categorizeUrl(url: string): { category: string; title: string } {
  let hostname = '';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    hostname = url.toLowerCase();
  }

  const title = hostname.split('.')[0];

  if (STAY_PATTERNS.test(hostname)) return { category: 'stay', title };
  if (TRANSPORT_PATTERNS.test(hostname)) return { category: 'transport', title };
  if (FOOD_PATTERNS.test(hostname)) return { category: 'food', title };
  if (THINGSTODO_PATTERNS.test(hostname)) return { category: 'thingstodo', title };

  return { category: 'thingstodo', title };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();

    if (!Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'urls array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = urls.map((url: string) => {
      const { category, title } = categorizeUrl(url);
      return { url, category, title, date: null };
    });

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to process' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
