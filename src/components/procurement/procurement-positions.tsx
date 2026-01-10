'use client'

import { formatCurrency } from '@/lib/format'
import type { Lot } from '@/types/api'

interface ProcurementPositionsProps {
  lot: Lot
}

export function ProcurementPositions({ lot }: ProcurementPositionsProps) {
  if (!lot) return null

  const purchaseObjects = lot.purchaseObjects?.purchaseObject || []
  const customers = lot.customers?.customer || []

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Позиции — Лот {lot.lotNumber}</h2>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 font-medium text-slate-600">№</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Наименование</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">ОКПД2</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">КТРУ</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Ед. изм.</th>
              <th className="text-right py-3 px-4 font-medium text-slate-600">Кол-во</th>
              <th className="text-right py-3 px-4 font-medium text-slate-600">Цена за ед.</th>
              <th className="text-right py-3 px-4 font-medium text-slate-600">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {purchaseObjects.map((obj, idx) => (
              <tr key={idx} className="border-b border-slate-100 last:border-0">
                <td className="py-3 px-4 text-slate-500">{obj.number}</td>
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900">{obj.name}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-mono text-xs text-slate-700">{obj.okpd2}</div>
                  <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{obj.okpd2Name}</div>
                </td>
                <td className="py-3 px-4">
                  {obj.ktru ? (
                    <span className="font-mono text-xs text-slate-700">{obj.ktru}</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-600">{obj.okeiName || '—'}</td>
                <td className="py-3 px-4 text-right text-slate-600">{obj.quantity ?? '—'}</td>
                <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(obj.price)}</td>
                <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(obj.sum)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {customers.some(c => c.deliveryPlaces.length > 0) && (
        <div className="mt-6">
          <h3 className="text-base font-semibold mb-3">Место поставки / выполнения работ</h3>
          <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
            {customers.flatMap((c, ci) => 
              c.deliveryPlaces.map((place, pi) => (
                <div key={`${ci}-${pi}`} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{place.deliveryPlace || '—'}</div>
                    {place.GARAddress && (
                      <div className="text-xs text-slate-500 mt-0.5">GAR: {place.GARAddress}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
