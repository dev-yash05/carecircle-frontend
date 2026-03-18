"use client";

import Link from "next/link";
import { Activity, AlertTriangle, CheckCircle2, Heart, XCircle } from "lucide-react";
import { useDashboardStore } from "@/lib/stores/dashboardStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function timeAgo(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "just now";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  return `${hours}h ago`;
}

function iconForType(type: string) {
  if (type === "DOSE_MARKED")
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  if (type === "DOSE_MISSED")
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/15">
        <XCircle className="h-3.5 w-3.5 text-destructive" />
      </div>
    );
  if (type === "VITAL_RECORDED")
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15">
        <Heart className="h-3.5 w-3.5 text-primary" />
      </div>
    );
  if (type.includes("ANOMALY"))
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/15">
        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
      </div>
    );
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
      <Activity className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}

export function ActivityFeed() {
  const activity = useDashboardStore((state) => state.activity);

  return (
    <Card className="overflow-hidden">
      {/* Accent top strip */}
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base inline-flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/15">
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          Live activity
        </CardTitle>
        {activity.length > 0 ? (
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse-soft" />
        ) : null}
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-5 text-sm text-muted-foreground">
            <p>Activity will appear here in real time</p>
            <p className="mt-1 text-xs">Waiting for WebSocket events…</p>
          </div>
        ) : (
          <div className="max-h-80 space-y-2 overflow-auto pr-1">
            {activity.map((item, i) => {
              const isAnomaly = item.type.includes("ANOMALY");
              const href = item.patientId
                ? `/patients/${item.patientId}/${isAnomaly ? "vitals" : "doses"}`
                : "/patients";

              return (
                <Link
                  key={item.id}
                  href={href}
                  className={[
                    "block rounded-xl border p-3 transition-all duration-200 hover:bg-accent/50 hover:shadow-sm animate-fade-in",
                    isAnomaly ? "border-destructive/30 bg-destructive/5" : "border-border/60",
                  ].join(" ")}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {iconForType(item.type)}
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.patientName ?? "Unknown patient"}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {timeAgo(item.timestamp)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
