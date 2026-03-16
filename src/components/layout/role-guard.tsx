"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/authStore"

interface RoleGuardProps {
  allowed: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Client-side role guard.  Renders children only when the current
 * user's role is in the `allowed` list.  Otherwise shows `fallback`
 * or redirects to /dashboard.
 */
export function RoleGuard({ allowed, children, fallback }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()

  if (!user) return null // still loading / not authenticated

  if (!allowed.includes(user.role)) {
    if (fallback) return <>{fallback}</>
    // redirect silently
    router.replace("/dashboard")
    return null
  }

  return <>{children}</>
}
