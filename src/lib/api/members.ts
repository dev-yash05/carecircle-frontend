import { apiClient } from "@/lib/api/client";
import type { MemberAddInput } from "@/lib/schemas/member.schema";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

interface MemberPayload {
  [key: string]: unknown;
}

function pickFirst<T>(...values: Array<T | null | undefined>): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function toMember(raw: MemberPayload): Member {
  return {
    id: String(pickFirst(raw.id, raw.memberId, raw.member_id) ?? ""),
    name: String(pickFirst(raw.name, raw.fullName, raw.full_name) ?? "Unknown"),
    email: String(pickFirst(raw.email, raw.emailAddress, raw.email_address) ?? ""),
    role: String(pickFirst(raw.role, "VIEWER")),
    avatarUrl: (pickFirst(raw.avatarUrl, raw.avatar_url) as string | null | undefined) ?? null,
  };
}

export async function getMembers(orgId: string): Promise<Member[]> {
  const data = await apiClient<MemberPayload[] | { content?: MemberPayload[] }>(
    `/api/v1/organizations/${orgId}/members`,
  );

  const list = Array.isArray(data) ? data : (data.content ?? []);
  return list.map((item) => toMember(item));
}

export async function addMember(orgId: string, payload: MemberAddInput): Promise<Member> {
  const data = await apiClient<MemberPayload>(`/api/v1/organizations/${orgId}/members`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return toMember(data);
}

export async function removeMember(orgId: string, memberId: string): Promise<void> {
  await apiClient<void>(`/api/v1/organizations/${orgId}/members/${memberId}`, {
    method: "DELETE",
  });
}
