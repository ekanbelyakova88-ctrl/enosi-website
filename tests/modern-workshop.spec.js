import { test, expect } from "@playwright/test";
test("personal topics, price status, sizing and real 3D are available", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Подобрать по дате рождения", exact: true })
    .click();
  await page.getByLabel("Дата рождения (необязательно)").fill("1990-05-10");
  await expect(page.locator(".personal-start")).toContainText("Телец");
  await page.getByLabel("Любовь", { exact: true }).check();
  await page.getByLabel("Вдохновение", { exact: true }).check();
  await page
    .getByLabel("Что вы хотите вложить в свой браслет?")
    .fill("Моя история");
  await expect(page.locator(".price-status")).toContainText("согласуется");
  await page.getByLabel("Обхват ползунком").fill("18");
  await expect(
    page.getByLabel("Обхват запястья, см", { exact: true }),
  ).toHaveValue("18");
  await page.getByLabel("Посадка", { exact: true }).selectOption("classic");
  await page.getByRole("button", { name: "Из готового сочетания" }).click();
  await page
    .getByRole("button", { name: "Нежные оттенки", exact: true })
    .click();
  await page.getByRole("button", { name: "Объёмный 3D", exact: true }).click();
  await expect(page.locator(".three-view")).toBeVisible();
  await expect(page.locator(".three-view canvas")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Исходный ракурс" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Исходный ракурс" }).click();
  await page.getByRole("button", { name: "Классический", exact: true }).click();
  await expect(page.locator(".workshop-stage g[data-instance]")).toHaveCount(
    24,
  );
  await page.reload();
  await expect(
    page.getByLabel("Обхват запястья, см", { exact: true }),
  ).toHaveValue("18");
});
test("capacity formula uses confirmed allowances and prices only", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { estimate, production } =
      await import("/src/components/bracelet-calculations.js");
    const { byId } = await import("/src/data/materials.js");
    const unknown = estimate({ beads: ["m01"], wrist: "16", fit: "classic" });
    production.allowancesMm.classic = 0;
    production.constructions[0].workPrice = 100;
    byId.m01.price = 10;
    const full = estimate({
      beads: Array(60).fill("m01"),
      wrist: "16",
      fit: "classic",
    });
    return {
      unknown: unknown.price,
      review: unknown.requiresReview,
      full: full.overfilled,
      price: full.price,
    };
  });
  expect(result).toEqual({
    unknown: null,
    review: true,
    full: true,
    price: 700,
  });
});
test("creative tray preserves the composition and sound starts muted", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Из готового сочетания" }).click();
  await page
    .getByRole("button", { name: "Нежные оттенки", exact: true })
    .click();
  await page.getByRole("button", { name: "Творческая студия" }).click();
  await expect(page.locator(".bead-studio canvas")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Звук выключен" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page
    .getByRole("button", { name: "Собрать браслет", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Вернуть на поднос" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Классический", exact: true }).click();
  await expect(page.locator(".workshop-stage g[data-instance]")).toHaveCount(
    24,
  );
});
