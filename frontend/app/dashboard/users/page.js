'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

const ROLES = ['admin', 'project_manager', 'team_member'];

function UserFormModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'team_member' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/users', form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create user.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50 px-4">
      <div className="card w-full max-w-sm p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Add user</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-signal-blocked">{error}</p>}
          <input
            required
            placeholder="Full name"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="Temporary password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            className="input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace('_', ' ')}
              </option>
            ))}
          </select>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Saving…' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UsersPageInner() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    api
      .get('/users')
      .then((res) => setUsers(res.data.data))
      .catch(() => setError('Could not load users.'));
  };

  useEffect(load, []);

  const updateRole = async (id, role) => {
    await api.put(`/users/${id}`, { role });
    load();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/users/${id}`, { status });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    await api.delete(`/users/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Users</h1>
          <p className="text-ink/50 text-sm">Manage accounts, roles, and access.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add user
        </button>
      </div>

      {error && <p className="text-sm text-signal-blocked mb-4">{error}</p>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/[.02] text-ink/50 text-xs uppercase font-mono">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-ink/60">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="input py-1 text-xs"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => updateStatus(u.id, u.status === 'active' ? 'suspended' : 'active')}
                    className={`badge ${
                      u.status === 'active' ? 'bg-signal-done/15 text-signal-done' : 'bg-signal-blocked/15 text-signal-blocked'
                    }`}
                  >
                    {u.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(u.id)} className="text-signal-blocked text-xs font-medium">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <UserFormModal onClose={() => setShowModal(false)} onSaved={load} />}
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute allowRoles={['admin']}>
      <UsersPageInner />
    </ProtectedRoute>
  );
}
