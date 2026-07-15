'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="font-mono text-xs uppercase tracking-widest text-ink/50">Taskframe</span>
          </div>
          <h1 className="block text-sm text-black mb-1">Sign in to your workspace</h1>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="text-sm text-signal-blocked bg-signal-blocked/10 rounded-md px-3 py-2">{error}</div>
          )}
          <div>
            <label className="block text-sm text-black mb-1">  <span className="mr-1" aria-hidden="true">📧</span>
  Email</label>
            
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-sm text-black mb-1"><span className="mr-1" aria-hidden="true">🔒</span>Password</label>
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-ink/60 mt-4">
          New here?{' '}
          <Link href="/register" className="text-accent font-medium">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
