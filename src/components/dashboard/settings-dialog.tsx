'use client'

import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Laptop, LogOut, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { useTokenTransactions, usePayments, useUpdateMe, useCurrentTariff } from '@/hooks/use-api'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/format'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Session {
  id: string
  device: string
  browser: string
  ip: string
  lastActive: string
  isCurrent: boolean
}

const mockSessions: Session[] = [
  { id: '1', device: 'Windows', browser: 'Chrome', ip: '185.45.123.45', lastActive: '26.12.2024 10:30', isCurrent: true },
  { id: '2', device: 'iPhone', browser: 'Safari', ip: '185.45.123.46', lastActive: '25.12.2024 18:15', isCurrent: false },
  { id: '3', device: 'MacBook', browser: 'Chrome', ip: '91.123.45.67', lastActive: '24.12.2024 09:00', isCurrent: false },
]

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useAuth()
  const { data: currentTariff } = useCurrentTariff()
  const { data: tokenTransactions } = useTokenTransactions(50)
  const { data: payments } = usePayments()
  const updateMe = useUpdateMe()

  const [activeTab, setActiveTab] = useState('billing')
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [inn, setInn] = useState('')
  const [kpp, setKpp] = useState('')
  const [address, setAddress] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  useEffect(() => {
    if (user) {
      setOrgName(user.org_name || '')
      setInn(user.org_inn || '')
      setKpp(user.org_kpp || '')
      setAddress(user.org_legal_address || '')
      setContactEmail(user.org_contact_email || '')
    }
  }, [user])

  const usedTokens = user ? (currentTariff?.tariff.token_limit || 0) - (currentTariff?.tokens_balance || 0) : 0
  const totalTokens = currentTariff?.tariff.token_limit || 0

  const handleSave = async () => {
    try {
      await updateMe.mutateAsync({
        org_name: orgName || undefined,
        org_inn: inn || undefined,
        org_kpp: kpp || undefined,
        org_legal_address: address || undefined,
        org_contact_email: contactEmail || undefined,
      })
      toast({ title: 'Настройки сохранены' })
      onOpenChange(false)
    } catch (error) {
      toast({ title: 'Ошибка сохранения', variant: 'destructive' })
    }
  }

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) return <Smartphone className="h-5 w-5" />
    if (device.includes('Mac')) return <Laptop className="h-5 w-5" />
    return <Monitor className="h-5 w-5" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Настройки</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="billing">Биллинг</TabsTrigger>
              {/* <TabsTrigger value="security">Безопасность</TabsTrigger> */}
              <TabsTrigger value="account">Аккаунт</TabsTrigger>
            </TabsList>

            <TabsContent value="billing" className="space-y-6">
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Текущий тариф</p>
                    <p className="text-xl font-semibold">{currentTariff?.tariff.name || 'Загрузка...'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Лимит токенов</p>
                    <p className="text-xl font-semibold">{totalTokens.toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Использовано</span>
                    <span>{usedTokens.toLocaleString()} / {totalTokens.toLocaleString()}</span>
                  </div>
                  <Progress value={usedTokens} max={totalTokens} />
                  <p className="text-sm text-muted-foreground">Остаток: {(currentTariff?.tokens_balance || 0).toLocaleString()} токенов</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">История списаний токенов</h3>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Скачать
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Дата</th>
                        <th className="text-left p-3 font-medium">Операция</th>
                        <th className="text-right p-3 font-medium">Токены</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokenTransactions?.items.map((item) => (
                        <tr key={item.id} className="border-t border-border">
                          <td className="p-3">{formatDate(item.created_at)}</td>
                          <td className="p-3">{item.reason}</td>
                          <td className={cn(
                            "p-3 text-right font-medium",
                            item.delta < 0 ? "text-red-600" : "text-green-600"
                          )}>
                            {item.delta > 0 ? '+' : ''}{item.delta.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {(!tokenTransactions?.items || tokenTransactions.items.length === 0) && (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-muted-foreground">
                            Нет транзакций
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">История платежей</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Дата</th>
                        <th className="text-center p-3 font-medium">Токены</th>
                        <th className="text-center p-3 font-medium">Статус</th>
                        <th className="text-right p-3 font-medium">Описание</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments?.items.map((item) => (
                        <tr key={item.id} className="border-t border-border">
                          <td className="p-3">{formatDate(item.created_at)}</td>
                          <td className="p-3 text-center font-medium">{item.tokens_amount.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className={cn(
                              "px-2 py-1 rounded text-xs",
                              item.status === 'completed' && "bg-green-100 text-green-700",
                              item.status === 'pending' && "bg-yellow-100 text-yellow-700",
                              item.status === 'failed' && "bg-red-100 text-red-700"
                            )}>
                              {item.status === 'completed' && 'Завершен'}
                              {item.status === 'pending' && 'В обработке'}
                              {item.status === 'failed' && 'Ошибка'}
                            </span>
                          </td>
                          <td className="p-3 text-right">{item.description || '—'}</td>
                        </tr>
                      ))}
                      {(!payments?.items || payments.items.length === 0) && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-muted-foreground">
                            Нет платежей
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* <TabsContent value="security" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Двухфакторная аутентификация (2FA)</p>
                  <p className="text-sm text-muted-foreground">Дополнительная защита при входе в аккаунт</p>
                </div>
                <Switch checked={twoFaEnabled} onCheckedChange={setTwoFaEnabled} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Активные сессии</h3>
                  <Button variant="outline" size="sm">Завершить все сессии</Button>
                </div>
                <div className="space-y-3">
                  {mockSessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                      <div className="text-muted-foreground">{getDeviceIcon(session.device)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.browser} на {session.device}</span>
                          {session.isCurrent && (
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">Текущая</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          IP: {session.ip} · Вход: {session.lastActive}
                        </p>
                      </div>
                      {!session.isCurrent && (
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent> */}

            <TabsContent value="account" className="space-y-6">
              <div>
                <h3 className="font-medium mb-1">Реквизиты для документов</h3>
                <p className="text-sm text-muted-foreground mb-4">Используется для формирования счетов и отчетных документов</p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="orgName">Наименование организации</Label>
                    <Input id="orgName" placeholder="ООО «Название организации»" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="inn">ИНН</Label>
                      <Input id="inn" placeholder="1234567890" value={inn} onChange={(e) => setInn(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="kpp">КПП</Label>
                      <Input id="kpp" placeholder="123456789" value={kpp} onChange={(e) => setKpp(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Юридический адрес</Label>
                    <Input id="address" placeholder="г. Москва, ул. Примерная, д. 1" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Контактный email</Label>
                    <Input id="contactEmail" type="email" placeholder="email@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={handleSave} disabled={updateMe.isPending}>
            {updateMe.isPending ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
