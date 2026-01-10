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

export function getDeadlineInfo(dateStr: string | null | undefined, cancelled: boolean) {
  if (!dateStr) {
    return { text: '—', colorClass: 'text-muted-foreground', isExpired: false }
  }

  if (cancelled) {
    return { text: 'Закупка отменена', colorClass: 'text-muted-foreground', isExpired: true }
  }

  const targetDate = new Date(dateStr)
  if (isNaN(targetDate.getTime())) {
    return { text: dateStr, colorClass: 'text-muted-foreground', isExpired: false }
  }

  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()
  const totalHours = diff / (1000 * 60 * 60)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((Math.abs(diff) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (diff <= 0) {
    const hoursAgo = Math.abs(Math.floor(totalHours))
    return {
      text: `Истекло: ${hoursAgo} ч назад`,
      colorClass: 'text-red-500',
      isExpired: true
    }
  }

  let colorClass: string
  if (totalHours <= 48) {
    colorClass = 'text-orange-500'
  } else if (days <= 7) {
    colorClass = 'text-amber-500'
  } else {
    colorClass = 'text-green-500'
  }

  const text = days > 0 ? `Осталось: ${days} дн. ${hours} ч.` : `Осталось: ${hours} ч.`

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
