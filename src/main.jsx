import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ArrowRight, X, Menu, Heart, Plus, Minus, Check, MoveRight, Flower2, Gem, Hand, Asterisk } from 'lucide-react';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/cyrillic-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/cyrillic-400-italic.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/cyrillic-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/cyrillic-500.css';
import './styles.css';
import heroImage from './assets/hero.webp';

// Replace image paths and editorial product information here when real ENOSI photographs are ready.
const products = [
  { id: 'first-light', name: 'Первый свет', stone: 'Амазонит · розовый кварц', mood: 'sage', image: 0, description: 'Приглушённый зелёный встречается с полупрозрачным розовым. Мягкое сочетание, которое легко представить и с белой рубашкой, и с любимым трикотажем.' },
  { id: 'pink-pause', name: 'Тихий румянец', stone: 'Розовый кварц · перламутр', mood: 'rose', image: 1, description: 'Пудровые оттенки и светлые переливы. Нежный акцент для тех дней, когда хочется выбрать что-то особенно близкое себе.' },
  { id: 'warm-sand', name: 'Тёплый берег', stone: 'Яшма · солнечный камень', mood: 'sand', image: 2, description: 'Тёплые песочные тона и природный рисунок камней. Спокойное, фактурное сочетание для повседневных образов.' },
];
const moods = [{ id: 'all', name: 'Все сочетания' }, { id: 'sage', name: 'Шалфейные' }, { id: 'rose', name: 'Пудровые' }, { id: 'sand', name: 'Тёплые' }];

function Symbol({ className = '' }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M35 5C5 12 7 45 25 47c14 1-9-16 10-42Z" fill="currentColor" opacity=".85"/><path d="M29 59c30-7 28-40 10-42-14-1 9 16-10 42Z" fill="currentColor" opacity=".45"/><path d="M29 46C37 35 26 28 35 17" stroke="currentColor" strokeWidth=".8"/><circle cx="31" cy="31" r="2.4" fill="#b79665"/></svg>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mood, setMood] = useState('all');
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [openQuestion, setOpenQuestion] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const dialog = useRef(null);
  const modalOpen = Boolean(selected || contactOpen);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector('button')?.focus();
    function onKey(event) {
      if (event.key === 'Escape') { setSelected(null); setContactOpen(false); }
      if (event.key === 'Tab') {
        const focusable = [...dialog.current.querySelectorAll('button, a[href]')];
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); previousFocus?.focus(); };
  }, [modalOpen]);

  function openProduct(product) { setSelected(product); }
  function toggleFavorite(id) { setFavorites(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]); }
  function navigate() { setMenuOpen(false); }

  return <>
    <a className="skip-link" href="#main">Перейти к содержимому</a>
    <div className="announcement">Природа создаёт камни. Мы находим их сочетания.</div>
    <header className="header">
      <a className="wordmark" href="#" aria-label="ENOSI — на главную"><Symbol /><span>ENOSI</span></a>
      <nav className={menuOpen ? 'navigation is-open' : 'navigation'} aria-label="Основная навигация" id="main-navigation">
        <a href="#collection" onClick={navigate}>Коллекция</a><a href="#story" onClick={navigate}>История ENOSI</a><a href="#craft" onClick={navigate}>Камни и детали</a><a href="#contacts" onClick={navigate}>Контакты</a>
      </nav>
      <a className="header-note" href="#philosophy">Красота в соединении <ArrowUpRight size={15}/></a>
      <button className="menu-toggle icon-button" aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </header>
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow"><span className="little-line"/> АВТОРСКИЕ УКРАШЕНИЯ ИЗ НАТУРАЛЬНЫХ КАМНЕЙ</div>
          <h1 id="hero-title">Красота,<br/>к которой<br/><em>тянет.</em><Asterisk className="heading-star" aria-hidden="true"/></h1>
          <p>Неповторимые камни. Неожиданные сочетания.<br className="desktop-break"/> Украшения, в которых вы узнаёте себя.</p>
          <a className="button primary" href="#collection">Найти своё сочетание <ArrowUpRight size={19}/></a>
          <div className="hero-footnote"><span className="small-orbit">e</span><span>Создано вручную.<br/>Выбрано сердцем.</span></div>
        </div>
        <div className="hero-visual">
          <img src={heroImage} alt="Демонстрационная композиция: браслет из розовых и шалфейных бусин на светлом камне" className="hero-image" fetchPriority="high"/>
          <span className="image-tag">ПРИРОДА × ТВОРЧЕСТВО</span>
          <div className="photo-caption"><span>Искусство быть собой</span><span>ENOSI / 01</span></div>
          <div className="hero-seal"><Symbol/><span>У КАЖДОГО КАМНЯ<br/>СВОЙ ХАРАКТЕР</span></div>
        </div>
      </section>

      <div className="values-strip"><span><Hand size={19}/> Ручная работа, небольшие партии</span><i/><span><Gem size={19}/> Красота натуральных камней</span><i/><span><Flower2 size={20}/> Свобода быть разной</span></div>

      <section className="collection section-space" id="collection" aria-labelledby="collection-title">
        <div className="section-heading reveal"><div><div className="eyebrow">МАЛЕНЬКИЕ ИСТОРИИ В КАМНЯХ</div><h2 id="collection-title">С чем вы <em>созвучны?</em></h2></div><p>Не ищите особый повод.<br/>Достаточно вашего «мне нравится».</p></div>
        <div className="collection-toolbar"><div className="filters" role="group" aria-label="Выбрать оттенок">{moods.map(item => <button key={item.id} className={mood === item.id ? 'filter active' : 'filter'} aria-pressed={mood === item.id} onClick={() => setMood(item.id)}>{item.id !== 'all' && <span className={`color-dot ${item.id}`}/>} {item.name}</button>)}</div><span className="collection-count">{mood === 'all' ? 'Три сочетания — три характера' : 'Ваше сочетание'}</span></div>
        <div className="product-grid">{products.filter(product => mood === 'all' || product.mood === mood).map(product => <article className="product-card" key={product.id}>
          <div className={`product-picture product-${product.image}`}>
            <button className="product-image-button" onClick={event => openProduct(product, event)} aria-label={`Подробнее: ${product.name}`}><span className="product-photo" role="img" aria-label={`Демонстрационный браслет: ${product.stone}`}/><span className="view-product">Рассмотреть поближе <ArrowUpRight size={17}/></span></button>
            <span className="product-tag">{product.image === 0 ? 'НЕЖНОЕ ЗНАКОМСТВО' : product.image === 1 ? 'МЯГКИЙ АКЦЕНТ' : 'ПРИРОДНЫЕ ОТТЕНКИ'}</span>
            <button className={`favorite icon-button ${favorites.includes(product.id) ? 'is-favorite' : ''}`} aria-label={`${favorites.includes(product.id) ? 'Убрать из' : 'Добавить в'} избранного: ${product.name}`} aria-pressed={favorites.includes(product.id)} onClick={() => toggleFavorite(product.id)}><Heart size={19} fill={favorites.includes(product.id) ? 'currentColor' : 'none'}/></button>
          </div>
          <div className="product-info"><div><button className="product-name" onClick={event => openProduct(product, event)}>{product.name}</button><p>{product.stone}</p></div><button className="product-arrow icon-button" onClick={event => openProduct(product, event)} aria-label={`Открыть ${product.name}`}><ArrowUpRight size={23}/></button></div>
        </article>)}</div>
        <p className="demo-note">Вдохновение для будущей коллекции. Изображения созданы для демонстрации и не являются фотографиями изделий ENOSI.</p>
      </section>

      <section className="philosophy" id="philosophy"><div className="philosophy-inner reveal"><Symbol className="philosophy-symbol"/><div className="eyebrow">ЕСТЕСТВЕННОЕ ПРИТЯЖЕНИЕ</div><h2>Красота не нуждается в объяснениях,<br/>чтобы <em>привлекать.</em></h2><p>Мы создаём украшения. А их личную историю<br className="desktop-break"/> вы определяете сами.</p><span className="handwritten">В этом и есть ENOSI.</span></div><span className="decorative-orbit orbit-one"/><span className="decorative-orbit orbit-two"/></section>

      <section className="story section-space" id="story" aria-labelledby="story-title">
        <div className="story-art reveal"><div className="story-image" role="img" aria-label="Природные фактуры и украшение в мягком свете"/><div className="story-art-label"><Symbol/><span>разные элементы.<br/><em>одна гармония.</em></span></div><span className="vertical-note">THE ART OF COMING TOGETHER</span></div>
        <div className="story-copy reveal"><div className="eyebrow">ДАВАЙТЕ ЗНАКОМИТЬСЯ</div><h2 id="story-title">Всё начинается<br/><em>с соединения.</em></h2><p className="lead">ENOSI — слово греческого происхождения,<br className="desktop-break"/> означающее «соединение», «союз».</p><p>У каждого камня свой оттенок, рисунок и характер. Когда они встречаются, рождается новая история. Именно эти встречи вдохновляют меня создавать украшения.</p><p>Я собираю браслеты вручную, небольшими партиями. Ищу красивые сочетания, прислушиваюсь к деталям — и оставляю вам самое главное: свободу выбирать то, что откликается именно вам.</p><a className="text-link" href="#craft">Ближе к деталям <MoveRight size={22}/></a><span className="story-signature">С любовью к красивым сочетаниям,<br/><span>ENOSI</span></span></div>
      </section>

      <section className="craft section-space" id="craft" aria-labelledby="craft-title"><div className="section-heading reveal"><div><div className="eyebrow">ЦЕННОСТЬ В ПРОСТЫХ ВЕЩАХ</div><h2 id="craft-title">Природа. Руки. <em>Детали.</em></h2></div><p>То, что делает украшение особенным,<br/>не всегда заметно с первого взгляда.</p></div><div className="craft-grid">
        <article className="craft-card reveal"><span className="craft-number">01 / ПРИРОДА</span><div className="stone-art"><span/><span/><span/></div><h3>Нет двух одинаковых</h3><p>Тонкие прожилки, оттенки и переливы — естественные особенности натуральных камней. Они делают каждое сочетание неповторимым.</p></article>
        <article className="craft-card reveal"><span className="craft-number">02 / ТВОРЧЕСТВО</span><div className="connection-art"><span/><span/><i/></div><h3>Собрано с вниманием</h3><p>От выбора бусин до последней детали — каждый браслет проходит через руки автора. Небольшие партии оставляют место творчеству.</p></article>
        <article className="craft-card reveal"><span className="craft-number">03 / ВЫ</span><div className="freedom-art"><Symbol/></div><h3>Без заданных правил</h3><p>Носите по одному или соединяйте. Сочетайте с любимыми вещами, пробуйте новое. Здесь нет правильного выбора — есть ваш.</p></article>
      </div></section>

      <section className="care section-space"><div className="care-title"><div className="eyebrow">НЕМНОГО ЗАБОТЫ</div><h2>Чтобы любимое<br/>оставалось <em>рядом.</em></h2><p>Простые ответы для первого знакомства.</p></div><div className="accordion">{[
        ['Как выбрать размер браслета?', 'Измерьте запястье мягкой лентой без натяжения. Для свободной посадки обычно добавляют около 1–1,5 см. Точный размер и посадку будущих моделей мы уточним в их описании.'],
        ['Как ухаживать за натуральными камнями?', 'Снимайте браслет перед душем, тренировкой и уборкой. Избегайте контакта с парфюмом и бытовой химией. Протирайте мягкой сухой тканью и храните отдельно от других украшений.'],
        ['Можно ли уже заказать украшение?', 'Сейчас это первая демонстрационная версия ENOSI. Заказы и оплата ещё не открыты. Коллекция, фотографии реальных изделий и способы связи появятся после знакомства с дизайном.'],
      ].map(([question, answer], index) => <div className="accordion-item" key={question}><h3><button aria-expanded={openQuestion === index} aria-controls={`answer-${index}`} onClick={() => setOpenQuestion(openQuestion === index ? null : index)}>{question}{openQuestion === index ? <Minus size={19}/> : <Plus size={19}/>}</button></h3><div id={`answer-${index}`} hidden={openQuestion !== index}><p>{answer}</p></div></div>)}</div></section>

      <section className="contact" id="contacts"><div className="contact-flower"><Symbol/></div><div className="eyebrow">У КРАСИВЫХ ИСТОРИЙ ЕСТЬ ПРОДОЛЖЕНИЕ</div><h2>Найдём ваше<br/><em>сочетание?</em></h2><p>Обсудить оттенки, задать вопрос или просто познакомиться.<br className="desktop-break"/> Каждой встрече мы будем рады.</p><button className="button primary" onClick={() => setContactOpen(true)}>Давайте знакомиться <ArrowUpRight size={18}/></button><span className="contact-note">Первая глава ENOSI. Скоро — больше.</span></section>
    </main>
    <footer className="footer"><div className="footer-top"><a className="wordmark" href="#" aria-label="ENOSI — наверх"><Symbol/><span>ENOSI</span></a><p>Авторские украшения.<br/>Естественное притяжение.</p><div><a href="#collection">Коллекция</a><a href="#story">О бренде</a><a href="#contacts">Контакты</a></div><a className="back-top" href="#">Наверх <ArrowUpRight size={17}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} ENOSI</span><span>Создаём с удовольствием. Выбираем сердцем.</span><span>Демонстрационная версия</span></div></footer>

    {modalOpen && <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) { setSelected(null); setContactOpen(false); } }}><div className={`modal ${selected ? 'product-modal' : 'contact-modal'}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title" ref={dialog}><button className="modal-close icon-button" aria-label="Закрыть окно" onClick={() => { setSelected(null); setContactOpen(false); }}><X/></button>{selected ? <><div className={`modal-image product-${selected.image}`}><span className="product-photo" role="img" aria-label={`Демонстрационное украшение ${selected.name}`}/></div><div className="modal-copy"><div className="eyebrow">ЭСКИЗ БУДУЩЕЙ КОЛЛЕКЦИИ</div><h2 id="dialog-title">{selected.name}</h2><p className="modal-stone">{selected.stone}</p><p>{selected.description}</p><p className="modal-disclaimer">Это демонстрационная модель. Состав, фотографии и наличие реальных изделий будут добавлены позже.</p><button className="button primary" onClick={() => toggleFavorite(selected.id)}>{favorites.includes(selected.id) ? <>Сочетание сохранено <Check size={18}/></> : <>Мне нравится <Heart size={18}/></>}</button><span className="save-note">Выбор сохранится до перезагрузки страницы.</span></div></> : <div className="modal-copy"><Symbol className="contact-dialog-symbol"/><div className="eyebrow">НАЧАЛО КРАСИВОЙ ИСТОРИИ</div><h2 id="dialog-title">Будем на связи</h2><p>Здесь скоро появятся настоящие контакты ENOSI — можно будет написать автору, обсудить украшение и познакомиться поближе.</p><p className="modal-disclaimer">Это демонстрация будущего сайта. Сообщения пока не отправляются, а личные данные не собираются.</p><button className="button primary" onClick={() => setContactOpen(false)}>Продолжить знакомство <ArrowRight size={18}/></button></div>}</div></div>}
  </>;
}

createRoot(document.getElementById('root')).render(<App/>);
