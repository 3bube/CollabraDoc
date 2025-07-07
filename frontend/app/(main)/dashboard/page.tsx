// app/dashboard/page.tsx
import { Suspense } from "react";
import { cookies } from "next/headers"; // if you need auth/session
import QuickStats from "@/components/dashboard/QuickStats";
import RecentDocuments from "@/components/dashboard/RecentDocuments";
import RightSidebar from "@/components/dashboard/RightSidebar"; // ⇠ needs hooks
import Header from "@/components/dashboard/Header"; // ⇠ needs hooks
import DashboardClient from "@/components/dashboard/DashboardClient"; // holds dialog state

import type { Document, User, Workspace } from "@/lib/data"; // types for API data

import { mockComments, mockDocuments, mockUsers } from "@/lib/data";

// Helper to hit your Python API
async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${process.env.BACKEND_URL}/${path}`, {
    // avoids ISR cache when you need fresh data
    cache: "no-store",
    // If you forward cookies / bearer token for auth, do it here
    headers: { cookie: cookies().toString() },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export default async function DashboardPage() {
  console.log(process.env.NEXT_PUBLIC_BACKEND_URL); // for debugging, ensure this is set
  // ▸ Fetch in parallel
  // const [documents, workspace] = await Promise.all([
  //   api<Document[]>("documents"),
  //   // api<User[]>('users'),
  //   api<Workspace>("workspace"),
  // ]);

  const recentDocs = mockDocuments.slice(0, 6) ?? [];
  const onlineUsers = mockUsers.filter((u) => u.status === "online") ?? 0;

  return (
    <DashboardClient>
      {/* ── HEADER (client for sidebar toggle etc.) ── */}
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* MAIN COLUMN */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick stats + Recent docs are pure display: keep server‑side */}
            <QuickStats
              documents={mockDocuments}
              users={mockUsers}
              onlineUsers={onlineUsers}
            />

            <RecentDocuments recentDocs={recentDocs} />
          </div>

          {/* RIGHT SIDEBAR (online users list + “New doc” button) */}
          <RightSidebar onlineUsers={onlineUsers} />
        </div>
      </div>
    </DashboardClient>
  );
}
