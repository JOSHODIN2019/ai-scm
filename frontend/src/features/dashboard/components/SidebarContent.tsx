import { Link, useLocation } from "react-router-dom"
import { LogOut, SearchCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/AuthContext"
import { NAV_ITEMS } from "../navItems"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

interface SidebarContentProps {
  onNavigate?: () => void
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="flex h-full flex-col">
      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-5 font-semibold tracking-tight">
        <SearchCode className="size-5 text-primary" strokeWidth={2.25} />
        <span>AI-SCM</span>
      </Link>

      <Separator />

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => {
          const isActive = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" strokeWidth={2} />
              {label}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {user && (
        <div className="flex items-center gap-2.5 px-4 py-4">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{initials(user.full_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.full_name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Sign out" onClick={logout}>
            <LogOut className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
