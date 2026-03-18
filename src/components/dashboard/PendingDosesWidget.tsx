"use client";

import Link from "next/link";
import { ChevronRight, Pill } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/lib/api/dashboard";
import type { DoseEvent } from "@/lib/hooks/useDoses";
import { useAuthStore } from "@/lib/stores/authStore";
import { MarkDoseDialog } from "@/components/doses/MarkDoseDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PendingDosesWidget() {
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);
  const role = useAuthStore((state) => state.user?.role);
  const [selected, setSelected] = useState<(DoseEvent & { patientId: string }) | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const canMark = role === "ADMIN" || role === "CAREGIVER" || role === "SUPER_ADMIN";

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", orgId],
    queryFn: () => getDashboardSummary(orgId as string),
    enabled: Boolean(orgId),
    staleTime: 60_000,
    retry: false,
  });

  const pending = (dashboardQuery.data?.pendingDoses ?? [])
    .filter((item) => item.status === "PENDING")
    .slice(0, 5);

  function openMarkDialog(item: (typeof pending)[number]) {
    setSelected({
      id: item.id,
      medicationName: item.medicationName,
      dosage: item.dosage,
      scheduledAt: item.scheduledAt,
      status: item.status,
      patientId: item.patientId,
    });
    setDialogOpen(true);
  }

  return (
    <Card className="overflow-hidden">
      {/* Accent top strip */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/15">
            <Pill className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-base">Pending doses</CardTitle>
          {pending.length > 0 ? <Badge variant="warning">{pending.length}</Badge> : null}
        </div>
        <Link href="/patients" className="text-xs font-medium text-primary hover:underline transition-colors">
          All patients →
        </Link>
      </CardHeader>

      <CardContent className="space-y-2">
        {dashboardQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : null}

        {dashboardQuery.isError ? (
          <div className="rounded-xl border border-dashed border-border/60 p-5 text-sm text-muted-foreground">
            Dashboard summary unavailable.{" "}
            <Link href="/patients" className="text-primary hover:underline">
              Browse patients
            </Link>
          </div>
        ) : null}

        {!dashboardQuery.isLoading && !dashboardQuery.isError && pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-5 text-sm dark:border-emerald-500/20 dark:bg-emerald-500/5">
            <p className="font-medium text-emerald-700 dark:text-emerald-400">All caught up ✓</p>
            <p className="mt-1 text-muted-foreground">No pending doses right now</p>
          </div>
        ) : null}

        {!dashboardQuery.isLoading && !dashboardQuery.isError && pending.length > 0 ? (
          <div className="space-y-2">
            {pending.map((item, i) => (
              <div
                key={item.id}
                className="rounded-xl border border-border/60 p-3 transition-all duration-200 hover:bg-accent/50 hover:shadow-sm animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground tabular-nums">
                      {formatTime(item.scheduledAt)}
                    </p>
                    <p className="text-sm font-semibold text-foreground">{item.medicationName}</p>
                    <p className="text-xs text-muted-foreground">{item.dosage}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="warning">PENDING</Badge>
                    {canMark ? (
                      <Button size="sm" onClick={() => openMarkDialog(item)} className="rounded-xl">
                        Mark
                      </Button>
                    ) : null}
                    <Link
                      href={`/patients/${item.patientId}/doses`}
                      className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Open patient doses"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>

      <MarkDoseDialog
        patientId={selected?.patientId ?? ""}
        dose={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}
