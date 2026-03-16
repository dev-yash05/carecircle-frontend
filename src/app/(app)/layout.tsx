"use client"

import { AppShell } from "@/components/layout/app-shell"
import { useMe } from "@/lib/hooks/useMe"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useMe()

  return <AppShell>{children}</AppShell>;
}
