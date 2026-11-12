import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("real collection, supplied logo and photographs load without errors", async ({
  page,
}) => {
  const errors = [],
    failed = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) failed.push(response.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Красота",
  );
  await expect(page.locator(".product-card")).toHaveCount(4);
  await expect(page.getByAltText("Логотип ENOSI").first()).toHaveAttribute(
    "src",
    /logo-enosi/,
  );
  await page.evaluate(() => document.fonts.ready);
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0))
      .toBe(true);
  }
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

test("mood filters show the matching real bracelets", async ({ page }) => {
  await page.goto("/");
  for (const [name, count] of [
    ["Нежные", 2],
    ["Природные", 1],
    ["Выразительные", 1],
    ["Все сочетания", 4],
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator(".product-card")).toHaveCount(count);
  }
  await page
    .getByRole("button", { name: "Выразительные", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "После заката", exact: true }),
  ).toBeVisible();
});

test("gallery contains only generated product angles and wrist view", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Подробнее: Нежное равновесие",
  });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { level: 2 })).toHaveText("Нежное равновесие");
  await expect(dialog.locator(".modal-palette")).toHaveText(
    "Розовый кварц · горный хрусталь · жемчуг",
  );
  await dialog
    .getByRole("button", { name: "Другой ракурс", exact: true })
    .click();
  await expect(dialog.locator(".modal-image .branded-image")).toHaveAttribute(
    "src",
    /\/18[.-]/,
  );
  await dialog
    .getByRole("button", { name: "На запястье", exact: true })
    .click();
  await expect(dialog.locator(".modal-image .branded-image")).toHaveAttribute(
    "src",
    /\/21[.-]/,
  );
  await dialog.getByRole("button", { name: "Следующая фотография" }).click();
  await expect(dialog.locator(".gallery-topline")).toContainText("1 / 5");
  await dialog.getByRole("button", { name: "Предыдущая фотография" }).click();
  await expect(dialog.locator(".gallery-topline")).toContainText("5 / 5");
  await dialog.getByRole("button", { name: "Увеличить" }).click();
  await expect(page.getByRole("dialog", { name: "Увеличенная фотография" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("favorites persist and empty selection can be reset", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Добавить в избранное: На одной волне" })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "Избранное: 1", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "На одной волне", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Убрать из избранного: На одной волне" })
    .click();
  await expect(
    page.getByText("Здесь будут ваши сочетания", { exact: true }),
  ).toBeVisible();
  await page
    .locator(".empty-state")
    .getByRole("button", { name: "Все сочетания" })
    .click();
  await expect(page.locator(".product-card")).toHaveCount(4);
});

test("Telegram connects to the author and includes the selected bracelet", async ({
  page,
}) => {
  await page.goto("/");
  const contact = page.getByRole("link", {
    name: "Написать Екатерине",
    exact: true,
  });
  await expect(contact).toHaveAttribute(
    "href",
    "https://t.me/BeliakovaKaterina",
  );
  await expect(contact).toHaveAttribute("target", "_blank");
  await page.getByRole("button", { name: "Подробнее: Лесная история" }).click();
  const dialog = page.getByRole("dialog");
  const url = new URL(
    await dialog
      .getByRole("link", { name: "Уточнить детали у автора" })
      .getAttribute("href"),
  );
  expect(url.origin + url.pathname).toBe("https://t.me/BeliakovaKaterina");
  expect(url.searchParams.get("text")).toContain("Лесная история");
  await expect(dialog.locator(".modal-palette")).toHaveText(
    "Авантюрин · горный хрусталь · крошка розового кварца",
  );
});

test("navigation, care answers and mobile menu work", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "Открыть меню" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Мир ENOSI" })
    .click();
  await expect(page).toHaveURL(/#story$/);
  await page.locator(".story-copy").scrollIntoViewIfNeeded();
  await expect(page.locator(".story-copy")).toHaveCSS("opacity", "1");
  if (testInfo.project.name === "mobile")
    await expect(
      page.getByRole("button", { name: "Открыть меню" }),
    ).toHaveAttribute("aria-expanded", "false");
  await page
    .getByRole("button", { name: "Как ухаживать за украшением?" })
    .click();
  await expect(
    page.getByText("Снимайте браслет перед душем", { exact: false }),
  ).toBeVisible();
});

test("page and product dialog fit phones and tablets with loaded fonts", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 375, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => new Promise(requestAnimationFrame));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Overflow at ${width}px`,
    ).toBe(true);
  }
  await page.setViewportSize({ width: 320, height: 700 });
  await page
    .getByRole("button", { name: "Подробнее: Нежное равновесие" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
});

test("editorial hero explains the brand and homepage photographs do not repeat", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero-category")).toContainText(
    "Авторские украшения",
  );
  await expect(page.locator(".hero-category")).toContainText(
    "натуральных камней",
  );
  expect(
    await page
      .locator(".hero-category")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(17);
  await expect(page.locator(".hero-craft-note")).toContainText(
    "Собраны вручную",
  );
  await expect(page.locator(".hero-neutral .branded-image")).toHaveAttribute(
    "src",
    /\/17[.-]/,
  );
  await expect(
    page.locator(".hero-pagination, .gallery-modes, .product-stones"),
  ).toHaveCount(0);
  const sources = await page
    .locator("main .branded-image")
    .evaluateAll((images) => images.map((img) => img.getAttribute("src")));
  expect(sources.length).toBe(8);
  expect(new Set(sources).size).toBe(sources.length);
});

test("page and product dialog meet WCAG AA automated accessibility checks", async ({
  page,
}) => {
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.getByRole("button", { name: "Подробнее: На одной волне" }).click();
  const modal = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    modal.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);

});

test("transparent logo and centered heading have no decorative stars", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const logo = page.getByAltText("Логотип ENOSI").first();
  await expect
    .poll(() =>
      logo.evaluate((image) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  const alpha = await logo.evaluate((image) => {
    const c = document.createElement("canvas");
    c.width = image.naturalWidth;
    c.height = image.naturalHeight;
    const x = c.getContext("2d");
    x.drawImage(image, 0, 0);
    return [
      [0, 0],
      [c.width - 1, 0],
      [0, c.height - 1],
      [c.width - 1, c.height - 1],
    ].map(([a, b]) => x.getImageData(a, b, 1, 1).data[3]);
  });
  expect(alpha).toEqual([0, 0, 0, 0]);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
    "text-align",
    "center",
  );
  const position = await page
    .getByRole("heading", { level: 1 })
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return Math.abs((r.left + r.right) / 2 - innerWidth / 2);
    });
  expect(position).toBeLessThan(2);
  await expect(page.locator("h1 svg, h2 svg, .lucide-asterisk")).toHaveCount(0);
  for (const photo of await page.locator("main .branded-photo").all())
    await expect(photo.locator(".photo-watermark img")).toHaveAttribute(
      "src",
      /logo-enosi-transparent/,
    );
});

test("all 21 uploaded angles have generated branded counterparts in the galleries", async ({
  page,
}) => {
  await page.goto("/");
  const sources = new Set();
  for (const [name, count] of [
    ["Нежное равновесие", 5],
    ["На одной волне", 4],
    ["Лесная история", 6],
    ["После заката", 6],
  ]) {
    await page.getByRole("button", { name: `Подробнее: ${name}` }).click();
    const dialog = page.getByRole("dialog");
    const thumbs = dialog.locator(
      ".gallery-thumbnails button[data-photo-slide]",
    );
    await expect(thumbs).toHaveCount(count);
    await expect(dialog.locator(".gallery-thumbnails button")).toHaveCount(count);
    for (let i = 0; i < count; i++) {
      await thumbs.nth(i).click();
      await expect(thumbs.nth(i)).toHaveAttribute("aria-pressed", "true");
      const image = dialog.locator(".modal-image .branded-image");
      await expect
        .poll(() =>
          image.evaluate((img) => img.complete && img.naturalWidth > 0),
        )
        .toBe(true);
      const src = await image.getAttribute("src");
      expect(src).toMatch(/\/gallery\/\d{2}\.webp/);
      sources.add(src);
      await expect(
        dialog.locator(".modal-image .photo-watermark img"),
      ).toBeVisible();
    }
    await expect(
      dialog.getByRole("button", { name: "Фото автора", exact: true }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");
  }
  expect(sources.size).toBe(21);
});

test("each bracelet has a material card with editorial symbolism", async ({
  page,
}) => {
  await page.goto("/");
  for (const [name, expected] of [
    ["Нежное равновесие", ["Розовый кварц", "Горный хрусталь", "Жемчуг"]],
    ["На одной волне", ["Розовый кварц", "Матовый амазонит"]],
    [
      "Лесная история",
      ["Горный хрусталь", "Авантюрин", "Розовый кварц · крошка"],
    ],
    ["После заката", ["Розовый кварц", "Лава", "Аметист"]],
  ]) {
    await page.getByRole("button", { name: `Подробнее: ${name}` }).click();
    const dialog = page.getByRole("dialog");
    const card = dialog.locator(".stone-card");
    await expect(card).toBeVisible();
    await expect(card.locator(".stone-row")).toHaveCount(expected.length);
    for (const mineral of expected)
      await expect(
        card.getByRole("heading", { name: mineral, exact: true }),
      ).toBeVisible();
    await expect(
      card.getByText("Свой личный смысл выбираете вы.", { exact: false }),
    ).toBeVisible();
    expect(await card.innerText()).not.toMatch(
      /лечит|исцеляет|энерги|усиливает|наполняет/iu,
    );
    await page.keyboard.press("Escape");
  }
});

test("gallery responds to keyboard arrows or a horizontal touch gesture", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Подробнее: На одной волне" }).click();
  const dialog = page.getByRole("dialog");
  if (testInfo.project.name === "mobile") {
    const box = await dialog.locator(".gallery-stage").boundingBox();
    const cdp = await page.context().newCDPSession(page),
      y = box.y + Math.min(160, box.height / 2),
      start = box.x + box.width * 0.8,
      end = box.x + box.width * 0.2;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: start, y }],
    });
    for (let i = 1; i <= 5; i++)
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: start + ((end - start) * i) / 5, y }],
      });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await cdp.detach();
  } else await page.keyboard.press("ArrowRight");
  await expect(dialog.locator('[data-photo-slide="1"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.locator('[data-photo-slide="0"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );

});

test("photo logos use varied clear corners and remain inside the photographs", async ({
  page,
}) => {
  await page.goto("/");
  const corners = new Set();
  for (const photo of await page.locator("main .branded-photo").all()) {
    await photo.scrollIntoViewIfNeeded();
    const mark = photo.locator(".photo-watermark");
    corners.add(await mark.getAttribute("data-corner"));
    const image = await photo.boundingBox(),
      logo = await mark.boundingBox();
    expect(logo.x).toBeGreaterThanOrEqual(image.x - 1);
    expect(logo.y).toBeGreaterThanOrEqual(image.y - 1);
    expect(logo.x + logo.width).toBeLessThanOrEqual(image.x + image.width + 1);
    expect(logo.y + logo.height).toBeLessThanOrEqual(
      image.y + image.height + 1,
    );
    await expect(mark).toHaveCSS("opacity", "1");
  }
  expect(corners.size).toBeGreaterThanOrEqual(3);
});
