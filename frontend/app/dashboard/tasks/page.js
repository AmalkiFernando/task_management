'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import { useAuth } from '../../../lib/AuthContext';

const STATUSES = ['todo', 'in_progress', 'in_review', 'done'];

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [busyTaskId, setBusyTaskId] = useState(null);

  useEffect(() => {
    api
      .get('/tasks/my')
      .then((res) => setTasks(res.data.data))
      .catch(() => setError('Could not load your tasks.'));
  }, []);

  const updateStatus = async (taskId, status) => {
    setBusyTaskId(taskId);
    setError('');
    try {
      await api.put(`/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update task.');
    } finally {
      setBusyTaskId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">My tasks</h1>
      <p className="text-ink/50 text-sm mb-6">Everything assigned to you, across all projects.</p>

      {error && <p className="text-sm text-signal-blocked">{error}</p>}

      {tasks.length === 0 && !error && (
        <div className="card p-8 text-center text-ink/50 text-sm">No tasks assigned to you yet.</div>
      )}

      <div className="card divide-y divide-black/5">
        {tasks.map((t) => (
          <div key={t.id} className="flex flex-col gap-3 px-4 py-3 hover:bg-black/[.02] md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium">{t.title}</p>
              <p className="text-xs text-ink/40 font-mono">{t.project?.name}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {t.due_date && <span className="text-xs text-ink/40 font-mono">{t.due_date}</span>}
              <StatusBadge value={t.priority} />
              <StatusBadge value={t.status} />
              <Link href={`/dashboard/tasks/${t.id}`} className="btn-secondary text-xs">
                Open
              </Link>
              {(user?.role === 'admin' || user?.role === 'project_manager' || t.assigned_to === user?.id) && (
                <select
                  className="input py-1 text-xs min-w-32"
                  value={t.status}
                  disabled={busyTaskId === t.id}
                  onChange={(e) => updateStatus(t.id, e.target.value)}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
