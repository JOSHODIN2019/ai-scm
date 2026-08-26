import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FolderGit2, Plus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { projectsApi } from "@/features/projects/projectsApi"
import type { Project } from "@/lib/types"
import { useAuth } from "@/lib/auth/AuthContext"

export default function DashboardHome() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState(false)

  async function load() {
    setError(false)
    setProjects(null)
    try {
      const data = await projectsApi.list()
      setProjects(data)
    } catch {
      setError(true)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Welcome back{user ? `, ${user.full_name}` : ""}</h2>
        <p className="text-sm text-muted-foreground">
          Track your projects and analyze software changes with AI-assessed risk.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{projects?.length ?? "-"}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent projects</h3>
          <Button size="sm" variant="outline" render={<Link to="/dashboard/projects">View all</Link>} />
        </div>

        {error && <ErrorState message="Could not load projects." onRetry={load} />}
        {!error && projects === null && <LoadingState />}
        {!error && projects !== null && projects.length === 0 && (
          <EmptyState
            icon={FolderGit2}
            title="No projects yet"
            description="Create your first project to start recording and analyzing software changes."
            action={
              <Button size="sm" render={<Link to="/dashboard/projects"><Plus className="size-4" />New project</Link>} />
            }
          />
        )}
        {!error && projects !== null && projects.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <Link key={project.id} to={`/dashboard/projects/${project.id}`}>
                <Card className="h-full border-border/60 transition-colors hover:border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-sm">
                      {project.project_name}
                      <ArrowRight className="size-3.5 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {project.description || "No description"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
