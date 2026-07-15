'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

const LINKS = [
  { href: '/dashboard', label: 'Overview', roles: ['admin', 'project_manager', 'team_member'] },
  { href: '/dashboard/projects', label: 'Projects', roles: ['admin', 'project_manager', 'team_member'] },
  { href: '/dashboard/tasks', label: 'My Tasks', roles: ['project_manager', 'team_member'] },
  { href: '/dashboard/users', label: 'Users', roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-black/5 bg-slate-100 min-h-screen flex flex-col">      <div className="px-5 py-5 border-b border-black/5">
        <div className="inline-flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="font-mono text-xs uppercase tracking-widest text-ink/50">Taskframe</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {LINKS.filter((l) => l.roles.includes(user?.role)).map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
active ? 'bg-black text-white' : 'text-ink/70 hover:bg-black/5'              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-black/5">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="text-xs text-ink/50 font-mono uppercase tracking-wide mb-3">
          {user?.role?.replace('_', ' ')}
        </p>
        <button onClick={logout} className="btn-secondary w-full text-xs">
          Sign out
        </button>
      </div>
    </aside>
  );
}
