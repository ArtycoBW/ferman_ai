'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { StatusResponse } from '@/types/api'

interface AnalysisStatusProps {
  status: StatusResponse | undefined
  isLoading: boolean
  error: string | null
}

export function AnalysisStatus({ status, isLoading, error }: AnalysisStatusProps) {
  if (!status && isLoading) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm">Загрузка статуса...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) return null

  const analysisStatus = status.analysis_status
  const callback = status.callback

  if (analysisStatus === 'completed') {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <span className="text-sm font-medium text-green-700">Анализ завершён</span>
              {status.tokens_spent > 0 && (
                <span className="text-xs text-muted-foreground ml-2">
                  Потрачено токенов: {status.tokens_spent}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (analysisStatus === 'failed' || error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <span className="text-sm font-medium text-destructive">Ошибка анализа</span>
              {(error || status.error) && (
                <p className="text-xs text-muted-foreground mt-1">{error || status.error}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (analysisStatus === 'queued') {
    return (
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-500" />
            <div className="flex-1">
              <span className="text-sm font-medium text-amber-700">В очереди</span>
              <p className="text-xs text-muted-foreground">Анализ скоро начнётся...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Running status
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex items-center gap-3 mb-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="flex-1">
            <span className="text-sm font-medium">Анализ выполняется...</span>
            {callback?.status && (
              <p className="text-xs text-muted-foreground">{callback.status}</p>
            )}
          </div>
        </div>
        {callback?.details && (
          <div className="text-xs text-muted-foreground mb-2">{callback.details}</div>
        )}
        <Progress value={undefined} className="h-1.5" />
      </CardContent>
    </Card>
  )
}
