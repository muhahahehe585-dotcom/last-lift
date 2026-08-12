import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';

type EmailGateProps = {
  children: ReactNode;
};

export function EmailGate({ children }: EmailGateProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    setBusy(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });

    if (error) {
      setBusy(false);
      setMessage(error.message);
    }
  }

  if (!isSupabaseConfigured) return <SupabaseSetupMessage />;
  if (loading) return <main className="auth-screen">Loading...</main>;
  if (session) return <>{children}</>;

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <p className="eyebrow">Last Lift</p>
        <h1>Sign In</h1>
        <button className="oauth-button" type="button" onClick={signInWithGoogle} disabled={busy}>
          {busy ? 'Opening Google...' : 'Continue with Google'}
        </button>
        {message && <p className="auth-message">{message}</p>}
      </section>
    </main>
  );
}
