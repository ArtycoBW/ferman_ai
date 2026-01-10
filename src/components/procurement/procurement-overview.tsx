'use client'

import { useState } from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { formatCurrency, formatDateTime, formatDate, formatBoolean, getDeadlineInfo, formatPercent } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import type { ProcurementBody } from '@/types/api'

interface ProcurementOverviewProps {
  procurement: ProcurementBody
}

function KPICard({ label, fieldName, value, subValue, colorClass }: { 
  label: string
  fieldName: string
  value: string
  subValue?: string
  colorClass?: string 
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="text-xs text-slate-500 mb-1">
        {label} <span className="text-slate-400">({fieldName})</span>
      </div>
      <div className={`text-lg font-semibold ${colorClass || 'text-slate-900'}`}>{value}</div>
      {subValue && <div className={`text-xs mt-1 ${colorClass || 'text-slate-500'}`}>{subValue}</div>}
    </div>
  )
}

function InfoRow({ label, fieldName, value }: { label: string; fieldName: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">
        {label} <span className="text-slate-400 text-xs">({fieldName})</span>
      </span>
      <span className="text-sm text-slate-900 font-medium">{value}</span>
    </div>
  )
}

export function ProcurementOverview({ procurement }: ProcurementOverviewProps) {
  const [copied, setCopied] = useState(false)

  const deadlineInfo = getDeadlineInfo(procurement.procedureInfo.end, procurement.cancelled)
  const lot = procurement.lots?.lot?.[0]
  const customer = lot?.customers?.customer?.[0]
  const enforcement = customer?.enforcement

  const hasPreferences = lot?.preferences?.preferense && lot.preferences.preferense.length > 0
  const hasAdditionalRequirements = procurement.computed.hasAdditionalRequirements

  const handleCopy = async () => {
    await navigator.clipboard.writeText(procurement.purchaseNumber)
    setCopied(true)
    toast({ title: 'Скопировано' })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Procurement Info Block */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="bg-amber-400 text-amber-900 px-3 py-2 rounded-md text-sm font-medium mb-3">
          {procurement.placingWay}
          <span className="text-amber-700 text-xs ml-2">(placingWay)</span>
        </div>

        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          {procurement.purchaseObjectInfo}
          <span className="text-slate-400 text-xs font-normal ml-2">(purchaseObjectInfo)</span>
        </h2>

        <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 font-mono text-xs hover:bg-slate-200 transition-colors"
          >
            {procurement.purchaseNumber}
            <span className="text-slate-400">(purchaseNumber)</span>
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
          </button>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-xs">
            {procurement.ETP} <span className="text-slate-400">(ETP)</span>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-xs">
            {procurement.stage} <span className="text-slate-400">(stage)</span>
          </span>
          {procurement.region && (
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-xs">
              {procurement.region} <span className="text-slate-400">(region)</span>
            </span>
          )}
        </div>

        <Button variant="outline" size="sm" className='hover:text-black' asChild >
          <a href={procurement.href} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Открыть в ЕИС
            <span className="text-slate-400 text-xs ml-1">(href)</span>
          </a>
        </Button>
      </div>

      {/* KPI Cards - 2 rows of 4 */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="НМЦК"
          fieldName="fullNMCK"
          value={formatCurrency(procurement.fullNMCK)}
        />
        <KPICard
          label="Дедлайн подачи"
          fieldName="procedureEnd"
          value={formatDateTime(procurement.procedureInfo.end)}
          subValue={deadlineInfo.text}
          colorClass={deadlineInfo.colorClass}
        />
        <KPICard
          label="Обеспечение заявки"
          fieldName="applicationGuaranteeAmount, applicationGuaranteePart"
          value={formatCurrency(enforcement?.applicationGuaranteeAmount)}
          subValue={enforcement?.applicationGuaranteePart ? `(${enforcement.applicationGuaranteePart}%)` : undefined}
        />
        <KPICard
          label="Обеспечение исполнения"
          fieldName="contractGuaranteeAmount, contractGuaranteePart"
          value={formatCurrency(enforcement?.contractGuaranteeAmount)}
          subValue={enforcement?.contractGuaranteePart ? `(${enforcement.contractGuaranteePart}%)` : undefined}
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Обеспечение гарант. обяз."
          fieldName="contractProvisionWarrantyAmount, contractProvisionWarrantyPart"
          value={formatCurrency(enforcement?.contractProvisionWarrantyAmount)}
          subValue={enforcement?.contractProvisionWarrantyPart ? `(${enforcement.contractProvisionWarrantyPart}%)` : undefined}
        />
        <KPICard
          label="Документы"
          fieldName="documentsCount"
          value={String(procurement.computed.documentsCount)}
        />
        <KPICard
          label="Позиции"
          fieldName="purchase_objects"
          value={String(procurement.computed.positionsCount)}
        />
        <KPICard
          label="Казначейское сопровождение"
          fieldName="customerTreasurySupportContractRequired"
          value={formatBoolean(customer?.treasurySupportContractRequired)}
        />
      </div>

      {/* Что важно */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Что важно</h3>
        </div>
        <div className="grid md:grid-cols-2 divide-x divide-slate-100">
          {/* Сроки */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-slate-500 mb-3">Сроки</h4>
            <div>
              <InfoRow 
                label="Начало подачи" 
                fieldName="procedureStart" 
                value={formatDateTime(procurement.procedureInfo.start)} 
              />
              {procurement.procedureInfo.secondPartsDate && (
                <InfoRow 
                  label="Рассмотрение 2-х частей" 
                  fieldName="procedureSecondPartsDate" 
                  value={formatDate(procurement.procedureInfo.secondPartsDate)} 
                />
              )}
              {procurement.procedureInfo.summarizingDate && (
                <InfoRow 
                  label="Подведение итогов" 
                  fieldName="procedureSummarizingDate" 
                  value={formatDate(procurement.procedureInfo.summarizingDate)} 
                />
              )}
              {(procurement.procedureInfo.deliveryTermStart || procurement.procedureInfo.deliveryTermEnd) && (
                <InfoRow
                  label="Период выполнения"
                  fieldName="deliveryTermStart, deliveryTermEnd"
                  value={`${formatDate(procurement.procedureInfo.deliveryTermStart)} — ${formatDate(procurement.procedureInfo.deliveryTermEnd)}`}
                />
              )}
            </div>
          </div>

          {/* Участие */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-slate-500 mb-3">Участие</h4>
            <div>
              <InfoRow 
                label="СМП/СОНКО" 
                fieldName="lotSmp" 
                value={lot?.lotSmp ? 'применяется' : 'не применяется'} 
              />
              <InfoRow 
                label="Субподрядчики СМП/СОНКО" 
                fieldName="lotSubContractors" 
                value={formatBoolean(lot?.lotSubContractors)} 
              />
              <InfoRow 
                label="Аванс" 
                fieldName="customerAdvanceSumPercents" 
                value={customer?.advanceSumPercents != null ? `${customer.advanceSumPercents}%` : '—'} 
              />
              <InfoRow 
                label="За счет собственных средств" 
                fieldName="customerSelfFunds" 
                value={formatBoolean(customer?.selfFunds)} 
              />
              <InfoRow 
                label="Обязат. публичное обсуждение" 
                fieldName="customerMustPublicDiscussion" 
                value={formatBoolean(customer?.mustPublicDiscussion)} 
              />
              <InfoRow 
                label="Преференции" 
                fieldName="benefits[]" 
                value={hasPreferences ? 'Не указаны' : 'Не указаны'} 
              />
              <InfoRow 
                label="Количество по позициям" 
                fieldName="purchaseObjectsQuantityUndefined" 
                value="указано" 
              />
              <InfoRow 
                label="Доп. требования" 
                fieldName="customer_requirements[].addRequirementCode" 
                value={hasAdditionalRequirements ? 'есть (см. Условия участия)' : 'нет'} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
