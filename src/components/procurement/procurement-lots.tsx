'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import { formatCurrency, formatBoolean, formatPercent } from '@/lib/format'
import type { Lot } from '@/types/api'

interface ProcurementLotsProps {
  lots: Lot[]
  showRequirements?: boolean
}

function LotPositionsTable({ lot }: { lot: Lot }) {
  const purchaseObjects = lot.purchaseObjects?.purchaseObject || []

  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left py-2 px-3 font-medium">№</th>
            <th className="text-left py-2 px-3 font-medium">Наименование</th>
            <th className="text-left py-2 px-3 font-medium">ОКПД2</th>
            <th className="text-left py-2 px-3 font-medium">КТРУ</th>
            <th className="text-left py-2 px-3 font-medium">Ед.изм</th>
            <th className="text-right py-2 px-3 font-medium">Кол-во</th>
            <th className="text-right py-2 px-3 font-medium">Цена</th>
            <th className="text-right py-2 px-3 font-medium">Сумма</th>
          </tr>
        </thead>
        <tbody>
          {purchaseObjects.map((obj, idx) => (
            <tr key={idx} className="border-t border-border/50">
              <td className="py-2 px-3 text-muted-foreground">{obj.number}</td>
              <td className="py-2 px-3 max-w-xs">
                <div className="font-medium">{obj.name}</div>
              </td>
              <td className="py-2 px-3">
                <div className="font-mono text-xs">{obj.OKPD2 || '—'}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{obj.OKPD2NAME}</div>
              </td>
              <td className="py-2 px-3">
                {obj.KTRU ? (
                  <div className="font-mono text-xs">{obj.KTRU}</div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="py-2 px-3">{obj.OKEINAME || '—'}</td>
              <td className="py-2 px-3 text-right">{obj.quantity != null ? obj.quantity : '—'}</td>
              <td className="py-2 px-3 text-right font-medium">{formatCurrency(obj.price)}</td>
              <td className="py-2 px-3 text-right font-medium">{formatCurrency(obj.sum)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LotRequirements({ lot }: { lot: Lot }) {
  const [expandedReqs, setExpandedReqs] = useState<Set<number>>(new Set())

  const toggleReq = (idx: number) => {
    setExpandedReqs(prev => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }

  const customers = lot.customers?.customer || []
  const enforcement = customers[0]?.enforcement
  const requirements = lot.requirements?.requirement || []
  const preferences = lot.preferenses?.preferense || []

  return (
    <div className="space-y-6">
      {enforcement && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Обеспечения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-2 px-3 font-medium">Вид обеспечения</th>
                    <th className="text-right py-2 px-3 font-medium">Сумма</th>
                    <th className="text-right py-2 px-3 font-medium">Процент</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border/50">
                    <td className="py-2 px-3 font-medium">Обеспечение заявки</td>
                    <td className="py-2 px-3 text-right font-medium">{formatCurrency(enforcement.applicationGuaranteeAmount)}</td>
                    <td className="py-2 px-3 text-right text-muted-foreground">{formatPercent(enforcement.applicationGuaranteePart)}</td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="py-2 px-3 font-medium">Обеспечение исполнения контракта</td>
                    <td className="py-2 px-3 text-right font-medium">{formatCurrency(enforcement.contractGuaranteeAmount)}</td>
                    <td className="py-2 px-3 text-right text-muted-foreground">{formatPercent(enforcement.contractGuaranteePart)}</td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="py-2 px-3 font-medium">Обеспечение гарантийных обязательств</td>
                    <td className="py-2 px-3 text-right font-medium">{formatCurrency(enforcement.contractProvisionWarrantyAmount)}</td>
                    <td className="py-2 px-3 text-right text-muted-foreground">{formatPercent(enforcement.contractProvisionWarrantyPart)}</td>
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
                    className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium">{req.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{req.code}</Badge>
                    </div>
                    {expandedReqs.has(idx) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {expandedReqs.has(idx) && req.content && (
                    <div className="px-3 pb-3 text-sm text-muted-foreground border-l-2 border-primary/30 ml-3 whitespace-pre-wrap">
                      {req.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {preferences.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Преференции / ограничения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/50 rounded-lg border overflow-hidden">
              {preferences.map((pref, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-2 px-3 even:bg-muted/30">
                  <span>{pref.name || '—'}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {pref.value && <span>{pref.value}</span>}
                    {pref.code && <Badge variant="outline" className="text-xs">{pref.code}</Badge>}
                  </div>
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
            <div className="divide-y divide-border/50 rounded-lg border overflow-hidden">
              <div className="flex justify-between items-center text-sm py-2 px-3">
                <span className="text-muted-foreground">Требование привлечения</span>
                <span className="text-foreground">Да</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function LotDeliveryPlaces({ lot }: { lot: Lot }) {
  const customers = lot.customers?.customer || []
  const places = customers.flatMap(c => c.deliveryPlaces)
  if (places.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Место выполнения работ / оказания услуг</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {places.map((place, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">{place.deliveryPlace || '—'}</div>
                {place.GARAddress && (
                  <div className="text-xs text-muted-foreground">GAR: {place.GARAddress}</div>
                )}
                {place.countryName && (
                  <div className="text-xs text-muted-foreground">{place.countryName}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ProcurementLots({ lots, showRequirements }: ProcurementLotsProps) {
  const [activeLot, setActiveLot] = useState(0)
  const lot = lots[activeLot]

  if (!lot) return null

  const purchaseObjects = lot.purchaseObjects?.purchaseObject || []

  return (
    <div className="space-y-6">
      {lots.length > 1 && (
        <div className="flex gap-2">
          {lots.map((l, idx) => (
            <Button
              key={idx}
              variant={activeLot === idx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveLot(idx)}
            >
              Лот {l.lotNumber}
            </Button>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            Информация о лоте {lot.lotNumber}
            {lot.lotSmp && <Badge variant="secondary">СМП/СОНКО</Badge>}
            {lot.lotDrugPurchase && <Badge variant="outline">Лекарства</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">НМЦК лота</div>
              <div className="font-semibold">{formatCurrency(lot.maxPrice)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Сумма позиций</div>
              <div className="font-semibold">{formatCurrency(lot.purchaseObjectsTotalSum)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Валюта</div>
              <div className="font-semibold">{lot.currency || '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Позиций</div>
              <div className="font-semibold">{purchaseObjects.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showRequirements ? (
        <LotRequirements lot={lot} />
      ) : (
        <>
          <div>
            <h3 className="text-lg font-semibold mb-4">Позиции — Лот {lot.lotNumber}</h3>
            <LotPositionsTable lot={lot} />
          </div>
          <LotDeliveryPlaces lot={lot} />
        </>
      )}
    </div>
  )
}
