"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/authStore"

interface RoleGuardProps {
  allowed: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

/**
 * Client-side role guard.  Renders children only when the current
 * user's role is in the `allowed` list.  Otherwise shows `fallback`
 * or hides content unless `redirectTo` is explicitly provided.
 */
export function RoleGuard({ allowed, children, fallback, redirectTo }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const isAllowed = Boolean(user && allowed.includes(user.role))
  const redirectTarget = fallback ? null : (redirectTo ?? null)

  useEffect(() => {
    if (!user || isAllowed || !redirectTarget) return
    router.replace(redirectTarget)
  }, [isAllowed, redirectTarget, router, user])

  if (!user) return null // still loading / not authenticated

  if (!isAllowed) {
    if (fallback) return <>{fallback}</>
    return null
  }

  return <>{children}</>
}
