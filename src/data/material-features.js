// Цветовые группы описывают фотографии запасов ENOSI, не свойства минералов.
const groups = {
  pink: ["m02", "m06", "m10", "m11"],
  green: ["m03", "m18", "m20", "m29", "m30"],
  white: ["m01", "m07", "m08", "m09"],
  purple: ["m12", "m15", "m19", "m28"],
  blue: ["m21", "m24"],
  grey: ["m14", "m22", "m23"],
  black: ["m13", "m25"],
  warm: ["m04", "m05", "m17", "m26", "m27"],
  mixed: ["m16"],
};
export const colorGroups = {
  all: "Все цвета",
  pink: "Розовый",
  green: "Зелёный и мятный",
  white: "Белый и прозрачный",
  purple: "Фиолетовый",
  blue: "Синий",
  grey: "Серый",
  black: "Чёрный",
  warm: "Тёплый красный, медовый, коричневый",
  mixed: "Разноцветный",
};
export const palettes = {
  free: "Свободный выбор",
  warm: "Тёплая",
  cool: "Холодная",
  neutral: "Нейтральная",
  pastel: "Пастельная",
  contrast: "Контрастная",
};
export function colorGroup(id) {
  return Object.keys(groups).find((key) => groups[key].includes(id)) || "mixed";
}
export function matchesFeatures(
  m,
  { color = "all", palette = "free", size = "all", surface = "all" } = {},
) {
  const group = colorGroup(m.id);
  if (color !== "all" && group !== color) return false;
  const allowed = {
    warm: ["warm", "pink"],
    cool: ["green", "blue", "purple", "grey"],
    neutral: ["white", "grey", "black"],
    pastel: ["pink", "white", "green"],
    contrast: ["black", "warm", "purple", "blue"],
  };
  if (palette !== "free" && !allowed[palette]?.includes(group)) return false;
  const numbers = m.size
    .match(/\d+(?:[.,]\d+)?/g)
    ?.map((s) => Number(s.replace(",", "."))) || [m.mm];
  const min = Math.min(...numbers),
    max = Math.max(...numbers);
  if (size === "small" && max > 8) return false;
  if (size === "medium" && (min < 8 || max > 10)) return false;
  if (size === "large" && max <= 10) return false;
  const finish =
    m.shape === "матовая"
      ? "matte"
      : m.shape === "гранёная" || m.treatment?.includes("гран")
        ? "faceted"
        : "other";
  return surface === "all" || surface === finish;
}
