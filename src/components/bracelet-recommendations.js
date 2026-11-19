import { materials, byId, inStock } from "../data/materials";
import { colorGroup } from "../data/material-features";
// Это авторские цветовые ассоциации ENOSI, не утверждения об эффектах камней.
const associations = {
  Любовь: [["m11", "m02", "m08"], "мягкие розовые и молочные оттенки"],
  Спокойствие: [["m30", "m09", "m21"], "приглушённые прохладные оттенки"],
  Уверенность: [["m27", "m13", "m04"], "выразительный тёмный и тёплый акцент"],
  Защита: [
    ["m25", "m13", "m23"],
    "сдержанный тёмный цвет как ваш личный символ",
  ],
  Достаток: [
    ["m05", "m17", "m04"],
    "тёплая медовая палитра как авторская ассоциация",
  ],
  Гармония: [
    ["m03", "m11", "m08"],
    "соединение зелёного, розового и молочного",
  ],
  Интуиция: [["m14", "m23", "m07"], "сложные светлые и серые оттенки"],
  Энергия: [["m26", "m27", "m04"], "насыщенные красные и коричневые акценты"],
  Вдохновение: [
    ["m28", "m16", "m18"],
    "выразительные фиолетовые и разноцветные детали",
  ],
};
export function recommendations(themes = [], sign = null) {
  const found = new Map();
  themes.forEach((theme) => {
    const entry = associations[theme];
    entry?.[0].forEach((id) => {
      const m = byId[id];
      if (inStock(m)) {
        const old = found.get(id);
        found.set(id, {
          material: m,
          reasons: [...(old?.reasons || []), `${theme}: ${entry[1]}`],
        });
      }
    });
  });
  const elementPalettes = {
    Земля: ["green", "warm", "grey"],
    Воздух: ["white", "blue"],
    Огонь: ["warm", "purple", "black"],
    Вода: ["green", "blue", "pink"],
  };
  if (sign && elementPalettes[sign.element])
    materials
      .filter(
        (m) =>
          inStock(m) &&
          elementPalettes[sign.element].includes(colorGroup(m.id)),
      )
      .forEach((m) => {
        const old = found.get(m.id);
        found.set(m.id, {
          material: m,
          reasons: [
            ...(old?.reasons || []),
            `Авторская палитра ENOSI для образа стихии «${sign.element}». Это современная цветовая интерпретация, а не традиционное назначение камня.`,
          ],
        });
      });
  return [...found.values()];
}
export function composeMaterials(ids, wrist) {
  const available = ids.filter((id) => inStock(byId[id]));
  if (!available.length) return [];
  // Баланс цвета и размеров: зеркальный мотив. Это стартовая идея, не расчёт посадки.
  const sorted = [...new Set(available)].sort(
    (a, b) =>
      byId[a].mm - byId[b].mm || colorGroup(a).localeCompare(colorGroup(b)),
  );
  const motif =
    sorted.length === 1
      ? sorted
      : [...sorted, ...sorted.slice(1, -1).reverse()];
  const mean = motif.reduce((sum, id) => sum + byId[id].mm, 0) / motif.length;
  const target = Number(wrist) > 0 ? Number(wrist) * 10 : 170;
  const count = Math.min(
    60,
    Math.max(motif.length, Math.round((target + Math.PI * mean) / mean)),
  );
  return Array.from({ length: count }, (_, i) => motif[i % motif.length]);
}
export function compositionStory(sketch) {
  const unique = [...new Set(sketch.beads)]
    .map((id) => byId[id])
    .filter(Boolean);
  if (!unique.length) return "";
  return `В композиции встречаются ${unique.map((m) => m.name.toLowerCase()).join(", ")}. ${sketch.themes?.length ? `Ваши темы — ${sketch.themes.join(", ").toLowerCase()}. ` : ""}${sketch.intention || "Личную историю этого сочетания определяете вы."}`;
}
