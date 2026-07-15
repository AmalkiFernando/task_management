'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

export default function ProtectedRoute({ children, allowRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (allowRoles && !allowRoles.includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [user, loading, allowRoles, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-ink/50">Checking access…</p>
      </div>
    );
  }

  if (allowRoles && !allowRoles.includes(user.role)) return null;

  return children;
}
