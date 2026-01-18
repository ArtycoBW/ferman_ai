'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { useProcurementBody, useTaskResult, useTaskAnalysis } from '@/hooks/use-api'
import { ProcurementHeader } from '@/components/procurement/procurement-header'
import { ProcurementSidebar } from '@/components/procurement/procurement-sidebar'
import { ProcurementOverview } from '@/components/procurement/procurement-overview'
import { LotObjectsPanel } from '@/components/dashboard/LotObjectsPanel'
import { LotParticipationPanel } from '@/components/dashboard/LotParticipationPanel'
import { ProcurementDocuments } from '@/components/procurement/procurement-documents'
import { ProcurementContacts } from '@/components/procurement/procurement-contacts'
import { AnalysisResults } from '@/components/procurement/analysis-results'
import { AnalysisStatus } from '@/components/procurement/analysis-status'
import { ProcurementChronology } from '@/components/procurement/procurement-chronology'
import { ProcurementRSS } from '@/components/procurement/procurement-rss'
import { Loader2 } from 'lucide-react'
import type { ProcurementBody } from '@/types/api'

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
  const fromHome = searchParams.get('from') === 'home'

  const useTaskResultForBody = !!taskId && !fromHome
  const { data: taskResultData, isLoading: taskResultLoading, error: taskResultError } = useTaskResult(taskId, useTaskResultForBody)
  const { data: procurementBodyData, isLoading: procurementBodyLoading, error: procurementBodyError } = useProcurementBody(purchaseId, !useTaskResultForBody)
  const { data: analysisData, isLoading: analysisLoading } = useTaskAnalysis(taskId, !!taskId)

  const procurement = useTaskResultForBody ? (taskResultData as unknown as ProcurementBody) : procurementBodyData
  const procurementLoading = useTaskResultForBody ? taskResultLoading : procurementBodyLoading
  const procurementError = useTaskResultForBody ? taskResultError : procurementBodyError

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

  const analysisStatus = analysisData?.analysis_status
  const analysisCompleted = analysisStatus === 'completed'
  const analysisFailed = analysisStatus === 'failed'
  const analysisInProgress = analysisStatus === 'queued' || analysisStatus === 'running'
  const hasTaskId = !!taskId
  const lots = procurement.lots?.lot || []

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <ProcurementOverview procurement={procurement} />
      case 'positions':
        return lots[activeLot] ? <LotObjectsPanel lot={lots[activeLot]} /> : <div className="text-muted-foreground">Лот не найден</div>
      case 'requirements':
        return lots[activeLot] ? <LotParticipationPanel lot={lots[activeLot]} /> : <div className="text-muted-foreground">Лот не найден</div>
      case 'documents':
        return <ProcurementDocuments attachments={procurement.attachments} />
      case 'contacts':
        return <ProcurementContacts responsibleOrg={procurement.responsibleOrg} lots={lots} />
      case 'analysis':
        if (!hasTaskId) {
          return <div className="text-muted-foreground">Анализ не запущен</div>
        }
        if (analysisLoading) {
          return (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )
        }
        if (analysisFailed) {
          return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-medium">Ошибка анализа</p>
              <p className="text-sm mt-1">{analysisData?.error || 'Не удалось выполнить анализ'}</p>
            </div>
          )
        }
        if (analysisInProgress) {
          return (
            <AnalysisStatus
              status={{
                purchase_id: purchaseId,
                task_id: taskId || '',
                state: analysisData?.state || '',
                analysis_id: analysisData?.analysis_id || 0,
                analysis_status: analysisStatus || 'queued',
                analysis_type: analysisData?.analysis_type || 'fast',
                tokens_spent: analysisData?.tokens_spent || 0,
                result: null,
                error: null,
                callback: null
              }}
              isLoading={analysisLoading}
              error={null}
            />
          )
        }
        if (analysisCompleted && analysisData?.result) {
          return <AnalysisResults result={analysisData.result} taskId={taskId || undefined} />
        }
        return <div className="text-muted-foreground">Анализ не завершён</div>
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
          analysisEnabled={hasTaskId}
          analysisStatus={analysisStatus}
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
