import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('Historial', () => {
  test('el filtro por estado muestra solo los viajes completados', async ({ page }) => {
    // Ana ya tiene, por datos semilla, un viaje COMPLETED.
    await loginAs(page, 'ana@uber.com');
    await page.getByRole('link', { name: 'Historial' }).click();
    await expect(page).toHaveURL(/\/history$/);

    await page.getByTestId('filter-completed').click();
    const rows = page.locator('.history-table tbody tr');
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Completado');
    }
  });

  test('el conductor ve su propio historial (GET /trips/my)', async ({ page }) => {
    await loginAs(page, 'carlos@uber.com');
    await page.getByRole('link', { name: 'Historial' }).click();
    await expect(page).toHaveURL(/\/history$/);
    // Carlos completó el viaje semilla con Ana.
    await expect(page.locator('.history-table')).toContainText('Ana Garcia');
  });
});
