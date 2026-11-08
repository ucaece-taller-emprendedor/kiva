import { createBrowserRouter, Navigate } from 'react-router'
import { RequireAdmin, RequireAuth, RequireRole } from '@/auth/guards'
import { AdminLayout, SitioLayout } from '@/components/layouts'
import { NegocioLayout } from '@/components/layouts-negocio'
import Administradores from '@/pages/admin/Administradores'
import Estadisticas from '@/pages/admin/Estadisticas'
import AdminLogin from '@/pages/admin/AdminLogin'
import { AdminAlojamientos, AdminInicio, AdminUsuarios } from '@/pages/admin/AdminPaginas'
import { AppInicio, CompletarPerfil, Ingresar, Registro, Suspendido } from '@/pages/app/Acceso'
import PanelCliente from '@/pages/cliente/PanelCliente'
import Disponibilidad from '@/pages/negocio/Disponibilidad'
import Inicio from '@/pages/negocio/Inicio'
import { ReservaEditar, ReservaNueva } from '@/pages/negocio/ReservaForm'
import ReservaDetalle from '@/pages/negocio/ReservaDetalle'
import Reservas from '@/pages/negocio/Reservas'
import Unidades from '@/pages/negocio/Unidades'
import Landing from '@/pages/public/Landing'
import NoEncontrada from '@/pages/public/NoEncontrada'

export const router = createBrowserRouter([
  { path: '/', element: <SitioLayout />, children: [{ index: true, element: <Landing /> }] },
  {
    path: '/app',
    element: <SitioLayout />,
    children: [
      { index: true, element: <AppInicio /> },
      { path: 'ingresar', element: <Ingresar /> },
      { path: 'registro', element: <Registro /> },
      { path: 'completar-perfil', element: <CompletarPerfil /> },
      { path: 'suspendido', element: <Suspendido /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'cliente', element: <RequireRole roles={['client']}><PanelCliente /></RequireRole> },
          {
            element: <RequireRole roles={['business']}><NegocioLayout /></RequireRole>,
            children: [
              { path: 'panel', element: <Inicio /> },
              { path: 'reservas', element: <Reservas /> },
              { path: 'reservas/nueva', element: <ReservaNueva /> },
              { path: 'reservas/:id', element: <ReservaDetalle /> },
              { path: 'reservas/:id/editar', element: <ReservaEditar /> },
              { path: 'disponibilidad', element: <Disponibilidad /> },
              { path: 'unidades', element: <Unidades /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '/admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout navegacion={[{ to: '/admin', etiqueta: 'Consola', fin: true }, { to: '/admin/alojamientos', etiqueta: 'Alojamientos' }, { to: '/admin/usuarios', etiqueta: 'Usuarios' }, { to: '/admin/administradores', etiqueta: 'Administradores' }, { to: '/admin/estadisticas', etiqueta: 'Estadísticas' }]} />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <AdminInicio /> },
      { path: 'alojamientos', element: <AdminAlojamientos /> },
      { path: 'usuarios', element: <AdminUsuarios /> },
      { path: 'administradores', element: <Administradores /> },
      { path: 'estadisticas', element: <Estadisticas /> },
      { path: '*', element: <Navigate to="/admin" replace /> },
    ],
  },
  { path: '*', element: <SitioLayout />, children: [{ path: '*', element: <NoEncontrada /> }] },
])
