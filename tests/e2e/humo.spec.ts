import { expect, test, type Page } from '@playwright/test'

const CLAVE = 'Demo-Clave-2026'

async function ingresar(page: Page, email: string) {
  await page.goto('/app/ingresar')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
  await expect(page).toHaveURL(/\/app\/(panel|cliente)$/)
}

async function ingresarAdmin(page: Page, email = 'admin.demo@kiva.test') {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Ingresar' }).click()
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const enDias = (n: number) => iso(new Date(Date.now() + n * 86_400_000))

test('la landing pública se ve con sus llamados a la acción', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('gestionar tu alojamiento')
  await expect(page.getByRole('link', { name: 'Ingresar' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Registrarme' }).first()).toBeVisible()
})

test('registro de un huésped, persistencia de sesión, cierre y login', async ({ page }) => {
  const email = `huesped.${Date.now()}@kiva.test`
  await page.goto('/app/registro')
  await page.getByLabel(/Client/).check()
  await page.getByLabel('Nombre').fill('Persona Nueva')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Registrarme' }).click()
  await expect(page).toHaveURL(/\/app\/cliente$/)
  await expect(page.getByRole('heading', { name: 'Consulta de Disponibilidad' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Consulta de Disponibilidad' })).toBeVisible()

  await page.getByRole('button', { name: 'Salir' }).click()
  await ingresar(page, email)
  await expect(page).toHaveURL(/\/app\/cliente$/)
})

test('el business nuevo queda pendiente hasta que el superadmin lo aprueba', async ({ page }) => {
  const email = `alojamiento.${Date.now()}@kiva.test`
  await page.goto('/app/registro')
  await page.getByLabel(/Business/).check()
  await page.getByLabel('Nombre').fill('Dueña Nueva')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Registrarme' }).click()
  await expect(page).toHaveURL(/\/app\/panel$/)
  await expect(page.getByText(/pendiente de aprobación/)).toBeVisible()
  await page.getByRole('button', { name: 'Salir' }).click()

  await ingresarAdmin(page)
  await expect(page).toHaveURL(/\/admin$/)
  await page.getByRole('button', { name: `Aprobar a ${email}` }).click()
  await expect(page.getByRole('button', { name: `Aprobar a ${email}` })).toHaveCount(0)
  await page.getByRole('button', { name: 'Salir' }).click()

  await ingresar(page, email)
  await expect(page.getByRole('heading', { name: 'Configurá tu alojamiento' })).toBeVisible()
  await page.getByLabel('Nombre del alojamiento').fill('Posada de Prueba')
  await page.getByRole('button', { name: 'Crear mi alojamiento' }).click()
  await expect(page.getByRole('heading', { name: 'Inicio' })).toBeVisible()
})

test('el business demo carga una reserva, ve la grilla y no puede superponer fechas', async ({ page }) => {
  const nombre = `Huésped E2E ${Date.now()}`
  const desde = 80 + Math.floor(Math.random() * 400)
  await ingresar(page, 'business.demo@kiva.test')
  await expect(page).toHaveURL(/\/app\/panel$/)
  await expect(page.getByText('Unidades ocupadas hoy')).toBeVisible()

  await page.goto('/app/reservas/nueva')
  await page.getByLabel('Nombre del huésped').fill(nombre)
  await page.getByLabel('Contacto').fill('e2e@ejemplo.com')
  await page.getByLabel('Unidad').selectOption({ label: 'Cabaña 3' })
  await page.getByLabel('Check-in').fill(enDias(desde))
  await page.getByLabel('Check-out').fill(enDias(desde + 3))
  await page.getByLabel('Importe total').fill('150000')
  await page.getByLabel('Importe cobrado').fill('50000')
  await page.getByRole('button', { name: 'Guardar reserva' }).click()
  await expect(page.getByRole('heading', { name: nombre })).toBeVisible()
  await expect(page.getByTestId('pagos')).toContainText('Registro de prueba')

  // Pago simulado: baja el saldo.
  await page.getByLabel('Importe').fill('100000')
  await page.getByRole('button', { name: 'Registrar pago' }).click()
  await expect(page.getByText('La reserva está paga.')).toBeVisible()

  // La grilla (desde la fecha del check-in) muestra la reserva.
  await page.getByRole('link', { name: 'Ver en disponibilidad' }).click()
  await expect(page.getByTestId('grilla').getByText(nombre).first()).toBeVisible()

  // Misma unidad, fechas superpuestas: la pantalla lo advierte y no deja guardar.
  await page.goto('/app/reservas/nueva')
  await page.getByLabel('Nombre del huésped').fill('Otra Persona')
  await page.getByLabel('Contacto').fill('otra@ejemplo.com')
  await page.getByLabel('Unidad').selectOption({ label: 'Cabaña 3' })
  await page.getByLabel('Check-in').fill(enDias(desde + 1))
  await page.getByLabel('Check-out').fill(enDias(desde + 2))
  await expect(page.getByRole('alert')).toContainText('ya está reservada')
  await expect(page.getByRole('button', { name: 'Guardar reserva' })).toBeDisabled()
})

test('el huésped demo ve su reserva y su consulta, y no ve las de otros', async ({ page }) => {
  await ingresar(page, 'client.demo@kiva.test')
  await expect(page).toHaveURL(/\/app\/cliente$/)
  const mis = page.getByTestId('mis-reservas')
  await expect(mis).toContainText('Cabaña 2')
  await expect(mis).toContainText('Consulta enviada')
  await expect(mis).not.toContainText('Ana Ejemplo')
  await expect(page.getByTestId('unidades-cliente')).toContainText('Cabaña 1')
})

test('un huésped envía una consulta y el business la confirma; el saldo se ve en ambos paneles', async ({ page }) => {
  const desde = 500 + Math.floor(Math.random() * 300)
  const email = `consulta.${Date.now()}@kiva.test`
  await page.goto('/app/registro')
  await page.getByLabel(/Client/).check()
  await page.getByLabel('Nombre').fill('Consultante Prueba')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Registrarme' }).click()
  await expect(page).toHaveURL(/\/app\/cliente$/)
  await page.getByLabel('Alojamiento').selectOption({ label: 'Cabañas y Departamentos Demo' })
  await page.getByLabel(/Check-in/).fill(enDias(desde))
  await page.getByLabel(/Check-out/).fill(enDias(desde + 2))
  await page.getByRole('button', { name: 'Consultar reserva' }).first().click()
  await page.getByRole('button', { name: 'Enviar consulta' }).click()
  await expect(page.getByTestId('mis-reservas')).toContainText('Consulta enviada')
  await page.getByRole('button', { name: 'Salir' }).click()

  await ingresar(page, 'business.demo@kiva.test')
  await page.goto('/app/reservas')
  const fila = page.getByTestId('consultas').locator('li', { hasText: 'Consultante Prueba' })
  await fila.getByLabel(/Importe total/).fill('80000')
  await fila.getByRole('button', { name: 'Confirmar reserva' }).click()
  await expect(page.getByTestId('consultas').locator('li', { hasText: 'Consultante Prueba' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Salir' }).click()

  await ingresar(page, email)
  await expect(page.getByTestId('mis-reservas')).toContainText('Confirmada')
  await expect(page.getByTestId('mis-reservas')).toContainText('registro de prueba')
})

test('login de superadmin; un usuario común no entra al panel', async ({ page }) => {
  await ingresarAdmin(page, 'client.demo@kiva.test')
  await expect(page.getByText('no tiene permisos de administrador')).toBeVisible()

  await page.getByLabel('Email').fill('admin.demo@kiva.test')
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: 'Administración' })).toBeVisible()
  await expect(page.getByTestId('alojamientos')).toContainText('Cabañas y Departamentos Demo')
})

test('/admin sin sesión manda al login', async ({ page }) => {
  await page.goto('/admin/usuarios')
  await expect(page).toHaveURL(/\/admin\/login$/)
})
