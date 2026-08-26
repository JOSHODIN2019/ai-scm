import { useEffect, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { FolderGit2, Plus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { useToast } from "@/components/shared/ToastProvider"
import { projectsApi } from "./projectsApi"
import type { Project } from "@/lib/types"
import { ApiRequestError } from "@/lib/api"

export default function ProjectsListPage() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [name, setName] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [description, setDescription] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function load() {
    setError(false)
    setProjects(null)
    try {
      setProjects(await projectsApi.list())
    } catch {
      setError(true)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)
    try {
      await projectsApi.create({
        project_name: name,
        repository_url: repoUrl || undefined,
        description: description || undefined,
      })
      setName("")
      setRepoUrl("")
      setDescription("")
      setDialogOpen(false)
      toast("Project created.", "success")
      load()
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Could not create project.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground">Manage the projects you track software changes for.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button><Plus className="size-4" />New project</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="project_name">Project name</Label>
                <Input id="project_name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="repository_url">Repository URL</Label>
                <Input
                  id="repository_url"
                  placeholder="https://github.com/org/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              {formError && (
                <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </p>
              )}
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating…" : "Create project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <ErrorState message="Could not load projects." onRetry={load} />}
      {!error && projects === null && <LoadingState />}
      {!error && projects !== null && projects.length === 0 && (
        <EmptyState
          icon={FolderGit2}
          title="No projects yet"
          description="Create your first project to start recording and analyzing software changes."
        />
      )}
      {!error && projects !== null && projects.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
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
  )
}
