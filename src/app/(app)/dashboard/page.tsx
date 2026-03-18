"use client";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AnomalyAlertBanner } from "@/components/dashboard/AnomalyAlertBanner";
import { PendingDosesWidget } from "@/components/dashboard/PendingDosesWidget";
import { useAuthStore } from "@/lib/stores/authStore";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Good {getTimeOfDay()}, {firstName} 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          Here&apos;s what&apos;s happening with your patients today.
        </p>
      </div>

      <AnomalyAlertBanner />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <PendingDosesWidget />
        </div>
        <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
