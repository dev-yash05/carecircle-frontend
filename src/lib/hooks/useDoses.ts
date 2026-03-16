import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ApiError, apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/authStore";

export type DoseStatus = "PENDING" | "TAKEN" | "SKIPPED" | "MISSED";

export interface DoseEvent {
  id: string;
  medicationName: string;
  dosage: string;
  scheduledAt: string;
  status: DoseStatus;
  notes?: string | null;
  markedByName?: string | null;
  markedAt?: string | null;
}

export interface MarkDosePayload {
  status: Extract<DoseStatus, "TAKEN" | "SKIPPED">;
  notes?: string;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const doseKeys = {
  all: ["doses"] as const,
  lists: () => [...doseKeys.all, "list"] as const,
  list: (orgId: string, patientId: string, page: number, status?: DoseStatus) =>
    [...doseKeys.lists(), orgId, patientId, page, status ?? "all"] as const,
};

async function getDoses(
  orgId: string,
  patientId: string,
  page = 0,
  status?: DoseStatus,
  size = 20,
): Promise<PaginatedResponse<DoseEvent>> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (status) {
    query.set("status", status);
  }

  return apiClient<PaginatedResponse<DoseEvent>>(
    `/api/v1/organizations/${orgId}/patients/${patientId}/doses?${query.toString()}`,
  );
}

async function markDose(
  orgId: string,
  doseEventId: string,
  payload: MarkDosePayload,
): Promise<DoseEvent> {
  return apiClient<DoseEvent>(
    `/api/v1/organizations/${orgId}/doses/${doseEventId}/mark`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export function useDoses(
  patientId: string | undefined,
  page: number,
  status?: DoseStatus,
) {
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);

  return useQuery<PaginatedResponse<DoseEvent>>({
    queryKey:
      orgId && patientId
        ? doseKeys.list(orgId, patientId, page, status)
        : [...doseKeys.lists(), "disabled"],
    queryFn: () => getDoses(orgId as string, patientId as string, page, status),
    enabled: Boolean(orgId && patientId),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
}

export function useMarkDose(patientId: string | undefined) {
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doseEventId, payload }: { doseEventId: string; payload: MarkDosePayload }) =>
      markDose(orgId as string, doseEventId, payload),
    onMutate: async ({ doseEventId, payload }) => {
      if (!orgId || !patientId) {
        return { previousData: [] as Array<[readonly unknown[], unknown]> };
      }

      const matchingQueries = queryClient.getQueriesData<PaginatedResponse<DoseEvent>>({
        queryKey: [...doseKeys.lists(), orgId, patientId],
      });

      await Promise.all(
        matchingQueries.map(async ([queryKey]) => {
          await queryClient.cancelQueries({ queryKey });
        }),
      );

      matchingQueries.forEach(([queryKey, data]) => {
        if (!data) return;

        const optimisticContent = data.content.map((dose) =>
          dose.id === doseEventId ? { ...dose, status: payload.status } : dose,
        );

        queryClient.setQueryData(queryKey, {
          ...data,
          content: optimisticContent,
        });
      });

      return { previousData: matchingQueries };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      // 409 is handled in the calling component via the thrown ApiError
    },
    onSettled: async (_result, error) => {
      if (!orgId || !patientId) return;

      if (error instanceof ApiError && error.status === 409) {
        await queryClient.invalidateQueries({
          queryKey: [...doseKeys.lists(), orgId, patientId],
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: [...doseKeys.lists(), orgId, patientId],
      });
    },
  });
}
