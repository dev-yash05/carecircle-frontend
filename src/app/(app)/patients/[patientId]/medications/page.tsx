"use client";

import * as React from "react";
import { ApiError } from "@/lib/api/client";
import { useCreateMedication } from "@/lib/hooks/useMedications";
import type { MedicationFormInput } from "@/lib/schemas/medication.schema";
import { useAuthStore } from "@/lib/stores/authStore";
import { RoleGuard } from "@/components/layout/role-guard";
import { MedicationForm } from "@/components/medications/MedicationForm";
import { MedicationList } from "@/components/medications/MedicationList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";

export default function MedicationsPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = React.use(params);
  const { toast } = useToast();
  const role = useAuthStore((state) => state.user?.role);
  const createMutation = useCreateMedication(patientId);
  const [open, setOpen] = React.useState(false);

  const canCreate = role === "ADMIN" || role === "SUPER_ADMIN";

  async function handleSubmit(payload: MedicationFormInput) {
    try {
      await createMutation.mutateAsync(payload);
      toast.success("Medication schedule added", {
        description: "Dose events will generate 24 hours ahead.",
      });
      setOpen(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to add medication";
      toast.error("Create failed", { description: message });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Medication schedules</h2>
          <p className="text-sm text-muted-foreground">Manage active medication plans for this patient.</p>
        </div>

        {canCreate ? (
          <RoleGuard allowed={["ADMIN", "SUPER_ADMIN"]} fallback={<></>}>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Add medication</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Add medication schedule</DialogTitle>
                  <DialogDescription>
                    Add name, dose and CRON schedule for this patient.
                  </DialogDescription>
                </DialogHeader>
                <MedicationForm onSubmit={handleSubmit} />
              </DialogContent>
            </Dialog>
          </RoleGuard>
        ) : null}
      </div>

      <MedicationList patientId={patientId} />
    </div>
  );
}
