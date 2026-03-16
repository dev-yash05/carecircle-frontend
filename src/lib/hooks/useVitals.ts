import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getVitals, recordVital, type PaginatedResponse, type VitalReading } from "@/lib/api/vitals";
import type { VitalCreateInput, VitalType } from "@/lib/schemas/vital.schema";
import { useAuthStore } from "@/lib/stores/authStore";

const vitalKeys = {
  all: (orgId: string, patientId: string) => ["vitals", orgId, patientId] as const,
  byType: (orgId: string, patientId: string, vitalType: VitalType) =>
    [...vitalKeys.all(orgId, patientId), vitalType] as const,
};

export function useVitals(patientId: string | undefined, vitalType: VitalType) {
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);

  return useQuery<PaginatedResponse<VitalReading>>({
    queryKey:
      orgId && patientId
        ? vitalKeys.byType(orgId, patientId, vitalType)
        : ["vitals", "disabled", vitalType],
    queryFn: () => getVitals(orgId as string, patientId as string, vitalType),
    enabled: Boolean(orgId && patientId),
    staleTime: 120_000,
  });
}

export function useRecordVital(patientId: string | undefined) {
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VitalCreateInput) =>
      recordVital(orgId as string, patientId as string, payload),
    onSuccess: async () => {
      if (!orgId || !patientId) return;
      await queryClient.invalidateQueries({ queryKey: ["vitals", orgId, patientId] });
    },
  });
}
