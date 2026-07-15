'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/AuthContext';
import StatusBadge from '../../../components/StatusBadge';

function NewProjectModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const handleStartDateChange = (value) => {
    setForm((current) => ({
      ...current,
      start_date: value,
      end_date: current.end_date && value && current.end_date < value ? '' : current.end_date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/projects', form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create project.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50 px-4">
      <div className="card w-full max-w-md p-6">
        <h2 className="font-display text-lg font-semibold mb-4">New project</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-signal-blocked">{error}</p>}
          <input
            required
            placeholder="Project name"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            placeholder="Description"
            rows={3}
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink/50 mb-1">Start date</label>
              <input
                type="date"
                className="input"
                min={today}
                value={form.start_date}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-ink/50 mb-1">End date</label>
              <input
                type="date"
                className="input"
                min={form.start_date || undefined}
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    api
      .get('/projects')
      .then((res) => setProjects(res.data.data))
      .catch(() => setError('Could not load projects.'));
  };

  useEffect(load, []);

  const canCreate = user?.role === 'admin' || user?.role === 'project_manager';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Projects</h1>
          <p className="text-ink/50 text-sm">
            {user?.role === 'team_member' ? 'Projects you are a member of.' : 'All projects you manage or oversee.'}
          </p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + New project
          </button>
        )}
      </div>

      {error && <p className="text-sm text-signal-blocked mb-4">{error}</p>}

      {projects.length === 0 && !error && (
        <div className="card p-8 text-center text-ink/50 text-sm">
          No projects yet. {canCreate ? 'Create your first one to get started.' : 'Ask a project manager to add you to one.'}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/projects/${p.id}`}
            className="card p-5 hover:shadow-md transition block"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-display font-semibold text-lg">{p.name}</h3>
              <StatusBadge value={p.status} />
            </div>
            <p className="text-sm text-ink/60 line-clamp-2 mb-3">{p.description || 'No description provided.'}</p>
            <div className="flex items-center justify-between text-xs text-ink/40 font-mono">
              <span>{p.members?.length || 0} members</span>
              <span>PM: {p.creator?.name}</span>
            </div>
          </Link>
        ))}
      </div>

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onSaved={load} />}
    </div>
  );
}
