'use client'

import { useState } from 'react'
import { Check, X, Coins } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useTariffs, useCurrentTariff, useCreatePayment } from '@/hooks/use-api'
import { toast } from '@/hooks/use-toast'

interface TariffsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Хардкод данных для отображения (API может не возвращать все поля)
const tariffDetails: Record<string, {
  description: string
  price: string
  priceNote?: string
  features: { text: string; included: boolean }[]
  buttonText: string
  buttonVariant: 'outline' | 'default'
  isPopular?: boolean
}> = {
  'Бесплатный': {
    description: 'Полноценный аудит закупок по данным ЕИС',
    price: '0 ₽',
    features: [
      { text: 'Весь функционал аудита по данным ЕИС', included: true },
      { text: 'Пояснения и обоснования', included: true },
      { text: 'Генерация отчетов', included: true },
      { text: 'Анализ проекта контракта', included: false },
    ],
    buttonText: 'Текущий план',
    buttonVariant: 'outline',
  },
  'Default': {
    description: 'Полноценный аудит закупок по данным ЕИС',
    price: '0 ₽',
    features: [
      { text: 'Весь функционал аудита по данным ЕИС', included: true },
      { text: 'Пояснения и обоснования', included: true },
      { text: 'Генерация отчетов', included: true },
      { text: 'Анализ проекта контракта', included: false },
    ],
    buttonText: 'Текущий план',
    buttonVariant: 'outline',
  },
  'Полный': {
    description: 'Полный аудит закупок с анализом проекта контракта',
    price: '4 900 ₽',
    priceNote: '/мес',
    features: [
      { text: 'Все возможности тарифа «Бесплатный»', included: true },
      { text: 'Анализ проекта контракта (парсинг файлов)', included: true },
      { text: 'Расширенная обработка', included: true },
    ],
    buttonText: 'Выбрать',
    buttonVariant: 'default',
    isPopular: true,
  },
  'Корпоративный': {
    description: 'Для организаций с повышенными требованиями и объемами',
    price: 'По запросу',
    features: [
      { text: 'Все возможности тарифа «Полный»', included: true },
      { text: 'Индивидуальные лимиты токенов', included: true },
      { text: 'Командный доступ', included: true },
      { text: 'Управление пользователями', included: true },
      { text: 'API-доступ', included: true },
      { text: 'SLA и персональная поддержка', included: true },
    ],
    buttonText: 'Связаться',
    buttonVariant: 'outline',
  },
}

export function TariffsDialog({ open, onOpenChange }: TariffsDialogProps) {
  const { data: tariffsData } = useTariffs()
  const { data: currentTariff } = useCurrentTariff()
  const createPayment = useCreatePayment()

  const [showTokenPurchase, setShowTokenPurchase] = useState(false)
  const [tokenAmount, setTokenAmount] = useState('10000')

  const tokenPrice = Math.ceil(parseInt(tokenAmount || '0') / 1000) * 2

  const handlePurchaseTokens = async () => {
    try {
      const amount = parseInt(tokenAmount || '0')
      if (amount < 1000) {
        toast({ title: 'Минимальное количество - 1000 токенов', variant: 'destructive' })
        return
      }
      await createPayment.mutateAsync({
        tokens_amount: amount,
        description: `Докупка ${amount.toLocaleString()} токенов`
      })
      toast({ title: 'Платеж создан', description: 'Токены будут зачислены после оплаты' })
      setShowTokenPurchase(false)
    } catch (error) {
      toast({ title: 'Ошибка создания платежа', variant: 'destructive' })
    }
  }

  const formatTokenLimit = (limit: number, name: string) => {
    if (name === 'Корпоративный') return 'Индивидуально'
    return limit.toLocaleString() + ' токенов'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Тарифы</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {tariffsData?.items.map((tariff) => {
              const isCurrent = currentTariff?.tariff.id === tariff.id
              const details = tariffDetails[tariff.name] || tariffDetails['Default']
              
              return (
                <div
                  key={tariff.id}
                  className={cn(
                    'relative rounded-xl border p-5 transition-all flex flex-col',
                    details.isPopular ? 'border-primary shadow-lg shadow-primary/10' : 'border-slate-200'
                  )}
                >
                  {details.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full whitespace-nowrap">
                      Популярный
                    </div>
                  )}
                  
                  {/* Название и описание */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">{tariff.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{details.description}</p>
                  </div>
                  
                  {/* Цена */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-slate-900">{details.price}</span>
                    {details.priceNote && (
                      <span className="text-sm text-slate-500">{details.priceNote}</span>
                    )}
                  </div>
                  
                  {/* Лимит токенов */}
                  <div className="mb-4 px-3 py-2 bg-slate-100 rounded-lg text-sm text-slate-700">
                    Лимит: {formatTokenLimit(tariff.token_limit, tariff.name)}
                  </div>
                  
                  {/* Фичи */}
                  <div className="flex-1 space-y-2 mb-4">
                    {details.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-slate-600 mt-0.5 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        )}
                        <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Кнопка */}
                  <Button
                    variant={isCurrent ? 'outline' : details.buttonVariant}
                    className={cn(
                      'w-full',
                      details.isPopular && !isCurrent && 'bg-primary hover:bg-primary/90'
                    )}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Текущий план' : details.buttonText}
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Докупка токенов */}
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Coins className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Докупка токенов</p>
                  <p className="text-sm text-slate-500">2 ₽ за 1 000 токенов</p>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setShowTokenPurchase(!showTokenPurchase)}>
                {showTokenPurchase ? 'Скрыть' : 'Показать'}
              </Button>
            </div>

            {showTokenPurchase && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-slate-500 mb-2 block">Количество токенов</label>
                    <Input
                      type="number"
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                      min="1000"
                      step="1000"
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Стоимость</p>
                    <p className="text-xl font-bold text-slate-900">{tokenPrice} ₽</p>
                  </div>
                  <Button 
                    onClick={handlePurchaseTokens} 
                    disabled={createPayment.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {createPayment.isPending ? 'Создание...' : 'Докупить'}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Токены расходуются при выполнении аудита и анализе проекта контракта. Докупленные токены расходуются сверх лимита тарифа.
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-slate-500">
            Все цены указаны без НДС. Возможна оплата по счёту для юридических лиц.
          </p>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}