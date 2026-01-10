'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  destructive?: boolean
}

const DropdownMenuContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({ open: false, onOpenChange: () => {} })

export function DropdownMenu({ open, onOpenChange, children }: DropdownMenuProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onOpenChange])

  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange }}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const { open, onOpenChange } = React.useContext(DropdownMenuContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => {
        if (typeof onOpenChange === 'function') {
          onOpenChange(!open)
        }
      },
    })
  }

  return (
    <button onClick={() => {
      if (typeof onOpenChange === 'function') {
        onOpenChange(!open)
      }
    }}>
      {children}
    </button>
  )
}

export function DropdownMenuContent({ children, className, align = 'end' }: DropdownMenuContentProps) {
  const { open } = React.useContext(DropdownMenuContext)

  if (!open) return null

  return (
    <div
      className={cn(
        'absolute top-full mt-2 z-50 min-w-[180px] rounded-xl border border-border bg-card p-1.5 shadow-lg',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        align === 'end' && 'right-0',
        align === 'start' && 'left-0',
        align === 'center' && 'left-1/2 -translate-x-1/2',
        className
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({ children, onClick, className, destructive }: DropdownMenuItemProps) {
  const { onOpenChange } = React.useContext(DropdownMenuContext)

  return (
    <button
      onClick={() => {
        onClick?.()
        onOpenChange(false)
      }}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
        'hover:bg-secondary focus:bg-secondary focus:outline-none',
        destructive && 'text-destructive hover:bg-destructive/10',
        className
      )}
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-border" />
}