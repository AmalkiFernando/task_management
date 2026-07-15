'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../lib/api';
import { useAuth } from '../../../../lib/AuthContext';
import StatusBadge from '../../../../components/StatusBadge';

const STATUSES = ['todo', 'in_progress', 'in_review', 'done'];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api
      .get(`/tasks/${id}`)
      .then((res) => setTask(res.data.data))
      .catch(() => setError('Could not load task.'));
    api
      .get(`/tasks/${id}/comments`)
      .then((res) => setComments(res.data.data))
      .catch(() => {});
  }, [id]);

  useEffect(load, [load]);

  const canEditFully = user?.role === 'admin' || user?.role === 'project_manager';
  const isAssignee = task?.assigned_to === user?.id;

  const updateStatus = async (status) => {
    await api.put(`/tasks/${id}`, { status });
    load();
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await api.post(`/tasks/${id}/comments`, { body: newComment });
    setNewComment('');
    load();
  };

  if (error) return <p className="text-sm text-signal-blocked">{error}</p>;
  if (!task) return <p className="text-sm text-ink/40 font-mono">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <Link href={`/dashboard/projects/${task.project_id}`} className="text-xs text-accent font-mono">
        ← {task.project?.name}
      </Link>

      <div className="flex items-start justify-between mt-3 mb-4">
        <h1 className="font-display text-2xl font-semibold">{task.title}</h1>
        <StatusBadge value={task.priority} />
      </div>

      <p className="text-ink/70 text-sm mb-6 whitespace-pre-wrap">{task.description || 'No description.'}</p>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <p className="text-xs font-mono uppercase text-ink/40 mb-1">Assignee</p>
          <p>{task.assignee?.name || 'Unassigned'}</p>
        </div>
        <div>
          <p className="text-xs font-mono uppercase text-ink/40 mb-1">Due date</p>
          <p>{task.due_date || '—'}</p>
        </div>
        <div>
          <p className="text-xs font-mono uppercase text-ink/40 mb-1">Created by</p>
          <p>{task.creator?.name}</p>
        </div>
        <div>
          <p className="text-xs font-mono uppercase text-ink/40 mb-1">Status</p>
          {(isAssignee || canEditFully) ? (
            <select className="input py-1" value={task.status} onChange={(e) => updateStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          ) : (
            <StatusBadge value={task.status} />
          )}
        </div>
      </div>

      <h2 className="font-display font-semibold mb-3">Comments</h2>
      <div className="space-y-3 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="card p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{c.author?.name}</span>
              <span className="text-xs text-ink/40 font-mono">{formatDate(c.createdAt || c.created_at)}</span>
            </div>
            <p className="text-sm text-ink/70">{c.body}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-ink/40">No comments yet.</p>}
      </div>

      <form onSubmit={submitComment} className="flex gap-2">
        <input
          className="input"
          placeholder="Add a comment…"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" className="btn-primary shrink-0">
          Post
        </button>
      </form>
    </div>
  );
}
