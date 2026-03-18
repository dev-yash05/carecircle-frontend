"use client"

import { Bell, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/stores/authStore"
import { logout } from "@/lib/api/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/* ── page title map ─────────────────────────────────────── */
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/patients": "Patients",
  "/settings": "Settings",
  "/team": "Team",
  "/superadmin": "All Organisations",
  "/superadmin/users": "All Users",
  "/superadmin/team": "Team Admin",
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // fallback: try prefix matches
  for (const [key, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key)) return title
  }
  return "CareCircle"
}

export function Topbar() {
  const { setTheme, resolvedTheme } = useTheme()
  const user = useAuthStore((s) => s.user)
  const pathname = usePathname()

  if (!user) return null

  const pageTitle = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Left: page title breadcrumb */}
        <div className="flex min-w-0 items-center gap-3 animate-fade-in">
          {/* Mobile brand (hidden on desktop where sidebar shows it) */}
          <Avatar className="h-9 w-9 rounded-2xl border border-border/50 lg:hidden">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase hidden lg:block">
              CareCircle
            </p>
            <h1 className="truncate text-lg font-bold leading-tight text-foreground">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative hover:bg-accent/60 transition-colors duration-200"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="hover:bg-accent/60 transition-colors duration-200"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Badge variant="outline" className="hidden md:inline-flex text-xs">
            {user.email}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            aria-label="Sign out"
            className="hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
