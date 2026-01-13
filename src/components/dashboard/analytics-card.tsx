'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDispatchProcurement } from '@/hooks/use-api'
import { toast } from '@/hooks/use-toast'
import type { AnalysisType } from '@/types/api'

export function AnalyticsCard() {
  const router = useRouter()
  const [purchaseId, setPurchaseId] = useState('')
  
  const dispatchProcurement = useDispatchProcurement()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!purchaseId.trim()) return

    try {
      const analysisType: AnalysisType = 'fast'
      const response = await dispatchProcurement.mutateAsync({
        purchase_id: purchaseId.trim(),
        analysis_type: analysisType,
      })
      toast({ title: 'Аудит запущен' })
      router.push(`/procurement/${response.purchase_id}?task=${response.task_id}&from=home`)
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось запустить аудит',
        variant: 'destructive'
      })
    }
  }

  const isDisabled = !purchaseId.trim() || dispatchProcurement.isPending

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Аналитика закупки из ЕИС</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={purchaseId}
          onChange={(e) => setPurchaseId(e.target.value)}
          placeholder="Например: 0373100000125000001"
          disabled={dispatchProcurement.isPending}
          className="font-mono bg-slate-50 border-slate-200"
        />

        <Button
          type="submit"
          className="w-full bg-slate-400 hover:bg-slate-500 text-white"
          size="lg"
          disabled={isDisabled}
        >
          {dispatchProcurement.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Анализируем...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Аналитика
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
