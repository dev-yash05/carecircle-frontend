"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCreatePatient, usePatients } from "@/lib/hooks/usePatients";
import { RoleGuard } from "@/components/layout/role-guard";
import { PatientCard } from "@/components/patients/PatientCard";
import { PatientForm } from "@/components/patients/PatientForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";

const PAGE_SIZE = 20;

export default function PatientsPage() {
  const user = useAuthStore((state) => state.user);
  const orgId = user?.organizationId ?? undefined;
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const patientsQuery = usePatients(orgId, page, PAGE_SIZE, search);
  const createPatient = useCreatePatient(orgId);

  const totalElements = patientsQuery.data?.totalElements ?? 0;
  const totalPages = Math.max(1, patientsQuery.data?.totalPages ?? 1);
  const patients = patientsQuery.data?.content ?? [];

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((patient) => patient.name.toLowerCase().includes(term));
  }, [patients, search]);

  async function handleCreate(values: any) {
    try {
      await createPatient.mutateAsync(values);
      setDialogOpen(false);
      toast.success("Patient created", { description: "The patient profile was added successfully." });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to create patient";
      toast.error("Create failed", { description: message });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Patients</h1>
          <p className="mt-1 text-sm text-muted-foreground">{totalElements} patients in this family.</p>
        </div>

        <RoleGuard allowed={["ADMIN", "SUPER_ADMIN"]}>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add patient</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Add a patient</DialogTitle>
                <DialogDescription>Capture the basics now, add medications and vitals in later sprints.</DialogDescription>
              </DialogHeader>
              <PatientForm mode="create" submitLabel="Create patient" onSubmit={handleCreate} />
            </DialogContent>
          </Dialog>
        </RoleGuard>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          placeholder="Search patients"
          className="pl-9"
        />
      </div>

      {patientsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : null}

      {!patientsQuery.isLoading && filteredPatients.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">No patients yet.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Add patient profiles to track medications, doses, vitals, and notes in one place.</p>
            <RoleGuard allowed={["ADMIN", "SUPER_ADMIN"]}>
              <Button onClick={() => setDialogOpen(true)}>Add your first patient</Button>
            </RoleGuard>
          </CardContent>
        </Card>
      ) : null}

      {!patientsQuery.isLoading && filteredPatients.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between rounded-2xl border border-border/90 bg-card p-3">
        <Button variant="outline" onClick={() => setPage((prev) => Math.max(0, prev - 1))} disabled={page === 0}>
          Previous
        </Button>
        <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
        <Button
          variant="outline"
          onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
          disabled={page + 1 >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
