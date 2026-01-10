'use client'

import { Logo } from '@/components/layout/logo'

export function Header() {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 relative z-20">
      <Logo />
      <div className="flex items-center gap-1.5 text-sm text-green-600">
        <span className="w-2 h-2 bg-green-500 rounded-full" />
        Online
      </div>
    </header>
  )
}
