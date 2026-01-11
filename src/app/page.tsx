'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Header } from '@/components/layout/header'
import { AnalyticsCard } from '@/components/dashboard/analytics-card'
import { Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

function HomePageContent() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessingCallback, setIsProcessingCallback] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const callbackProcessedRef = useRef(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle Yandex OAuth callback
  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('cid')

    if (code && state && !isProcessingCallback && !callbackProcessedRef.current) {
      callbackProcessedRef.current = true
      setIsProcessingCallback(true)

      const handleYandexCallback = async () => {
        try {
          const response = await apiClient.yandexCallback({ code, state })
          login(response.access_token)
          toast({
            title: 'Добро пожаловать!',
            description: 'Вы успешно вошли через Яндекс ID',
            variant: 'success'
          })
          // Clean URL from OAuth parameters
          router.replace('/')
        } catch (error) {
          toast({
            title: 'Ошибка авторизации',
            description: error instanceof Error ? error.message : 'Не удалось войти через Яндекс',
            variant: 'destructive'
          })
          callbackProcessedRef.current = false
          router.push('/auth')
        } finally {
          setIsProcessingCallback(false)
        }
      }

      handleYandexCallback()
    }
  }, [searchParams, isProcessingCallback, login, router])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isProcessingCallback) {
      const code = searchParams.get('code')
      if (!code) {
        router.push('/auth')
      }
    }
  }, [isLoading, isAuthenticated, isProcessingCallback, router, searchParams])

  if (!isMounted || isLoading || isProcessingCallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          {isProcessingCallback && (
            <p className="text-sm text-slate-600">Авторизация через Яндекс...</p>
          )}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      {/* Grid background */}
      <div className="flex-1 relative">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 min-h-[calc(100vh-120px)]">
          <AnalyticsCard />
        </main>
      </div>
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white relative z-10">
        © 2025 Ferman AI · Аналитика закупок
      </footer>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}
