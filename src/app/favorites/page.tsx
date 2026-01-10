'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { useAnalyses, useRemoveFavorite } from '@/hooks/use-api'
import { Background } from '@/components/layout/background'
import { Logo } from '@/components/layout/logo'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Star, 
  Loader2, 
  ExternalLink, 
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { formatDateTime } from '@/lib/format'
import { toast } from '@/hooks/use-toast'
import type { AnalysisListItem, AnalysisStatus } from '@/types/api'

function getStatusIcon(status: AnalysisStatus) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'running':
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />
    case 'queued':
      return <Clock className="h-4 w-4 text-amber-500" />
  }
}

function getStatusLabel(status: AnalysisStatus) {
  switch (status) {
    case 'completed': return 'Завершён'
    case 'failed': return 'Ошибка'
    case 'running': return 'Выполняется'
    case 'queued': return 'В очереди'
  }
}

function AnalysisCard({ analysis, onRemove }: { analysis: AnalysisListItem; onRemove: () => void }) {
  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(analysis.status)}
              <span className="font-mono text-sm font-medium">{analysis.purchase_id}</span>
              <Badge variant="outline" className="text-xs">
                {analysis.analysis_type === 'full' ? 'Полный' : 'Быстрый'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>Создан: {formatDateTime(analysis.created_at)}</span>
              {analysis.completed_at && (
                <span>Завершён: {formatDateTime(analysis.completed_at)}</span>
              )}
              {analysis.tokens_spent > 0 && (
                <span>Токенов: {analysis.tokens_spent}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/procurement/${analysis.purchase_id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Открыть
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FavoritesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: analyses, isLoading, refetch } = useAnalyses()
  const removeFavorite = useRemoveFavorite()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [authLoading, isAuthenticated, router])

  const favorites = analyses?.items.filter(a => a.is_favorite) || []

  const handleRemove = async (analysisId: number) => {
    try {
      await removeFavorite.mutateAsync(analysisId)
      toast({ title: 'Удалено из избранного' })
      refetch()
    } catch {
      toast({ title: 'Ошибка', variant: 'destructive' })
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <Background />
      <header className="bg-card/90 backdrop-blur-md border-b border-border/50 relative z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Logo />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Star className="h-6 w-6 text-primary fill-current" />
            <h1 className="text-2xl font-bold">Избранное</h1>
            <Badge variant="secondary">{favorites.length}</Badge>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : favorites.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Star className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="text-lg font-semibold mb-2">Избранное пусто</h2>
                <p className="text-muted-foreground mb-4">
                  Добавляйте закупки в избранное, чтобы быстро к ним возвращаться
                </p>
                <Link href="/">
                  <Button>
                    Перейти к анализу
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {favorites.map(analysis => (
                <AnalysisCard
                  key={analysis.id}
                  analysis={analysis}
                  onRemove={() => handleRemove(analysis.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
