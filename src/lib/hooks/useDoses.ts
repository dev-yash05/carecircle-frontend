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

function pickFirst<T>(...values: Array<T | null | undefined>): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function normalizeStatus(value: unknown): DoseStatus {
  const normalized = String(value ?? "PENDING").toUpperCase();
  if (normalized === "TAKEN" || normalized === "SKIPPED" || normalized === "MISSED") {
    return normalized;
  }
  return "PENDING";
}

function normalizeDose(raw: Record<string, unknown>): DoseEvent {
  return {
    id: String(pickFirst(raw.id, raw.doseEventId, raw.dose_event_id, raw.eventId, raw.event_id) ?? ""),
    medicationName: String(pickFirst(raw.medicationName, raw.medication_name, raw.medication) ?? "Medication"),
    dosage: String(pickFirst(raw.dosage, raw.dose, raw.strength) ?? "-"),
    scheduledAt: String(pickFirst(raw.scheduledAt, raw.scheduled_at, raw.time, raw.scheduledFor, raw.scheduled_for) ?? ""),
    status: normalizeStatus(pickFirst(raw.status, raw.state)),
    notes: (pickFirst(raw.notes, raw.note, raw.comment) as string | null | undefined) ?? null,
    markedByName: (pickFirst(raw.markedByName, raw.marked_by_name, raw.markedBy) as string | null | undefined) ?? null,
    markedAt: (pickFirst(raw.markedAt, raw.marked_at) as string | null | undefined) ?? null,
  };
}

function toPaginatedDoses(
  data: unknown,
  page: number,
  size: number,
  status?: DoseStatus,
): PaginatedResponse<DoseEvent> {
  const source = (data as Record<string, unknown>) ?? {};
  const rawList = Array.isArray(data)
    ? data
    : (pickFirst(source.content, source.items, source.data, source.results) as unknown[] | undefined) ?? [];

  const normalized = rawList
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => normalizeDose(item))
    .filter((item) => (status ? item.status === status : true));

  if (Array.isArray(data)) {
    return {
      content: normalized,
      totalElements: normalized.length,
      totalPages: normalized.length === 0 ? 1 : Math.ceil(normalized.length / size),
      number: page,
      size,
    };
  }

  const totalElementsRaw = pickFirst(source.totalElements, source.total_elements, source.total, source.count);
  const totalPagesRaw = pickFirst(source.totalPages, source.total_pages);
  const numberRaw = pickFirst(source.number, source.page, source.pageNumber, source.page_number);
  const sizeRaw = pickFirst(source.size, source.pageSize, source.page_size);

  return {
    content: normalized,
    totalElements: Number(totalElementsRaw ?? normalized.length),
    totalPages: Number(totalPagesRaw ?? 1),
    number: Number(numberRaw ?? page),
    size: Number(sizeRaw ?? size),
  };
}

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

  const queryString = query.toString();
  const endpoints = [
    `/api/v1/organizations/${orgId}/patients/${patientId}/doses?${queryString}`,
    `/api/v1/organizations/${orgId}/doses?patientId=${patientId}&${queryString}`,
    `/api/v1/organizations/${orgId}/doses/patient/${patientId}?${queryString}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const data = await apiClient<unknown>(endpoint);
      return toPaginatedDoses(data, page, size, status);
    } catch (error) {
      if (error instanceof ApiError && [404, 405, 501].includes(error.status)) {
        continue;
      }
      throw error;
    }
  }

  return {
    content: [],
    totalElements: 0,
    totalPages: 1,
    number: page,
    size,
  };
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
    refetchOnMount: "always",
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
