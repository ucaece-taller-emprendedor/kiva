'use client'

import { useParams } from 'next/navigation'
import { LoadingState, PageHeader } from '@/components/kiva-ui'
import { ReservationForm } from '@/components/reservation-form'
import { useReservations } from '@/components/reservations-provider'
import { NotFoundState } from '@/components/not-found-state'

export default function EditarReservaPage() {
  const { id } = useParams<{ id: string }>()
  const { ready, getReservation } = useReservations()
  const reservation = getReservation(id)

  if (!ready) return <LoadingState />
  if (!reservation) return <NotFoundState />

  return (
    <>
      <PageHeader title="Editar reserva" description={reservation.guest.name} />
      <ReservationForm key={reservation.id} initial={reservation} />
    </>
  )
}
