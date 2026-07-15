'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

function StatCard({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-mono uppercase tracking-wide text-ink/40 mb-2">{label}</p>
      <p className="font-display text-3xl font-semibold">{value ?? '—'}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setStats(res.data.data))
      .catch(() => setError('Could not load dashboard stats.'));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">
        Welcome back, {user?.name?.split(' ')[0]}
      </h1>
      <p className="text-ink/50 mb-8 text-sm">Here&apos;s what&apos;s happening across your workspace.</p>

      {error && <p className="text-sm text-signal-blocked">{error}</p>}

      {stats && user?.role === 'admin' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Users" value={stats.userCount} />
          <StatCard label="Projects" value={stats.projectCount} />
          <StatCard label="Tasks" value={stats.taskCount} />
          <StatCard label="Recent events" value={stats.recentActivity?.length} />
        </div>
      )}

      {stats && user?.role === 'project_manager' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="My Projects" value={stats.projectCount} />
          <StatCard label="Total Tasks" value={stats.taskCount} />
          <StatCard label="Overdue Tasks" value={stats.overdueTasks} />
        </div>
      )}

      {stats && user?.role === 'team_member' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="My Tasks" value={stats.myTaskCount} />
          <StatCard label="Overdue" value={stats.overdueTasks} />
          <StatCard label="Projects" value={stats.projectCount} />
        </div>
      )}

      {stats?.recentActivity && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold mb-3">Recent activity</h2>
          <div className="card divide-y divide-black/5">
            {stats.recentActivity.map((a) => (
              <div key={a.id} className="px-4 py-3 text-sm flex justify-between">
                <span>
                  <span className="font-medium">{a.user?.name || 'Someone'}</span>{' '}
                  {a.action.replace(/_/g, ' ')}
                  <span className="text-ink/40"> · {a.entity_type}</span>
                </span>
                <span className="text-ink/40 font-mono text-xs">
                  {formatDate(a.createdAt || a.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
