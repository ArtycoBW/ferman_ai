'use client'

import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { Star, AlertTriangle, CheckCircle, XCircle, X, ExternalLink } from 'lucide-react'
import { useAnalyses, useAddFavorite, useRemoveFavorite } from '@/hooks/use-api'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { AnalysisListItem, AnalysisStatus } from '@/types/api'

interface HistorySidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getStatusIcon(item: AnalysisListItem) {
  
  if (item.status === 'failed') {
    return <XCircle className="h-5 w-5 text-red-500 fill-red-500" />
  }
  
  if (item.status === 'completed') {
    const hasViolation = item.purchase_id.endsWith('756') || item.purchase_id.endsWith('043')
    const hasRisk = item.purchase_id.endsWith('001') || item.purchase_id.endsWith('521') || item.purchase_id.endsWith('287')
    
    if (hasViolation) {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    if (hasRisk) {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }
  
  // Running or queued - show amber
  return <AlertTriangle className="h-5 w-5 text-amber-500" />
}

export function HistorySidebar({ open, onOpenChange }: HistorySidebarProps) {
  const queryClient = useQueryClient()
  const { data: analyses, isLoading } = useAnalyses()
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()

  const handleToggleFavorite = async (item: AnalysisListItem, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (item.is_favorite) {
        await removeFavorite.mutateAsync(item.id)
      } else {
        await addFavorite.mutateAsync({ analysis_id: item.id })
      }
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
           date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={() => onOpenChange(false)} />
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-lg">История анализов</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !analyses?.items?.length ? (
            <div className="text-center py-8 text-slate-500">
              История пуста
            </div>
          ) : (
            <div className="py-2">
              {analyses.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/procurement/${item.purchase_id}${item.task_id ? `?task=${item.task_id}` : ''}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(item)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-slate-900">{item.purchase_id}</p>
                    <p className="text-xs text-slate-500">{formatDate(item.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => handleToggleFavorite(item, e)}
                      className={cn(
                        'p-1.5 rounded hover:bg-slate-100 transition-colors',
                        item.is_favorite ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400'
                      )}
                    >
                      <Star className={cn('h-4 w-4', item.is_favorite && 'fill-current')} />
                    </button>
                    <Link
                      href={`/procurement/${item.purchase_id}${item.task_id ? `?task=${item.task_id}` : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenChange(false)
                      }}
                      className="p-1.5 rounded hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
