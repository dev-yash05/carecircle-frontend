"use client"

import { Bell, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuthStore } from "@/lib/stores/authStore"
import { logout } from "@/lib/api/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function Topbar() {
  const { setTheme, resolvedTheme } = useTheme()
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-10 w-10 rounded-2xl border border-border/70">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-tight text-foreground">CareCircle</p>
            <p className="truncate text-xs text-muted-foreground">{user.role.replace("_", " ")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Badge variant="outline" className="hidden md:inline-flex">
            {user.email}
          </Badge>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
