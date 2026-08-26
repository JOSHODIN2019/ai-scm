import { api } from "@/lib/api"
import type { Analysis } from "@/lib/types"

export const analysisApi = {
  list: (changeId: string) => api.get<Analysis[]>(`/api/changes/${changeId}/analyses`),
  analyze: (changeId: string) => api.post<Analysis>(`/api/changes/${changeId}/analyze`),
}
