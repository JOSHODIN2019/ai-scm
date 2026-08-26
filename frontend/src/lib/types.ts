export type ChangeType = "Bug Fix" | "New Feature" | "Refactoring" | "Configuration Change"
export type RiskLevel = "Low" | "Medium" | "High"

export interface Project {
  id: string
  user_id: string
  project_name: string
  repository_url: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface SoftwareChange {
  id: string
  project_id: string
  commit_id: string
  commit_message: string
  author: string
  changed_files: string[]
  code_diff: string
  commit_date: string
  created_at: string
}

export interface Analysis {
  id: string
  change_id: string
  change_type: ChangeType
  risk_level: RiskLevel
  explanation: string
  is_mock: boolean
  analyzed_at: string
  created_at: string
}

export interface GitHubCommitSummary {
  sha: string
  message: string
  author: string
  date: string
}

export interface GitHubCommitListResponse {
  commits: GitHubCommitSummary[]
  page: number
  has_more: boolean
}
