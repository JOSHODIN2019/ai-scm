import { api } from "@/lib/api"
import type { Project } from "@/lib/types"

export interface ProjectCreateInput {
  project_name: string
  repository_url?: string
  description?: string
}

export const projectsApi = {
  list: () => api.get<Project[]>("/api/projects"),
  get: (id: string) => api.get<Project>(`/api/projects/${id}`),
  create: (input: ProjectCreateInput) => api.post<Project>("/api/projects", input),
  remove: (id: string) => api.delete<void>(`/api/projects/${id}`),
}
