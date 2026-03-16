"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useMe } from "@/lib/hooks/useMe";
import { useAuthStore } from "@/lib/stores/authStore";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const meQuery = useMe();

  useEffect(() => {
    if (!meQuery.isLoading && user && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [meQuery.isLoading, router, user]);

  if (meQuery.isLoading || !user) return null;
  if (user.role !== "SUPER_ADMIN") return null;

  return <AppShell>{children}</AppShell>;
}
