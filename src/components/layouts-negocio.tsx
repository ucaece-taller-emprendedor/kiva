import { Plus } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { BotonLink } from '@/components/ui'
import { useAuth } from '@/auth/useAuth'
import { Alerta, Cargando } from '@/components/ui'
import { ConfigurarAlojamiento } from '@/pages/negocio/Unidades'
import { NegocioProvider, useNegocio } from '@/negocio/NegocioContext'

const items = [
  { to: '/app/panel', etiqueta: 'Inicio', fin: true },
  { to: '/app/reservas', etiqueta: 'Reservas' },
  { to: '/app/disponibilidad', etiqueta: 'Disponibilidad' },
  { to: '/app/unidades', etiqueta: 'Unidades' },
]

function Contenido() {
  const { listo, alojamiento } = useNegocio()
  if (!listo) return <Cargando />
  if (alojamiento === null) return <ConfigurarAlojamiento />
  return <Outlet />
}

/** Marco del panel Business: datos del alojamiento en tiempo real + navegación propia. */
export function NegocioLayout() {
  const { perfil } = useAuth()
  if (perfil?.status === 'pendiente') {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <Alerta tipo="aviso">Tu cuenta de alojamiento está pendiente de aprobación. Cuando el equipo de KIVA la apruebe vas a poder configurar tu alojamiento, cargar unidades y reservas.</Alerta>
      </div>
    )
  }
  return (
    <NegocioProvider>
      <div className="border-b border-borde bg-superficie">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 md:px-6">
          <nav aria-label="Panel del alojamiento" className="flex flex-1 flex-wrap gap-1">
            {items.map(i => (
              <NavLink key={i.to} to={i.to} end={i.fin} className={({ isActive }) => `inline-flex h-9 items-center rounded-full px-3 text-sm font-medium transition-colors ${isActive ? 'bg-primario text-primario-texto' : 'text-suave hover:bg-primario/10 hover:text-texto'}`}>
                {i.etiqueta}
              </NavLink>
            ))}
          </nav>
          <BotonLink to="/app/reservas/nueva" className="min-h-9">
            <Plus className="size-4" aria-hidden /> Nueva reserva
          </BotonLink>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <Contenido />
      </div>
    </NegocioProvider>
  )
}
