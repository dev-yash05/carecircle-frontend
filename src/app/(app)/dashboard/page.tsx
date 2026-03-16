"use client";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AnomalyAlertBanner } from "@/components/dashboard/AnomalyAlertBanner";
import { PendingDosesWidget } from "@/components/dashboard/PendingDosesWidget";
import { useAuthStore } from "@/lib/stores/authStore";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome back, {firstName}.</p>
      </div>

      <AnomalyAlertBanner />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PendingDosesWidget />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
