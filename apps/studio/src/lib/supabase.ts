import { createSupabaseClient } from '@siteos/db';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env at the repo root.',
  );
}

/** One browser client for the Studio. Publishable key only; RLS authorizes every query. */
export const supabase = createSupabaseClient(url, key);
