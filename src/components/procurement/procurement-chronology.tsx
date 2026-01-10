'use client'

import { formatDateTime } from '@/lib/format'

interface ProcurementChronologyProps {
  chronology: Record<string, unknown>[]
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
      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
        {chronology.map((event, idx) => (
          <div key={idx} className="p-4 flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-900">
                {String(event.event || event.type || 'Событие')}
              </div>
              {event.date && (
                <div className="text-xs text-slate-500 mt-1">
                  {formatDateTime(String(event.date))}
                </div>
              )}
              {event.description && (
                <div className="text-sm text-slate-600 mt-2">
                  {String(event.description)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
