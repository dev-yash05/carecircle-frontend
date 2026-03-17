"use client"

import { RoleGuard } from "@/components/layout/role-guard"

export default function AdminFamiliesPage() {
  return (
    <RoleGuard allowed={["SUPER_ADMIN"]} redirectTo="/dashboard">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Families</h1>
        <p className="mt-2 text-muted-foreground">
          Manage every family on the platform. Content coming in Sprint 3.
        </p>
      </div>
    </RoleGuard>
  )
}
