import { Navigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

/** Email + password sign-in, or a magic link. No self-registration: accounts are created by an owner. */
export function LoginPage() {
  const session = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (session) return <Navigate to="/" />;

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error)
      setError(
        error.message === 'Invalid login credentials'
          ? 'That email and password do not match.'
          : error.message,
      );
  };

  const magicLink = async () => {
    if (!email) return setError('Enter your email first.');
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setNotice(`We sent a sign-in link to ${email}. It expires in a few minutes.`);
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-muted/40 p-6">
      <form
        onSubmit={signIn}
        className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-foreground text-xs font-bold text-background">
            S
          </span>
          <h1 className="text-lg font-semibold tracking-tight">Sign in to SiteOS</h1>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-sm text-muted-foreground">
              {notice}
            </p>
          )}
          <Button type="submit" disabled={busy || !email || !password}>
            {busy && <Loader2 className="animate-spin" />} Sign in
          </Button>
          <Button type="button" variant="ghost" disabled={busy || !email} onClick={magicLink}>
            Email me a sign-in link
          </Button>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Accounts are created by a site owner. No public sign-up.
        </p>
      </form>
    </main>
  );
}
