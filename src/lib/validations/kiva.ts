import { z } from 'zod'
import { MAX_NOCHES } from '@/config/app'
import { contarNoches } from '@/lib/kiva'

const fecha = (msg: string) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, msg)
const entero = (msg: string) => z.coerce.number({ error: msg }).int(msg).min(0, msg).max(1_000_000_000, msg)

export const alojamientoSchema = z.object({
  nombre: z.string().trim().min(2, 'Ingresá el nombre del alojamiento.').max(80, 'Máximo 80 caracteres.'),
  whatsapp: z.string().trim().max(40, 'Máximo 40 caracteres.'),
  email: z.string().trim().max(120, 'Máximo 120 caracteres.').refine(v => v === '' || z.email().safeParse(v).success, 'Ingresá un email válido.'),
})

export const unidadSchema = z.object({
  nombre: z.string().trim().min(2, 'Ingresá el nombre de la unidad.').max(60, 'Máximo 60 caracteres.'),
  tipo: z.string().trim().max(60, 'Máximo 60 caracteres.'),
  capacidad: z.coerce.number({ error: 'Ingresá la capacidad.' }).int('Ingresá un número entero.').min(1, 'Mínimo 1 persona.').max(50, 'Máximo 50 personas.'),
  comodidades: z
    .string()
    .transform(v => v.split(',').map(x => x.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(60, 'Cada comodidad: máximo 60 caracteres.')).max(10, 'Máximo 10 comodidades.')),
})

export const reservaSchema = z
  .object({
    guestName: z.string().trim().min(2, 'Ingresá el nombre del huésped.').max(80, 'Máximo 80 caracteres.'),
    contact: z.string().trim().min(3, 'Ingresá un teléfono o email de contacto.').max(120, 'Máximo 120 caracteres.'),
    unitId: z.string().min(1, 'Elegí una unidad.'),
    checkIn: fecha('Ingresá la fecha de check-in.'),
    checkOut: fecha('Ingresá la fecha de check-out.'),
    total: entero('Ingresá un importe total válido.'),
    paid: entero('Ingresá un importe cobrado válido (0 si no hubo cobro).'),
  })
  .superRefine((d, ctx) => {
    if (d.checkIn && d.checkOut && d.checkOut <= d.checkIn) ctx.addIssue({ code: 'custom', path: ['checkOut'], message: 'El check-out debe ser posterior al check-in.' })
    else if (d.checkIn && d.checkOut && contarNoches(d.checkIn, d.checkOut) > MAX_NOCHES) ctx.addIssue({ code: 'custom', path: ['checkOut'], message: `La estadía no puede superar las ${MAX_NOCHES} noches.` })
    if (d.paid > d.total) ctx.addIssue({ code: 'custom', path: ['paid'], message: 'El importe cobrado no puede superar el importe total.' })
  })

export const pagoSchema = z.object({
  monto: z.coerce.number({ error: 'Ingresá un importe válido.' }).int('Ingresá un número entero.').min(1, 'El importe debe ser mayor a 0.').max(1_000_000_000, 'Importe demasiado grande.'),
  nota: z.string().trim().max(120, 'Máximo 120 caracteres.'),
})
