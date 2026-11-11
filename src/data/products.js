import pearl from "../assets/products/pearl.webp";
import sage from "../assets/products/sage.webp";
import leaf from "../assets/products/leaf.webp";
import violet from "../assets/products/violet.webp";
import pearlOriginal from "../assets/originals/pearl-detail.jpg";
import pearlWrist from "../assets/originals/pearl-wrist.jpg";
import sageOriginal from "../assets/originals/sage-detail.jpg";
import sageWrist from "../assets/originals/sage-wrist.jpg";
import leafOriginal from "../assets/originals/leaf-detail.jpg";
import leafWrist from "../assets/originals/leaf-wrist.jpg";
import leafClose from "../assets/originals/leaf-close.jpg";
import violetOriginal from "../assets/originals/violet-detail.jpg";
import violetWrist from "../assets/originals/violet-wrist.jpg";
import violetClose from "../assets/originals/violet-close.jpg";

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
    original: pearlOriginal,
    wrist: pearlWrist,
    description:
      "Мягкий розовый, прозрачные грани и жемчужные переливы. Светлое сочетание, которое хочется носить и с любимой рубашкой, и с платьем на особенный вечер.",
    detail:
      "В этом сочетании встречаются гладкие, гранёные и жемчужные бусины. Их ритм и порядок сохранены по фотографиям автора.",
    galleries: [
      { image: pearl, label: "В стиле ENOSI" },
      { image: pearlOriginal, label: "Фото автора" },
      { image: pearlWrist, label: "На запястье" },
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
    original: sageOriginal,
    wrist: sageWrist,
    description:
      "Прохладный мятный оттенок встречается с полупрозрачным розовым. Лаконичный ритм круглых бусин — для лёгких образов и маленьких повседневных радостей.",
    detail:
      "Двадцать круглых бусин: десять мятно-зелёных и десять розовых, с чередованием оттенков. Без подвесок и разделителей.",
    galleries: [
      { image: sage, label: "В стиле ENOSI" },
      { image: sageOriginal, label: "Фото автора" },
      { image: sageWrist, label: "На запястье" },
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
    original: leafOriginal,
    wrist: leafWrist,
    description:
      "Глубокий зелёный, розовые камни свободной формы и маленький золотистый лист. Живое, немного неожиданное сочетание фактур — как находка на любимой прогулке.",
    detail:
      "Круглые бусины, камни неправильной формы, небольшие разделители и подвеска-лист. В оригинальных фото можно рассмотреть каждую деталь.",
    galleries: [
      { image: leaf, label: "В стиле ENOSI" },
      { image: leafOriginal, label: "Фото автора" },
      { image: leafWrist, label: "На запястье" },
      { image: leafClose, label: "Детали" },
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
    original: violetOriginal,
    wrist: violetWrist,
    description:
      "Насыщенный фиолетовый и светлый розовый рядом с чёрными фактурными бусинами. Контраст, который становится красивым акцентом в спокойном образе.",
    detail:
      "Гладкие камни и четыре чёрные фактурные бусины с серебристыми ажурными деталями. У одной фиолетовой бусины особенно светлый, лавандовый оттенок.",
    galleries: [
      { image: violet, label: "В стиле ENOSI" },
      { image: violetOriginal, label: "Фото автора" },
      { image: violetWrist, label: "На запястье" },
      { image: violetClose, label: "Детали" },
    ],
  },
];

export const moods = [
  { id: "all", name: "Все сочетания" },
  { id: "soft", name: "Нежные", color: "#dca6ad" },
  { id: "green", name: "Природные", color: "#739777" },
  { id: "contrast", name: "Выразительные", color: "#766088" },
];
