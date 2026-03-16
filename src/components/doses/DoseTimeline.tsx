"use client";

import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { type DoseEvent, type DoseStatus, useDoses } from "@/lib/hooks/useDoses";
import { MarkDoseDialog } from "@/components/doses/MarkDoseDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatusFilter = DoseStatus | "all";

const FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Taken", value: "TAKEN" },
  { label: "Skipped", value: "SKIPPED" },
  { label: "Missed", value: "MISSED" },
];

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatGroupLabel(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const today = startOfDay(new Date());
  const day = startOfDay(date);
  const diffMs = today.getTime() - day.getTime();
  const diffDays = Math.round(diffMs / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function formatTime(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function rowClassName(status: DoseStatus) {
  if (status === "PENDING") return "border-warning/30 bg-warning/5";
  if (status === "MISSED") return "border-destructive/30 bg-destructive/5";
  return "border-border bg-card";
}

function badgeVariant(status: DoseStatus): "warning" | "success" | "destructive" | "secondary" {
  if (status === "PENDING") return "warning";
  if (status === "TAKEN") return "success";
  if (status === "MISSED") return "destructive";
  return "secondary";
}

function groupedDoses(content: DoseEvent[]) {
  const sorted = [...content].sort((a, b) => {
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });

  const map = new Map<string, DoseEvent[]>();
  sorted.forEach((dose) => {
    const key = formatGroupLabel(dose.scheduledAt);
    const list = map.get(key) ?? [];
    list.push(dose);
    map.set(key, list);
  });

  return Array.from(map.entries()).map(([label, doses]) => ({ label, doses }));
}

export function DoseTimeline({ patientId }: { patientId: string }) {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedDose, setSelectedDose] = useState<DoseEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const canMark = user?.role !== "VIEWER";

  const query = useDoses(
    patientId,
    page,
    statusFilter === "all" ? undefined : (statusFilter as DoseStatus),
  );

  const groups = useMemo(() => {
    return groupedDoses(query.data?.content ?? []);
  }, [query.data?.content]);

  const totalPages = Math.max(1, query.data?.totalPages ?? 1);

  function openMarkDialog(dose: DoseEvent) {
    setSelectedDose(dose);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = filter.value === statusFilter;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(0);
              }}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : null}

      {!query.isLoading && (query.data?.content.length ?? 0) === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No doses scheduled yet.</p>
          </CardContent>
        </Card>
      ) : null}

      {!query.isLoading && groups.length > 0 ? (
        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group.label} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h3>

              <div className="space-y-2">
                {group.doses.map((dose) => (
                  <Card key={dose.id} className={rowClassName(dose.status)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-sm font-semibold text-foreground">
                            {dose.medicationName}
                          </CardTitle>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatTime(dose.scheduledAt)} · {dose.dosage}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={badgeVariant(dose.status)}>{dose.status}</Badge>

                          {dose.status === "PENDING" && canMark ? (
                            <Button size="sm" onClick={() => openMarkDialog(dose)}>
                              Mark
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 text-sm text-muted-foreground">
                      {dose.status === "TAKEN" && dose.markedByName ? (
                        <p>
                          Given by {dose.markedByName}
                          {dose.markedAt ? ` · ${formatTime(dose.markedAt)}` : ""}
                        </p>
                      ) : null}

                      {dose.status === "SKIPPED" && dose.markedByName ? (
                        <p>Skipped by {dose.markedByName}</p>
                      ) : null}

                      {dose.notes ? <p className="mt-1 italic">{dose.notes}</p> : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between rounded-lg border p-3">
        <Button
          variant="outline"
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={page === 0 || query.isLoading}
        >
          Previous
        </Button>
        <p className="text-sm text-muted-foreground">
          Page {page + 1} of {totalPages}
        </p>
        <Button
          variant="outline"
          onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
          disabled={query.isLoading || page + 1 >= totalPages}
        >
          Next
        </Button>
      </div>

      <MarkDoseDialog
        patientId={patientId}
        dose={selectedDose}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
