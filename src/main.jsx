import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  X,
  Menu,
  Heart,
  Plus,
  Minus,
  Check,
  Send,
  MoveRight,
  Gem,
  Hand,
} from "lucide-react";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/cyrillic-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/cyrillic-400-italic.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/cyrillic-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/cyrillic-500.css";
import { products, moods, TELEGRAM_URL, contactFor } from "./data/products";
import { stones, productStones } from "./data/stones";
import logo from "./assets/logo-enosi-transparent.png";
import "./styles.css";

const heroProducts = [products[0], products[1], products[3]];
const questions = [
  [
    "Как выбрать браслет и узнать наличие?",
    "Напишите Екатерине в Telegram: расскажите, какое сочетание вам понравилось. Автор уточнит наличие, стоимость, состав и поможет подобрать размер. Оплаты и оформления заказов на сайте пока нет.",
  ],
  [
    "Как определить размер запястья?",
    "Измерьте запястье мягкой лентой без натяжения. Для более свободной посадки обычно прибавляют около 1–1,5 см. Перед выбором напишите автору: удобная посадка зависит и от размера бусин.",
  ],
  [
    "Как ухаживать за украшением?",
    "Снимайте браслет перед душем, тренировкой и уборкой. Избегайте прямого контакта с парфюмом и бытовой химией. Протирайте мягкой сухой тканью, храните отдельно от других украшений.",
  ],
  [
    "Будет ли мой браслет точно как на фото?",
    "Фотографии украшений оформлены в едином стиле ENOSI на основе снимков автора. У натуральных камней возможны различия рисунка и оттенка. Детали конкретного браслета и дополнительные фотографии можно обсудить с Екатериной.",
  ],
];

function TelegramLink({ children, className = "", product }) {
  return (
    <a
      className={className}
      href={product ? contactFor(product) : TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

function Brand({ footer = false }) {
  return (
    <a
      className={`brand ${footer ? "brand-footer" : ""}`}
      href="#top"
      aria-label="ENOSI — на главную"
    >
      <img src={logo} alt="Логотип ENOSI" width="1610" height="977" />
    </a>
  );
}

function BrandedPhoto({
  src,
  alt,
  className = "",
  imageClassName = "",
  loading = "lazy",
  fetchPriority,
}) {
  return (
    <span className={`branded-photo ${className}`}>
      <img
        className={`branded-image ${imageClassName}`}
        src={src}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        width="750"
        height="1000"
      />
      <span className="photo-watermark" aria-hidden="true">
        <img src={logo} alt="" />
      </span>
    </span>
  );
}

function StoneCard({ product }) {
  return (
    <article
      className="stone-card"
      aria-label={`Камни браслета «${product.name}»`}
    >
      <header className="stone-card-heading">
        <h3>
          Натуральные камни
          <br />в гармонии
        </h3>
        <img src={logo} alt="ENOSI" />
      </header>
      <p className="stone-card-product">{product.name}</p>
      <div className="stone-rows">
        {productStones[product.id].map((id) => {
          const stone = stones[id];
          return (
            <section className="stone-row" key={id} aria-label={stone.name}>
              <span
                className={`stone-swatch stone-${id}`}
                style={{ backgroundPosition: stone.position }}
                role="img"
                aria-label={`Иллюстрация: ${stone.name.toLowerCase()}`}
              />
              <div>
                <h4>
                  {stone.name}
                  {product.id === "forest-story" && id === "roseQuartz"
                    ? " · крошка"
                    : ""}
                </h4>
                <span className="stone-meaning">{stone.meaning}</span>
                <p>{stone.description}</p>
              </div>
            </section>
          );
        })}
      </div>
      <p className="stone-card-note">
        Образы и ассоциации ENOSI.
        <br />
        Свой личный смысл выбираете вы.
      </p>
    </article>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mood, setMood] = useState("all");
  const [heroIndex, setHeroIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [galleryMode, setGalleryMode] = useState("photos");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("enosi-favorites-v2") || "[]",
      );
      return Array.isArray(saved)
        ? saved.filter((id) => products.some((p) => p.id === id))
        : [];
    } catch {
      return [];
    }
  });
  const [openQuestion, setOpenQuestion] = useState(null);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const heroProduct = heroProducts[heroIndex];
  const visibleProducts = products.filter(
    (p) =>
      (mood === "all" || p.mood === mood) &&
      (!onlyFavorites || favorites.includes(p.id)),
  );

  useEffect(() => {
    try {
      localStorage.setItem("enosi-favorites-v2", JSON.stringify(favorites));
    } catch {
      /* Local storage can be disabled. */
    }
  }, [favorites]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("will-reveal");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector("button")?.focus();
    function onKey(event) {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "Tab") {
        const items = [...dialog.current.querySelectorAll("button, a[href]")];
        const first = items[0],
          last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      trigger.current?.focus();
    };
  }, [selected]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function openProduct(product, event) {
    trigger.current = event.currentTarget;
    setPhotoIndex(0);
    setGalleryMode("photos");
    setSelected(product);
  }
  function toggleFavorite(id) {
    setFavorites((previous) =>
      previous.includes(id)
        ? previous.filter((value) => value !== id)
        : [...previous, id],
    );
  }
  function showFavorites() {
    setOnlyFavorites(!onlyFavorites);
    setMood("all");
    setMenuOpen(false);
    document
      .querySelector("#collection")
      .scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к содержимому
      </a>
      <div className="announcement" id="top">
        <span>Небольшие партии. Большая любовь к деталям.</span>
        <TelegramLink>
          Знакомиться с автором <ArrowUpRight size={12} />
        </TelegramLink>
      </div>
      <header className="header">
        <Brand />
        <nav
          className={menuOpen ? "navigation is-open" : "navigation"}
          aria-label="Основная навигация"
          id="main-navigation"
        >
          <a href="#collection" onClick={() => setMenuOpen(false)}>
            Выбрать украшение
          </a>
          <a href="#story" onClick={() => setMenuOpen(false)}>
            Мир ENOSI
          </a>
          <a href="#craft" onClick={() => setMenuOpen(false)}>
            Внимание к деталям
          </a>
          <a href="#contacts" onClick={() => setMenuOpen(false)}>
            Контакты
          </a>
        </nav>
        <div className="header-actions">
          <button
            className={`icon-button saved-button ${onlyFavorites ? "is-active" : ""}`}
            aria-label={`Избранное: ${favorites.length}`}
            aria-pressed={onlyFavorites}
            onClick={showFavorites}
          >
            <Heart size={19} />
            {favorites.length > 0 && (
              <span className="saved-count">{favorites.length}</span>
            )}
          </button>
          <TelegramLink className="header-contact">
            Написать автору <ArrowUpRight size={15} />
          </TelegramLink>
          <button
            className="menu-toggle icon-button"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow">
              АВТОРСКИЕ УКРАШЕНИЯ ИЗ НАТУРАЛЬНЫХ КАМНЕЙ
            </span>
            <h1 id="hero-title">
              Красота, <span className="hero-phrase">к которой</span>{" "}
              <em>тянет.</em>
            </h1>
            <p>
              Соединяем оттенки, фактуры и маленькие детали.
              <br className="desktop-break" /> Чтобы вы нашли своё — с первого
              взгляда.
            </p>
            <div className="hero-buttons">
              <a className="button primary" href="#collection">
                Выбрать своё сочетание <ArrowUpRight size={19} />
              </a>
              <a className="hero-story-link" href="#story">
                Познакомиться с ENOSI <ArrowRight size={17} />
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-photo-wrap">
              <BrandedPhoto
                key={heroProduct.id}
                imageClassName="hero-image"
                src={heroProduct.image}
                alt={`Браслет ENOSI «${heroProduct.name}», ${heroProduct.palette.toLowerCase()}`}
                fetchPriority="high"
                loading="eager"
              />
              <button
                className="hero-product-label"
                onClick={(event) => openProduct(heroProduct, event)}
              >
                <span>
                  <small>БРАСЛЕТ ENOSI</small>
                  {heroProduct.name}
                </span>
                <span className="round-arrow">
                  <ArrowUpRight size={22} />
                </span>
              </button>
            </div>
            <BrandedPhoto
              className="hero-angle"
              src={heroProduct.wrist}
              alt={`Браслет «${heroProduct.name}» на запястье`}
            />
          </div>
          <div
            className="hero-pagination"
            role="group"
            aria-label="Сочетание на первом экране"
          >
            {["Нежность", "Свежесть", "Характер"].map((name, index) => (
              <button
                key={name}
                onClick={() => setHeroIndex(index)}
                aria-pressed={heroIndex === index}
                className={heroIndex === index ? "active" : ""}
              >
                <span>0{index + 1}</span>
                {name}
                <i />
              </button>
            ))}
          </div>
        </section>

        <div className="values-strip">
          <span>
            <Hand /> Создаём вручную
          </span>
          <span>
            <Gem /> Выбираем природную красоту
          </span>
          <span>
            <Heart /> Соединяем с удовольствием
          </span>
        </div>

        <section
          className="collection section-space"
          id="collection"
          aria-labelledby="collection-title"
        >
          <div className="section-heading reveal">
            <div>
              <span className="eyebrow">
                ЧЕТЫРЕ СОЧЕТАНИЯ. БЕСКОНЕЧНО МНОГО ВАС.
              </span>
              <h2 id="collection-title">
                Сегодня я выбираю <em>себя.</em>
              </h2>
            </div>
            <p>
              Нежное или выразительное?
              <br />
              Пусть решает ваше «нравится».
            </p>
          </div>
          <div className="collection-toolbar">
            <div
              className="filters"
              role="group"
              aria-label="Выбрать настроение"
            >
              {moods.map((item) => (
                <button
                  key={item.id}
                  className={mood === item.id ? "filter active" : "filter"}
                  aria-pressed={mood === item.id}
                  onClick={() => setMood(item.id)}
                >
                  {item.color && (
                    <span
                      className="color-dot"
                      style={{ background: item.color }}
                    />
                  )}{" "}
                  {item.name}
                </button>
              ))}
            </div>
            <button
              className={`favorites-filter ${onlyFavorites ? "active" : ""}`}
              aria-pressed={onlyFavorites}
              onClick={() => setOnlyFavorites(!onlyFavorites)}
            >
              <Heart size={14} />
              <span>Мне нравится</span>
              {favorites.length > 0 && <b>{favorites.length}</b>}
            </button>
          </div>
          <div className="collection-status" aria-live="polite">
            {onlyFavorites
              ? `Избранные сочетания: ${visibleProducts.length}`
              : `Найдено сочетаний: ${visibleProducts.length}`}
          </div>
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-picture">
                  <button
                    className="product-image-button"
                    onClick={(event) => openProduct(product, event)}
                    aria-label={`Подробнее: ${product.name}`}
                  >
                    <BrandedPhoto
                      src={product.image}
                      alt={`Браслет «${product.name}»: ${product.palette.toLowerCase()}`}
                      loading="lazy"
                    />
                    <span className="view-product">
                      Рассмотреть поближе <ArrowUpRight size={17} />
                    </span>
                  </button>
                  <span className="product-tag">
                    0{products.indexOf(product) + 1} / ENOSI
                  </span>
                  <button
                    className={`favorite icon-button ${favorites.includes(product.id) ? "is-favorite" : ""}`}
                    aria-label={`${favorites.includes(product.id) ? "Убрать из избранного" : "Добавить в избранное"}: ${product.name}`}
                    aria-pressed={favorites.includes(product.id)}
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart
                      size={18}
                      fill={
                        favorites.includes(product.id) ? "currentColor" : "none"
                      }
                    />
                  </button>
                </div>
                <div className="product-info">
                  <span className="product-kicker">{product.tag}</span>
                  <button
                    className="product-name"
                    onClick={(event) => openProduct(product, event)}
                  >
                    {product.name}
                  </button>
                  <p>{product.materials}</p>
                  <button
                    className="product-more"
                    onClick={(event) => openProduct(product, event)}
                  >
                    Узнать ближе <ArrowUpRight size={16} />
                  </button>
                  <button
                    className="product-stones"
                    aria-label={`Камни и смысл: ${product.name}`}
                    onClick={(event) => {
                      openProduct(product, event);
                      setGalleryMode("stones");
                    }}
                  >
                    <Gem size={13} /> Камни и смысл
                  </button>
                </div>
              </article>
            ))}
          </div>
          {visibleProducts.length === 0 && (
            <div className="empty-state">
              <Heart size={30} />
              <h3>Здесь будут ваши сочетания</h3>
              <p>
                Нажмите на сердечко у понравившегося браслета.
                <br />
                Или посмотрите всю коллекцию.
              </p>
              <button
                className="button primary"
                onClick={() => {
                  setOnlyFavorites(false);
                  setMood("all");
                }}
              >
                Все сочетания <ArrowRight size={18} />
              </button>
            </div>
          )}
          <div className="collection-note">
            <span>
              <span className="small-dot" /> Каждый браслет собран автором
              вручную
            </span>
            <TelegramLink>
              Помочь с выбором? Напишите Екатерине <ArrowUpRight size={15} />
            </TelegramLink>
          </div>
        </section>

        <section className="manifesto" id="philosophy">
          <div className="manifesto-inner reveal">
            <span className="eyebrow">НАША ФИЛОСОФИЯ</span>
            <h2>
              Не по правилам.
              <br />
              <em>По любви.</em>
            </h2>
            <p>
              Красота не нуждается в объяснениях, чтобы привлекать.
              <br className="desktop-break" /> Иногда достаточно взгляда и
              простого: «Вот оно. Моё».
            </p>
            <a href="#collection" className="text-link">
              Довериться своему вкусу <MoveRight size={24} />
            </a>
          </div>
          <span className="manifesto-petal petal-one" />
          <span className="manifesto-petal petal-two" />
          <span className="manifesto-orbit" />
        </section>

        <section
          className="story section-space"
          id="story"
          aria-labelledby="story-title"
        >
          <div className="story-art reveal">
            <BrandedPhoto
              className="story-photo"
              src={products[1].wrist}
              alt="Браслет ENOSI с мятно-зелёными и розовыми бусинами на запястье, фотография в стиле бренда"
              loading="lazy"
            />
            <div className="story-caption">
              <span className="eyebrow">ОТ АВТОРА — К ВАМ</span>
              <span>
                Красивые вещи
                <br />
                <em>находят своих людей.</em>
              </span>
            </div>
            <span className="story-side-note">
              NATURAL STONES. PERSONAL STORIES.
            </span>
          </div>
          <div className="story-copy reveal">
            <span className="eyebrow">ЕКАТЕРИНА · АВТОР ENOSI</span>
            <h2 id="story-title">
              Мне нравится
              <br />
              соединять.
              <br />
              <em>Вам — выбирать.</em>
            </h2>
            <p className="lead">
              ENOSI означает «соединение».
              <br />
              Именно с него всё начинается.
            </p>
            <p>
              Сочетать прохладный зелёный с мягким розовым. Гладкие бусины — с
              неровными природными формами. Искать маленькую деталь, которая
              соберёт всё воедино.
            </p>
            <p>
              Я создаю браслеты вручную, небольшими партиями. Мне важно, чтобы
              украшение хотелось рассматривать — и с удовольствием носить каждый
              день.
            </p>
            <p>Я создаю украшения. А их личную историю вы определяете сами.</p>
            <TelegramLink className="text-link">
              Познакомиться с Екатериной <ArrowUpRight size={22} />
            </TelegramLink>
            <span className="author-signature">
              С удовольствием создавать.
              <br />
              <em>С удовольствием выбирать.</em>
            </span>
          </div>
        </section>

        <section
          className="craft section-space"
          id="craft"
          aria-labelledby="craft-title"
        >
          <div className="section-heading reveal">
            <div>
              <span className="eyebrow">ТО, ИЗ ЧЕГО СКЛАДЫВАЕТСЯ ENOSI</span>
              <h2 id="craft-title">
                Внимание. В каждом <em>соединении.</em>
              </h2>
            </div>
            <p>
              Больше, чем красивое сочетание.
              <br />
              Меньше, чем громкие обещания.
            </p>
          </div>
          <div className="craft-grid">
            {[
              {
                number: "01",
                icon: <Gem />,
                title: "Природная красота",
                text: "Рисунки, оттенки и фактуры камней интересны сами по себе. Мы выбираем природные материалы за их красоту и неповторимые сочетания.",
              },
              {
                number: "02",
                icon: <Hand />,
                title: "Почерк автора",
                text: "Порядок бусин, ритм оттенков, маленькая подвеска. Каждая деталь становится частью композиции, собранной вручную.",
              },
              {
                number: "03",
                icon: <Heart />,
                title: "Свобода сочетать",
                text: "С рубашкой или платьем. На каждый день или для особенного вечера. Украшение дополняет вас, а не диктует, какой вам быть.",
              },
            ].map((item) => (
              <article className="craft-card reveal" key={item.number}>
                <div className="craft-card-top">
                  <span>{item.number} / ENOSI</span>
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="looks section-space" aria-labelledby="looks-title">
          <div className="section-heading reveal">
            <div>
              <span className="eyebrow">УКРАШЕНИЕ В ВАШЕЙ ИСТОРИИ</span>
              <h2 id="looks-title">
                Для жизни.
                <br />
                <em>И всех её настроений.</em>
              </h2>
            </div>
            <p>
              Фотографии в стиле ENOSI.
              <br />
              Можно представить на своём запястье.
            </p>
          </div>
          <div className="looks-grid">
            <button
              className="look-card"
              onClick={(event) => openProduct(products[0], event)}
            >
              <BrandedPhoto
                src={products[0].wrist}
                alt="Светлый браслет ENOSI с розовыми и жемчужными бусинами на руке"
                loading="lazy"
              />
              <span>
                <small>КОГДА ХОЧЕТСЯ НЕЖНОСТИ</small>Маленький светлый акцент{" "}
                <ArrowUpRight />
              </span>
            </button>
            <div className="look-quote">
              <p>
                У вас есть
                <br />
                право быть
                <br />
                <em>разной.</em>
              </p>
              <span>И КАЖДЫЙ РАЗ — СОБОЙ.</span>
            </div>
            <button
              className="look-card"
              onClick={(event) => openProduct(products[3], event)}
            >
              <BrandedPhoto
                src={products[3].wrist}
                alt="Контрастный фиолетово-чёрный браслет ENOSI на запястье"
                loading="lazy"
              />
              <span>
                <small>КОГДА ХОЧЕТСЯ ХАРАКТЕРА</small>Красивый повод выделиться{" "}
                <ArrowUpRight />
              </span>
            </button>
          </div>
        </section>

        <section className="care section-space" aria-labelledby="care-title">
          <div className="care-title">
            <span className="eyebrow">ПЕРЕД ПЕРВЫМ ЗНАКОМСТВОМ</span>
            <h2 id="care-title">
              Всё просто.
              <br />И с <em>заботой.</em>
            </h2>
            <p>
              О выборе, размере и маленьких
              <br />
              привычках, которые берегут украшения.
            </p>
          </div>
          <div className="accordion">
            {questions.map(([question, answer], index) => (
              <div className="accordion-item" key={question}>
                <h3>
                  <button
                    aria-expanded={openQuestion === index}
                    aria-controls={`answer-${index}`}
                    onClick={() =>
                      setOpenQuestion(openQuestion === index ? null : index)
                    }
                  >
                    {question}
                    {openQuestion === index ? (
                      <Minus size={19} />
                    ) : (
                      <Plus size={19} />
                    )}
                  </button>
                </h3>
                <div id={`answer-${index}`} hidden={openQuestion !== index}>
                  <p>{answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="contact" id="contacts">
          <div className="contact-inner reveal">
            <span className="eyebrow">ОДНО СООБЩЕНИЕ — НАЧАЛО ЗНАКОМСТВА</span>
            <h2>
              Давайте найдём
              <br />
              <em>ваше сочетание.</em>
            </h2>
            <p>
              Помогу выбрать оттенки, расскажу о деталях
              <br className="desktop-break" /> и отвечу на вопросы. Просто
              напишите мне.
            </p>
            <TelegramLink className="button contact-button">
              <Send size={18} /> Написать Екатерине <ArrowUpRight size={20} />
            </TelegramLink>
            <TelegramLink className="contact-handle">
              @BeliakovaKaterina
            </TelegramLink>
            <span className="contact-person">
              Лично автору. Без форм и лишних шагов.
            </span>
          </div>
          <div className="contact-petal contact-petal-one" />
          <div className="contact-petal contact-petal-two" />
        </section>
      </main>
      <footer className="footer">
        <div className="footer-top">
          <Brand footer />
          <p>
            Авторские украшения из натуральных камней.
            <br />
            Красота, к которой тянет.
          </p>
          <div className="footer-links">
            <a href="#collection">Коллекция</a>
            <a href="#story">О бренде</a>
            <TelegramLink>
              Telegram <ArrowUpRight size={13} />
            </TelegramLink>
          </div>
          <a className="back-top" href="#top">
            Наверх <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} ENOSI</span>
          <span>Создаём с удовольствием. Выбираем сердцем.</span>
          <span>Ручная работа · небольшие партии</span>
        </div>
        <p className="photo-note">
          Все фотографии подготовлены в единой стилистике ENOSI на основе
          снимков украшений автора. Состав, размер, стоимость и наличие
          уточняйте лично у Екатерины.
        </p>
      </footer>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div
            className="modal product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            ref={dialog}
          >
            <button
              className="modal-close icon-button"
              aria-label="Закрыть окно"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>
            <div className="modal-gallery">
              <div
                className="gallery-modes"
                role="group"
                aria-label="Содержимое карточки"
              >
                <button
                  aria-pressed={galleryMode === "photos"}
                  onClick={() => setGalleryMode("photos")}
                >
                  Фотографии
                </button>
                <button
                  aria-pressed={galleryMode === "stones"}
                  onClick={() => setGalleryMode("stones")}
                >
                  Камни и смысл
                </button>
              </div>
              {galleryMode === "stones" ? (
                <StoneCard product={selected} />
              ) : (
                <>
                  <div className="modal-image">
                    <BrandedPhoto
                      src={selected.galleries[photoIndex].image}
                      alt={`${selected.name} — ${selected.galleries[photoIndex].label.toLowerCase()}`}
                    />
                    <span className="gallery-label">
                      {selected.galleries[photoIndex].label}
                    </span>
                    <button
                      className="gallery-prev icon-button"
                      aria-label="Предыдущее фото"
                      onClick={() =>
                        setPhotoIndex(
                          (photoIndex - 1 + selected.galleries.length) %
                            selected.galleries.length,
                        )
                      }
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <button
                      className="gallery-next icon-button"
                      aria-label="Следующее фото"
                      onClick={() =>
                        setPhotoIndex(
                          (photoIndex + 1) % selected.galleries.length,
                        )
                      }
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                  <div
                    className="gallery-thumbnails"
                    role="group"
                    aria-label="Ракурсы украшения"
                  >
                    {selected.galleries.map((photo, index) => (
                      <button
                        key={photo.label}
                        className={photoIndex === index ? "active" : ""}
                        aria-pressed={photoIndex === index}
                        onClick={() => setPhotoIndex(index)}
                      >
                        <BrandedPhoto src={photo.image} alt="" />
                        <span>{photo.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="modal-copy">
              <span className="eyebrow">АВТОРСКОЕ СОЧЕТАНИЕ ENOSI</span>
              <h2 id="dialog-title">{selected.name}</h2>
              <p className="modal-palette">{selected.materials}</p>
              <p>{selected.description}</p>
              <p className="product-detail">{selected.detail}</p>
              <div className="modal-information">
                <span>
                  <Hand size={16} /> Ручная работа
                </span>
                <span>
                  <Gem size={16} /> Природные фактуры
                </span>
              </div>
              <TelegramLink
                className="button primary product-contact"
                product={selected}
              >
                Уточнить детали у автора <ArrowUpRight size={18} />
              </TelegramLink>
              <button
                className={`save-product ${favorites.includes(selected.id) ? "is-favorite" : ""}`}
                onClick={() => toggleFavorite(selected.id)}
              >
                {favorites.includes(selected.id) ? (
                  <>
                    <Check size={17} /> Сочетание сохранено
                  </>
                ) : (
                  <>
                    <Heart size={17} /> Мне нравится
                  </>
                )}
              </button>
              <p className="modal-disclaimer">
                Состав, размер, стоимость и наличие уточним лично в Telegram.
                Оттенок камней может немного отличаться в зависимости от экрана.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
