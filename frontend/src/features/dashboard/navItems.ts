import { LayoutDashboard, FolderGit2, UserCircle, type LucideIcon } from "lucide-react"

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", to: "/dashboard/projects", icon: FolderGit2 },
  { label: "Profile", to: "/dashboard/profile", icon: UserCircle },
]
