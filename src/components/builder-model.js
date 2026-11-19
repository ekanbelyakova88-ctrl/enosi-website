import { byId } from "../data/materials";
export const STORAGE_KEY = "enosi-bracelet-builder-v1";
export const LIMIT = 60;
export const material = (id) =>
  byId[id] || {
    id,
    name: "Неизвестный материал",
    size: "уточнить",
    mm: 8,
    shape: "круглая",
    available: false,
  };
const uid = () => crypto.randomUUID();
export function validate(value) {
  const beads = Array.isArray(value?.beads)
    ? value.beads.filter((id) => typeof id === "string").slice(0, LIMIT)
    : [];
  const seen = new Set();
  const instanceIds = beads.map((_, i) => {
    const old = value?.instanceIds?.[i];
    const id = typeof old === "string" && !seen.has(old) ? old : uid();
    seen.add(id);
    return id;
  });
  return {
    beads,
    instanceIds,
    name: String(value?.name || "").slice(0, 60),
    wrist: String(value?.wrist || "").slice(0, 5),
    orderId:
      typeof value?.orderId === "string" ? value.orderId : crypto.randomUUID(),
    construction: value?.construction || "elastic",
    birthDate: String(value?.birthDate || "").slice(0, 10),
    themes: Array.isArray(value?.themes)
      ? value.themes.filter((x) => typeof x === "string").slice(0, 12)
      : [],
    intention: String(value?.intention || "").slice(0, 500),
    fit: ["close", "classic", "loose", "unknown"].includes(value?.fit)
      ? value.fit
      : "unknown",
    wishes: String(value?.wishes || "").slice(0, 500),
  };
}
export function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      current: validate(data.current),
      saved: Array.isArray(data.saved)
        ? data.saved.slice(0, 20).map(validate)
        : [],
    };
  } catch {
    return { current: validate({}), saved: [] };
  }
}
export const cropFor = (id) =>
  ({
    m05: [190, 65, 150],
    m06: [275, 65, 170],
    m14: [185, 65, 140],
    m16: [275, 255, 170],
    m17: [245, 120, 235],
    m18: [160, 120, 180],
    m22: [210, 210, 80],
    m29: [50, 145, 145],
  })[id] || [115, 115, 270];
export function layout(beads) {
  // Reserve at least each bead's diameter along a circle, with constant proportional scale.
  const diameters = beads.map((id) =>
    Math.max(8, Math.min(80, material(id).mm * 3.2)),
  );
  const lengths = diameters.map((d) => d + 5);
  const total = lengths.reduce((a, b) => a + b, 0);
  const circumference = Math.max(870, total);
  const scale = 870 / circumference;
  let offset = 0;
  const slots = [{ x: 200, y: 52 }];
  const nodes = diameters.map((d, i) => {
    const angle =
      -Math.PI / 2 + ((offset + lengths[i] / 2) / circumference) * Math.PI * 2;
    offset += lengths[i];
    const slotAngle = -Math.PI / 2 + (offset / circumference) * Math.PI * 2;
    slots.push({
      x: 200 + 138 * Math.cos(slotAngle),
      y: 190 + 138 * Math.sin(slotAngle),
    });
    return {
      x: 200 + 138 * Math.cos(angle),
      y: 190 + 138 * Math.sin(angle),
      d: d * scale,
      angle,
    };
  });
  return { nodes, slots };
}
export function describe(sketch) {
  const counts = {};
  sketch.beads.forEach((id) => (counts[id] = (counts[id] || 0) + 1));
  return [
    `Эскиз ENOSI ${sketch.name}`,
    `Обхват: ${sketch.wrist ? sketch.wrist + " см" : "Нужно подобрать"}`,
    `Состав: ${Object.entries(counts)
      .map(([id, n]) => `${material(id).name} ${material(id).size} — ${n} шт.`)
      .join("; ")}`,
    `Порядок от начала по часовой стрелке: ${sketch.beads.map((id, i) => `${i + 1}. ${material(id).name} (${material(id).shape}, ${material(id).size})`).join(" → ")}`,
    `Пожелания: ${sketch.wishes || "нет"}`,
    "Стоимость, посадку и детали согласуем с Екатериной. Визуальный эскиз приблизительный.",
  ].join("\n");
}
