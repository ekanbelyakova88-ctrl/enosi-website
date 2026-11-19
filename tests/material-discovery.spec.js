import { test, expect } from "@playwright/test";
test("palette and size filters retain real materials and clear correctly", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "С нуля", exact: true }).click();
  await page.locator(".extended-filters summary").click();
  await page.getByLabel("Цвет", { exact: true }).selectOption("purple");
  await expect(page.locator(".material-select")).toHaveCount(4);
  await page.getByLabel("Поверхность", { exact: true }).selectOption("matte");
  await expect(page.locator(".material-select")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Сбросить фильтры", exact: true })
    .click();
  await expect(page.locator(".material-select")).toHaveCount(30);
});
test("date and multiple themes offer explained choices and a composition can be edited", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Подобрать по дате рождения", exact: true })
    .click();
  await page.getByLabel("Дата рождения (необязательно)").fill("1990-05-10");
  await expect(page.locator(".recommendation-row").first()).toContainText(
    "Авторская палитра",
  );
  await page.getByLabel("Любовь", { exact: true }).check();
  await page.getByLabel("Вдохновение", { exact: true }).check();
  await page
    .getByRole("button", { name: "Создать начальную композицию" })
    .click();
  await expect(
    page.locator(".workshop-stage g[data-instance]").first(),
  ).toBeVisible();
  const before = await page.locator(".workshop-stage g[data-instance]").count();
  await page
    .getByRole("button", { name: /Позиция 1:/, exact: false })
    .first()
    .click();
  await page.getByRole("button", { name: "Удалить", exact: true }).click();
  await expect(page.locator(".workshop-stage g[data-instance]")).toHaveCount(
    before - 1,
  );
});
test("licensed anatomical wrist loads and the current 3D view can be saved", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Из готового сочетания" }).click();
  await page
    .getByRole("button", { name: "Нежные оттенки", exact: true })
    .click();
  const response = page.waitForResponse((r) =>
    r.url().includes("enosi-neutral-hand.glb"),
  );
  await page
    .getByRole("button", { name: "Примерить на руке", exact: true })
    .click();
  expect((await response).status()).toBe(200);
  await expect(page.locator(".wrist-three-view canvas")).toBeVisible();
  await expect(page.locator(".wrist-three-view")).toContainText(
    "Анатомическая",
  );
  const downloaded = page.waitForEvent("download");
  await page
    .locator(".wrist-three-view")
    .getByRole("button", { name: "Сохранить этот ракурс" })
    .click();
  expect((await downloaded).suggestedFilename()).toBe("ENOSI-wrist-3D.png");
});
test('confirmed stock quantities limit additions without changing old instances',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'С нуля',exact:true}).click();await page.evaluate(async()=>{const m=await import('/src/data/materials.js');m.byId.m01.stock=1;});await page.getByRole('button',{name:'Вставить бусину: место 1',exact:true}).click();await page.getByRole('button',{name:'Вставить бусину: место 2',exact:true}).click();await expect(page.locator('.workshop-stage g[data-instance]')).toHaveCount(1);await expect(page.getByRole('status')).toContainText('остатка');});
