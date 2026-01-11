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

      // Extract event description from description
      const eventMatch = description.match(/<strong>Описание события:<\/strong>\s*([^<]+)/)
      const eventDescription = eventMatch ? eventMatch[1].trim() : ''

      // Determine status based on event description
      let status: 'violation' | 'risk' | 'ok' = 'ok'
      let severity: 'high' | 'medium' | 'low' = 'low'

      // Check for keywords that indicate status
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
      // Due to CORS, we'll use mock data that matches the real RSS structure
      // In production, this should go through a backend proxy
      const mockXML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Портал госзакупок</title>
<link>/epz/main/public/</link>
<description>Официальный сайт Российской Федерации для размещения информации о размещении заказов</description>
<item>
<title>Извещение № ${purchaseId}</title>
<description><strong>Номер закупки: </strong>${purchaseId}<br/><strong>Наименование объекта закупки: </strong>Оказание услуг специализированной организацией<br/><strong>Описание события: </strong>Размещен протокол № ${purchaseId}-01. Извещение о закупке. Способ закупки: Закупка у единственного поставщика.<br/><strong>Дата и время события: </strong>09.01.2026<br/><br/></description>
<pubDate>Thu, 09 Jan 2026 10:00:00 GMT</pubDate>
</item>
<item>
<title>Извещение № ${purchaseId}</title>
<description><strong>Номер закупки: </strong>${purchaseId}<br/><strong>Наименование объекта закупки: </strong>Оказание услуг специализированной организацией<br/><strong>Описание события: </strong>Закупка переведена на этап «Закупка завершена» с этапа «Работа комиссии»<br/><strong>Дата и время события: </strong>09.01.2026<br/><br/></description>
<pubDate>Thu, 09 Jan 2026 09:30:00 GMT</pubDate>
</item>
<item>
<title>Извещение № ${purchaseId}</title>
<description><strong>Номер закупки: </strong>${purchaseId}<br/><strong>Наименование объекта закупки: </strong>Оказание услуг специализированной организацией<br/><strong>Описание события: </strong>Закупка переведена на этап «Работа комиссии» с этапа «Формирование извещения»<br/><strong>Дата и время события: </strong>08.01.2026<br/><br/></description>
<pubDate>Wed, 08 Jan 2026 14:20:00 GMT</pubDate>
</item>
<item>
<title>Извещение № ${purchaseId}</title>
<description><strong>Номер закупки: </strong>${purchaseId}<br/><strong>Наименование объекта закупки: </strong>Оказание услуг специализированной организацией<br/><strong>Описание события: </strong>Размещено извещение о закупке (приглашение) № ${purchaseId}. Способ закупки: Закупка у единственного поставщика.<br/><strong>Дата и время события: </strong>08.01.2026<br/><br/></description>
<pubDate>Wed, 08 Jan 2026 12:00:00 GMT</pubDate>
</item>
</channel>
</rss>`

      const parsedItems = parseRSSXML(mockXML, purchaseId)
      setItems(parsedItems)
    } catch (err) {
      setError('Не удалось загрузить RSS ленту')
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