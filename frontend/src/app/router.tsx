import { lazy } from "react"
import { createBrowserRouter } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"

const LandingPage = lazy(() => import("@/features/landing/LandingPage"))
const LoginPage = lazy(() => import("@/features/auth/LoginPage"))
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage"))
const DashboardHome = lazy(() => import("@/features/dashboard/DashboardHome"))
const ProjectsListPage = lazy(() => import("@/features/projects/ProjectsListPage"))
const ProjectDetailPage = lazy(() => import("@/features/projects/ProjectDetailPage"))
const ChangeDetailPage = lazy(() => import("@/features/changes/ChangeDetailPage"))
const ProfilePage = lazy(() => import("@/features/profile/ProfilePage"))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"))

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardHome /> },
          { path: "projects", element: <ProjectsListPage /> },
          { path: "projects/:projectId", element: <ProjectDetailPage /> },
          { path: "changes/:changeId", element: <ChangeDetailPage /> },
          { path: "profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])
