'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../lib/api';
import { useAuth } from '../../../../lib/AuthContext';
import StatusBadge from '../../../../components/StatusBadge';

const COLUMNS = [
  { key: 'todo', label: 'To do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'in_review', label: 'In review' },
  { key: 'done', label: 'Done' },
];

function AddMemberModal({ projectId, onClose, onSaved }) {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [professionalRole, setProfessionalRole] = useState('other');
  const [error, setError] = useState('');

  const PROFESSIONAL_ROLES = [
    { value: 'designer', label: 'Designer' },
    { value: 'frontend_developer', label: 'Frontend Developer' },
    { value: 'backend_developer', label: 'Backend Developer' },
    { value: 'qa_engineer', label: 'QA Engineer' },
    { value: 'devops_engineer', label: 'DevOps Engineer' },
    { value: 'data_analyst', label: 'Data Analyst' },
    { value: 'product_manager', label: 'Product Manager' },
    { value: 'business_analyst', label: 'Business Analyst' },
    { value: 'content_writer', label: 'Content Writer' },
    { value: 'marketing_specialist', label: 'Marketing Specialist' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    api.get('/users').then((res) => setUsers(res.data.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${projectId}/members`, {
        user_id: Number(userId),
        professional_role: professionalRole,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add member.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50 px-4">
      <div className="card w-full max-w-sm p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Add team member</h2>
        <form onSubmit={submit} className="space-y-3">
          {error && <p className="text-sm text-signal-blocked">{error}</p>}
          <select required className="input" value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">Select a user…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
          <select className="input" value={professionalRole} onChange={(e) => setProfessionalRole(e.target.value)}>
            <option value="">Select role…</option>
            {PROFESSIONAL_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewTaskModal({ projectId, projectStartDate, members, onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post(`/projects/${projectId}/tasks`, {
        ...form,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create task.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50 px-4">
      <div className="card w-full max-w-md p-6">
        <h2 className="font-display text-lg font-semibold mb-4">New task</h2>
        <form onSubmit={submit} className="space-y-3">
          {error && <p className="text-sm text-signal-blocked">{error}</p>}
          <input
            required
            placeholder="Task title"
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            rows={3}
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {['low', 'medium', 'high', 'urgent'].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="input"
              min={projectStartDate || undefined}
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>
          <select
            className="input"
            value={form.assigned_to}
            onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Creating…' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({ name: project.name, description: project.description, status: project.status });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.put(`/projects/${project.id}`, form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update project.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50 px-4">
      <div className="card w-full max-w-md p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Edit project</h2>
        <form onSubmit={submit} className="space-y-3">
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
            className="input min-h-24"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            className="input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);

  const canManage = user?.role === 'admin' || project?.creator?.id === user?.id;
  const canCreateTasks =
    user?.role === 'admin' ||
    (project &&
      user &&
      user.role === 'project_manager' &&
      (project.creator?.id === user.id || project.members?.some((member) => member.id === user.id)));

  const load = useCallback(() => {
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data.data))
      .catch(() => setError('Could not load project.'));
    api
      .get(`/projects/${id}/tasks`)
      .then((res) => setTasks(res.data.data))
      .catch(() => {});
  }, [id]);

  useEffect(load, [load]);

  const moveTask = async (taskId, status) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    try {
      await api.put(`/tasks/${taskId}`, { status });
    } catch {
      load(); // revert on failure
    }
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member from the project?')) return;
    await api.delete(`/projects/${id}/members/${userId}`);
    load();
  };

  const deleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      router.push('/dashboard/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete project.');
    }
  };

  if (error) return <p className="text-sm text-signal-blocked">{error}</p>;
  if (!project) return <p className="text-sm text-ink/40 font-mono">Loading…</p>;

  return (
    <div>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="font-display text-2xl font-semibold">{project.name}</h1>
          <p className="text-ink/50 text-sm mt-1 max-w-xl">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge value={project.status} />
          {canManage && (
            <>
              <button
                className="btn-secondary text-xs"
                onClick={() => setShowEditProject(true)}
              >
                Edit
              </button>
              <button
                className="btn-secondary text-xs text-signal-blocked"
                onClick={() => deleteProject()}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 text-xs text-ink/40 font-mono my-4">
        <span>PM: {project.creator?.name}</span>
        {project.start_date && <span>Start: {project.start_date}</span>}
        {project.end_date && <span>Due: {project.end_date}</span>}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold">Team ({project.members?.length || 0})</h2>
        {canManage && (
          <button className="btn-secondary text-xs" onClick={() => setShowAddMember(true)}>
            + Add member
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {project.members?.map((m) => {
          const roleLabel = m.professional_role
            ? m.professional_role
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
            : 'Other';
          return (
            <span key={m.id} className="badge bg-black/5 text-ink/70 gap-1 flex items-center">
              <div>
                <div className="text-sm">{m.name}</div>
                <div className="text-xs text-ink/50">{roleLabel}</div>
              </div>
              {canManage && (
                <button onClick={() => removeMember(m.id)} className="text-signal-blocked ml-1">
                  ×
                </button>
              )}
            </span>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold">Tasks</h2>
        {canCreateTasks && (
          <button className="btn-primary text-xs" onClick={() => setShowNewTask(true)}>
            + New task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.key} className="bg-black/[.02] rounded-card p-3 min-h-[200px]">
            <p className="text-xs font-mono uppercase tracking-wide text-ink/40 mb-3">
              {col.label} · {tasks.filter((t) => t.status === col.key).length}
            </p>
            <div className="space-y-2">
              {tasks
                .filter((t) => t.status === col.key)
                .map((t) => (
                  <Link
                    key={t.id}
                    href={`/dashboard/tasks/${t.id}`}
                    className="card p-3 block hover:shadow-md transition"
                  >
                    <p className="text-sm font-medium mb-2">{t.title}</p>
                    <div className="flex items-center justify-between">
                      <StatusBadge value={t.priority} />
                      {t.assignee && <span className="text-xs text-ink/40">{t.assignee.name}</span>}
                    </div>
                    {(t.assigned_to === user?.id || canManage) && (
                      <select
                        className="input mt-2 py-1 text-xs"
                        value={t.status}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onChange={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          moveTask(t.id, e.target.value);
                        }}
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>

      {showAddMember && (
        <AddMemberModal projectId={id} onClose={() => setShowAddMember(false)} onSaved={load} />
      )}
      {showNewTask && (
        <NewTaskModal
          projectId={id}
          projectStartDate={project.start_date}
          members={project.members || []}
          onClose={() => setShowNewTask(false)}
          onSaved={load}
        />
      )}
      {showEditProject && project && (
        <EditProjectModal project={project} onClose={() => setShowEditProject(false)} onSaved={load} />
      )}
    </div>
  );
}
