import { material } from "./builder-model";
// Настройки производства заполняет автор. null означает отсутствие подтверждения.
export const production = {
  constructions: [
    { id: "elastic", name: "Эластичная нить", enabled: true, workPrice: null },
    {
      id: "woven",
      name: "Регулируемый плетёный замок",
      enabled: false,
      workPrice: null,
    },
  ],
  allowancesMm: { close: null, classic: null, loose: null },
  hardware: [],
};
export const moneyCents = (value) =>
  Number.isFinite(value) &&
  value >= 0 &&
  Number.isSafeInteger(Math.round(value * 100))
    ? Math.round(value * 100)
    : null;

export function componentPriceLabel(value) {
  const cents = moneyCents(value);
  return cents === null
    ? "Цена — по согласованию"
    : `${(cents / 100).toLocaleString("ru-RU")} ₽ / шт.`;
}

export function estimate(sketch) {
  const items = Object.entries(
    sketch.beads.reduce(
      (all, id) => ({ ...all, [id]: (all[id] || 0) + 1 }),
      {},
    ),
  ).map(([id, count]) => ({ material: material(id), count }));
  const cents = moneyCents;
  const construction = production.constructions.find(
    (c) => c.id === (sketch.construction || "elastic"),
  );
  const work = cents(construction?.workPrice);
  const unknown = items.some(({ material: m }) => cents(m.price) === null);
  const sum =
    unknown || work === null
      ? null
      : items.reduce(
          (total, { material: m, count }) => total + cents(m.price) * count,
          work,
        );
  const price = sum !== null && Number.isSafeInteger(sum) ? sum / 100 : null;
  const mm = Number(sketch.wrist) * 10;
  const allowance = production.allowancesMm[sketch.fit];
  const irregular = items.some(
    ({ material: m }) =>
      ["крошка", "самородок", "цилиндр"].includes(m.shape) || !m.mm,
  );
  let occupied = null;
  if (
    mm >= 80 &&
    mm <= 300 &&
    Number.isFinite(allowance) &&
    mm + allowance > 0 &&
    allowance !== null &&
    allowance !== undefined &&
    !irregular &&
    sketch.beads.length > 1
  ) {
    const inner = (mm + allowance) / (2 * Math.PI);
    occupied = sketch.beads.reduce((sum, id, i) => {
      const a = material(id).mm / 2,
        b = material(sketch.beads[(i + 1) % sketch.beads.length]).mm / 2;
      const ra = inner + a,
        rb = inner + b;
      return (
        sum +
        Math.acos(
          Math.max(
            -1,
            Math.min(1, (ra * ra + rb * rb - (a + b) ** 2) / (2 * ra * rb)),
          ),
        )
      );
    }, 0);
  }
  const stockIssue = items.some(
    ({ material: m, count }) =>
      !m.active ||
      !m.available ||
      (Number.isFinite(m.stock) && count > m.stock),
  );
  return {
    items,
    price,
    stockIssue,
    occupied,
    overfilled: occupied !== null && occupied > 2 * Math.PI,
    requiresReview: occupied === null,
    axialLength: items.reduce(
      (sum, { material: m, count }) => sum + (m.lengthMm || m.mm || 0) * count,
      0,
    ),
  };
}
export function compositionIssue(next, previous) {
  const before = estimate(previous).items;
  for (const { material: m, count } of estimate(next).items) {
    const old = before.find((item) => item.material.id === m.id)?.count || 0;
    if (count <= old) continue;
    if (!m.active || !m.available)
      return "Один из добавляемых материалов сейчас недоступен.";
    if (Number.isFinite(m.stock) && count > m.stock)
      return `Для материала «${m.name}» недостаточно подтверждённого остатка.`;
  }
  return estimate(next).overfilled
    ? "Для выбранного размера недостаточно места. Замените элементы или измените размер."
    : null;
}
