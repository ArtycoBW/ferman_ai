import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' }
  const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-md shadow-slate-400/30', sizes[size])}>
        F
      </div>
      <span className={cn('font-semibold tracking-tight', textSizes[size])}>Ferman AI</span>
    </div>
  )
}
