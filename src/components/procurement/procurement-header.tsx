'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, History, Star, User, Settings, LogOut, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/layout/logo'
import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HistorySidebar } from '@/components/dashboard/history-sidebar'
import { FavoritesSidebar } from '@/components/dashboard/favorites-sidebar'
import { SettingsDialog } from '@/components/dashboard/settings-dialog'
import { TariffsDialog } from '@/components/dashboard/tariffs-dialog'

interface ProcurementHeaderProps {
  analysisCompleted?: boolean
}

export function ProcurementHeader({ analysisCompleted }: ProcurementHeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showHistory, setShowHistory] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tariffsOpen, setTariffsOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/auth')
  }

  return (
    <>
      <header className="w-full px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Logo />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">История</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowFavorites(true)}>
            <Star className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Избранное</span>
          </Button>
          <div className="flex items-center gap-1.5 text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Online
          </div>
          <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {user?.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Настройки
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTariffsOpen(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Тарифы
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} destructive>
                <LogOut className="h-4 w-4 mr-2" />
                Выход
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <HistorySidebar open={showHistory} onOpenChange={setShowHistory} />
      <FavoritesSidebar open={showFavorites} onOpenChange={setShowFavorites} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <TariffsDialog open={tariffsOpen} onOpenChange={setTariffsOpen} />
    </>
  )
}
