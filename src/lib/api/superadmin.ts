import { ApiError, apiClient } from "@/lib/api/client";

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface OrgSummary {
  id: string;
  name: string;
  plan: "FREE" | "PREMIUM" | "ENTERPRISE" | string;
  memberCount: number;
  patientCount: number;
  createdAt: string;
  active: boolean;
}

export interface OrgDetail extends OrgSummary {
  deactivatedAt?: string | null;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CAREGIVER" | "VIEWER" | string;
  avatarUrl?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
  active: boolean;
}

interface Payload {
  [key: string]: unknown;
}

function pickFirst<T>(...values: Array<T | null | undefined>): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toOrgSummary(raw: Payload): OrgSummary {
  return {
    id: String(pickFirst(raw.id, raw.organizationId, raw.organization_id) ?? ""),
    name: String(pickFirst(raw.name, raw.organizationName, raw.organization_name) ?? "Unnamed org"),
    plan: String(pickFirst(raw.plan, raw.subscriptionPlan, raw.tier, "FREE")),
    memberCount: toNumber(pickFirst(raw.memberCount, raw.members, raw.member_count), 0),
    patientCount: toNumber(pickFirst(raw.patientCount, raw.patients, raw.patient_count), 0),
    createdAt: String(pickFirst(raw.createdAt, raw.created_at) ?? new Date().toISOString()),
    active: Boolean(pickFirst(raw.active, raw.enabled, true)),
  };
}

function toUserSummary(raw: Payload): UserSummary {
  return {
    id: String(pickFirst(raw.id, raw.userId, raw.user_id) ?? ""),
    name: String(pickFirst(raw.name, raw.fullName, raw.full_name) ?? "Unknown user"),
    email: String(pickFirst(raw.email, raw.emailAddress, raw.email_address) ?? ""),
    role: String(pickFirst(raw.role, "VIEWER")),
    avatarUrl: (pickFirst(raw.avatarUrl, raw.avatar_url) as string | null | undefined) ?? null,
    organizationId: (pickFirst(raw.organizationId, raw.organization_id) as string | null | undefined) ?? null,
    organizationName: (pickFirst(raw.organizationName, raw.organization_name, raw.orgName) as string | null | undefined) ?? null,
    active: Boolean(pickFirst(raw.active, raw.enabled, true)),
  };
}

function normalizePage<T>(data: PaginatedResponse<Payload> | Payload[], mapper: (value: Payload) => T): PaginatedResponse<T> {
  if (Array.isArray(data)) {
    return {
      content: data.map((row) => mapper(row)),
      totalElements: data.length,
      totalPages: 1,
      number: 0,
      size: data.length || 20,
    };
  }

  return {
    ...data,
    content: data.content.map((row) => mapper(row)),
  };
}

export async function getAllOrgs(page = 0, size = 20): Promise<PaginatedResponse<OrgSummary>> {
  const query = new URLSearchParams({ page: String(page), size: String(size) }).toString();
  const data = await apiClient<PaginatedResponse<Payload> | Payload[]>(`/api/v1/superadmin/organizations?${query}`);
  return normalizePage(data, toOrgSummary);
}

export async function getOrgDetail(orgId: string): Promise<OrgDetail> {
  const data = await apiClient<Payload>(`/api/v1/superadmin/organizations/${orgId}`);
  const base = toOrgSummary(data);
  return {
    ...base,
    deactivatedAt: (pickFirst(data.deactivatedAt, data.deactivated_at) as string | null | undefined) ?? null,
  };
}

export async function getAllUsers(page = 0, size = 20): Promise<PaginatedResponse<UserSummary>> {
  const query = new URLSearchParams({ page: String(page), size: String(size) }).toString();
  const data = await apiClient<PaginatedResponse<Payload> | Payload[]>(`/api/v1/superadmin/users?${query}`);
  return normalizePage(data, toUserSummary);
}

export async function deactivateOrg(orgId: string): Promise<void> {
  const candidates = [
    { path: `/api/v1/superadmin/organizations/${orgId}/deactivate`, method: "POST" },
    { path: `/api/v1/superadmin/organizations/${orgId}/deactivate`, method: "PUT" },
    { path: `/api/v1/superadmin/organizations/${orgId}`, method: "DELETE" },
  ] as const;

  for (const candidate of candidates) {
    try {
      await apiClient<void>(candidate.path, { method: candidate.method });
      return;
    } catch (error) {
      if (error instanceof ApiError && [404, 405].includes(error.status)) {
        continue;
      }
      throw error;
    }
  }
}

export async function deactivateUser(userId: string): Promise<void> {
  const candidates = [
    { path: `/api/v1/superadmin/users/${userId}/deactivate`, method: "POST" },
    { path: `/api/v1/superadmin/users/${userId}/deactivate`, method: "PUT" },
    { path: `/api/v1/superadmin/users/${userId}`, method: "DELETE" },
  ] as const;

  for (const candidate of candidates) {
    try {
      await apiClient<void>(candidate.path, { method: candidate.method });
      return;
    } catch (error) {
      if (error instanceof ApiError && [404, 405].includes(error.status)) {
        continue;
      }
      throw error;
    }
  }
}
