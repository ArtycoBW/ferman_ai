'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'

interface RSSItem {
  title: string
  description: string
  pubDate: string
  purchaseNumber?: string
  eventDescription?: string
  status?: 'violation' | 'risk' | 'ok'
  severity?: 'high' | 'medium' | 'low'
}

interface ProcurementRSSProps {
  purchaseId: string
}

export function ProcurementRSS({ purchaseId }: ProcurementRSSProps) {
  const [items, setItems] = useState<RSSItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseRSSXML = (xmlText: string, purchaseNum: string): RSSItem[] => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
    const items = xmlDoc.querySelectorAll('item')

    const parsedItems: RSSItem[] = []
    items.forEach((item) => {
      const title = item.querySelector('title')?.textContent || ''
      const description = item.querySelector('description')?.textContent || ''
      const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString()

      const eventMatch = description.match(/<strong>Описание события:<\/strong>\s*([^<]+)/)
      const eventDescription = eventMatch ? eventMatch[1].trim() : ''

      let status: 'violation' | 'risk' | 'ok' = 'ok'
      let severity: 'high' | 'medium' | 'low' = 'low'

      if (eventDescription.includes('нарушение') || eventDescription.includes('отклонен')) {
        status = 'violation'
        severity = 'high'
      } else if (eventDescription.includes('предупреждение') || eventDescription.includes('риск')) {
        status = 'risk'
        severity = 'medium'
      }

      parsedItems.push({
        title,
        description: description
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/strong>/g, '</strong> ')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/Номер закупки:/g, '\nНомер закупки:')
          .replace(/Наименование объекта закупки:/g, '\nНаименование объекта закупки:')
          .replace(/Описание события:/g, '\nОписание события:')
          .replace(/Дата и время события:/g, '\nДата и время события:')
          .trim(),
        pubDate,
        purchaseNumber: purchaseNum,
        eventDescription,
        status,
        severity
      })
    })

    return parsedItems
  }

  const fetchRSS = async () => {
    if (!purchaseId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://zakupki.gov.ru/epz/order/notice/rss?regNumber=${encodeURIComponent(purchaseId)}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Ошибка: ${response.status}`)
      }

      const xmlText = await response.text()
      const parsedItems = parseRSSXML(xmlText, purchaseId)
      setItems(parsedItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить RSS ленту')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRSS()
  }, [purchaseId])

  const getStatusIcon = (status?: 'violation' | 'risk' | 'ok') => {
    switch (status) {
      case 'violation':
        return <XCircle className="h-5 w-5 text-red-500 fill-red-500" />
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-yellow-500 fill-yellow-500" />
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500 fill-green-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500 fill-green-500" />
    }
  }

  const getStatusBadge = (status?: 'violation' | 'risk' | 'ok', severity?: 'high' | 'medium' | 'low') => {
    if (status === 'violation') {
      return (
        <Badge variant="destructive" className="bg-red-500">
          Нарушение {severity === 'high' ? '(высокое)' : severity === 'medium' ? '(среднее)' : ''}
        </Badge>
      )
    }
    if (status === 'risk') {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          Риск {severity === 'medium' ? '(средний)' : ''}
        </Badge>
      )
    }
    return <Badge className="bg-green-500 hover:bg-green-600">OK</Badge>
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">RSS лента событий</h2>
        <Button
          onClick={fetchRSS}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
          Нет событий для отображения
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                    {getStatusBadge(item.status, item.severity)}
                  </div>
                  <p className="text-sm text-slate-600 mb-2 whitespace-pre-line">{item.description}</p>
                  <div className="text-xs text-slate-400">
                    {formatDateTime(item.pubDate)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}