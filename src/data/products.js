
const setPhotos = import.meta.glob("../assets/set-styled/*.webp", { eager: true, query: "?url", import: "default" });
const setPhoto = n => setPhotos[`../assets/set-styled/${String(n).padStart(2, "0")}.webp`];
const setAngle = (n, label) => ({ image: setPhoto(n), label });
const generatedPhotos = import.meta.glob("../assets/gallery/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
const photo = (number) =>
  generatedPhotos[`../assets/gallery/${String(number).padStart(2, "0")}.webp`];
const angle = (number, label) => ({
  image: photo(number),
  label,
  sourceNumber: number,
});
const pearl = photo(17),
  sage = photo(1),
  leaf = photo(7),
  violet = photo(11);

// Individually selected clear corners. Keep the logo off flowers, hands,
// stone details and patterned backgrounds; lower corners are intentional fallbacks.
const corners = {
  1: "top-right",
  2: "bottom-right",
  3: "bottom-right",
  4: "top-right",
  5: "bottom-left",
  6: "top-right",
  7: "top-left",
  8: "top-left",
  9: "top-left",
  10: "top-left",
  11: "top-left",
  12: "bottom-right",
  13: "top-left",
  14: "top-left",
  15: "bottom-right",
  16: "top-left",
  17: "top-left",
  18: "top-left",
  19: "top-left",
  20: "top-left",
  21: "top-left",
};
export const photoBranding = Object.fromEntries(
  Object.entries(corners).map(([number, corner]) => [
    photo(Number(number)),
    { corner, ...(Number(number) === 6 ? { insetY: "1%" } : {}) },
  ]),
);
for (let n = 1; n <= 7; n++) photoBranding[setPhoto(n)] = { corner: n === 1 || n === 5 ? "bottom-left" : n === 7 ? "top-left" : "top-right" };
export const homePhotos = {
  story: photo(5),
  light: photo(20),
  contrast: photo(16),
};

export const TELEGRAM_URL = "https://t.me/BeliakovaKaterina";
export const contactFor = (product) =>
  `${TELEGRAM_URL}?text=${encodeURIComponent(`Здравствуйте, Екатерина! Мне понравилось украшение ENOSI «${product.name}». Хочу обсудить размер, камни и оформление заказа.`)}`;

// Mineral names must be confirmed by the author, not inferred from a photograph.
export const products = [
  {
    id: "gentle-balance",
    name: "Нежное равновесие",
    palette: "Розовый · прозрачный · жемчужный",
    materials: "Розовый кварц · горный хрусталь · жемчуг",
    mood: "soft",
    tag: "НЕЖНОСТЬ В ДЕТАЛЯХ",
    image: pearl,
    cover: photo(18),
    wrist: photo(21),
    description:
      "Мягкий розовый, прозрачные бусины и жемчужные переливы. Светлое сочетание, которое хочется носить и с любимой рубашкой, и с платьем на особенный вечер.",
    detail:
      "Розовый кварц, прозрачный горный хрусталь и жемчуг соединяются в светлый ритм. Порядок бусин сохранён по фотографиям автора.",
    galleries: [
      angle(17, "Предметное фото"),
      angle(18, "Другой ракурс"),
      angle(19, "Крупный план"),
      angle(20, "Детали"),
      angle(21, "На запястье"),
    ],
  },
  {
    id: "same-wave",
    name: "На одной волне",
    palette: "Мятно-зелёный · пудровый",
    materials: "Матовый амазонит · розовый кварц",
    mood: "soft",
    tag: "ПРИРОДНОЕ ПРИТЯЖЕНИЕ",
    image: sage,
    cover: photo(1),
    wrist: photo(3),
    description:
      "Прохладный мятный оттенок встречается с полупрозрачным розовым. Лаконичный ритм круглых бусин — для лёгких образов и маленьких повседневных радостей.",
    detail:
      "Двадцать круглых бусин: десять мятно-зелёных и десять розовых, с чередованием оттенков. Без подвесок и разделителей.",
    galleries: [
      angle(1, "Предметное фото"),
      angle(2, "Другой ракурс"),
      angle(3, "На запястье"),
      angle(4, "На ладони"),
    ],
  },
  {
    id: "forest-story",
    name: "Лесная история",
    palette: "Зелёный · розовый · золотистый",
    materials: "Авантюрин · горный хрусталь · крошка розового кварца",
    mood: "green",
    tag: "У КАЖДОГО СВОЙ ХАРАКТЕР",
    image: leaf,
    cover: photo(8),
    wrist: photo(10),
    description:
      "Глубокий зелёный, розовые камни свободной формы и маленький золотистый лист. Живое, немного неожиданное сочетание фактур — как находка на любимой прогулке.",
    detail:
      "Круглые бусины, камни неправильной формы, небольшие разделители и подвеска-лист. Рассмотрите разные ракурсы и вид на запястье.",
    galleries: [
      angle(7, "Предметное фото"),
      angle(5, "Общий план"),
      angle(6, "На ладони"),
      angle(8, "Крупный план"),
      angle(9, "На руке"),
      angle(10, "На запястье"),
    ],
  },
  {
    id: "after-sunset",
    name: "После заката",
    palette: "Фиолетовый · дымчато-розовый · чёрный",
    materials: "Аметист · розовый кварц · лава",
    mood: "contrast",
    tag: "ВЫРАЗИТЕЛЬНОЕ СОЧЕТАНИЕ",
    image: violet,
    cover: photo(13),
    wrist: photo(15),
    description:
      "Фиолетовый аметист и полупрозрачный розовый кварц рядом с чёрной фактурной лавой. Одна светлая лавандовая бусина выделяется матовой поверхностью — тонкая деталь в ритме полированных камней.",
    detail:
      "В браслете четыре чёрные бусины лавы с серебристыми ажурными деталями. У аметиста шесть тёмных полированных бусин и одна светлая лавандовая — она единственная матовая.",
    galleries: [
      angle(11, "Предметное фото"),
      angle(12, "На руке"),
      angle(13, "Детали"),
      angle(14, "Другой ракурс"),
      angle(15, "На запястье"),
      angle(16, "Крупный план"),
    ],
  },
  ...[
    { id: "tree-bracelet", name: "Браслет «Дерево жизни»", type: "Браслет", price: 1990, detail: "Браслет с круглыми камнями и серебристыми разделителями.", description: "Браслет из розового кварца, горного хрусталя и авантюрина. Сочетается с колье с подвеской-деревом." },
    { id: "tree-necklace", name: "Колье «Дерево жизни»", type: "Колье", price: 3490, detail: "Колье с круглой подвеской в форме дерева и серебристыми деталями.", description: "Колье из розового кварца, горного хрусталя и авантюрина с подвеской-деревом." },
    { id: "tree-set", name: "Комплект «Дерево жизни»", type: "Комплект", price: 4490, detail: "В комплект входят колье с подвеской-деревом и сочетающийся браслет.", description: "Колье и браслет из розового кварца, горного хрусталя и авантюрина." },
  ].map(item => {
    const angles = item.type === "Браслет" ? [setAngle(3, "Браслет"), setAngle(6, "На запястье"), setAngle(7, "Другой ракурс")] : item.type === "Колье" ? [setAngle(5, "Детали колье"), setAngle(4, "На ладони"), setAngle(1, "На модели")] : [setAngle(2, "Колье и браслет"), setAngle(6, "Браслет на запястье"), setAngle(1, "Колье на модели"), setAngle(3, "Браслет крупно")];
    return { ...item, materials: "Розовый кварц · горный хрусталь · авантюрин", mood: "green", tag: item.type.toUpperCase(), galleries: angles, image: angles[0].image, cover: item.type === "Колье" ? setPhoto(1) : angles[0].image, palette: "Зелёный · розовый · прозрачный" };
  }),

];

export const moods = [
  { id: "all", name: "Все сочетания" },
  { id: "soft", name: "Нежные", color: "#dca6ad" },
  { id: "green", name: "Природные", color: "#739777" },
  { id: "contrast", name: "Выразительные", color: "#766088" },
];
