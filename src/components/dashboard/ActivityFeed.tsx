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
  if (type === "DOSE_MARKED") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (type === "DOSE_MISSED") return <XCircle className="h-4 w-4 text-destructive" />;
  if (type === "VITAL_RECORDED") return <Heart className="h-4 w-4 text-primary" />;
  if (type.includes("ANOMALY")) return <AlertTriangle className="h-4 w-4 text-destructive" />;
  return <Activity className="h-4 w-4 text-muted-foreground" />;
}

export function ActivityFeed() {
  const activity = useDashboardStore((state) => state.activity);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base inline-flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Live activity
        </CardTitle>
        {activity.length > 0 ? <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" /> : null}
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            <p>Activity will appear here in real time</p>
            <p className="mt-1 text-xs">Waiting for WebSocket events…</p>
          </div>
        ) : (
          <div className="max-h-80 space-y-2 overflow-auto pr-1">
            {activity.map((item) => {
              const isAnomaly = item.type.includes("ANOMALY");
              const href = item.patientId
                ? `/patients/${item.patientId}/${isAnomaly ? "vitals" : "doses"}`
                : "/patients";

              return (
                <Link
                  key={item.id}
                  href={href}
                  className={[
                    "block rounded-lg border p-3 transition-colors hover:bg-accent",
                    isAnomaly ? "border-destructive/30 bg-destructive/5" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      {iconForType(item.type)}
                      <div>
                        <p className="text-sm text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.patientName ?? "Unknown patient"}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{timeAgo(item.timestamp)}</span>
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
