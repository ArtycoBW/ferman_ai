'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  side?: 'left' | 'right'
}

export function Sheet({ open, onOpenChange, children, side = 'right' }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className={cn('fixed inset-0 z-50 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div
        className={cn(
          'fixed top-0 h-full w-full max-w-md bg-card shadow-xl transition-transform duration-300',
          side === 'right' ? 'right-0' : 'left-0',
          open ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full'
        )}
      >
        {children}
      </div>
    </div>
  )
}

interface SheetHeaderProps {
  children: React.ReactNode
  onClose: () => void
  className?: string
}

export function SheetHeader({ children, onClose, className }: SheetHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between p-4 border-b border-border', className)}>
      <h2 className="text-lg font-semibold">{children}</h2>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

export function SheetContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-4 overflow-auto h-[calc(100%-60px)]', className)}>{children}</div>
}
