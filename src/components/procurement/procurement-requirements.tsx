'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/format'
import type { Lot } from '@/types/api'

interface ProcurementRequirementsProps {
  lot: Lot
}

export function ProcurementRequirements({ lot }: ProcurementRequirementsProps) {
  const [expandedReqs, setExpandedReqs] = useState<Set<number>>(new Set())
  const [expandedAddReqs, setExpandedAddReqs] = useState<Set<number>>(new Set())

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

  if (!lot) return null

  const requirements = lot.requirements?.requirement || []
  const preferences = lot.preferences?.preferense || []
  const additionalRequirements = requirements.filter(r => r.addRequirements && r.addRequirements.length > 0)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Условия участия — Лот {lot.lotNumber}</h2>

      {/* Обеспечения */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Обеспечения</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-4 font-medium text-slate-600"></th>
              <th className="text-right py-3 px-4 font-medium text-slate-600">Сумма</th>
              <th className="text-right py-3 px-4 font-medium text-slate-600 w-24">Процент</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-3 px-4">
                <span className="text-slate-900">Обеспечение заявки</span>
                <span className="text-slate-400 text-xs ml-2">(applicationGuaranteeAmount, applicationGuaranteePart)</span>
              </td>
              <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(lot.enforcement.applicationGuaranteeAmount)}</td>
              <td className="py-3 px-4 text-right text-slate-600">{formatPercent(lot.enforcement.applicationGuaranteePart)}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-3 px-4">
                <span className="text-slate-900">Обеспечение исполнения контракта</span>
                <span className="text-slate-400 text-xs ml-2">(contractGuaranteeAmount, contractGuaranteePart)</span>
              </td>
              <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(lot.enforcement.contractGuaranteeAmount)}</td>
              <td className="py-3 px-4 text-right text-slate-600">{formatPercent(lot.enforcement.contractGuaranteePart)}</td>
            </tr>
            <tr>
              <td className="py-3 px-4">
                <span className="text-slate-900">Обеспечение гарантийных обязательств</span>
                <span className="text-slate-400 text-xs ml-2">(contractProvisionWarrantyAmount, contractProvisionWarrantyPart)</span>
              </td>
              <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(lot.enforcement.contractProvisionWarrantyAmount)}</td>
              <td className="py-3 px-4 text-right text-slate-600">{formatPercent(lot.enforcement.contractProvisionWarrantyPart)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Требования к участнику (ЕИС) */}
      {requirements.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">Требования к участнику (ЕИС)</h3>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{requirements.length}</span>
            <span className="text-slate-400 text-xs">(requirements[])</span>
          </div>
          <div className="divide-y divide-slate-100">
            {requirements.map((req, idx) => (
              <div key={idx}>
                <button
                  onClick={() => toggleReq(idx)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <span className="text-sm text-slate-900">{req.name}</span>
                    <span className="text-slate-400 text-xs ml-2">(requirements[].requirementName)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{req.code}</span>
                    <span className="text-slate-400 text-xs">(requirements[].requirementCode)</span>
                    {expandedReqs.has(idx) ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>
                {expandedReqs.has(idx) && (
                  <div className="px-4 pb-3 ml-4 border-l-2 border-slate-200">
                    {req.content ? (
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{req.content}</p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Не указано (Данных в источнике нет) <span className="text-xs">(requirements[].requirementContent)</span></p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Дополнительные требования / квалификация */}
      {additionalRequirements.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">Дополнительные требования / квалификация</h3>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{additionalRequirements.length}</span>
            <span className="text-slate-400 text-xs">(customer_requirements[])</span>
          </div>
          <div className="divide-y divide-slate-100">
            {additionalRequirements.map((req, idx) => (
              <div key={idx}>
                <button
                  onClick={() => toggleAddReq(idx)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <span className="text-sm text-slate-900">{req.addRequirements?.[0]?.name || req.name}</span>
                    <span className="text-slate-400 text-xs ml-2">(customer_requirements[].addRequirementName)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{req.addRequirements?.[0]?.code || req.code}</span>
                    <span className="text-slate-400 text-xs">(customer_requirements[].addRequirementCode)</span>
                    {expandedAddReqs.has(idx) ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>
                {expandedAddReqs.has(idx) && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="ml-4 border-l-2 border-slate-200 pl-4">
                      <div className="text-xs text-slate-500 mb-1">
                        <span className="text-amber-600">Базовое:</span> {req.code} <span className="text-slate-400">(customer_requirements[].requirementCode)</span> {req.name} <span className="text-slate-400">(customer_requirements[].requirementName)</span>
                      </div>
                      {req.addRequirements?.map((addReq, addIdx) => (
                        <div key={addIdx} className="mt-3 p-3 bg-slate-50 rounded-lg">
                          {addReq.content ? (
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{addReq.content}</p>
                          ) : (
                            <p className="text-sm text-slate-400 italic">Не указано <span className="text-xs">(customer_requirements[].addRequirementContent)</span></p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Субподрядчики СМП/СОНКО */}
      {lot.lotSubContractors && (
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Субподрядчики СМП/СОНКО</h3>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center text-sm py-2 px-3 bg-slate-50 rounded">
              <span className="text-slate-600">Требование привлечения <span className="text-slate-400 text-xs">(lotSubContractors)</span></span>
              <span className="text-slate-900 font-medium">Да</span>
            </div>
            <p className="text-sm text-slate-600 mt-3">
              Требование к поставщику (подрядчику, исполнителю), не являющемуся субъектом малого предпринимательства или социально ориентированной некоммерческой организацией, о привлечении к исполнению контракта субподрядчиков, соисполнителей из числа субъектов малого предпринимательства, социально ориентированных некоммерческих организаций в соответствии с ч. 5 ст. 30 Закона № 44 ФЗ <span className="text-slate-400 text-xs">(requirements[].requirementName)</span>
            </p>
            <p className="text-sm text-slate-400 italic mt-2">
              Не указано (Данных в источнике нет) <span className="text-xs">(requirements[].requirementContent)</span>
            </p>
          </div>
        </div>
      )}

      {/* Преференции */}
      {preferences.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Преференции / ограничения</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {preferences.map((pref, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm py-3 px-4">
                <span className="text-slate-900">{pref.name}</span>
                <div className="flex items-center gap-2">
                  {pref.value && <span className="text-slate-600">{pref.value}</span>}
                  <span className="text-xs text-slate-400">{pref.code}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
