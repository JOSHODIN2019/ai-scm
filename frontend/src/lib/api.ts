import { getAccessToken } from "@/lib/auth/tokenStorage"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001"

export class ApiRequestError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface FastApiError {
  detail?: string | { msg: string }[]
}

function extractErrorMessage(body: FastApiError, fallback: string): string {
  if (!body.detail) return fallback
  if (typeof body.detail === "string") return body.detail
  return body.detail.map((e) => e.msg).join(", ") || fallback
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = getAccessToken()

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 204) {
    return undefined as T
  }

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiRequestError(res.status, extractErrorMessage(body, "Request failed"))
  }

  return body as T
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, payload?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: "POST", body: payload ? JSON.stringify(payload) : undefined }),
  patch: <T>(path: string, payload?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: "PATCH", body: payload ? JSON.stringify(payload) : undefined }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "DELETE" }),
}
