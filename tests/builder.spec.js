import { test, expect } from "@playwright/test";
const key = "enosi-bracelet-builder-v1";
async function start(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "С нуля", exact: true }).click();
}
async function read(page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)).current,
    key,
  );
}
async function add(page, slot = 1) {
  await page
    .getByRole("button", {
      name: `Вставить бусину: место ${slot}`,
      exact: true,
    })
    .click();
}
test("starts from an idea, then restores existing designs with unique instances", async ({
  page,
}) => {
  await page.addInitScript(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          current: { beads: ["m11", "m11", "m01"], wrist: "17" },
          saved: [{ beads: ["m03"], name: "Мой вариант" }],
        }),
      ),
    key,
  );
  await page.goto("/");
  const s = await read(page);
  expect(s.beads).toEqual(["m11", "m11", "m01"]);
  expect(new Set(s.instanceIds).size).toBe(3);
  await page.locator(".workshop-extra summary").click();
  await page.getByLabel("Сохранённые варианты").selectOption("0");
  expect((await read(page)).beads).toEqual(["m03"]);
  await page.getByRole("button", { name: "Из готового сочетания" }).click();
  await page
    .getByRole("button", { name: "Нежные оттенки", exact: true })
    .click();
  expect((await read(page)).beads).toHaveLength(24);
});
test("tap and keyboard insert at exact gaps, replace and delete independently, undo restores IDs", async ({
  page,
}) => {
  await start(page);
  await add(page);
  await page.locator(".material-select").filter({ hasText: "Родонит" }).click();
  await add(page, 1);
  const before = await read(page);
  expect(before.beads).toEqual(["m02", "m01"]);
  await page
    .getByRole("button", { name: "Позиция 2: Горный хрусталь", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Заменить", exact: true }).click();
  expect((await read(page)).beads).toEqual(["m02", "m02"]);
  await page
    .getByRole("button", { name: "Позиция 1: Родонит", exact: true })
    .click();
  await page.getByRole("button", { name: "Удалить", exact: true }).click();
  expect((await read(page)).beads).toEqual(["m02"]);
  await page.getByRole("button", { name: "Отменить", exact: true }).click();
  expect((await read(page)).instanceIds).toEqual(before.instanceIds);
});
test("mouse transfer inserts and cancelled drops leave sequence unchanged", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile);
  await start(page);
  const card = page.locator(".material-select").first();
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  const svg = page.locator(".workshop-stage svg.workshop-bracelet");
  const target = await svg.boundingBox();
  await page.mouse.move(box.x + 30, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(
    target.x + target.width / 2,
    target.y + target.height / 2,
    { steps: 12 },
  );
  await page.mouse.up();
  expect((await read(page)).beads).toEqual(["m01"]);
  const saved = await read(page);
  await page.mouse.move(box.x + 30, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(3, 3, { steps: 10 });
  await page.mouse.up();
  expect((await read(page)).instanceIds).toEqual(saved.instanceIds);
});
test("same beads reorder independently with no loss", async ({ page }) => {
  await start(page);
  await add(page);
  await add(page, 2);
  await page.locator(".material-select").filter({ hasText: "Родонит" }).click();
  await add(page, 3);
  const old = await read(page);
  await page
    .getByRole("button", { name: "Позиция 2: Горный хрусталь", exact: true })
    .click();
  await page.locator(".workshop-extra summary").click();
  await page.getByRole("button", { name: "Переместить вправо" }).click();
  const now = await read(page);
  expect(now.beads).toEqual(["m01", "m02", "m01"]);
  expect(now.instanceIds).toEqual([
    old.instanceIds[0],
    old.instanceIds[2],
    old.instanceIds[1],
  ]);
});
test("stone info is separate, enlarged image closes with focus restored", async ({
  page,
}) => {
  await start(page);
  await page.locator(".material-select").filter({ hasText: "Родонит" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const button = page.getByRole("button", { name: "О камне: Родонит, 8 мм" });
  await button.click();
  await expect(page.getByRole("dialog")).toContainText("индивидуальности");
  await page
    .getByRole("button", { name: "Увеличить фото", exact: true })
    .click();
  await expect(page.getByRole("dialog").locator("img")).toHaveClass("enlarged");
  await page.keyboard.press("Escape");
  await expect(button).toBeFocused();
});
test("try-on and order reuse exact sequence and image can be downloaded", async ({
  page,
}) => {
  await start(page);
  await add(page);
  await add(page, 2);
  await page.getByLabel("Обхват запястья, см").fill("17");
  await page
    .getByRole("button", { name: "Примерить на руке", exact: true })
    .click();
  await expect(page.locator(".wrist-image")).toBeVisible();
  expect(
    await page
      .locator(".wrist-image g[data-material]")
      .evaluateAll((nodes) => nodes.map((n) => n.dataset.material)),
  ).toEqual(["m01", "m01"]);
  await expect(page.locator(".wrist-image svg image")).toHaveCount(2);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Сохранить примерку" }).click();
  expect((await download).suggestedFilename()).toBe("ENOSI-eskiz.png");
  await page
    .getByRole("button", { name: "Обсудить заказ", exact: true })
    .click();
  await expect(page.getByLabel("Описание эскиза для копирования")).toHaveValue(
    /Горный хрусталь.*2 шт/s,
  );
  await expect(
    page.getByRole("link", { name: "Написать в Telegram", exact: true }),
  ).toHaveAttribute("href", /^https:\/\/t.me\/BeliakovaKaterina\?text=/);
  await expect(
    page.getByRole("link", { name: "Написать в MAX", exact: true }).first(),
  ).toHaveAttribute("href", /^https:\/\/max.ru\/u\//);
  await page.reload();
  expect((await read(page)).beads).toEqual(["m01", "m01"]);
});
test("layout fits narrow screens and materials remain reachable", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await start(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator(".material-select").last().scrollIntoViewIfNeeded();
    await expect(page.locator(".workshop-stage")).toBeVisible();
  }
});
test("touch movement before hold cancels drag without inserting", async ({
  page,
}) => {
  await start(page);
  const b = page.locator(".material-select").first();
  await b.dispatchEvent("pointerdown", {
    pointerId: 12,
    pointerType: "touch",
    button: 0,
    clientX: 100,
    clientY: 400,
  });
  await page.evaluate(() => {
    window.dispatchEvent(
      new PointerEvent("pointermove", {
        pointerId: 12,
        pointerType: "touch",
        clientX: 100,
        clientY: 430,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointerup", {
        pointerId: 12,
        pointerType: "touch",
        clientX: 100,
        clientY: 430,
      }),
    );
  });
  expect((await read(page)).beads).toEqual([]);
});
