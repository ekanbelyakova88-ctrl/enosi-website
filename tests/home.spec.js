import { test, expect } from '@playwright/test';

test('page loads without broken assets or horizontal overflow', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const failed = [];
  page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Красота');
  await expect(page.locator('.product-card')).toHaveCount(3);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(requestAnimationFrame));
  expect(await page.locator('.hero-image').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const section of ['#collection', '#story', '#craft', '#contacts']) await expect(page.locator(section)).toBeAttached();
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

test('page fits narrow and medium screens after fonts finish loading', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 375, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => new Promise(requestAnimationFrame));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px`).toBe(true);
  }
});

test('color selection, product details and favorites work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Пудровые', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Тихий румянец', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Все сочетания', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(3);
  const product = page.getByRole('button', { name: 'Подробнее: Первый свет' });
  await product.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading')).toHaveText('Первый свет');
  await dialog.getByRole('button', { name: 'Мне нравится', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Сочетание сохранено' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(product).toBeFocused();
  await expect(page.getByRole('button', { name: 'Убрать из избранного: Первый свет' })).toHaveAttribute('aria-pressed', 'true');
});

test('care answers and honest contact placeholder work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Как ухаживать за натуральными камнями?' }).click();
  await expect(page.getByText('Снимайте браслет перед душем', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Давайте знакомиться' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading')).toHaveText('Будем на связи');
  await expect(dialog.getByText('Сообщения пока не отправляются', { exact: false })).toBeVisible();
  await dialog.getByRole('button', { name: 'Продолжить знакомство' }).click();
  await expect(dialog).toHaveCount(0);
});

test('navigation works on the selected screen size', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Открыть меню' }).click();
    await expect(page.getByRole('navigation')).toBeVisible();
  }
  await page.getByRole('navigation').getByRole('link', { name: 'История ENOSI' }).click();
  await expect(page).toHaveURL(/#story$/);
  await page.locator('.story-copy').scrollIntoViewIfNeeded();
  await expect(page.locator('.story-copy')).toHaveCSS('opacity', '1');
  if (testInfo.project.name === 'mobile') await expect(page.getByRole('button', { name: 'Открыть меню' })).toHaveAttribute('aria-expanded', 'false');
});
