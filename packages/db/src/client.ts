import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';

export type Db = SupabaseClient<Database>;

/** Browser/edge client. Only ever receives the publishable key; RLS does the authorization. */
export function createSupabaseClient(url: string, publishableKey: string): Db {
  return createClient<Database>(url, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}
