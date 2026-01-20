'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { getContactFullName } from '@/lib/format'
import type { ResponsibleOrg, Lot } from '@/types/api'

interface ProcurementContactsProps {
  responsibleOrg: ResponsibleOrg
  lots: Lot[]
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    toast({ title: 'Скопировано' })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 hover:bg-slate-100 rounded transition-colors"
      title="Копировать"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
    </button>
  )
}

function ContactRow({ label, value, fieldName, copyable = false }: { label: string; value: string | null; fieldName: string; copyable?: boolean }) {
  if (!value) return null
  return (
    <div className="flex items-start py-2">
      <div className="w-32 text-sm text-slate-500 shrink-0">
        {label}

      </div>
      <div className="flex-1 text-sm text-slate-900 flex items-center gap-2">
        {value}
        {copyable && <CopyButton value={value} />}
      </div>
    </div>
  )
}

export function ProcurementContacts({ responsibleOrg, lots }: ProcurementContactsProps) {
  const safeLots = Array.isArray(lots) ? lots : []
  const customers = safeLots.flatMap(lot => lot.customers?.customer || [])
  const uniqueCustomers = customers.filter(
    (customer, index, self) =>
      index === self.findIndex(c => c.inn === customer.inn && c.kpp === customer.kpp)
  )

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Контакты</h2>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="text-sm text-slate-500">Организация размещения</div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 mb-4">
            {responsibleOrg.fullName}
          </h3>
          
          <div className="space-y-1">
            <ContactRow label="ИНН" value={responsibleOrg.inn} fieldName="responsibleOrgInn" />
            <ContactRow label="КПП" value={responsibleOrg.kpp} fieldName="responsibleOrgKpp" />
            <ContactRow label="Адрес" value={responsibleOrg.factAddress} fieldName="responsibleOrgFactAddress" />
            
            {responsibleOrg.contactPerson && getContactFullName(responsibleOrg.contactPerson) !== '—' && (
              <div className="flex items-start py-2">
                <div className="w-32 text-sm text-slate-500 shrink-0">
                  Контактное лицо:
                </div>
                <div className="flex-1 text-sm text-slate-900">
                  <span className="font-medium">{getContactFullName(responsibleOrg.contactPerson)}</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-6 pt-2">
              {responsibleOrg.contactEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <a href={`mailto:${responsibleOrg.contactEmail}`} className="text-primary hover:underline">
                    {responsibleOrg.contactEmail}
                  </a>
                  <CopyButton value={responsibleOrg.contactEmail} />
                </div>
              )}
              {responsibleOrg.contactPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <a href={`tel:${responsibleOrg.contactPhone}`} className="text-primary hover:underline">
                    {responsibleOrg.contactPhone}
                  </a>
                  <CopyButton value={responsibleOrg.contactPhone} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {uniqueCustomers.map((customer, idx) => (
        <div key={idx} className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="text-sm text-slate-500">Заказчик</div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-slate-900 mb-4">
              {customer.fullName}
            </h3>
            
            <div className="space-y-1">
              <ContactRow label="ИНН" value={customer.inn} fieldName="customerInn" />
              <ContactRow label="КПП" value={customer.kpp} fieldName="customerKpp" />
              {customer.ogrn && <ContactRow label="ОГРН" value={customer.ogrn} fieldName="customerOgrn" />}
              {customer.factualAddress && <ContactRow label="Факт. адрес" value={customer.factualAddress} fieldName="customerFactualAddress" />}
              {customer.postalAddress && <ContactRow label="Почт. адрес" value={customer.postalAddress} fieldName="customerPostalAddress" />}
              
              {customer.contactPerson && getContactFullName(customer.contactPerson) !== '—' && (
                <div className="flex items-start py-2">
                  <div className="w-32 text-sm text-slate-500 shrink-0">
                    Контактное лицо:
                  </div>
                  <div className="flex-1 text-sm text-slate-900">
                    <span className="font-medium">{getContactFullName(customer.contactPerson)}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-6 pt-2 flex-wrap">
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                      {customer.email}
                    </a>
                    <CopyButton value={customer.email} />
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <a href={`tel:${customer.phone}`} className="text-primary hover:underline">
                      {customer.phone}
                    </a>
                    <CopyButton value={customer.phone} />
                  </div>
                )}
                {customer.fax && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    Факс: {customer.fax}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
