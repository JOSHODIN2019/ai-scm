import { SidebarContent } from "./SidebarContent"

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-background md:block">
      <SidebarContent />
    </aside>
  )
}
