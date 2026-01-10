'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { User } from '@/types/api'
import Cookies from 'js-cookie'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  refetchUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [hasToken, setHasToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!Cookies.get('access_token')
    }
    return false
  })

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.getMe(),
    enabled: hasToken,
    retry: false,
  })

  const login = (token: string) => {
    apiClient.setToken(token)
    setHasToken(true)
    refetch()
  }

  const logout = () => {
    apiClient.removeToken()
    setHasToken(false)
    queryClient.setQueryData(['user'], null)
    queryClient.clear()
  }

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, isAuthenticated: !!user, login, logout, refetchUser: refetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
