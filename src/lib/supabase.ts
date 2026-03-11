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
}

export const CATEGORIES = [
  { id: 'stay', emoji: '🏠', name: 'Stay', subtitle: 'Vrbo & Accommodation' },
  { id: 'transport', emoji: '⛴', name: 'Getting There', subtitle: 'Ferry, Flights & Transit' },
  { id: 'activities', emoji: '🤿', name: 'Activities', subtitle: 'Scuba, Tours & Adventures' },
  { id: 'food', emoji: '🍽', name: 'Eat & Drink', subtitle: 'Restaurants & Bars' },
  { id: 'explore', emoji: '📍', name: 'Explore', subtitle: 'Things to See & Do' },
] as const;

export const EMOJI_OPTIONS = ['🏝', '🏔', '🌊', '🏕', '🎿', '🌴', '🗺', '✈️', '🚗', '🎉', '🏖', '🛶', '🎒', '🚂', '🍷'];
