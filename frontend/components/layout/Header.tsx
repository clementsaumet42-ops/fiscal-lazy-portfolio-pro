'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  
  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Nouvelle Simulation', href: '/client/profil' },
    { name: 'Dashboard', href: '/dashboard' },
  ]
  
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-midnight/90 border-b border-midnight-lighter shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-white">
                Fiscal <span className="text-gold">Lazy Portfolio</span> Pro
              </span>
            </Link>
          </div>
          
          <nav className="flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'inline-flex items-center px-1 pt-1 text-sm font-medium transition-all duration-200',
                  pathname === item.href
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-cream/70 hover:text-white hover:border-b-2 hover:border-gold/50'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
