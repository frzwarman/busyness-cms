import type { Session } from '@supabase/supabase-js';
import { redirect } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

/** Route guard: use in `beforeLoad`. */
export async function requireSession(): Promise<Session> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw redirect({ to: '/login' });
  return data.session;
}

export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return session;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.assign('/login');
}
