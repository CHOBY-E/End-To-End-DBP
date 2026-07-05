import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function loginAs(page: Page, email: string, password = 'pass123') {
  await page.goto('/login');
  await page.getByTestId('email-input').fill(email);
  await page.getByTestId('password-input').fill(password);
  await page.getByTestId('auth-submit').click();
  await expect(page).toHaveURL(/\/(passenger|driver)$/);
}
