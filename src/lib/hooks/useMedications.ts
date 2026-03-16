import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMedication,
  deactivateMedication,
  getMedications,
  type Medication,
} from "@/lib/api/medications";
import type { MedicationCreateInput } from "@/lib/schemas/medication.schema";
import { useAuthStore } from "@/lib/stores/authStore";

const medicationKeys = {
  all: ["medications"] as const,
  list: (orgId: string, patientId: string) => [...medicationKeys.all, orgId, patientId] as const,
};

export function useMedications(patientId: string | undefined) {
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);

  return useQuery<Medication[]>({
    queryKey: orgId && patientId ? medicationKeys.list(orgId, patientId) : [...medicationKeys.all, "disabled"],
    queryFn: () => getMedications(orgId as string, patientId as string),
    enabled: Boolean(orgId && patientId),
    staleTime: 60_000,
  });
}

export function useCreateMedication(patientId: string | undefined) {
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<MedicationCreateInput, "patientId">) =>
      createMedication(orgId as string, { ...payload, patientId: patientId as string }),
    onSuccess: async () => {
      if (!orgId || !patientId) return;
      await queryClient.invalidateQueries({ queryKey: medicationKeys.list(orgId, patientId) });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeactivateMedication(patientId: string | undefined) {
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medicationId: string) => deactivateMedication(orgId as string, medicationId),
    onSuccess: async () => {
      if (!orgId || !patientId) return;
      await queryClient.invalidateQueries({ queryKey: medicationKeys.list(orgId, patientId) });
      await queryClient.invalidateQueries({ queryKey: ["doses"] });
    },
  });
}
