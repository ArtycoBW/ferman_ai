'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OtpInput } from '@/components/ui/otp-input'
import {
  useStartRegistration,
  useVerifyRegistration,
  useStartPhoneRegistration,
  useVerifyPhone,
  useCompleteRegistration,
} from '@/hooks/use-api'
import { useAuth } from '@/providers/auth-provider'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type Step = 'email' | 'email-code' | 'phone' | 'phone-code' | 'complete'

const steps = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Телефон' },
  { id: 'complete', label: 'Готово' },
]

export function RegisterForm() {
  const router = useRouter()
  const { login: setAuthToken } = useAuth()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [sessionId, setSessionId] = useState('')

  const startRegistration = useStartRegistration()
  const verifyRegistration = useVerifyRegistration()
  const startPhoneRegistration = useStartPhoneRegistration()
  const verifyPhoneMutation = useVerifyPhone()
  const completeRegistration = useCompleteRegistration()

  const getCurrentStepIndex = () => {
    if (step === 'email' || step === 'email-code') return 0
    if (step === 'phone' || step === 'phone-code') return 1
    return 2
  }

  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await startRegistration.mutateAsync({ email })
      setSessionId(response.session_id)
      setStep('email-code')
      toast({ title: 'Код отправлен', description: `Код подтверждения отправлен на ${email}` })
      if (response.debug_email_code) console.log('Debug email code:', response.debug_email_code)
    } catch (error) {
      toast({ title: 'Ошибка', description: error instanceof Error ? error.message : 'Произошла ошибка', variant: 'destructive' })
    }
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await verifyRegistration.mutateAsync({ session_id: sessionId, code: emailCode })
      setStep('phone')
      toast({ title: 'Email подтвержден', description: 'Теперь добавьте номер телефона', variant: 'success' })
    } catch (error) {
      toast({ title: 'Ошибка', description: error instanceof Error ? error.message : 'Неверный код', variant: 'destructive' })
    }
  }

  const handleStartPhoneRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await startPhoneRegistration.mutateAsync({ session_id: sessionId, phone })
      setStep('phone-code')
      toast({ title: 'Код отправлен', description: `Код подтверждения отправлен на ${phone}` })
      if (response.debug_phone_code) console.log('Debug phone code:', response.debug_phone_code)
    } catch (error) {
      toast({ title: 'Ошибка', description: error instanceof Error ? error.message : 'Произошла ошибка', variant: 'destructive' })
    }
  }

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await verifyPhoneMutation.mutateAsync({ session_id: sessionId, code: phoneCode })
      setStep('complete')
      toast({ title: 'Телефон подтвержден', description: 'Завершите регистрацию', variant: 'success' })
    } catch (error) {
      toast({ title: 'Ошибка', description: error instanceof Error ? error.message : 'Неверный код', variant: 'destructive' })
    }
  }

  const handleComplete = async () => {
    try {
      const response = await completeRegistration.mutateAsync({ session_id: sessionId })
      setAuthToken(response.access_token)
      toast({ title: 'Регистрация завершена!', description: 'Добро пожаловать в Ferman AI', variant: 'success' })
      router.push('/')
    } catch (error) {
      toast({ title: 'Ошибка', description: error instanceof Error ? error.message : 'Произошла ошибка', variant: 'destructive' })
    }
  }

  const handleBack = () => {
    switch (step) {
      case 'email-code': setStep('email'); setEmailCode(''); break
      case 'phone': setStep('email-code'); break
      case 'phone-code': setStep('phone'); setPhoneCode(''); break
      case 'complete': setStep('phone-code'); break
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, index) => (
          <div key={s.id} className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
              index < getCurrentStepIndex() ? 'bg-primary text-primary-foreground' :
              index === getCurrentStepIndex() ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-110' :
              'bg-secondary text-muted-foreground'
            )}>
              {index < getCurrentStepIndex() ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={cn('w-24 sm:w-32 h-0.5 mx-2 transition-colors duration-300', index < getCurrentStepIndex() ? 'bg-primary' : 'bg-secondary')} />
            )}
          </div>
        ))}
      </div>

      {step !== 'email' && (
        <button type="button" onClick={handleBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>
      )}

      {step === 'email' && (
        <form onSubmit={handleStartRegistration} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="user@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} disabled={startRegistration.isPending} required />
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" isLoading={startRegistration.isPending}>Продолжить</Button>
        </form>
      )}

      {step === 'email-code' && (
        <form onSubmit={handleVerifyEmail} className="space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="text-lg font-medium">Подтвердите email</h3>
            <p className="text-sm text-muted-foreground">Код отправлен на <span className="text-foreground font-medium">{email}</span></p>
          </div>
          <OtpInput value={emailCode} onChange={setEmailCode} disabled={verifyRegistration.isPending} />
          <Button type="submit" className="w-full" size="lg" isLoading={verifyRegistration.isPending} disabled={emailCode.length !== 6}>Подтвердить</Button>
        </form>
      )}

      {step === 'phone' && (
        <form onSubmit={handleStartPhoneRegistration} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Номер телефона</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="phone" type="tel" placeholder="+7 (999) 123-45-67" className="pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={startPhoneRegistration.isPending} required />
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" isLoading={startPhoneRegistration.isPending}>Получить код</Button>
        </form>
      )}

      {step === 'phone-code' && (
        <form onSubmit={handleVerifyPhone} className="space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="text-lg font-medium">Подтвердите телефон</h3>
            <p className="text-sm text-muted-foreground">Код отправлен на <span className="text-foreground font-medium">{phone}</span></p>
          </div>
          <OtpInput value={phoneCode} onChange={setPhoneCode} disabled={verifyPhoneMutation.isPending} />
          <Button type="submit" className="w-full" size="lg" isLoading={verifyPhoneMutation.isPending} disabled={phoneCode.length !== 6}>Подтвердить</Button>
        </form>
      )}

      {step === 'complete' && (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Все готово!</h3>
            <p className="text-sm text-muted-foreground">Email и телефон подтверждены. Нажмите кнопку, чтобы завершить регистрацию.</p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{phone}</span>
              <Check className="h-4 w-4 text-primary" />
            </div>
          </div>
          <Button onClick={handleComplete} className="w-full" size="lg" isLoading={completeRegistration.isPending}>Завершить регистрацию</Button>
        </div>
      )}
    </div>
  )
}
