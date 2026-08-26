import { api } from "@/lib/api"
import type { SoftwareChange } from "@/lib/types"

export interface ChangeCreateInput {
  commit_id: string
  commit_message: string
  author: string
  changed_files: string[]
  code_diff: string
  commit_date: string
}

export const changesApi = {
  list: (projectId: string) => api.get<SoftwareChange[]>(`/api/projects/${projectId}/changes`),
  get: (changeId: string) => api.get<SoftwareChange>(`/api/changes/${changeId}`),
  create: (projectId: string, input: ChangeCreateInput) =>
    api.post<SoftwareChange>(`/api/projects/${projectId}/changes`, input),
  importGithubCommit: (projectId: string, commitSha: string) =>
    api.post<SoftwareChange>(`/api/projects/${projectId}/changes/import-github`, { commit_sha: commitSha }),
}
