import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { GitCommitHorizontal, History, Plus, Trash2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { CommitHistoryList } from "./components/CommitHistoryList"
import { changesApi } from "@/features/changes/changesApi"
import type { Project, SoftwareChange } from "@/lib/types"
import { ApiRequestError } from "@/lib/api"

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [changes, setChanges] = useState<SoftwareChange[] | null>(null)
  const [error, setError] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [commitId, setCommitId] = useState("")
  const [commitMessage, setCommitMessage] = useState("")
  const [author, setAuthor] = useState("")
  const [changedFiles, setChangedFiles] = useState("")
  const [codeDiff, setCodeDiff] = useState("")
  const [commitDate, setCommitDate] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function load() {
    if (!projectId) return
    setError(false)
    try {
      const [projectData, changesData] = await Promise.all([
        projectsApi.get(projectId),
        changesApi.list(projectId),
      ])
      setProject(projectData)
      setChanges(changesData)
    } catch {
      setError(true)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  async function handleCreateChange(e: FormEvent) {
    e.preventDefault()
    if (!projectId) return
    setFormError(null)
    setIsSubmitting(true)
    try {
      await changesApi.create(projectId, {
        commit_id: commitId,
        commit_message: commitMessage,
        author,
        changed_files: changedFiles
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        code_diff: codeDiff,
        commit_date: commitDate || new Date().toISOString(),
      })
      setCommitId("")
      setCommitMessage("")
      setAuthor("")
      setChangedFiles("")
      setCodeDiff("")
      setCommitDate("")
      setDialogOpen(false)
      toast("Software change recorded.", "success")
      load()
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Could not record change.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteProject() {
    if (!projectId || !confirm("Delete this project and all its changes?")) return
    try {
      await projectsApi.remove(projectId)
      toast("Project deleted.", "success")
      navigate("/dashboard/projects", { replace: true })
    } catch {
      toast("Could not delete project.", "error")
    }
  }

  if (error) return <ErrorState message="Could not load this project." onRetry={load} />
  if (!project || changes === null) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{project.project_name}</h2>
          {project.repository_url && (
            <a
              href={project.repository_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              {project.repository_url}
            </a>
          )}
          {project.description && <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>}
        </div>
        <Button variant="ghost" size="icon" aria-label="Delete project" onClick={handleDeleteProject}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>

      {project.repository_url && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <History className="size-4" />
            Commit history
          </h3>
          <CommitHistoryList projectId={project.id} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {project.repository_url ? "Software changes" : "Software changes (manual entry)"}
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button size="sm" variant={project.repository_url ? "outline" : "default"}><Plus className="size-4" />Add change manually</Button>} />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Record a software change</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateChange} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="commit_id">Commit ID</Label>
                  <Input id="commit_id" required value={commitId} onChange={(e) => setCommitId(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="author">Author</Label>
                  <Input id="author" required value={author} onChange={(e) => setAuthor(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="commit_message">Commit message</Label>
                <Textarea
                  id="commit_message"
                  required
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="changed_files">Changed files (one per line)</Label>
                <Textarea
                  id="changed_files"
                  rows={3}
                  value={changedFiles}
                  onChange={(e) => setChangedFiles(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="code_diff">Code diff</Label>
                <Textarea
                  id="code_diff"
                  rows={6}
                  className="font-mono text-xs"
                  value={codeDiff}
                  onChange={(e) => setCodeDiff(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="commit_date">Commit date</Label>
                <Input
                  id="commit_date"
                  type="date"
                  value={commitDate}
                  onChange={(e) => setCommitDate(e.target.value)}
                />
              </div>
              {formError && (
                <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </p>
              )}
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Save change"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {changes.length === 0 && (
        <EmptyState
          icon={GitCommitHorizontal}
          title="No software changes yet"
          description="Add a change to extract its details and run an AI analysis."
        />
      )}

      {changes.length > 0 && (
        <div className="space-y-2">
          {changes.map((change) => (
            <Link key={change.id} to={`/dashboard/changes/${change.id}`}>
              <Card className="border-border/60 transition-colors hover:border-border">
                <CardContent className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{change.commit_message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {change.commit_id} &middot; {change.author} &middot; {change.changed_files.length} file(s)
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
