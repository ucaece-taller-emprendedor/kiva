import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export function NotFoundState() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-lg font-semibold">No encontramos esta reserva</h1>
      <p className="text-sm text-muted-foreground">Puede que el enlace sea incorrecto.</p>
      <Link href="/reservas" className={buttonVariants({ variant: 'outline' })}>
        Volver a Reservas
      </Link>
    </div>
  )
}
