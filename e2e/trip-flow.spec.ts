import { test, expect, chromium, type Browser } from '@playwright/test';
import { loginAs } from './helpers';

// Direcciones únicas para poder identificar ESTE viaje en medio de los datos
// semilla (que ya traen otros viajes PENDING/IN_PROGRESS/COMPLETED).
const stamp = Date.now();
const PICKUP = `Origen E2E ${stamp}`;
const DROPOFF = `Destino E2E ${stamp}`;

test.describe('Flujo completo de viaje (pasajero ↔ conductor)', () => {
  test.setTimeout(60_000);

  let browser: Browser;

  test.beforeAll(async () => {
    browser = await chromium.launch();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test('pasajero pide viaje → conductor acepta y completa → pasajero califica', async () => {
    // Dos sesiones simultáneas: pasajero (Ana) y conductor (Pedro).
    const passengerCtx = await browser.newContext();
    const driverCtx = await browser.newContext();
    const passengerPage = await passengerCtx.newPage();
    const driverPage = await driverCtx.newPage();

    // ---- 1. Login / Registro ----------------------------------------
    await loginAs(passengerPage, 'ana@uber.com');
    await loginAs(driverPage, 'pedro@uber.com');

    // ---- 2. Dashboard pasajero: ir a solicitar viaje -------------------
    await passengerPage.getByTestId('request-trip-link').click();
    await expect(passengerPage).toHaveURL(/\/passenger\/new-trip$/);

    // ---- 3. Solicitar viaje: se ven conductores disponibles ----------
    await expect(passengerPage.getByText('Pedro Salas', { exact: false })).toBeVisible();
    await passengerPage.getByTestId('pickup-input').fill(PICKUP);
    await passengerPage.getByTestId('dropoff-input').fill(DROPOFF);
    await passengerPage.getByTestId('confirm-trip-submit').click();

    // Redirige al detalle del viaje recién creado, en estado PENDING
    await expect(passengerPage).toHaveURL(/\/trips\/\d+$/);
    await expect(passengerPage.getByText('Buscando conductor')).toBeVisible();
    const tripUrl = passengerPage.url();
    const tripId = tripUrl.match(/\/trips\/(\d+)/)?.[1];
    expect(tripId).toBeTruthy();

    // ---- 4. Dashboard conductor: ver y aceptar el viaje pendiente ----
    await driverPage.goto('/driver');
    const pendingRow = driverPage.locator('.trip-row', { hasText: PICKUP });
    await expect(pendingRow).toBeVisible();
    await driverPage.getByTestId(`accept-trip-${tripId}`).click();

    // Redirige al detalle, ahora IN_PROGRESS
    await expect(driverPage).toHaveURL(new RegExp(`/trips/${tripId}$`));
    await expect(driverPage.getByText('En curso')).toBeVisible();
    await expect(driverPage.getByText('Ana Garcia')).toBeVisible();

    // ---- 5. Detalle de viaje (pasajero): ve que ya tiene conductor ---
    // Simulamos el polling recargando la página.
    await passengerPage.reload();
    await expect(passengerPage.getByText('En curso')).toBeVisible();
    await expect(passengerPage.getByText('Pedro Salas', { exact: false })).toBeVisible();

    // ---- 6. Detalle de viaje (conductor): completar el viaje ---------
    await driverPage.getByTestId('complete-trip-button').click();
    await expect(driverPage.getByText('Completado', { exact: true })).toBeVisible();

    // ---- 7. Detalle de viaje (pasajero): calificar -------------------
    await passengerPage.reload();
    await expect(passengerPage.getByText('Completado', { exact: true })).toBeVisible();
    await expect(passengerPage.getByTestId('rating-form')).toBeVisible();

    await passengerPage.getByRole('button', { name: '5 estrellas' }).click();
    await passengerPage.getByTestId('rating-comment').fill('Viaje E2E de prueba, todo excelente');
    await passengerPage.getByTestId('submit-rating').click();

    await expect(passengerPage.getByText('Tu calificación')).toBeVisible();
    await expect(passengerPage.getByText('Viaje E2E de prueba, todo excelente')).toBeVisible();

    // ---- 8. Historial: el viaje aparece como COMPLETED ---------------
    await passengerPage.getByRole('link', { name: 'Historial' }).click();
    await expect(passengerPage).toHaveURL(/\/history$/);
    await passengerPage.getByTestId('filter-completed').click();
    await expect(passengerPage.locator('tr', { hasText: PICKUP })).toBeVisible();

    await passengerCtx.close();
    await driverCtx.close();
  });
});
