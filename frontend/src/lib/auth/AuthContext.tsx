import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api } from "@/lib/api"
import { getAccessToken, storeToken, clearToken } from "./tokenStorage"

export interface AuthUser {
  id: string
  full_name: string
  email: string
  role: "developer" | "admin"
  created_at: string
}

interface RegisterInput {
  full_name: string
  email: string
  password: string
}

interface TokenResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (input: RegisterInput) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function rehydrate() {
      const token = getAccessToken()
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        const me = await api.get<AuthUser>("/api/auth/me")
        setUser(me)
      } catch {
        clearToken()
      } finally {
        setIsLoading(false)
      }
    }
    rehydrate()
  }, [])

  async function login(email: string, password: string) {
    const result = await api.post<TokenResponse>("/api/auth/login", { email, password })
    storeToken(result.access_token)
    setUser(result.user)
    return result.user
  }

  async function register(input: RegisterInput) {
    const result = await api.post<TokenResponse>("/api/auth/register", input)
    storeToken(result.access_token)
    setUser(result.user)
    return result.user
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
