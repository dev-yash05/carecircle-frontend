"use client"

import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

/**
 * AppShell wraps authenticated pages with a sidebar + topbar chrome.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
