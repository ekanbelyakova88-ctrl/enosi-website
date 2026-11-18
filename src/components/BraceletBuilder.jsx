import React, { useEffect, useMemo, useRef, useState } from "react";
import { materials } from "../data/materials";
import { materialStory } from "../data/material-stories";
import {
  STORAGE_KEY,
  LIMIT,
  material,
  validate,
  load,
  cropFor,
  layout,
  describe,
} from "./builder-model";
import "./builder.css";
import "./workshop.css";
import wristPhoto from "../assets/wrist-neutral.webp";

const TELEGRAM = "https://t.me/BeliakovaKaterina";
const MAX =
  "https://max.ru/u/f9LHodD0cOL0UMph0aJXniNSXxQtPOUQcCmjElEUAEtc-cQi4j2GZmhCvzw";
const ideas = [
  { name: "Нежные оттенки", ids: ["m11", "m01", "m08"] },
  { name: "Природная свежесть", ids: ["m03", "m01", "m11"] },
  { name: "Выразительный контраст", ids: ["m28", "m13", "m11"] },
];

function Bead({ id, x, y, d, instance }) {
  const m = material(id);
  const [cx, cy, size] = cropFor(id);
  const irregular = ["крошка", "самородок", "цилиндр"].includes(m.shape);
  return (
    <svg
      x={x - d / 2}
      y={y - d / 2}
      width={d}
      height={d}
      viewBox={`${cx} ${cy} ${size} ${size}`}
    >
      <defs>
        <clipPath id={`cut-${instance}`}>
          {irregular ? (
            <rect x={cx} y={cy} width={size} height={size} />
          ) : (
            <circle cx={cx + size / 2} cy={cy + size / 2} r={size / 2} />
          )}
        </clipPath>
      </defs>
      {m.image ? (
        <image
          href={m.image}
          width="500"
          height="500"
          clipPath={`url(#cut-${instance})`}
        />
      ) : (
        <circle
          cx={cx + size / 2}
          cy={cy + size / 2}
          r={size / 2}
          fill="#b7b7b0"
        />
      )}
    </svg>
  );
}

function Bracelet({
  sketch,
  selected = -1,
  slot = -1,
  onSelect,
  onInsert,
  onPointerDown,
  interactive = false,
  prefix = "display",
}) {
  const { nodes, slots } = layout(sketch.beads);
  return (
    <svg
      className="workshop-bracelet"
      viewBox="0 0 400 380"
      aria-label="Эскиз браслета: от начала по часовой стрелке"
      role="group"
    >
      <circle
        cx="200"
        cy="190"
        r="138"
        fill="none"
        stroke="#b6bca9"
        strokeWidth="1"
      />
      <text x="200" y="28" textAnchor="middle" fill="#405b43" fontSize="11">
        НАЧАЛО · ПО ЧАСОВОЙ СТРЕЛКЕ
      </text>
      {nodes.map((n, i) => (
        <g
          key={sketch.instanceIds[i]}
          data-instance={sketch.instanceIds[i]}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-label={
            interactive
              ? `Позиция ${i + 1}: ${material(sketch.beads[i]).name}`
              : undefined
          }
          aria-pressed={interactive ? selected === i : undefined}
          onClick={() => onSelect?.(i)}
          onPointerDown={(e) => onPointerDown?.(e, i)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect?.(i);
            }
          }}
        >
          <circle
            cx={n.x}
            cy={n.y}
            r={Math.max(n.d / 2 + 4, 13)}
            fill={selected === i ? "#eed1d8" : "transparent"}
            stroke={selected === i ? "#995269" : "transparent"}
          />
          <Bead
            id={sketch.beads[i]}
            {...n}
            instance={`${prefix}-${sketch.instanceIds[i]}`}
          />
        </g>
      ))}
      {interactive &&
        slots.map((p, i) => (
          <g
            key={i}
            role="button"
            tabIndex="0"
            aria-label={`Вставить бусину: место ${i + 1}`}
            onClick={() => onInsert(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onInsert(i);
              }
            }}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r="7"
              fill={slot === i ? "#44644c" : "#fffdf5"}
              stroke="#7f967b"
            />
            <text
              x={p.x}
              y={p.y + 4}
              fontSize="14"
              textAnchor="middle"
              fill={slot === i ? "white" : "#36543d"}
            >
              +
            </text>
          </g>
        ))}
      {!nodes.length && (
        <text x="200" y="190" textAnchor="middle" fontSize="13" fill="#52664d">
          Выберите бусину и нажмите +
        </text>
      )}
    </svg>
  );
}

function WristPreview({ sketch }) {
  const { nodes } = layout(sketch.beads);
  return (
    <svg
      className="wrist-image"
      viewBox="0 0 400 320"
      aria-label="Визуальный эскиз выбранного браслета на нейтральном запястье"
    >
      <image href={wristPhoto} width="400" height="320" />
      {nodes.map((n, i) => {
        const x = 211 + 22 * Math.cos(n.angle),
          y = 166 + 56 * Math.sin(n.angle);
        return (
          <g
            key={sketch.instanceIds[i]}
            data-instance={sketch.instanceIds[i]}
            data-material={sketch.beads[i]}
            opacity={Math.cos(n.angle) < -0.25 ? 0 : 1}
            style={{ filter: "drop-shadow(1px 2px 1px #6d4d3a55)" }}
          >
            <Bead
              id={sketch.beads[i]}
              x={x}
              y={y}
              d={n.d * 0.44}
              instance={`try-${sketch.instanceIds[i]}`}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function BraceletBuilder() {
  const initial = useRef(load()).current;
  const [sketch, setSketch] = useState(initial.current);
  const [saved, setSaved] = useState(initial.saved);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [mode, setMode] = useState(initial.current.beads.length ? "new" : null);
  const [chosen, setChosen] = useState("m01");
  const [selected, setSelected] = useState(-1);
  const [query, setQuery] = useState("");
  const [shape, setShape] = useState("all");
  const [only, setOnly] = useState(true);
  const [info, setInfo] = useState(null);
  const [photo, setPhoto] = useState(false);
  const [step, setStep] = useState("build");
  const [notice, setNotice] = useState("");
  const [storage, setStorage] = useState(true);
  const [drag, setDrag] = useState(null);
  const dragState = useRef(null);
  const stage = useRef(null);
  const infoTrigger = useRef(null);
  const { slots } = layout(sketch.beads);
  const filtered = materials.filter(
    (m) =>
      m.active &&
      (!only || m.available) &&
      m.name.toLowerCase().includes(query.toLowerCase()) &&
      (shape === "all" || m.shape === shape),
  );
  const detail = useMemo(() => describe(sketch), [sketch]);
  const chosenMaterial = material(chosen);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ current: sketch, saved }),
      );
      setStorage(true);
    } catch {
      setStorage(false);
    }
  }, [sketch, saved]);
  const commit = (next) => {
    setPast((p) => [...p.slice(-49), sketch]);
    setFuture([]);
    setSketch(validate(next));
    setSelected(-1);
  };
  function insertAt(index, id = chosen) {
    const m = material(id);
    if (!m.available || !m.active) {
      setNotice("Этот материал сейчас недоступен.");
      return;
    }
    if (sketch.beads.length >= LIMIT) {
      setNotice(`В эскизе может быть до ${LIMIT} бусин.`);
      return;
    }
    const beads = [...sketch.beads],
      instanceIds = [...sketch.instanceIds];
    beads.splice(index, 0, id);
    instanceIds.splice(index, 0, crypto.randomUUID());
    commit({ ...sketch, beads, instanceIds });
    setNotice(`Добавлена бусина: ${m.name}.`);
  }
  function remove() {
    commit({
      ...sketch,
      beads: sketch.beads.filter((_, i) => i !== selected),
      instanceIds: sketch.instanceIds.filter((_, i) => i !== selected),
    });
  }
  function replace() {
    if (!chosenMaterial.available || !chosenMaterial.active) return;
    commit({
      ...sketch,
      beads: sketch.beads.map((id, i) => (i === selected ? chosen : id)),
    });
  }
  function undo() {
    if (!past.length) return;
    setFuture((f) => [sketch, ...f]);
    setSketch(past.at(-1));
    setPast((p) => p.slice(0, -1));
    setSelected(-1);
  }
  function redo() {
    if (!future.length) return;
    setPast((p) => [...p, sketch]);
    setSketch(future[0]);
    setFuture((f) => f.slice(1));
    setSelected(-1);
  }
  function startNew() {
    if (
      sketch.beads.length &&
      !window.confirm(
        "Начать новый эскиз? Текущий вариант останется доступен через «Отменить».",
      )
    )
      return;
    commit(validate({}));
    setMode("new");
    setStep("build");
  }
  function startPointer(e, source, index) {
    if (e.button !== 0 || dragState.current) return;
    if (
      source === "palette" &&
      (!material(index).available || !material(index).active)
    )
      return;
    const state = {
      pointer: e.pointerId,
      version: sketch.instanceIds.join(","),
      x: e.clientX,
      y: e.clientY,
      source,
      index,
      active: false,
      timer: null,
    };
    dragState.current = state;
    if (e.pointerType === "touch")
      state.timer = setTimeout(() => {
        state.active = true;
        setDrag({ ...state, x: e.clientX, y: e.clientY, slot: -1 });
      }, 280);
  }
  useEffect(() => {
    function move(e) {
      const d = dragState.current;
      if (!d || d.pointer !== e.pointerId) return;
      const distance = Math.hypot(e.clientX - d.x, e.clientY - d.y);
      if (!d.active && distance > 7) {
        if (e.pointerType === "touch") {
          clearTimeout(d.timer);
          dragState.current = null;
          return;
        }
        d.active = true;
      }
      if (!d.active) return;
      e.preventDefault();
      const rect = stage.current?.querySelector("svg")?.getBoundingClientRect();
      let slot = -1;
      if (
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const x = ((e.clientX - rect.left) / rect.width) * 400,
          y = ((e.clientY - rect.top) / rect.height) * 380;
        let distance = Infinity;
        slots.forEach((p, i) => {
          const value = Math.hypot(x - p.x, y - p.y);
          if (value < distance) {
            distance = value;
            slot = i;
          }
        });
        if (
          sketch.beads.length
            ? distance > 50
            : Math.hypot(x - 200, y - 190) > 170
        )
          slot = -1;
      }
      d.slot = slot;
      setDrag({ ...d, x: e.clientX, y: e.clientY, slot });
    }
    function cancelDrag() {
      clearTimeout(dragState.current?.timer);
      dragState.current = null;
      setDrag(null);
    }
    function touchMove(e) {
      if (dragState.current?.active) e.preventDefault();
    }
    function escape(e) {
      if (e.key === "Escape") cancelDrag();
    }
    function end(e) {
      const d = dragState.current;
      if (!d || d.pointer !== e.pointerId) return;
      clearTimeout(d.timer);
      dragState.current = null;
      setDrag(null);
      if (d.version !== sketch.instanceIds.join(",")) return;
      if (
        e.type === "pointercancel" ||
        !d.active ||
        d.slot < 0 ||
        d.slot === undefined
      )
        return;
      if (d.source === "palette") insertAt(d.slot, d.index);
      else {
        const beads = [...sketch.beads],
          instanceIds = [...sketch.instanceIds];
        const [id] = beads.splice(d.index, 1),
          [instance] = instanceIds.splice(d.index, 1);
        const target = d.slot > d.index ? d.slot - 1 : d.slot;
        beads.splice(target, 0, id);
        instanceIds.splice(target, 0, instance);
        commit({ ...sketch, beads, instanceIds });
      }
    }
    window.addEventListener("keydown", escape);
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("blur", cancelDrag);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("keydown", escape);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("blur", cancelDrag);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  });
  useEffect(() => () => clearTimeout(dragState.current?.timer), []);
  function closeInfo() {
    setInfo(null);
    setPhoto(false);
    requestAnimationFrame(() => infoTrigger.current?.focus());
  }
  async function exportImage(share = false, wrist = false) {
    try {
      const svg = wrist
        ? document.querySelector(".wrist-image")
        : stage.current?.querySelector("svg");
      if (!svg) return;
      const copy = svg.cloneNode(true);
      copy.querySelectorAll('[role="button"]').forEach((g) => {
        if (g.getAttribute("aria-label")?.startsWith("Вставить")) g.remove();
      });
      await Promise.all(
        [...copy.querySelectorAll("image")].map(async (image) => {
          const response = await fetch(image.getAttribute("href"));
          if (!response.ok) throw new Error("image");
          const blob = await response.blob();
          const url = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          image.setAttribute("href", url);
        }),
      );
      copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      copy.setAttribute("width", "800");
      copy.setAttribute("height", "760");
      const image = new Image();
      const svgUrl = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(copy)], {
          type: "image/svg+xml",
        }),
      );
      try {
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = svgUrl;
        });
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 900;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#faf7ef";
        ctx.fillRect(0, 0, 800, 900);
        ctx.drawImage(image, 0, 50);
        ctx.fillStyle = "#304b39";
        ctx.textAlign = "center";
        ctx.font = "22px sans-serif";
        ctx.fillText("ENOSI · визуальный эскиз", 400, 35);
        ctx.font = "15px sans-serif";
        ctx.fillText("Оттенки и посадку уточним перед изготовлением", 400, 870);
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        const file = new File([blob], "ENOSI-eskiz.png", { type: "image/png" });
        if (share && navigator.canShare?.({ files: [file] }))
          await navigator.share({
            title: "Эскиз ENOSI",
            text: detail,
            files: [file],
          });
        else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          if (share)
            setNotice("Эскиз скачан. Приложите его к сообщению автору.");
        }
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
    } catch (error) {
      if (error?.name !== "AbortError")
        setNotice("Не удалось сохранить изображение. Попробуйте ещё раз.");
    }
  }
  return (
    <section
      id="constructor"
      className="builder section-space workshop"
      aria-labelledby="builder-title"
    >
      <div className="builder-head">
        <span className="eyebrow">МАСТЕРСКАЯ ENOSI</span>
        <h2 id="builder-title">
          Создай свой <em>браслет</em>
        </h2>
        <p>Ваши оттенки. Ваше сочетание. Ручная работа Екатерины.</p>
      </div>
      <ol className="workshop-steps">
        <li aria-current={step === "build" ? "step" : undefined}>Соберите</li>
        <li aria-current={step === "try" ? "step" : undefined}>
          Посмотрите на руке
        </li>
        <li aria-current={step === "order" ? "step" : undefined}>
          Обсудите изготовление
        </li>
      </ol>
      <div className="builder-start">
        <button
          aria-pressed={mode === "ideas"}
          onClick={() => {
            setMode("ideas");
            setStep("build");
          }}
        >
          Из готового сочетания
        </button>
        <button aria-pressed={mode === "new"} onClick={startNew}>
          С нуля
        </button>
      </div>
      {mode === "ideas" && (
        <div className="builder-ideas">
          {ideas.map((idea) => (
            <button
              key={idea.name}
              onClick={() => {
                commit(
                  validate({
                    ...sketch,
                    beads: Array.from(
                      { length: 24 },
                      (_, i) => idea.ids[i % idea.ids.length],
                    ),
                  }),
                );
                setMode("new");
              }}
            >
              <span className="idea-beads">
                {idea.ids.map((id) => (
                  <img key={id} src={material(id).image} alt="" />
                ))}
              </span>
              {idea.name}
            </button>
          ))}
        </div>
      )}
      {(mode || sketch.beads.length > 0) && (
        <div className="builder-grid">
          <div className="workshop-stage" ref={stage}>
            <div className="workshop-preview">
              <Bracelet
                sketch={sketch}
                interactive={step === "build"}
                selected={selected}
                slot={drag?.slot}
                onSelect={setSelected}
                onInsert={insertAt}
                onPointerDown={(e, i) => startPointer(e, "existing", i)}
              />
              {selected >= 0 && step === "build" && (
                <div className="selection-actions">
                  <span>
                    {material(sketch.beads[selected]).name} · {selected + 1}
                  </span>
                  <button
                    onClick={replace}
                    disabled={!chosenMaterial.available}
                  >
                    Заменить
                  </button>
                  <button onClick={remove}>Удалить</button>
                </div>
              )}
            </div>
            <div className="workshop-controls">
              <button onClick={undo} disabled={!past.length}>
                Отменить
              </button>
              <button
                disabled={!sketch.beads.length}
                onClick={() => setStep(step === "try" ? "build" : "try")}
              >
                {step === "try" ? "Вернуться к сборке" : "Примерить на руке"}
              </button>
              <button
                className="builder-primary"
                disabled={!sketch.beads.length}
                onClick={() => setStep("order")}
              >
                Обсудить заказ
              </button>
            </div>
            <p className="chosen-status">
              {step === "build"
                ? `Выбрано: ${chosenMaterial.name}, ${chosenMaterial.size}. Нажмите + для вставки.`
                : "Визуальный эскиз. Оттенки природных камней и посадку уточним перед изготовлением"}
            </p>
            <label className="wrist-label">
              Обхват запястья, см
              <input
                type="number"
                min="8"
                max="30"
                step="0.1"
                placeholder="Не знаю размер"
                value={sketch.wrist}
                onChange={(e) =>
                  setSketch({ ...sketch, wrist: e.target.value.slice(0, 5) })
                }
              />
            </label>
            <p className="workshop-notice" role="status">
              {notice ||
                `${sketch.beads.length} бусин · ${storage ? "Эскиз сохраняется на этом устройстве" : "Хранилище недоступно: скачайте эскиз"}`}
            </p>
          </div>
          <div className="workshop-panel">
            {step === "build" ? (
              <>
                <p className="gesture-hint">
                  Перетащите бусину на +. На телефоне удерживайте её перед
                  переносом или выберите нажатием и коснитесь +.
                </p>
                <div className="workshop-filters">
                  <label>
                    Поиск
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value.slice(0, 80))}
                      placeholder="Название камня"
                    />
                  </label>
                  <label>
                    Форма
                    <select
                      value={shape}
                      onChange={(e) => setShape(e.target.value)}
                    >
                      <option value="all">Все формы</option>
                      {[
                        "круглая",
                        "матовая",
                        "гранёная",
                        "крошка",
                        "цилиндр",
                        "самородок",
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label className="available">
                    <input
                      type="checkbox"
                      checked={only}
                      onChange={(e) => setOnly(e.target.checked)}
                    />
                    Только в наличии
                  </label>
                </div>
                <div className="workshop-materials">
                  {filtered.map((m) => (
                    <article
                      key={m.id}
                      className={chosen === m.id ? "chosen" : ""}
                    >
                      <button
                        className="material-select"
                        aria-pressed={chosen === m.id}
                        onClick={() => {
                          setChosen(m.id);
                          setNotice("");
                        }}
                        onPointerDown={(e) => startPointer(e, "palette", m.id)}
                      >
                        <img draggable="false" src={m.image} alt="" />
                        <span>
                          <strong>{m.name}</strong>
                          <small>
                            {m.size} · {m.shape}
                          </small>
                          <small>
                            {m.available ? "В наличии" : "Нет в наличии"}
                          </small>
                        </span>
                      </button>
                      <button
                        className="stone-info"
                        aria-label={`О камне: ${m.name}, ${m.size}`}
                        onClick={(e) => {
                          infoTrigger.current = e.currentTarget;
                          setInfo(m);
                        }}
                      >
                        О камне
                      </button>
                    </article>
                  ))}
                </div>
                {!filtered.length && (
                  <p>
                    Таких бусин не найдено. Попробуйте другой запрос или форму.
                  </p>
                )}
                <details className="workshop-extra">
                  <summary>Дополнительно</summary>
                  <label>
                    Название браслета
                    <input
                      maxLength="60"
                      value={sketch.name}
                      onChange={(e) =>
                        setSketch({ ...sketch, name: e.target.value })
                      }
                    />
                  </label>
                  <div className="builder-actions">
                    <button onClick={redo} disabled={!future.length}>
                      Повторить
                    </button>
                    <button
                      disabled={
                        !sketch.beads.length || sketch.beads.length * 2 > LIMIT
                      }
                      onClick={() =>
                        commit(
                          validate({
                            ...sketch,
                            beads: [...sketch.beads, ...sketch.beads],
                            instanceIds: [],
                          }),
                        )
                      }
                    >
                      Повторить последовательность
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Очистить браслет?"))
                          commit({ ...sketch, beads: [], instanceIds: [] });
                      }}
                    >
                      Очистить
                    </button>
                    <button
                      onClick={() => {
                        setSaved([...saved.slice(-19), validate(sketch)]);
                        setNotice("Вариант сохранён.");
                      }}
                    >
                      Сохранить вариант
                    </button>
                  </div>
                  {saved.length > 0 && (
                    <label>
                      Сохранённые варианты
                      <select
                        value=""
                        onChange={(e) => {
                          const item = saved[Number(e.target.value)];
                          if (item) commit(item);
                        }}
                      >
                        <option value="">Выберите вариант</option>
                        {saved.map((s, i) => (
                          <option key={i} value={i}>
                            {s.name || `Вариант ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {selected >= 0 && (
                    <div className="builder-actions">
                      <button
                        disabled={selected === 0}
                        onClick={() => {
                          const beads = [...sketch.beads],
                            instanceIds = [...sketch.instanceIds];
                          [beads[selected - 1], beads[selected]] = [
                            beads[selected],
                            beads[selected - 1],
                          ];
                          [instanceIds[selected - 1], instanceIds[selected]] = [
                            instanceIds[selected],
                            instanceIds[selected - 1],
                          ];
                          commit({ ...sketch, beads, instanceIds });
                        }}
                      >
                        Переместить влево
                      </button>
                      <button
                        disabled={selected === sketch.beads.length - 1}
                        onClick={() => {
                          const beads = [...sketch.beads],
                            instanceIds = [...sketch.instanceIds];
                          [beads[selected + 1], beads[selected]] = [
                            beads[selected],
                            beads[selected + 1],
                          ];
                          [instanceIds[selected + 1], instanceIds[selected]] = [
                            instanceIds[selected],
                            instanceIds[selected + 1],
                          ];
                          commit({ ...sketch, beads, instanceIds });
                        }}
                      >
                        Переместить вправо
                      </button>
                    </div>
                  )}
                </details>
              </>
            ) : step === "try" ? (
              <div className="try-panel">
                <h3>Ваше сочетание на запястье</h3>
                <p>
                  Локальный визуальный эскиз. Масштаб ориентировочный: посадка
                  зависит от обхвата запястья и размеров бусин.
                </p>
                <div className="wrist-preview">
                  <WristPreview sketch={sketch} />
                </div>
                <p>
                  Фон запястья создан для ENOSI. Часть бусин скрыта за
                  запястьем. Это приближённая визуализация, детали крошки и
                  посадку проверит автор.
                </p>
                <p>
                  Визуальный эскиз. Оттенки природных камней и посадку уточним
                  перед изготовлением
                </p>
                <button onClick={() => exportImage(false, true)}>
                  Сохранить примерку
                </button>
                <button onClick={() => setStep("build")}>
                  Вернуться к редактированию
                </button>
              </div>
            ) : (
              <div className="order-panel">
                <h3>Ваш эскиз — начало заказа</h3>
                <p>
                  Размер:{" "}
                  {sketch.wrist ? `${sketch.wrist} см` : "Нужно подобрать"}.
                  Стоимость и посадку Екатерина уточнит перед изготовлением.
                </p>
                <label>
                  Пожелания
                  <textarea
                    maxLength="500"
                    value={sketch.wishes}
                    onChange={(e) =>
                      setSketch({ ...sketch, wishes: e.target.value })
                    }
                  />
                </label>
                <label>
                  Описание эскиза
                  <textarea
                    readOnly
                    value={detail}
                    aria-label="Описание эскиза для копирования"
                    onFocus={(e) => e.target.select()}
                  />
                </label>
                <div className="builder-actions">
                  <button onClick={() => exportImage(true)}>
                    Поделиться эскизом
                  </button>
                  <button onClick={() => exportImage()}>Скачать эскиз</button>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(detail);
                        setNotice("Описание скопировано.");
                      } catch {
                        setNotice(
                          "Выделите текст описания и скопируйте вручную.",
                        );
                      }
                    }}
                  >
                    Скопировать описание
                  </button>
                </div>
                <p>
                  Приложите изображение и описание в сообщении. Отправку вы
                  подтверждаете самостоятельно.
                </p>
                <div className="order-contacts">
                  <a
                    href={`${TELEGRAM}?text=${encodeURIComponent(detail)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Написать в Telegram
                  </a>
                  <a href={MAX} target="_blank" rel="noopener noreferrer">
                    Написать в MAX
                  </a>
                </div>
                <button onClick={() => setStep("build")}>
                  Вернуться к редактированию
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {drag && (
        <div
          className="bead-drag-preview"
          style={{ left: drag.x, top: drag.y }}
        >
          <img
            src={
              material(
                drag.source === "palette"
                  ? drag.index
                  : sketch.beads[drag.index],
              ).image
            }
            alt=""
          />
        </div>
      )}
      {info && (
        <div
          className="workshop-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeInfo();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="stone-info-title"
            className="workshop-modal"
            onKeyDown={(e) => {
              if (e.key === "Escape") closeInfo();
              if (e.key === "Tab") {
                const buttons = [...e.currentTarget.querySelectorAll("button")];
                const index = buttons.indexOf(document.activeElement);
                e.preventDefault();
                buttons[
                  (index + (e.shiftKey ? -1 : 1) + buttons.length) %
                    buttons.length
                ]?.focus();
              }
            }}
          >
            <button autoFocus onClick={closeInfo}>
              Закрыть ×
            </button>
            <img
              src={info.image}
              alt={`${info.name}, ${info.size}`}
              className={photo ? "enlarged" : ""}
            />
            <h3 id="stone-info-title">{info.name}</h3>
            <p>
              {info.size} · {info.shape}
              {info.treatment ? ` · ${info.treatment}` : ""}
            </p>
            <p>{materialStory(info)}</p>
            <p className="symbol-note">
              Символика — авторское прочтение ENOSI. Природный рисунок и оттенки
              отличаются от бусины к бусине.
            </p>
            <button onClick={() => setPhoto(!photo)}>
              {photo ? "Уменьшить" : "Увеличить фото"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
