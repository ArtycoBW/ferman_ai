'use client'

import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { Star, ExternalLink, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAnalyses, useRemoveFavorite } from '@/hooks/use-api'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDateTime } from '@/lib/format'
import type { AnalysisListItem } from '@/types/api'

interface FavoritesSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function FavoriteCard({ item, onRemove }: { item: AnalysisListItem; onRemove: () => void }) {
  const isActive = item.status === 'completed' || item.status === 'running'
  
  return (
    <div className="p-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {isActive ? 'Активна' : 'Завершена'}
          </span>
        </div>
        <span className="text-xs text-slate-400">
          Добавлено: {formatDateTime(item.created_at)}
        </span>
      </div>
      
      <div className="mb-2">
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
          {item.purchase_id}
        </div>
        <p className="text-sm text-slate-900 font-medium line-clamp-2">
          {item.title || `Закупка №${item.purchase_id}`}
        </p>
      </div>
      
      <div className="text-sm mb-1">
        <span className="text-slate-500">НМЦК: </span>
        <span className="font-medium text-slate-900">{item.nmck ? formatCurrency(item.nmck) : '—'}</span>
      </div>
      
      <div className="text-xs text-slate-500 mb-3">
        Дедлайн: {item.deadline || '—'}
      </div>
      
      <div className="flex items-center gap-2">
        <Link href={`/procurement/${item.purchase_id}${item.task_id ? `?task=${item.task_id}` : ''}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full hover:text-black">
            <ExternalLink className="h-4 w-4 mr-2" />
            Открыть
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-red-500"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function FavoritesSidebar({ open, onOpenChange }: FavoritesSidebarProps) {
  const queryClient = useQueryClient()
  const { data: analyses, isLoading } = useAnalyses()
  const removeFavorite = useRemoveFavorite()

  const favorites = analyses?.items.filter(a => a.is_favorite) || []

  const handleRemove = async (id: number) => {
    try {
      await removeFavorite.mutateAsync(id)
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
      toast({ title: 'Удалено из избранного' })
    } catch {
      toast({ title: 'Ошибка', variant: 'destructive' })
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={() => onOpenChange(false)} />
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-slate-700" />
            <h2 className="font-semibold text-lg">Избранное</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{favorites.length} закупок</span>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Star className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">Избранное пусто</p>
              <p className="text-sm text-slate-400 mt-1">
                Добавляйте закупки в избранное для быстрого доступа
              </p>
            </div>
          ) : (
            <div>
              {favorites.map((item) => (
                <FavoriteCard
                  key={item.id}
                  item={item}
                  onRemove={() => handleRemove(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
