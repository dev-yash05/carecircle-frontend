import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/client";
import { getAuditLog, type AuditEvent, type PaginatedResponse } from "@/lib/api/audit";
import { useAuthStore } from "@/lib/stores/authStore";

const auditKeys = {
  all: ["audit"] as const,
  list: (orgId: string, patientId: string, page: number, size: number) =>
    [...auditKeys.all, orgId, patientId, page, size] as const,
};

export function useAuditLog(patientId: string | undefined, page: number, size = 20) {
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);

  return useQuery<PaginatedResponse<AuditEvent>>({
    queryKey:
      orgId && patientId
        ? auditKeys.list(orgId, patientId, page, size)
        : [...auditKeys.all, "disabled"],
    queryFn: () => getAuditLog(orgId as string, patientId as string, page, size),
    enabled: Boolean(orgId && patientId),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 1;
    },
  });
}
