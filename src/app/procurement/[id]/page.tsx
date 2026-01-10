'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { useProcurementBody, useStatus, useTaskResult } from '@/hooks/use-api'
import { ProcurementHeader } from '@/components/procurement/procurement-header'
import { ProcurementSidebar } from '@/components/procurement/procurement-sidebar'
import { ProcurementOverview } from '@/components/procurement/procurement-overview'
import { LotObjectsPanel } from '@/components/dashboard/LotObjectsPanel'
import { LotParticipationPanel } from '@/components/dashboard/LotParticipationPanel'
import { ProcurementDocuments } from '@/components/procurement/procurement-documents'
import { ProcurementContacts } from '@/components/procurement/procurement-contacts'
import { AnalysisResults } from '@/components/procurement/analysis-results'
import { ProcurementChronology } from '@/components/procurement/procurement-chronology'
import { ProcurementRSS } from '@/components/procurement/procurement-rss'
import { Loader2 } from 'lucide-react'

export type SectionType = 'overview' | 'positions' | 'requirements' | 'documents' | 'contacts' | 'analysis' | 'chronology' | 'rss'

export default function ProcurementPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [activeSection, setActiveSection] = useState<SectionType>('overview')
  const [activeLot, setActiveLot] = useState(0)

  const purchaseId = params.id as string
  const taskId = searchParams.get('task')

  const { data: procurement, isLoading: procurementLoading, error: procurementError } = useProcurementBody(purchaseId)
  const { data: status } = useStatus(purchaseId, !!taskId)
  const { data: taskResult } = useTaskResult(
    status?.task_id || taskId,
    status?.analysis_status === 'completed'
  )

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading || procurementLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (procurementError) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Ошибка загрузки</h1>
            <p className="text-muted-foreground">{procurementError.message}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!procurement) {
    return null
  }

  const analysisCompleted = status?.analysis_status === 'completed'
  const lots = procurement.lots?.lot || []

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <ProcurementOverview procurement={procurement} />
      case 'positions':
        return <LotObjectsPanel lot={lots[activeLot]} />
      case 'requirements':
        return <LotParticipationPanel lot={lots[activeLot]} />
      case 'documents':
        return <ProcurementDocuments attachments={procurement.attachments} />
      case 'contacts':
        return <ProcurementContacts responsibleOrg={procurement.responsibleOrg} lots={lots} />
      case 'analysis':
        return taskResult?.result ? <AnalysisResults result={taskResult.result} /> : <div className="text-muted-foreground">Анализ не завершён</div>
      case 'chronology':
        return <ProcurementChronology chronology={procurement.computed.chronology} />
      case 'rss':
        return <ProcurementRSS purchaseId={purchaseId} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ProcurementHeader analysisCompleted={analysisCompleted} />
      <div className="flex flex-1">
        <ProcurementSidebar
          lots={lots}
          activeSection={activeSection}
          activeLot={activeLot}
          onSectionChange={setActiveSection}
          onLotChange={setActiveLot}
          analysisEnabled={analysisCompleted}
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
