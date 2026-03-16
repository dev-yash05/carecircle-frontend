"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuditLog } from "@/lib/hooks/useAuditLog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actionLabel(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function actionClass(action: string) {
  if (action === "DOSE_MARKED" || action === "VITAL_RECORDED") return "text-primary";
  if (action === "DOSE_MISSED" || action.includes("ANOMALY")) return "text-destructive";
  return "text-muted-foreground";
}

function truncateId(value: string | undefined) {
  if (!value) return "-";
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function AuditLogTable({ patientId }: { patientId: string }) {
  const [page, setPage] = useState(0);
  const query = useAuditLog(patientId, page, 20);

  const totalPages = Math.max(1, query.data?.totalPages ?? 1);
  const totalEvents = query.data?.totalElements ?? 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{totalEvents} total events</p>

      <div className="rounded-xl border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Actor</th>
                <th className="hidden px-4 py-3 md:table-cell">Resource</th>
                <th className="hidden px-4 py-3 lg:table-cell">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.isLoading
                ? Array.from({ length: 8 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td colSpan={5} className="px-4 py-2"><Skeleton className="h-8 w-full" /></td>
                    </tr>
                  ))
                : null}

              {!query.isLoading && (query.data?.content.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">No audit events yet</p>
                  </td>
                </tr>
              ) : null}

              {!query.isLoading
                ? (query.data?.content ?? []).map((event) => (
                    <tr key={event.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatTime(event.createdAt)}</td>
                      <td className={cn("whitespace-nowrap px-4 py-3 font-medium", actionClass(event.action))}>
                        {actionLabel(event.action)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{event.actorName ?? "System"}</p>
                        <p className="text-xs text-muted-foreground">{event.actorEmail || "-"}</p>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <p className="font-mono text-xs text-muted-foreground">{event.resourceType || "-"}</p>
                        <p className="text-xs text-muted-foreground">{truncateId(event.resourceId)}</p>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell text-muted-foreground">{event.ipAddress || "-"}</td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <Button variant="outline" onClick={() => setPage((prev) => Math.max(0, prev - 1))} disabled={page === 0 || query.isFetching}>
          Previous
        </Button>
        <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
        <Button
          variant="outline"
          onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
          disabled={query.isFetching || page + 1 >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
