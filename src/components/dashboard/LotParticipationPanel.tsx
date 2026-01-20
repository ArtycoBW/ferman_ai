'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp } from "lucide-react"
import { formatCurrencyWithPercent } from "@/lib/format"
import type { Lot } from "@/types/api"

interface LotParticipationPanelProps {
  lot: Lot
}

export const LotParticipationPanel = ({ lot }: LotParticipationPanelProps) => {
  const [expandedReqs, setExpandedReqs] = useState<Set<number>>(new Set())
  const [expandedAddReqs, setExpandedAddReqs] = useState<Set<number>>(new Set())

  if (!lot) return null

  const toggleReq = (idx: number) => {
    setExpandedReqs(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const toggleAddReq = (idx: number) => {
    setExpandedAddReqs(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const requirements = lot.requirements?.requirement || []
  const preferences = lot.preferenses?.preferense || []
  const customers = lot.customers?.customer || []
  const enforcement = customers[0]?.enforcement
  const additionalRequirements = requirements.filter(
    r => r.addRequirements && r.addRequirements.length > 0
  )

  const computedApplicationAmount = enforcement?.applicationGuaranteeAmount ?? null
  const computedContractAmount = enforcement?.contractGuaranteeAmount ?? null
  const computedWarrantyAmount = enforcement?.contractProvisionWarrantyAmount ?? null

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Условия участия — Лот {lot.lotNumber}
      </h2>

      {enforcement && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Обеспечения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Вид обеспечения</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4 font-medium text-slate-900">Обеспечение заявки</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {formatCurrencyWithPercent(computedApplicationAmount, enforcement.applicationGuaranteePart)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4 font-medium text-slate-900">Обеспечение исполнения контракта</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {formatCurrencyWithPercent(computedContractAmount, enforcement.contractGuaranteePart)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-900">Обеспечение гарантийных обязательств</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {formatCurrencyWithPercent(computedWarrantyAmount, enforcement.contractProvisionWarrantyPart)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {requirements.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Требования к участнику (ЕИС)
              <Badge variant="secondary" className="text-xs">{requirements.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requirements.map((req, idx) => (
                <div key={idx} className="border rounded-lg">
                  <button
                    onClick={() => toggleReq(idx)}
                    className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-900">{req.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{req.code}</Badge>
                    </div>
                    {expandedReqs.has(idx) ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                  {expandedReqs.has(idx) && (
                    <div className="px-3 pb-3 text-sm text-slate-600 border-l-2 border-primary/30 ml-3 whitespace-pre-wrap">
                      {req.content || (
                        <span className="italic text-slate-400">
                          Не указано (данных в источнике нет)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {additionalRequirements.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Дополнительные требования / квалификация
              <Badge variant="secondary" className="text-xs">{additionalRequirements.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {additionalRequirements.map((req, idx) => (
                <div key={idx} className="border rounded-lg">
                  <button
                    onClick={() => toggleAddReq(idx)}
                    className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-900">
                        {req.addRequirements && req.addRequirements[0]?.name ? req.addRequirements[0].name : req.name}
                      </span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {req.addRequirements && req.addRequirements[0]?.code ? req.addRequirements[0].code : req.code}
                      </Badge>
                    </div>
                    {expandedAddReqs.has(idx) ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                  {expandedAddReqs.has(idx) && (
                    <div className="px-3 pb-3">
                      <div className="text-xs text-slate-500 mb-2 p-2 bg-slate-50 rounded">
                        <span className="font-medium">Базовое: </span>
                        {req.code} {req.name}
                      </div>
                      {req.addRequirements?.map((addReq, addIdx) => (
                        <div key={addIdx} className="text-sm text-slate-600 border-l-2 border-primary/30 pl-3 whitespace-pre-wrap">
                          {addReq.content || (
                            <span className="italic text-slate-400">
                              Не указано (данных в источнике нет)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {lot.lotSubContractors && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Субподрядчики СМП/СОНКО</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center text-sm py-2 px-3 bg-slate-50 rounded">
              <span className="text-slate-600">Требование привлечения</span>
              <span className="text-slate-900 font-medium">Да</span>
            </div>
            <p className="text-sm text-slate-600 mt-3">
              Требование к поставщику (подрядчику, исполнителю), не являющемуся субъектом малого
              предпринимательства или социально ориентированной некоммерческой организацией,
              о привлечении к исполнению контракта субподрядчиков, соисполнителей из числа
              субъектов малого предпринимательства, социально ориентированных некоммерческих
              организаций в соответствии с ч. 5 ст. 30 Закона № 44 ФЗ
            </p>
          </CardContent>
        </Card>
      )}

      {preferences.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Преференции / ограничения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 rounded-lg border overflow-hidden">
              {preferences.map((pref, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-3 px-4 even:bg-slate-50">
                  <span className="text-slate-900">{pref.name || '—'}</span>
                  <div className="flex items-center gap-2">
                    {pref.value && <span className="text-slate-600">{pref.value}</span>}
                    <span className="text-xs text-slate-400">{pref.code}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
