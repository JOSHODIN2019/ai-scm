import { api } from "@/lib/api"
import type { GitHubCommitListResponse } from "@/lib/types"

export const githubApi = {
  listCommits: (projectId: string, page: number) =>
    api.get<GitHubCommitListResponse>(`/api/projects/${projectId}/github/commits?page=${page}`),
}
