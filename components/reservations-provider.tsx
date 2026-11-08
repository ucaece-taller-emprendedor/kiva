'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  createDemoReservations,
  findConflict,
  todayISO,
  type Reservation,
  type ReservationInput,
} from '@/lib/kiva'

const STORAGE_KEY = 'kiva:reservas:v1'

type SaveResult = { ok: true; id: string } | { ok: false; conflict: Reservation }

type ReservationsContextValue = {
  reservations: Reservation[]
  ready: boolean
  getReservation: (id: string) => Reservation | undefined
  saveReservation: (input: ReservationInput, id?: string) => SaveResult
}

const ReservationsContext = createContext<ReservationsContextValue | null>(null)

export function ReservationsProvider({ children }: { children: React.ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let stored: Reservation[] | null = null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) stored = JSON.parse(raw)
    } catch {
      stored = null
    }
    setReservations(stored ?? createDemoReservations(todayISO()))
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations))
  }, [ready, reservations])

  const getReservation = useCallback(
    (id: string) => reservations.find((r) => r.id === id),
    [reservations],
  )

  const saveReservation = useCallback(
    (input: ReservationInput, id?: string): SaveResult => {
      const conflict = findConflict(reservations, input, id)
      if (conflict) return { ok: false, conflict }

      if (id) {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...input, id } : r)))
        return { ok: true, id }
      }

      const newId = crypto.randomUUID()
      setReservations((prev) => [...prev, { ...input, id: newId }])
      return { ok: true, id: newId }
    },
    [reservations],
  )

  const value = useMemo(
    () => ({ reservations, ready, getReservation, saveReservation }),
    [reservations, ready, getReservation, saveReservation],
  )

  return <ReservationsContext.Provider value={value}>{children}</ReservationsContext.Provider>
}

export function useReservations() {
  const ctx = useContext(ReservationsContext)
  if (!ctx) throw new Error('useReservations debe usarse dentro de ReservationsProvider')
  return ctx
}
