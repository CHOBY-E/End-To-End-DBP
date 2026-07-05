import { test, expect } from '@playwright/test';

// Emails únicos por corrida para no chocar con datos de ejecuciones previas
// (el backend usa H2 in-memory, así que solo se resetea al reiniciar el server).
const stamp = Date.now();

test.describe('Login / Registro', () => {
  test('registra un nuevo pasajero y redirige a su dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('tab-register').click();

    await page.getByTestId('firstname-input').fill('Test');
    await page.getByTestId('lastname-input').fill('Pasajero');
    await page.getByTestId('email-input').fill(`pasajero.${stamp}@test.com`);
    await page.getByTestId('password-input').fill('pass123');
    await page.getByTestId('role-passenger').click();
    await page.getByTestId('auth-submit').click();

    await expect(page).toHaveURL(/\/passenger$/);
    await expect(page.getByRole('heading', { name: /Hola, Test/ })).toBeVisible();
  });

  test('registra un nuevo conductor y redirige a su dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('tab-register').click();

    await page.getByTestId('firstname-input').fill('Test');
    await page.getByTestId('lastname-input').fill('Conductor');
    await page.getByTestId('email-input').fill(`conductor.${stamp}@test.com`);
    await page.getByTestId('password-input').fill('pass123');
    await page.getByTestId('role-driver').click();
    await page.getByTestId('auth-submit').click();

    await expect(page).toHaveURL(/\/driver$/);
    await expect(page.getByRole('heading', { name: /Hola, Test/ })).toBeVisible();
  });

  test('login con usuario semilla (pasajero) funciona', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill('ana@uber.com');
    await page.getByTestId('password-input').fill('pass123');
    await page.getByTestId('auth-submit').click();

    await expect(page).toHaveURL(/\/passenger$/);
  });

  test('login con credenciales incorrectas muestra error', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill('ana@uber.com');
    await page.getByTestId('password-input').fill('contraseña-mala');
    await page.getByTestId('auth-submit').click();

    await expect(page.getByTestId('auth-error')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('logout limpia la sesión y vuelve a login', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill('ana@uber.com');
    await page.getByTestId('password-input').fill('pass123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/\/passenger$/);

    await page.getByRole('button', { name: 'Salir' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
