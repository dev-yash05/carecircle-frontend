"use client"

import { Moon, Sun, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuthStore } from "@/lib/stores/authStore"
import { logout } from "@/lib/api/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function Topbar() {
  const { setTheme, resolvedTheme } = useTheme()
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        {/* breadcrumb / page title slot — filled by page content */}
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <span className="hidden text-sm text-muted-foreground sm:inline-block">{user.email}</span>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
          <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
