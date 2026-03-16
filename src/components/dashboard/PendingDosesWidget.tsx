"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Pending doses</CardTitle>
          {pending.length > 0 ? <Badge variant="warning">{pending.length}</Badge> : null}
        </div>
        <Link href="/patients" className="text-xs text-primary hover:underline">
          All patients →
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        {dashboardQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : null}

        {dashboardQuery.isError ? (
          <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            Dashboard summary unavailable. <Link href="/patients" className="text-primary hover:underline">Browse patients</Link>
          </div>
        ) : null}

        {!dashboardQuery.isLoading && !dashboardQuery.isError && pending.length === 0 ? (
          <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            <p className="font-medium">All caught up ✓</p>
            <p className="mt-1">No pending doses right now</p>
          </div>
        ) : null}

        {!dashboardQuery.isLoading && !dashboardQuery.isError && pending.length > 0 ? (
          <div className="space-y-2">
            {pending.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{formatTime(item.scheduledAt)}</p>
                    <p className="text-sm font-medium text-foreground">{item.medicationName}</p>
                    <p className="text-xs text-muted-foreground">{item.dosage}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="warning">PENDING</Badge>
                    {canMark ? (
                      <Button size="sm" onClick={() => openMarkDialog(item)}>Mark</Button>
                    ) : null}
                    <Link
                      href={`/patients/${item.patientId}/doses`}
                      className="inline-flex items-center text-muted-foreground hover:text-foreground"
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
