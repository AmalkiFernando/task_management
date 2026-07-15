'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account.');
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
          <h1 className="font-display text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-ink/50 mt-1">New accounts start as team members. An admin can change your role.</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="text-sm text-signal-blocked bg-signal-blocked/10 rounded-md px-3 py-2">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input name="name" required className="input" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" required className="input" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="input"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-ink/60 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-accent font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
