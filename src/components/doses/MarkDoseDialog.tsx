"use client";

import { CheckCircle2, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  type DoseEvent,
  type MarkDosePayload,
  useMarkDose,
} from "@/lib/hooks/useDoses";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toaster";

type Action = "TAKEN" | "SKIPPED";

interface MarkDoseDialogProps {
  patientId: string;
  dose: DoseEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatScheduledAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Scheduled time unavailable";
  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
  const timePart = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Scheduled ${datePart} at ${timePart}`;
}

export function MarkDoseDialog({
  patientId,
  dose,
  open,
  onOpenChange,
}: MarkDoseDialogProps) {
  const [action, setAction] = useState<Action>("TAKEN");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const markDose = useMarkDose(patientId);

  const title = useMemo(() => {
    if (!dose) return "Mark dose";
    return `Mark ${dose.medicationName}`;
  }, [dose]);

  const description = useMemo(() => {
    if (!dose) return "";
    return `${dose.dosage} · ${formatScheduledAt(dose.scheduledAt)}`;
  }, [dose]);

  const notesPlaceholder =
    action === "TAKEN"
      ? "Optional note, for example patient took dose after breakfast"
      : "Optional note, for example skipped due to nausea";

  function resetDialogState() {
    setAction("TAKEN");
    setNotes("");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetDialogState();
    }
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    if (!dose) return;

    const payload: MarkDosePayload = {
      status: action,
      notes: notes.trim() || undefined,
    };

    try {
      await markDose.mutateAsync({ doseEventId: dose.id, payload });
      if (action === "TAKEN") {
        toast.success("Dose marked as taken");
      } else {
        toast.warning("Dose marked as skipped");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.warning("Already marked by someone else");
      } else {
        toast.error("Failed to mark dose");
      }
    } finally {
      handleOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Select action
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setAction("TAKEN")}
              className={[
                "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                action === "TAKEN"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
              ].join(" ")}
            >
              <CheckCircle2
                className={[
                  "h-5 w-5",
                  action === "TAKEN" ? "text-primary" : "text-muted-foreground",
                ].join(" ")}
              />
              <div>
                <p className="text-sm font-semibold text-foreground">Taken</p>
                <p className="text-xs text-muted-foreground">Dose was administered</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAction("SKIPPED")}
              className={[
                "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                action === "SKIPPED"
                  ? "border-warning bg-warning/10"
                  : "border-border hover:border-warning/40",
              ].join(" ")}
            >
              <Clock3
                className={[
                  "h-5 w-5",
                  action === "SKIPPED" ? "text-warning" : "text-muted-foreground",
                ].join(" ")}
              />
              <div>
                <p className="text-sm font-semibold text-foreground">Skipped</p>
                <p className="text-xs text-muted-foreground">Dose could not be given</p>
              </div>
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Notes
            </p>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={notesPlaceholder}
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={action === "SKIPPED" ? "bg-warning text-warning-foreground hover:bg-warning/90" : undefined}
          >
            {action === "TAKEN" ? "Confirm taken" : "Confirm skipped"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
