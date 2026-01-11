'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Navigation() {
  const pathname = usePathname()
  
  const steps = [
    { name: 'Profil', href: '/client/profil', step: 1 },
    { name: 'Enveloppes', href: '/client/enveloppes', step: 2 },
    { name: 'Allocation', href: '/client/allocation', step: 3 },
    { name: 'Optimisation', href: '/client/optimisation', step: 4 },
    { name: 'Backtest', href: '/client/backtest', step: 5 },
    { name: 'Rapport', href: '/client/rapport', step: 6 },
  ]
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-4 py-4">
          {steps.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {item.step}. {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
