import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/lib/auth/AuthContext"
import { PageFallback } from "@/components/PageFallback"

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageFallback fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
