'use client'

import { usePathname } from 'next/navigation'
import { AppHeader } from '@/components/app-header'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { AccesoHeader } from '@/components/acceso-header'
import { SuperadminHeader } from '@/components/superadmin-header'
import { ClientHeader } from '@/components/client-header'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/') {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <LandingHeader />
        <main className="flex-1">{children}</main>
        <LandingFooter />
      </div>
    )
  }

  if (pathname.startsWith('/acceso')) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <AccesoHeader />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 md:px-6 md:py-12">
          {children}
        </main>
      </div>
    )
  }

  if (pathname.startsWith('/superadmin')) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <SuperadminHeader />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    )
  }

  if (pathname.startsWith('/cliente')) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <ClientHeader />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  )
}
