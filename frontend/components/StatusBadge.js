'use client';

const STATUS_STYLES = {
  todo: 'bg-black/5 text-ink/60',
  in_progress: 'bg-signal-progress/15 text-signal-progress',
  in_review: 'bg-accent/15 text-accent',
  done: 'bg-signal-done/15 text-signal-done',
  planning: 'bg-black/5 text-ink/60',
  active: 'bg-signal-progress/15 text-signal-progress',
  on_hold: 'bg-black/10 text-ink/50',
  completed: 'bg-signal-done/15 text-signal-done',
  cancelled: 'bg-signal-blocked/15 text-signal-blocked',
  low: 'bg-black/5 text-ink/50',
  medium: 'bg-accent/10 text-accent',
  high: 'bg-signal-progress/15 text-signal-progress',
  urgent: 'bg-signal-blocked/15 text-signal-blocked',
};

export default function StatusBadge({ value }) {
  const style = STATUS_STYLES[value] || 'bg-black/5 text-ink/60';
  return <span className={`badge ${style}`}>{String(value).replace('_', ' ')}</span>;
}
