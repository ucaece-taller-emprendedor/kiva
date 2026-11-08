import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">KIVA</span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                MVP v1.0
              </span>
            </div>
            <p className="max-w-md text-sm text-muted-foreground text-pretty">
              Software de gestión operativa diseñado para pequeños alojamientos turísticos: cabañas,
              departamentos de alquiler temporario y pequeñas posadas.
            </p>
            <p className="text-xs text-muted-foreground">
              Entorno demostrativo interactivo con almacenamiento local en el navegador (localStorage).
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-tight">Vistas por rol</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/acceso" className="hover:text-foreground transition-colors font-medium text-foreground">
                  Selector de perfiles →
                </Link>
              </li>
              <li>
                <Link href="/superadmin" className="hover:text-foreground transition-colors">
                  Consola Superadmin
                </Link>
              </li>
              <li>
                <Link href="/panel" className="hover:text-foreground transition-colors">
                  Panel Business (Admin)
                </Link>
              </li>
              <li>
                <Link href="/cliente" className="hover:text-foreground transition-colors">
                  Portal Huésped (Client)
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-tight">Contexto académico</h3>
            <p className="text-sm text-muted-foreground">
              Proyecto de validación y desarrollo MVP para <strong>Taller Emprendedor</strong>.
            </p>
            <p className="text-xs text-muted-foreground">
              Universidad CAECE · 2 de noviembre de 2026.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/80 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 KIVA — Todos los derechos reservados.</p>
          <p>Demostración operativa de software sin autenticación simulada engañosa ni datos ficticios externos.</p>
        </div>
      </div>
    </footer>
  )
}
