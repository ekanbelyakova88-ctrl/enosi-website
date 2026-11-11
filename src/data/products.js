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

export const TELEGRAM_URL = "https://t.me/BeliakovaKaterina";
export const contactFor = (product) =>
  `${TELEGRAM_URL}?text=${encodeURIComponent(`Здравствуйте, Екатерина! Мне понравился браслет ENOSI «${product.name}». Подскажите, пожалуйста, его состав, размер и наличие.`)}`;

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
    wrist: photo(21),
    description:
      "Мягкий розовый, прозрачные грани и жемчужные переливы. Светлое сочетание, которое хочется носить и с любимой рубашкой, и с платьем на особенный вечер.",
    detail:
      "В этом сочетании встречаются гладкие, гранёные и жемчужные бусины. Их ритм и порядок сохранены по фотографиям автора.",
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
    wrist: photo(15),
    description:
      "Насыщенный фиолетовый и светлый розовый рядом с чёрными фактурными бусинами. Контраст, который становится красивым акцентом в спокойном образе.",
    detail:
      "Гладкие камни и четыре чёрные фактурные бусины с серебристыми ажурными деталями. У одной фиолетовой бусины особенно светлый, лавандовый оттенок.",
    galleries: [
      angle(11, "Предметное фото"),
      angle(12, "На руке"),
      angle(13, "Детали"),
      angle(14, "Другой ракурс"),
      angle(15, "На запястье"),
      angle(16, "Крупный план"),
    ],
  },
];

export const moods = [
  { id: "all", name: "Все сочетания" },
  { id: "soft", name: "Нежные", color: "#dca6ad" },
  { id: "green", name: "Природные", color: "#739777" },
  { id: "contrast", name: "Выразительные", color: "#766088" },
];
