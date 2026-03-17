"use client"

import { AppShell } from "@/components/layout/app-shell"
import { WebSocketProvider } from "@/components/providers/WebSocketProvider"
import { useMe } from "@/lib/hooks/useMe"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useMe()

  return (
    <>
      <WebSocketProvider />
      <AppShell>{children}</AppShell>
    </>
  );
}
