'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useStartYandexAuth } from '@/hooks/use-api'
import { toast } from '@/hooks/use-toast'

export function YandexAuthButton() {
  const [isLoading, setIsLoading] = useState(false)
  const startYandexAuth = useStartYandexAuth()

  const handleYandexAuth = async () => {
    setIsLoading(true)
    try {
      const response = await startYandexAuth.mutateAsync(undefined)
      window.location.href = response.auth_url
    } catch (error) {
      toast({ title: 'Ошибка', description: error instanceof Error ? error.message : 'Не удалось начать авторизацию через Яндекс', variant: 'destructive' })
      setIsLoading(false)
    }
  }

  return (
    <Button type="button" variant="outline" className="w-full hover:text-primary justify-center items-center gap-2" size="lg" onClick={handleYandexAuth} disabled={isLoading}>
      {isLoading ? (
        <svg className=" h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center pr-[1px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" className="w-[14px] h-[14px] fill-white">
            <path d="M153.1 315.8L65.7 512H2l96-209.8c-45.1-22.9-75.2-64.4-75.2-141.1C22.7 53.7 90.8 0 171.7 0H254v512h-55.1V315.8h-45.8zm45.8-269.3h-29.4c-44.4 0-87.4 29.4-87.4 114.6 0 82.3 39.4 108.8 87.4 108.8h29.4V46.5z"/>
          </svg>
        </div>
      )}
      Войти c Яндекс ID
    </Button>
  )
}