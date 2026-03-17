"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/stores/authStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

/* ---------- nav items ------------------------------------------------- */

export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]       // visible to these roles; undefined = all
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
    ),
  },
  {
    label: "Patients",
    href: "/patients",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
    ),
  },
  {
    label: "Team",
    href: "/team",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "All Orgs",
    href: "/superadmin",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4c0-.6.4-1 1-1h6c.6 0 1 .4 1 1v18"/><path d="M6 12H4a1 1 0 0 0-1 1v8h3"/><path d="M20 12h-2"/><path d="M14 12h6a1 1 0 0 1 1 1v8h-7"/><path d="M10 7h.01"/><path d="M10 11h.01"/><path d="M10 15h.01"/></svg>
    ),
    roles: ["SUPER_ADMIN"],
  },
  {
    label: "All Users",
    href: "/superadmin/users",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>
    ),
    roles: ["SUPER_ADMIN"],
  },
  {
    label: "Team Admin",
    href: "/superadmin/team",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>
    ),
    roles: ["SUPER_ADMIN"],
  },
]

/* ---------- component ------------------------------------------------- */

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  )

  return (
    <aside className="hidden h-dvh w-[var(--sidebar-width)] shrink-0 flex-col border-r border-border/80 bg-card/85 backdrop-blur lg:flex">
      {/* brand */}
      <div className="flex h-[76px] items-center gap-3 px-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-sm">
          C
        </div>
        <div>
          <p className="text-[26px] font-bold leading-none tracking-tight text-foreground">CareCircle</p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Caregiver Hub</p>
        </div>
      </div>

      <Separator />

      {/* nav links */}
      <nav className="flex-1 space-y-2 px-3 py-4">
        {visibleItems.map((item) => {
          const active = item.href === "/superadmin"
            ? pathname === "/superadmin"
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-colors [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0",
                active
                  ? "bg-primary text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/0.3)]"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* user footer */}
      {user && (
        <div className="m-4 flex items-center gap-3 rounded-2xl border border-border/70 bg-accent/60 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback>
              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              <Badge variant="outline" className="text-[10px]">
                {user.role.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
