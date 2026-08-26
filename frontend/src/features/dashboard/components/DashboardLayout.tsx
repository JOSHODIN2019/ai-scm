import { Suspense } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { PageFallback } from "@/components/PageFallback"
import { NAV_ITEMS } from "../navItems"

export function DashboardLayout() {
  const location = useLocation()
  const activeItem = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to) && item.to !== "/dashboard")

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={activeItem?.label ?? "Overview"} />
        <main className="flex-1 p-4 md:p-6">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
