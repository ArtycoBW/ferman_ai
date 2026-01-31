'use client'

import { MapPin, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCurrency } from "@/lib/format"
import type { Lot, PurchaseObject } from "@/types/api"
import { JSX } from "react/jsx-dev-runtime"

interface LotObjectsPanelProps {
  lot: Lot
}

function getNationalRegimeBadge(obj: PurchaseObject) {
  const badges: JSX.Element[] = []

  if (obj.prohibitionForeign) {
    badges.push(
      <span key="prohibition" className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600">
        Запрет
      </span>
    )
  }

  if (obj.restrictForeign) {
    badges.push(
      <span key="restriction" className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600">
        Ограничение
      </span>
    )
  }

  if (obj.preferenseRF) {
    badges.push(
      <span key="preference" className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600">
        Преимущество
      </span>
    )
  }

  if (obj.imposibilityProhibition && obj.reasonImposibilityProhibition) {
    badges.push(
      <TooltipProvider key="impossibility">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 cursor-help">
              Не установлен <Info className="h-2.5 w-2.5 ml-0.5" />
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">{obj.reasonImposibilityProhibition}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  } else if (obj.imposibilityProhibition) {
    badges.push(
      <span key="impossibility-simple" className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
        Не установлен
      </span>
    )
  }

  if (badges.length === 0) {
    return <span className="text-slate-400 text-xs">—</span>
  }

  return <div className="flex flex-wrap gap-1">{badges}</div>
}

export const LotObjectsPanel = ({ lot }: LotObjectsPanelProps) => {
  if (!lot) return null

  const customers = lot.customers?.customer || []
  const deliveryPlaces = customers.flatMap(c => {
    const places = c.deliveryPlaces
    if (!places) return []
    if (Array.isArray(places)) return places
    if (typeof places === 'object' && 'deliveryPlace' in places) {
      const inner = (places as { deliveryPlace: unknown }).deliveryPlace
      return Array.isArray(inner) ? inner : []
    }
    return []
  })
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
              <th className="text-left py-3 px-4 font-medium text-slate-600">Нацрежим</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600 w-[12%]">ОКПД2</th>
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
                <td className="py-3 px-4 w-[25%]">
                  <div className="font-medium text-slate-900">{obj.name}</div>
                </td>
                <td className="py-3 px-4">
                  {getNationalRegimeBadge(obj)}
                </td>
                <td className="py-3 px-4 w-[15%]">
                  {obj.OKPD2 ? (
                    <>
                      <div className="font-mono text-xs text-slate-700">{obj.OKPD2}</div>
                      {obj.OKPD2Name && <div className="text-xs text-slate-500 mt-0.5 break-words">{obj.OKPD2Name}</div>}
                    </>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {obj.KTRU ? (
                    <span className="font-mono text-xs text-slate-700">{obj.KTRU}</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-600">{obj.OKEIName || '—'}</td>
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
              {deliveryPlaces.map((place, idx) => {
                const deliveryPlaceText = typeof place?.deliveryPlace === 'string' ? place.deliveryPlace : null
                const garAddress = typeof place?.GARAddress === 'string' ? place.GARAddress : null
                const countryName = typeof place?.countryName === 'string' ? place.countryName : null

                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-900">
                        {deliveryPlaceText || '—'}
                      </div>
                      {garAddress && (
                        <div className="text-xs text-slate-500">
                          GAR: {garAddress}
                        </div>
                      )}
                      {countryName && (
                        <div className="text-xs text-slate-500">
                          {countryName}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
