import { test, expect } from "@playwright/test";
const key = "enosi-bracelet-builder-v1";
const read = (page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)).current, key);
test("touch hold inserts into a precise gap and Escape cancels", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("button", { name: "С нуля", exact: true }).click();
  const card = page.locator(".material-select").first();
  await card.scrollIntoViewIfNeeded();
  await card.dispatchEvent("pointerdown", {
    pointerId: 32,
    pointerType: "touch",
    button: 0,
    clientX: 100,
    clientY: 500,
  });
  await page.waitForTimeout(320);
  const target = await page
    .getByRole("button", { name: "Вставить бусину: место 1", exact: true })
    .boundingBox();

  await page.evaluate(
    ({ x, y }) => {
      window.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerId: 32,
          pointerType: "touch",
          clientX: x,
          clientY: y,
        }),
      );
      window.dispatchEvent(
        new PointerEvent("pointerup", {
          pointerId: 32,
          pointerType: "touch",
          clientX: x,
          clientY: y,
        }),
      );
    },
    { x: target.x + target.width / 2, y: target.y + target.height / 2 },
  );
  await expect.poll(async () => (await read(page)).beads).toEqual(["m01"]);
  await card.dispatchEvent("pointerdown", {
    pointerId: 33,
    pointerType: "touch",
    button: 0,
    clientX: 100,
    clientY: 500,
  });
  await page.waitForTimeout(320);
  await page.keyboard.press("Escape");
  await page.evaluate(() =>
    window.dispatchEvent(
      new PointerEvent("pointerup", {
        pointerId: 33,
        pointerType: "touch",
        clientX: 200,
        clientY: 200,
      }),
    ),
  );
  expect((await read(page)).beads).toHaveLength(1);
});
test("unavailable material cannot be inserted and unknown old beads survive", async ({
  page,
}) => {
  await page.addInitScript(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({ current: { beads: ["retired-id"] } }),
      ),
    key,
  );
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const m = await import("/src/data/materials.js");
    m.byId.m01.available = false;
  });
  await page
    .getByRole("button", { name: "Вставить бусину: место 1", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("недоступен");
  expect((await read(page)).beads).toEqual(["retired-id"]);
});
test("dragging one of two equal beads preserves its identity and precise order", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile);
  await page.addInitScript(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({ current: { beads: ["m01", "m01", "m02"] } }),
      ),
    key,
  );
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const old = await read(page);
  const bead = page.getByRole("button", {
    name: "Позиция 1: Горный хрусталь",
    exact: true,
  });
  await bead.scrollIntoViewIfNeeded();
  const source = await bead.boundingBox(),
    target = await page
      .getByRole("button", { name: "Вставить бусину: место 4", exact: true })
      .boundingBox();
  await page.mouse.move(
    source.x + source.width / 2,
    source.y + source.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    target.x + target.width / 2,
    target.y + target.height / 2,
    { steps: 15 },
  );
  await page.mouse.up();
  const now = await read(page);
  expect(now.instanceIds).toEqual([
    old.instanceIds[1],
    old.instanceIds[2],
    old.instanceIds[0],
  ]);
  expect(now.beads).toEqual(["m01", "m02", "m01"]);
});
