import { apiClient } from "@/lib/api/client";

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuditEvent {
  id: string;
  action: string;
  createdAt: string;
  actorName?: string;
  actorEmail?: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
}

interface AuditPayload {
  [key: string]: unknown;
}

function pickFirst<T>(...values: Array<T | null | undefined>): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function toAuditEvent(raw: AuditPayload): AuditEvent {
  return {
    id: String(pickFirst(raw.id, raw.eventId, raw.event_id) ?? ""),
    action: String(pickFirst(raw.action, raw.eventType, raw.type) ?? "UNKNOWN"),
    createdAt: String(pickFirst(raw.createdAt, raw.created_at, raw.timestamp) ?? new Date().toISOString()),
    actorName: String(pickFirst(raw.actorName, raw.actor_name, raw.userName, "System")),
    actorEmail: String(pickFirst(raw.actorEmail, raw.actor_email, raw.userEmail, "")),
    resourceType: String(pickFirst(raw.resourceType, raw.resource_type, "-")),
    resourceId: String(pickFirst(raw.resourceId, raw.resource_id, "")),
    ipAddress: (pickFirst(raw.ipAddress, raw.ip_address, raw.ip) as string | undefined) ?? undefined,
  };
}

export async function getAuditLog(
  orgId: string,
  patientId: string,
  page = 0,
  size = 20,
): Promise<PaginatedResponse<AuditEvent>> {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  const data = await apiClient<PaginatedResponse<AuditPayload> | AuditPayload[]>(
    `/api/v1/organizations/${orgId}/patients/${patientId}/audit?${query.toString()}`,
  );

  if (Array.isArray(data)) {
    return {
      content: data.map((item) => toAuditEvent(item)),
      totalElements: data.length,
      totalPages: 1,
      number: 0,
      size: data.length,
    };
  }

  return {
    ...data,
    content: data.content.map((item) => toAuditEvent(item)),
  };
}
