import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createPatient,
  getPatient,
  getPatients,
  updatePatient,
  type Patient,
  type PaginatedResponse,
} from "@/lib/api/patients";
import type { PatientCreateInput, PatientUpdateInput } from "@/lib/schemas/patient.schema";

const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (orgId: string, page: number, size: number, search: string) =>
    [...patientKeys.lists(), orgId, page, size, search] as const,
  details: () => [...patientKeys.all, "detail"] as const,
  detail: (orgId: string, patientId: string) =>
    [...patientKeys.details(), orgId, patientId] as const,
};

export function usePatients(orgId: string | undefined, page: number, size: number, search: string) {
  return useQuery<PaginatedResponse<Patient>>({
    queryKey: orgId ? patientKeys.list(orgId, page, size, search) : [...patientKeys.lists(), "no-org"],
    queryFn: () => getPatients(orgId as string, page, size, search),
    enabled: Boolean(orgId),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function usePatient(orgId: string | undefined, patientId: string | undefined) {
  return useQuery<Patient>({
    queryKey:
      orgId && patientId
        ? patientKeys.detail(orgId, patientId)
        : [...patientKeys.details(), "disabled"],
    queryFn: () => getPatient(orgId as string, patientId as string),
    enabled: Boolean(orgId && patientId),
    staleTime: 60_000,
  });
}

export function useCreatePatient(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatientCreateInput) => createPatient(orgId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

export function useUpdatePatient(orgId: string | undefined, patientId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatientUpdateInput) =>
      updatePatient(orgId as string, patientId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      if (orgId && patientId) {
        queryClient.invalidateQueries({ queryKey: patientKeys.detail(orgId, patientId) });
      }
    },
  });
}
