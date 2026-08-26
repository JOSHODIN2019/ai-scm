import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Sparkles, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { RiskBadge } from "@/components/shared/RiskBadge"
import { ChangeTypeBadge } from "@/components/shared/ChangeTypeBadge"
import { CodeViewer } from "@/components/shared/CodeViewer"
import { useToast } from "@/components/shared/ToastProvider"
import { changesApi } from "./changesApi"
import { analysisApi } from "@/features/analysis/analysisApi"
import { projectsApi } from "@/features/projects/projectsApi"
import type { Analysis, Project, SoftwareChange } from "@/lib/types"
import { ApiRequestError } from "@/lib/api"

export default function ChangeDetailPage() {
  const { changeId } = useParams<{ changeId: string }>()
  const { toast } = useToast()

  const [change, setChange] = useState<SoftwareChange | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [analyses, setAnalyses] = useState<Analysis[] | null>(null)
  const [error, setError] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  async function load() {
    if (!changeId) return
    setError(false)
    try {
      const changeData = await changesApi.get(changeId)
      const [analysesData, projectData] = await Promise.all([
        analysisApi.list(changeId),
        projectsApi.get(changeData.project_id),
      ])
      setChange(changeData)
      setAnalyses(analysesData)
      setProject(projectData)
    } catch {
      setError(true)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeId])

  async function handleAnalyze() {
    if (!changeId) return
    setIsAnalyzing(true)
    try {
      const result = await analysisApi.analyze(changeId)
      setAnalyses((current) => [result, ...(current ?? [])])
      toast("Analysis complete.", "success")
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : "Analysis failed.", "error")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (error) return <ErrorState message="Could not load this change." onRetry={load} />
  if (!change || analyses === null) return <LoadingState />

  const repoUrl = project?.repository_url?.replace(/\/$/, "")
  const githubCommitUrl = repoUrl?.includes("github.com") ? `${repoUrl}/commit/${change.commit_id}` : undefined

  return (
    <div className="space-y-6">
      <div>
        {project && (
          <p className="text-xs font-medium text-muted-foreground">{project.project_name}</p>
        )}
        <h2 className="text-lg font-semibold tracking-tight">{change.commit_message}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-mono">{change.commit_id.slice(0, 12)}</span> &middot; {change.author} &middot;{" "}
          {new Date(change.commit_date).toLocaleDateString()}
        </p>
        {githubCommitUrl && (
          <a
            href={githubCommitUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            <ExternalLink className="size-3.5" />
            View commit on GitHub
          </a>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Changed files ({change.changed_files.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {change.changed_files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files listed.</p>
          ) : (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {change.changed_files.map((file) => (
                <li key={file} className="font-mono text-xs">
                  {file}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Code diff</CardTitle>
        </CardHeader>
        <CardContent>
          {change.code_diff ? <CodeViewer diff={change.code_diff} /> : (
            <p className="text-sm text-muted-foreground">No diff provided.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">AI analysis</CardTitle>
          <Button size="sm" onClick={handleAnalyze} disabled={isAnalyzing}>
            <Sparkles className="size-4" />
            {isAnalyzing ? "Analyzing…" : "Analyze with AI"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {analyses.length === 0 && (
            <EmptyState
              icon={Sparkles}
              title="No analysis yet"
              description="Run an AI analysis to get a change classification and risk assessment."
            />
          )}

          {analyses.map((analysis) => (
            <div key={analysis.id} className="rounded-lg border border-border/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <ChangeTypeBadge type={analysis.change_type} />
                <RiskBadge level={analysis.risk_level} />
                {analysis.is_mock && (
                  <span className="text-xs font-medium text-muted-foreground">
                    Mock AI result, not a real OpenAI model output
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{analysis.explanation}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(analysis.analyzed_at).toLocaleString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
