'use client'

import { formatDateTime } from '@/lib/format'

interface ChronologyEvent {
  fieldName?: string
  date?: string
  title?: string
  event?: string
  type?: string
  description?: string
  [key: string]: unknown
}

interface ProcurementChronologyProps {
  chronology: ChronologyEvent[]
}

const fieldNameLabels: Record<string, string> = {
  firstPublishDate: 'Первая публикация',
  docPublishDate: 'Публикация документации',
  procedureStart: 'Начало подачи заявок',
  procedureEnd: 'Окончание подачи заявок',
  procedureSecondPartsDate: 'Рассмотрение вторых частей',
  procedureSummarizingDate: 'Подведение итогов',
  deliveryTermStart: 'Начало выполнения работ',
  deliveryTermEnd: 'Окончание выполнения работ',
}

export function ProcurementChronology({ chronology }: ProcurementChronologyProps) {
  if (!chronology || chronology.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-500">Хронология событий пуста</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Хронология</h2>
      
      <div className="relative">
        {/* Вертикальная линия */}
        <div className="absolute left-[5px] top-4 bottom-4 w-[2px] bg-slate-200" />
        
        <div className="space-y-2">
          {chronology.map((event, idx) => {
            const fieldName = event.fieldName || event.type || ''
            const title = event.title || event.event || fieldNameLabels[fieldName] || 'Событие'
            const date = event.date

            return (
              <div key={idx} className="relative flex items-start gap-4">
                {/* Точка на линии */}
                <div className="relative z-10 w-3 h-3 rounded-full bg-[#1e3a5f] mt-4 shrink-0" />
                
                {/* Карточка события */}
                <div className="flex-1 bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                  {date && (
                    <div className="text-sm text-slate-500">
                      {formatDateTime(date)}
                      {fieldName && (
                        <span className="text-slate-400 ml-1">({fieldName})</span>
                      )}
                    </div>
                  )}
                  <div className="text-base font-semibold text-slate-900 mt-1">
                    {title}
                  </div>
                  {event.description && (
                    <div className="text-sm text-slate-600 mt-2">
                      {event.description}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
