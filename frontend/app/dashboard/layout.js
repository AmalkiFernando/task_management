'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 max-w-6xl">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
