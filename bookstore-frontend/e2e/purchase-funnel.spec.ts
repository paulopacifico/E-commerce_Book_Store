import { expect, test } from '@playwright/test';

test('guest signs in and completes the purchase funnel', async ({ page }) => {
  await page.goto('/books/5');

  await expect(page.getByRole('heading', { name: 'Clean Code' })).toBeVisible();
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await page.goto('/cart');
  await page.getByRole('link', { name: 'Proceed to Checkout' }).click();

  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fcheckout$/);
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Password').fill('user123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  await page.getByLabel(/Full name/).fill('E2E Reader');
  await page.getByLabel(/Address line 1/).fill('42 Checkout Street');
  await page.getByLabel(/City/).fill('Toronto');
  await page.getByLabel(/State \/ Province/).fill('Ontario');
  await page.getByLabel(/Postal code/).fill('M5V 2T6');
  await page.getByLabel(/Phone number/).fill('+1 416 555 0100');
  await page.getByRole('button', { name: 'Place Order' }).click();

  await expect(page).toHaveURL(/\/orders\/\d+$/);
  await expect(page.getByRole('heading', { name: /Order #/ })).toBeVisible();
  await page.getByRole('link', { name: 'Back to Orders' }).click();
  await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible();
});
