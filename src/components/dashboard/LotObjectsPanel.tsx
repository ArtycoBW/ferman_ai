'use client'

import { MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import type { Lot } from "@/types/api"

interface LotObjectsPanelProps {
  lot: Lot
}

export const LotObjectsPanel = ({ lot }: LotObjectsPanelProps) => {
  if (!lot) return null

  // Get delivery places from all customers
  const customers = lot.customers?.customer || []
  const deliveryPlaces = customers.flatMap(c => c.deliveryPlaces || [])
  const purchaseObjects = lot.purchaseObjects?.purchaseObject || []

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Позиции — Лот {lot.lotNumber}
      </h2>

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
              <th className="text-right py-3 px-4 font-medium text-slate-600">Цена</th>
              <th className="text-right py-3 px-4 font-medium text-slate-600">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {purchaseObjects.map((obj, idx) => (
              <tr key={idx} className="border-b border-slate-100 last:border-0">
                <td className="py-3 px-4 text-slate-500">{obj.number}</td>
                <td className="py-3 px-4 max-w-xs">
                  <div className="font-medium text-slate-900">{obj.name}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-mono text-xs text-slate-700">{obj.okpd2}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{obj.okpd2Name}</div>
                </td>
                <td className="py-3 px-4">
                  {obj.ktru ? (
                    <span className="font-mono text-xs text-slate-700">{obj.ktru}</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-600">{obj.okeiName || '—'}</td>
                <td className="py-3 px-4 text-right text-slate-600">{obj.quantity != null ? obj.quantity : '—'}</td>
                <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(obj.price)}</td>
                <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(obj.sum)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deliveryPlaces.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Место выполнения работ / оказания услуг</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deliveryPlaces.map((place, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-slate-900">
                      {place.deliveryPlace || '—'}
                    </div>
                    {place.GARAddress && (
                      <div className="text-xs text-slate-500">
                        GAR: {place.GARAddress}
                      </div>
                    )}
                    {place.countryName && (
                      <div className="text-xs text-slate-500">
                        {place.countryName}
                      </div>
                    )}
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
