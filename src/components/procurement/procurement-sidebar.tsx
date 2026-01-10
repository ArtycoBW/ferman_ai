'use client'

import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Lot } from '@/types/api'
import type { SectionType } from '@/app/procurement/[id]/page'

interface ProcurementSidebarProps {
  lots: Lot[]
  activeSection: SectionType
  activeLot: number
  onSectionChange: (section: SectionType) => void
  onLotChange: (lotIndex: number) => void
  analysisEnabled: boolean
}

export function ProcurementSidebar({
  lots,
  activeSection,
  activeLot,
  onSectionChange,
  onLotChange,
  analysisEnabled
}: ProcurementSidebarProps) {
  const isLotSection = activeSection === 'positions' || activeSection === 'requirements'

  const safeLots = Array.isArray(lots) ? lots : []

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-slate-500 mb-3">Структура закупки</h2>
        <nav className="space-y-1">
          <button
            onClick={() => onSectionChange('overview')}
            className={cn(
              'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
              activeSection === 'overview'
                ? 'bg-slate-100 text-slate-900 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            Обзор
          </button>

          {safeLots.map((lot, idx) => (
            <div key={idx}>
              <button
                onClick={() => {
                  onLotChange(idx)
                  if (!isLotSection) onSectionChange('positions')
                }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between',
                  activeLot === idx && isLotSection
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <span>Лот {lot.lotNumber}</span>
                {activeLot === idx && isLotSection ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {activeLot === idx && (
                <div className="ml-3 border-l border-slate-200 pl-3 mt-1 space-y-1">
                  <button
                    onClick={() => {
                      onLotChange(idx)
                      onSectionChange('positions')
                    }}
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                      activeSection === 'positions' && activeLot === idx
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    Позиции
                  </button>
                  <button
                    onClick={() => {
                      onLotChange(idx)
                      onSectionChange('requirements')
                    }}
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                      activeSection === 'requirements' && activeLot === idx
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    Условия участия
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => onSectionChange('documents')}
            className={cn(
              'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
              activeSection === 'documents'
                ? 'bg-slate-100 text-slate-900 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            Документы
          </button>

          <button
            onClick={() => onSectionChange('contacts')}
            className={cn(
              'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
              activeSection === 'contacts'
                ? 'bg-slate-100 text-slate-900 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            Контакты
          </button>

          <button
            onClick={() => analysisEnabled && onSectionChange('analysis')}
            disabled={!analysisEnabled}
            className={cn(
              'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
              activeSection === 'analysis'
                ? 'bg-slate-100 text-slate-900 font-medium'
                : analysisEnabled
                  ? 'text-slate-600 hover:bg-slate-50'
                  : 'text-slate-400 cursor-not-allowed'
            )}
          >
            ИИ анализ
          </button>

          <button
            onClick={() => onSectionChange('chronology')}
            className={cn(
              'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
              activeSection === 'chronology'
                ? 'bg-slate-100 text-slate-900 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            Хронология
          </button>

          <button
            onClick={() => onSectionChange('rss')}
            className={cn(
              'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
              activeSection === 'rss'
                ? 'bg-slate-100 text-slate-900 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            RSS лента
          </button>
        </nav>
      </div>
    </aside>
  )
}
