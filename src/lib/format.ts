export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value).replace(/\s/g, ' ') + ' ₽'
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatBoolean(value: boolean | null | undefined): string {
  if (value == null) return '—'
  return value ? 'Да' : 'Нет'
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value}%`
}

export function formatCurrencyWithPercent(
  amount: number | null | undefined,
  percent: number | null | undefined
): string {
  if (amount == null && percent == null) return '—'

  const amountStr = amount != null
    ? new Intl.NumberFormat('ru-RU', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount).replace(/\s/g, ' ') + ' ₽'
    : null

  if (amountStr && percent != null) {
    return `${amountStr} (${percent}%)`
  }
  if (amountStr) {
    return amountStr
  }
  if (percent != null) {
    return `${percent}%`
  }
  return '—'
}

export function parseAnyDateToTs(input?: string): number | null {
  if (!input) return null

  const s = input.trim()

  const ruMatch = s.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (ruMatch) {
    const dd = Number(ruMatch[1])
    const mm = Number(ruMatch[2])
    const yyyy = Number(ruMatch[3])
    const hh = ruMatch[4] ? Number(ruMatch[4]) : 0
    const mi = ruMatch[5] ? Number(ruMatch[5]) : 0
    const ss = ruMatch[6] ? Number(ruMatch[6]) : 0

    const d = new Date(yyyy, mm - 1, dd, hh, mi, ss, 0)
    const ts = d.getTime()
    return Number.isNaN(ts) ? null : ts
  }

  const isoTs = Date.parse(s)
  if (!Number.isNaN(isoTs)) return isoTs

  return null
}

export function getDeadlineInfo(dateStr: string | null | undefined, cancelled: boolean) {
  if (cancelled) {
    return { text: 'Закупка отменена', colorClass: 'text-muted-foreground', isExpired: true }
  }

  if (!dateStr) {
    return { text: null, colorClass: 'text-muted-foreground', isExpired: false }
  }

  const targetTs = parseAnyDateToTs(dateStr)
  if (targetTs === null) {
    return { text: null, colorClass: 'text-muted-foreground', isExpired: false }
  }

  const now = Date.now()
  const diff = targetTs - now
  const totalHours = Math.abs(diff) / (1000 * 60 * 60)
  const days = Math.floor(totalHours / 24)
  const hours = Math.floor(totalHours % 24)

  if (diff <= 0) {
    const text = days > 0 ? `истекло ${days} дн. ${hours} ч.` : `истекло ${hours} ч.`
    return { text, colorClass: 'text-red-500', isExpired: true }
  }

  let colorClass: string
  if (totalHours <= 24) {
    colorClass = 'text-orange-500'
  } else {
    colorClass = 'text-green-500'
  }

  const text = days > 0 ? `осталось ${days} дн. ${hours} ч.` : `осталось ${hours} ч.`
  return { text, colorClass, isExpired: false }
}

export function getContactFullName(contactPerson: { lastName: string | null; firstName: string | null; middleName: string | null } | null): string {
  if (!contactPerson) return '—'
  return [contactPerson.lastName, contactPerson.firstName, contactPerson.middleName].filter(Boolean).join(' ') || '—'
}

export function formatFileSize(sizeStr: string | null | undefined): string {
  if (!sizeStr) return '—'
  const size = parseInt(sizeStr, 10)
  if (isNaN(size)) return sizeStr

  if (size < 1024) return `${size} Б`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} КБ`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} МБ`
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} ГБ`
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatRuDateTime(input?: string | null): string {
  if (!input) return '—'

  const ts = parseAnyDateToTs(input)
  if (ts == null) return input.trim()

  const d = new Date(ts)
  const datePart = `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0

  if (!hasTime) return datePart
  return `${datePart} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function formatRuDate(input?: string | null): string {
  if (!input) return '—'

  const ts = parseAnyDateToTs(input)
  if (ts == null) return input.trim()

  const d = new Date(ts)
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`
}
