import BraceletBuilder from "./components/BraceletBuilder";
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
import {
  products,
  moods,
  TELEGRAM_URL,
  contactFor,
  photoBranding,
  homePhotos,
} from "./data/products";
import { stones, productStones } from "./data/stones";
import logo from "./assets/logo-enosi-transparent.png";
import heroCollection from "./assets/hero-collection.webp";
import "./styles.css";

const questions = [
  [
    "Как заказать украшение?",
    "Напишите Екатерине в Telegram и расскажите, какое украшение вам понравилось. Мы согласуем размер и детали; по желанию можно обсудить изменение камней. Все изделия создаются на заказ.",
  ],
  [
    "Как происходит оплата?",
    "Предоплата — 50% при заказе. После изготовления вы получите фотографии изделия для согласования. Когда вы подтвердите, что всё нравится, оплачиваются оставшиеся 50% и доставка. Затем заказ отправляется вам.",
  ],
  [
    "Сколько занимает изготовление и как работает доставка?",
    "Изготовление занимает от 3 до 10 дней в зависимости от загруженности. Отправляем Почтой России или СДЭК. Доставка оплачивается покупателем; её стоимость уточним при заказе.",
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
  const branding = src === heroCollection ? { corner: "top-right" } : photoBranding[src] || { corner: "top-left" };
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
      <span
        className="photo-watermark"
        data-corner={branding.corner}
        style={branding.insetY ? { "--wm-y": branding.insetY } : undefined}
        aria-hidden="true"
      >
        <img src={logo} alt="" />
      </span>
    </span>
  );
}

function StoneCard({ product }) {
  return (
    <article
      className="stone-card"
      aria-label={`Камни украшения «${product.name}»`}
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
  const [selected, setSelected] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
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
  const touchStart = useRef(null);
  const [zoom, setZoom] = useState(false);
  const zoomRef = useRef(false);
  zoomRef.current = zoom;
  const [photoError, setPhotoError] = useState(false);
  const requestedPhoto = useRef(0);
  const requestVersion = useRef(0);
  const displayedPhoto = useRef(0);
  displayedPhoto.current = photoIndex;
  const zoomButton = useRef(null);
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
      if (event.key === "Escape") { if (zoomRef.current) { setZoom(false); requestAnimationFrame(() => zoomButton.current?.focus()); } else setSelected(null); }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        moveSlide(event.key === "ArrowRight" ? 1 : -1);
      }
      if (event.key === "Tab" && zoomRef.current) { event.preventDefault(); dialog.current?.querySelector(".gallery-zoom button")?.focus(); return; }
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
    if (!selected) return;
    const strip = dialog.current?.querySelector(".gallery-thumbnails");
    const active = strip?.querySelector(`[data-slide-index="${photoIndex}"]`);
    if (strip && active)
      strip.scrollTo({
        left: Math.max(
          0,
          active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2,
        ),
      });
  }, [selected, photoIndex]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function openProduct(product, event) {
    trigger.current = event.currentTarget;
    requestVersion.current++;
    requestedPhoto.current = 0;
    setPhotoIndex(0);
    setPhotoError(false);
    setZoom(false);
    setSelected(product);
  }
  function selectPhoto(index) {
    if (!selected?.galleries.length) return;
    const target = (index + selected.galleries.length) % selected.galleries.length;
    requestedPhoto.current = target;
    const version = ++requestVersion.current;
    const image = new Image();
    image.src = selected.galleries[target].image;
    image.decode().then(() => {
      if (version === requestVersion.current) { setPhotoError(false); setPhotoIndex(target); }
    }).catch(() => { if (version === requestVersion.current) { requestedPhoto.current = displayedPhoto.current; setPhotoError(true); } });
  }
  function moveSlide(direction) { selectPhoto(requestedPhoto.current + direction); }
  useEffect(() => {
    if (!selected?.galleries.length) return;
    const next = new Image();
    next.src = selected.galleries[(photoIndex + 1) % selected.galleries.length].image;
    next.decode().catch(() => {});
  }, [selected, photoIndex]);
  useEffect(() => () => { requestVersion.current++; }, [selected]);
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
        <a href="#contacts">Знакомиться с автором <ArrowUpRight size={12} /></a>
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
          <a href="#constructor" onClick={() => setMenuOpen(false)}>Создать браслет</a>
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
          <a className="header-contact" href="#contacts">Связаться <ArrowUpRight size={15} /></a>
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
            <p className="hero-category">
              Авторские украшения{" "}
              <span>
                из <strong>натуральных камней</strong>
              </span>
            </p>
            <h1 id="hero-title">
              Красота, <span className="hero-phrase">к которой</span>{" "}
              <em>тянет.</em>
            </h1>
            <p>
              Соединяем оттенки, фактуры и маленькие детали.
              <br className="desktop-break" /> Чтобы вы нашли своё — с первого
              взгляда.
            </p>
            <p className="hero-craft-note">
              Собраны вручную. Небольшими партиями.
            </p>
            <div className="hero-buttons">
              <a className="button primary" href="#collection">
                Выбрать украшение <ArrowUpRight size={19} />
              </a>
            </div>
          </div>
          <BrandedPhoto
            className="hero-neutral"
            imageClassName="hero-image"
            src={heroCollection}
            alt="Художественная композиция из браслетов с разноцветными камнями"
            loading="eager"
            fetchPriority="high"
          />
          <p className="hero-image-note">Художественная композиция · варианты украшений</p>
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
                СОЧЕТАНИЯ, КОТОРЫЕ ХОЧЕТСЯ НОСИТЬ.
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
                    {product.cover ? <BrandedPhoto src={product.cover} imageClassName={product.type ? "natural-product" : ""} alt={`${product.type || "Браслет"} «${product.name}»: ${product.palette.toLowerCase()}`} loading="lazy" /> : <span className="photo-pending">Фото украшения готовится</span>}
                    <span className="view-product">
                      Рассмотреть поближе <ArrowUpRight size={17} />
                    </span>
                  </button>

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
                  <p>{(product.price || 1990).toLocaleString("ru-RU")} ₽ · Изготовление на заказ</p>
                  <button
                    className="product-more"
                    onClick={(event) => openProduct(product, event)}
                  >
                    Узнать ближе <ArrowUpRight size={16} />
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
              <span className="small-dot" /> Каждое украшение собрано автором
              вручную
            </span>
            <a href="#contacts">Помочь с выбором? Связаться с Екатериной <ArrowUpRight size={15} /></a>
          </div>
        </section>

        <BraceletBuilder />

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
              src={homePhotos.story}
              alt="Браслет ENOSI с зелёным авантюрином и розовым кварцем"
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
              Я создаю украшения вручную, небольшими партиями. Мне важно, чтобы
              украшение хотелось рассматривать — и с удовольствием носить каждый
              день.
            </p>
            <p>Я создаю украшения. А их личную историю вы определяете сами.</p>
            <a className="text-link" href="#contacts">Познакомиться с Екатериной <ArrowUpRight size={22} /></a>
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
                src={homePhotos.light}
                alt="Светлый браслет ENOSI с розовыми и жемчужными бусинами"
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
                src={homePhotos.contrast}
                alt="Контрастный фиолетово-чёрный браслет ENOSI"
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
            <a className="button contact-button" href="https://max.ru/u/f9LHodD0cOL0UMph0aJXniNSXxQtPOUQcCmjElEUAEtc-cQi4j2GZmhCvzw" target="_blank" rel="noopener noreferrer">Написать в MAX</a>
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
            <TelegramLink>Telegram <ArrowUpRight size={13} /></TelegramLink>
            <a href="https://max.ru/u/f9LHodD0cOL0UMph0aJXniNSXxQtPOUQcCmjElEUAEtc-cQi4j2GZmhCvzw" target="_blank" rel="noopener noreferrer">MAX <ArrowUpRight size={13} /></a>
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
          Изображения украшений созданы на основе фотографий автора и могут
          отличаться от изделий в деталях. Первый экран — художественная
          композиция. Размер и детали можно обсудить с Екатериной.
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
              {selected.galleries.length ? <>
              <div className="gallery-topline"><span>{selected.galleries[photoIndex].label}</span><span aria-live="polite">{photoIndex + 1} / {selected.galleries.length}</span></div>
              <div className="gallery-stage" onTouchStart={(event) => { const t=event.touches[0]; touchStart.current={x:t.clientX,y:t.clientY}; }} onTouchEnd={(event) => { if(!touchStart.current)return; const t=event.changedTouches[0], dx=touchStart.current.x-t.clientX, dy=touchStart.current.y-t.clientY; touchStart.current=null; if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.4)moveSlide(dx>0?1:-1); }}>
                <button className="modal-image gallery-photo-button" onClick={() => moveSlide(1)} aria-label="Показать следующую фотографию">
                  <BrandedPhoto src={selected.galleries[photoIndex].image} imageClassName={selected.type ? "natural-product" : ""} alt={`${selected.name} — ${selected.galleries[photoIndex].label.toLowerCase()}`} />
                </button>
                <button className="gallery-overlay-arrow previous" aria-label="Предыдущая фотография" onClick={() => moveSlide(-1)}><ArrowLeft size={20} /></button>
                <button className="gallery-overlay-arrow next" aria-label="Следующая фотография" onClick={() => moveSlide(1)}><ArrowRight size={20} /></button>
              </div>
              {photoError && <p role="status">Не удалось загрузить фотографию. Попробуйте ещё раз.</p>}
              <div className="gallery-navigation">
                <button ref={zoomButton} onClick={() => setZoom(true)}>Увеличить фотографию</button>
              </div>
              <div className="gallery-thumbnails" role="group" aria-label="Фотографии украшения">
                {selected.galleries.map((photo,index) => <button key={photo.label} data-photo-slide={index} data-slide-index={index} className={photoIndex===index?"active":""} aria-pressed={photoIndex===index} onClick={() => selectPhoto(index)}><BrandedPhoto src={photo.image} alt="" /><span>{photo.label}</span></button>)}
              </div>
              {zoom && <div className="gallery-zoom" role="dialog" aria-modal="true" aria-label="Увеличенная фотография"><button onClick={() => { setZoom(false); requestAnimationFrame(() => zoomButton.current?.focus()); }} autoFocus aria-label="Закрыть увеличение">Закрыть ×</button><BrandedPhoto src={selected.galleries[photoIndex].image} alt={`${selected.name} — увеличенная фотография`} /></div>}
              </> : <div className="photo-pending modal-photo-pending">Фото украшения готовится</div>}
            </div>
            <div className="modal-copy">
              <span className="eyebrow">АВТОРСКОЕ СОЧЕТАНИЕ ENOSI</span>
              <h2 id="dialog-title">{selected.name}</h2>
              <p className="modal-palette">{selected.materials}</p>
              <p>{(selected.price || 1990).toLocaleString("ru-RU")} ₽ · Изготовление на заказ. Размер — по вашим меркам.</p>
              <p>{selected.description}</p>
              <p className="product-photo-note">Изображения стилизованы по фотографиям автора; детали изделия можно уточнить у Екатерины.</p>
              <StoneCard product={selected} />
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
              <a className="button primary product-contact" href="https://max.ru/u/f9LHodD0cOL0UMph0aJXniNSXxQtPOUQcCmjElEUAEtc-cQi4j2GZmhCvzw" target="_blank" rel="noopener noreferrer">Написать в MAX</a>
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
