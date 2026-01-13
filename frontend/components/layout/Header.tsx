'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, BarChart3, Users, Settings } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              Fiscal Lazy Portfolio Pro
            </span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center justify-end space-x-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/client/profil">
            <Button variant="ghost" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              Nouveau Client
            </Button>
          </Link>
          <Link href="/client/parcours">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
              <Sparkles className="h-4 w-4" />
              Démarrer
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
