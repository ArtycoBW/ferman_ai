'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import { YandexAuthButton } from '@/components/auth/yandex-auth-button'
import { Background } from '@/components/layout/background'
import { Logo } from '@/components/layout/logo'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <Background />
      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8 opacity-0 animate-fade-in">
          <Logo size="lg" />
        </div>
        <Card className="opacity-0 animate-fade-in stagger-1">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{activeTab === 'login' ? 'Вход в аккаунт' : 'Создание аккаунта'}</CardTitle>
            <CardDescription>{activeTab === 'login' ? 'Войдите для доступа к аналитике закупок' : 'Зарегистрируйтесь для начала работы'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-6">
                <LoginForm />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">или</span>
                  </div>
                </div>
                <YandexAuthButton />
              </TabsContent>
              <TabsContent value="register" className="space-y-6">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
