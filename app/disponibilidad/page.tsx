import { AvailabilityView } from '@/components/availability-view'

export default async function DisponibilidadPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string }>
}) {
  const { desde } = await searchParams
  const initialStart = desde && /^\d{4}-\d{2}-\d{2}$/.test(desde) ? desde : undefined

  return <AvailabilityView initialStart={initialStart} />
}
