import React from "react";
const signs = [
  ["Козерог", 120, "Земля"],
  ["Водолей", 219, "Воздух"],
  ["Рыбы", 321, "Вода"],
  ["Овен", 420, "Огонь"],
  ["Телец", 521, "Земля"],
  ["Близнецы", 621, "Воздух"],
  ["Рак", 723, "Вода"],
  ["Лев", 823, "Огонь"],
  ["Дева", 923, "Земля"],
  ["Весы", 1023, "Воздух"],
  ["Скорпион", 1122, "Вода"],
  ["Стрелец", 1222, "Огонь"],
  ["Козерог", 1232, "Земля"],
];
export function zodiac(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(value + "T12:00:00Z");
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== value)
    return null;
  const n = (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
  const sign = signs.find((s) => n < s[1]);
  return sign
    ? {
        name: sign[0],
        element: sign[2],
        boundary: signs.some((s) => Math.abs(n - s[1]) <= 1),
      }
    : null;
}
export default function PersonalStart({ sketch, onChange }) {
  const sign = zodiac(sketch.birthDate || "");
  const topics = [
    "Любовь",
    "Спокойствие",
    "Уверенность",
    "Защита",
    "Достаток",
    "Гармония",
    "Интуиция",
    "Энергия",
    "Вдохновение",
  ];
  return (
    <details className="personal-start" open>
      <summary>Личная история и дата рождения</summary>
      <label>
        Дата рождения (необязательно)
        <input
          type="date"
          value={sketch.birthDate || ""}
          onChange={(e) => onChange({ ...sketch, birthDate: e.target.value })}
        />
      </label>
      {sign && (
        <p>
          {sign.name} · {sign.element}. Условные календарные границы западной
          астрологии.{" "}
          {sign.boundary
            ? "Пограничная дата: точное положение Солнца зависит от года, времени и места рождения."
            : "Это символическая тема, а не характеристика человека."}
        </p>
      )}
      <fieldset>
        <legend>Что для вас важно? Можно выбрать несколько тем</legend>
        <div className="theme-choices">
          {topics.map((topic) => (
            <label key={topic}>
              <input
                type="checkbox"
                checked={sketch.themes?.includes(topic) || false}
                onChange={(e) =>
                  onChange({
                    ...sketch,
                    themes: e.target.checked
                      ? [...(sketch.themes || []), topic]
                      : (sketch.themes || []).filter((x) => x !== topic),
                  })
                }
              />
              {topic}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        Что вы хотите вложить в свой браслет?
        <textarea
          maxLength="500"
          value={sketch.intention || ""}
          onChange={(e) => onChange({ ...sketch, intention: e.target.value })}
        />
      </label>
      <p>
        Выбранные темы — ваши личные ассоциации. Они не обещают защиту, здоровье
        или финансовый результат. Проверенные привязки камней к знакам пока не
        добавлены.
      </p>
    </details>
  );
}
