'use client'

import Link from 'next/link'
import { ArrowRight, Users } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-xl font-bold tracking-tight text-foreground">KIVA</span>
          <span className="hidden rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary sm:inline-block">
            Gestión hotelera ágil
          </span>
        </Link>

        <nav aria-label="Navegación pública" className="hidden items-center gap-6 md:flex">
          <a
            href="#beneficios"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Beneficios
          </a>
          <a
            href="#modulos"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Módulos del MVP
          </a>
          <a
            href="#como-funciona"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Cómo funciona
          </a>
          <Link
            href="/acceso"
            className="text-sm font-medium text-primary transition-colors hover:underline"
          >
            Vistas por rol
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/acceso"
            className={cn(
              buttonVariants({ size: 'default' }),
              'gap-2 bg-primary px-3.5 font-medium shadow-sm transition-transform active:scale-[0.98]',
            )}
          >
            <Users className="size-4" aria-hidden="true" />
            <span>Acceso a la demo</span>
            <ArrowRight className="size-3.5 opacity-80" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  )
}
