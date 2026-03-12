import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfnsixdzixuixxdvmfdt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbnNpeGR6aXh1aXh4ZHZtZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODU0ODgsImV4cCI6MjA4ODY2MTQ4OH0.06ihTTN9eC5GMuIeLSHjL5UrhaW9MabJV2-IJl1I3Jw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Trip {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  slug: string;
  created_at: string;
  start_date: string | null;
  end_date: string | null;
}

export interface TripItem {
  id: string;
  trip_id: string;
  category: string;
  type: string;
  title: string;
  url: string | null;
  content: string | null;
  file_data: string | null;
  file_name: string | null;
  added_by_name: string;
  created_at: number;
  status: string;
  item_date: string | null;
}

export const CATEGORIES = [
  { id: 'stay', emoji: '🏠', name: 'Stay', subtitle: 'Airbnb, Vrbo & Hotels' },
  { id: 'transport', emoji: '🚀', name: 'Getting There', subtitle: 'Flights, Ferries & Transit' },
  { id: 'thingstodo', emoji: '🎯', name: 'Things to Do', subtitle: 'Activities, Sights & Adventures' },
  { id: 'food', emoji: '🍽', name: 'Eat & Drink', subtitle: 'Restaurants & Bars' },
] as const;

// Map legacy category IDs to new ones
export const normalizeCategoryId = (id: string): string => {
  if (id === 'activities' || id === 'explore') return 'thingstodo';
  return id;
};

export const EMOJI_OPTIONS = ['🏝', '🏔', '🌊', '🏕', '🎿', '🌴', '🗺', '✈️', '🚗', '🎉', '🏖', '🛶', '🎒', '🚂', '🍷'];

export const EMPTY_CATEGORY_LINES: Record<string, string[]> = {
  stay: [
    "done scrolling through endless airbnb listings? the good ones go here.",
    "that dreamy villa your friend found at 2am? save it before the chat buries it.",
    "hotels, vrbo, hostels, that one friend's cousin's guesthouse — all welcome.",
  ],
  transport: [
    "flights, ferries, and the 'who's driving?' conversation — sorted here.",
    "the booking confirmation someone sent last tuesday? yeah, put it here.",
    "trains, planes, and that one friend who insists on driving.",
  ],
  thingstodo: [
    "scuba, sunset hikes, or 'let's just wing it' — whatever your group's vibe is.",
    "that activity link someone dropped at 11pm? rescue it from the chat.",
    "museums and hammock people can coexist. add both.",
  ],
  food: [
    "the restaurant your foodie friend won't shut up about? immortalize it here.",
    "reservations, yelp links, and that tiktok ramen place — all of it.",
    "because 'where should we eat?' shouldn't take 45 minutes every night.",
  ],
};
