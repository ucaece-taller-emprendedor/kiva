'use client'

import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

export function AccesoHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            KIVA
          </Link>
          <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
            <Sparkles className="size-3" aria-hidden="true" />
            Acceso demostrativo
          </span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Volver a la landing
        </Link>
      </div>
    </header>
  )
}
