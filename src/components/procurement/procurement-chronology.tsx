'use client'

interface ChronologyEvent {
  fieldName?: string
  date?: string
  title?: string
  event?: string
  type?: string
  description?: string
  eventType?: string
  eventName?: string
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

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function parseAnyDateToTs(input?: string): number | null {
  if (!input) return null

  const s = input.trim()

  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (m) {
    const dd = Number(m[1])
    const mm = Number(m[2])
    const yyyy = Number(m[3])
    const hh = m[4] ? Number(m[4]) : 0
    const mi = m[5] ? Number(m[5]) : 0
    const ss = m[6] ? Number(m[6]) : 0

    const d = new Date(yyyy, mm - 1, dd, hh, mi, ss, 0)
    const ts = d.getTime()
    return Number.isNaN(ts) ? null : ts
  }

  const isoTs = Date.parse(s)
  if (!Number.isNaN(isoTs)) return isoTs

  return null
}

function formatRuDateTime(input?: string): string {
  const ts = parseAnyDateToTs(input)
  if (ts == null) return input?.trim?.() || ''

  const d = new Date(ts)
  const datePart = `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0

  if (!hasTime) return datePart
  return `${datePart} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function ProcurementChronology({ chronology }: ProcurementChronologyProps) {
  const normalized = (chronology || [])
    .map((e, idx) => {
      const type = (e.eventType as string) || e.fieldName || e.type || ''
      const name =
        (e.eventName as string) ||
        e.title ||
        e.event ||
        (type ? fieldNameLabels[type] : undefined) ||
        'Событие'

      const dateRaw = e.date
      const ts = parseAnyDateToTs(dateRaw)
      const dateLabel = formatRuDateTime(dateRaw)

      return {
        key: `${type || 'event'}-${dateRaw || 'nodate'}-${idx}`,
        type,
        name,
        dateRaw,
        dateLabel,
        ts,
        description: e.description,
      }
    })
    .sort((a, b) => {
      const at = a.ts ?? Number.POSITIVE_INFINITY
      const bt = b.ts ?? Number.POSITIVE_INFINITY
      if (at !== bt) return at - bt
      return a.key.localeCompare(b.key)
    })

  if (!normalized.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Хронология событий пуста</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Хронология</h2>

      <div className="relative">
        <div className="absolute left-[5px] top-1 bottom-0 w-[2px] bg-border" />

        <div className="space-y-3">
          {normalized.map((event) => (
            <div key={event.key} className="relative flex items-start gap-4">
              <div className="relative z-10 mt-7 h-3 w-3 shrink-0 rounded-full bg-primary" />

              <div className="flex-1 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
                <div className="text-sm text-muted-foreground">
                  {event.dateLabel}
                </div>

                <div className="mt-1 text-base font-semibold text-foreground">{event.name}</div>

                {event.description ? (
                  <div className="mt-2 text-sm text-muted-foreground">{event.description}</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}