'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OtpInput } from '@/components/ui/otp-input'
import { useStartLogin, useLogin } from '@/hooks/use-api'
import { useAuth } from '@/providers/auth-provider'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type LoginMethod = 'email' | 'phone'
type Step = 'credentials' | 'code'

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  const normalized = digits.startsWith('8') ? '7' + digits.slice(1) : digits.startsWith('7') ? digits : '7' + digits
  const limited = normalized.slice(0, 11)
  
  if (limited.length === 0) return ''
  if (limited.length <= 1) return '+7'
  if (limited.length <= 4) return `+7 (${limited.slice(1)}`
  if (limited.length <= 7) return `+7 (${limited.slice(1, 4)}) ${limited.slice(4)}`
  if (limited.length <= 9) return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7)}`
  return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7, 9)}-${limited.slice(9)}`
}

const getCleanPhone = (formatted: string): string => {
  return '+' + formatted.replace(/\D/g, '')
}

export function LoginForm() {
  const router = useRouter()
  const { login: setAuthToken } = useAuth()
  const [method, setMethod] = useState<LoginMethod>('email')
  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [sessionId, setSessionId] = useState('')

  const startLogin = useStartLogin()
  const loginMutation = useLogin()

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  const handlePhoneFocus = () => {
    if (!phone) setPhone('+7')
  }

  const handlePhoneBlur = () => {
    if (phone === '+7' || phone === '+7 (') setPhone('')
  }

  const handleStartLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await startLogin.mutateAsync({
        email: method === 'email' ? email : undefined,
        phone: method === 'phone' ? getCleanPhone(phone) : undefined,
      })
      setSessionId(response.session_id)
      setStep('code')
      toast({
        title: 'Код отправлен',
        description: method === 'email' ? `Код отправлен на ${email}` : `Код отправлен на ${phone}`,
      })
      if (response.debug_email_code || response.debug_phone_code) {
        console.log('Debug code:', response.debug_email_code || response.debug_phone_code)
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: error instanceof Error ? error.message : 'Произошла ошибка', variant: 'destructive' })
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await loginMutation.mutateAsync({ session_id: sessionId, code })
      setAuthToken(response.access_token)
      toast({ title: 'Добро пожаловать!', description: 'Вы успешно вошли в систему', variant: 'success' })
      router.push('/')
    } catch (error) {
      toast({ title: 'Ошибка', description: error instanceof Error ? error.message : 'Неверный код', variant: 'destructive' })
    }
  }

  if (step === 'code') {
    return (
      <form onSubmit={handleVerifyCode} className="space-y-6">
        <button type="button" onClick={() => { setStep('credentials'); setCode('') }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-medium">Введите код подтверждения</h3>
          <p className="text-sm text-muted-foreground">
            Код отправлен на <span className="text-foreground font-medium">{method === 'email' ? email : phone}</span>
          </p>
        </div>
        <OtpInput value={code} onChange={setCode} disabled={loginMutation.isPending} />
        <Button type="submit" className="w-full" size="lg" isLoading={loginMutation.isPending} disabled={code.length !== 6}>
          Войти
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleStartLogin} className="space-y-6">
      <div className="flex gap-2 p-1 bg-secondary rounded-lg">
        <button
          type="button"
          onClick={() => setMethod('email')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
            method === 'email' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          type="button"
          onClick={() => setMethod('phone')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
            method === 'phone' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Phone className="h-4 w-4" />
          Телефон
        </button>
      </div>
      <div className="space-y-4">
        {method === 'email' ? (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={startLogin.isPending} required />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="phone">Номер телефона</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="+7 (999) 123-45-67" 
              value={phone} 
              onChange={handlePhoneChange}
              onFocus={handlePhoneFocus}
              onBlur={handlePhoneBlur}
              disabled={startLogin.isPending} 
              required 
            />
          </div>
        )}
      </div>
      <Button type="submit" className="w-full" size="lg" isLoading={startLogin.isPending}>
        Получить код
      </Button>
    </form>
  )
}