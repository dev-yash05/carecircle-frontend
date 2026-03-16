"use client";

import { CalendarDays, Pill, Trash2 } from "lucide-react";
import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { useDeactivateMedication, useMedications } from "@/lib/hooks/useMedications";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";
import { MedicationBadge } from "@/components/medications/MedicationBadge";

function formatDate(dateText: string) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function MedicationList({ patientId }: { patientId: string }) {
  const { toast } = useToast();
  const query = useMedications(patientId);
  const deactivateMutation = useDeactivateMedication(patientId);
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === "ADMIN" || role === "SUPER_ADMIN";

  const [target, setTarget] = useState<{ id: string; name: string } | null>(null);

  async function confirmDeactivate() {
    if (!target) return;

    try {
      await deactivateMutation.mutateAsync(target.id);
      toast.success("Medication removed");
      setTarget(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to remove medication";
      toast.error("Remove failed", { description: message });
    }
  }

  return (
    <div className="space-y-3">
      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : null}

      {!query.isLoading && (query.data?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Pill className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No active medications</p>
        </div>
      ) : null}

      {!query.isLoading && (query.data?.length ?? 0) > 0 ? (
        <div className="space-y-3">
          {(query.data ?? []).map((item) => (
            <div key={item.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Pill className="h-4 w-4" />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.dosage}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <MedicationBadge cronExpression={item.cronExpression} />
                      <span className="text-xs text-muted-foreground">{item.timezone}</span>
                    </div>

                    <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Starts {formatDate(item.startDate)}
                      {item.endDate ? ` • Ends ${formatDate(item.endDate)}` : ""}
                    </p>

                    {item.instructions ? (
                      <p className="text-sm italic text-muted-foreground">{item.instructions}</p>
                    ) : null}
                  </div>
                </div>

                {canManage ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove medication"
                    onClick={() => setTarget({ id: item.id, name: item.name })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <Dialog open={Boolean(target)} onOpenChange={(open) => (!open ? setTarget(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove medication?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{target?.name}</span>
              {" "}will be deactivated. Existing dose history is preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeactivate} disabled={deactivateMutation.isPending}>
              {deactivateMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
