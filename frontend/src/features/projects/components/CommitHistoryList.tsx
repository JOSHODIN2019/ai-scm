import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, GitCommitHorizontal, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { useToast } from "@/components/shared/ToastProvider"
import { githubApi } from "../githubApi"
import { changesApi } from "@/features/changes/changesApi"
import type { GitHubCommitSummary } from "@/lib/types"
import { ApiRequestError } from "@/lib/api"

export function CommitHistoryList({ projectId }: { projectId: string }) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [page, setPage] = useState(1)
  const [commits, setCommits] = useState<GitHubCommitSummary[] | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importingSha, setImportingSha] = useState<string | null>(null)

  async function load() {
    setError(null)
    setCommits(null)
    try {
      const result = await githubApi.listCommits(projectId, page)
      setCommits(result.commits)
      setHasMore(result.has_more)
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load commit history.")
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, page])

  async function handleAnalyze(sha: string) {
    setImportingSha(sha)
    try {
      const change = await changesApi.importGithubCommit(projectId, sha)
      navigate(`/dashboard/changes/${change.id}`)
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : "Could not retrieve this commit.", "error")
      setImportingSha(null)
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (commits === null) return <LoadingState label="Loading commit history…" />

  if (commits.length === 0 && page === 1) {
    return (
      <EmptyState
        icon={GitCommitHorizontal}
        title="No commits found"
        description="This repository has no commits, or they couldn't be retrieved."
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commit</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commits.map((commit) => (
              <TableRow key={commit.sha}>
                <TableCell className="font-mono text-xs">{commit.sha.slice(0, 7)}</TableCell>
                <TableCell className="max-w-xs truncate">{commit.message}</TableCell>
                <TableCell className="text-muted-foreground">{commit.author}</TableCell>
                <TableCell className="text-muted-foreground">
                  {commit.date ? new Date(commit.date).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    disabled={importingSha !== null}
                    onClick={() => handleAnalyze(commit.sha)}
                  >
                    <Sparkles className="size-3.5" />
                    {importingSha === commit.sha ? "Retrieving…" : "Analyze"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">Page {page}</span>
        <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}>
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
