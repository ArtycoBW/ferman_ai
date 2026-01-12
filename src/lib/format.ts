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

function parseAnyDateToTs(input?: string): number | null {
  if (!input) return null
  const s = input.trim()
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (m) {
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4] || 0), Number(m[5] || 0), Number(m[6] || 0))
    const ts = d.getTime()
    return Number.isNaN(ts) ? null : ts
  }
  const isoTs = Date.parse(s)
  return Number.isNaN(isoTs) ? null : isoTs
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
  if (totalHours <= 48) {
    colorClass = 'text-orange-500'
  } else if (days <= 7) {
    colorClass = 'text-amber-500'
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
