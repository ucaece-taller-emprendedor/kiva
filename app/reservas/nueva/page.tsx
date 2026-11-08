'use client'

import { LoadingState, PageHeader } from '@/components/kiva-ui'
import { ReservationForm } from '@/components/reservation-form'
import { useReservations } from '@/components/reservations-provider'

export default function NuevaReservaPage() {
  const { ready } = useReservations()

  return (
    <>
      <PageHeader title="Nueva reserva" description="Completá los datos de la reserva." />
      {ready ? <ReservationForm /> : <LoadingState />}
    </>
  )
}
