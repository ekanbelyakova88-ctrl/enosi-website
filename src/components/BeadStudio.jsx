import React, { useEffect, useRef, useState } from "react";
import { material, cropFor, layout } from "./builder-model";
export default function BeadStudio({ sketch }) {
  const canvas = useRef(null),
    bodies = useRef(new Map()),
    audio = useRef(null);
  const [dark, setDark] = useState(false),
    [sound, setSound] = useState(false),
    [assembled, setAssembled] = useState(false);
  useEffect(() => {
    const element = canvas.current,
      ctx = element.getContext("2d");
    let frame,
      previous = 0,
      disposed = false;
    const images = new Map();
    sketch.beads.forEach((id) => {
      if (images.has(id)) return;
      images.set(id, null);
      const img = new Image();
      img.onload = () => images.set(id, img);
      img.src = material(id).image || "";
    });
    const ids = new Set(sketch.instanceIds);
    for (const id of bodies.current.keys())
      if (!ids.has(id)) bodies.current.delete(id);
    sketch.instanceIds.forEach((id, i) => {
      if (!bodies.current.has(id))
        bodies.current.set(id, {
          x: 40 + ((i * 47) % 320),
          y: 20,
          vx: (i % 2 ? 1 : -1) * 1.5,
          vy: 0,
          r: Math.min(25, (material(sketch.beads[i]).mm || 8) * 1.4),
        });
      bodies.current.get(id).r = Math.min(
        25,
        (material(sketch.beads[i]).mm || 8) * 1.4,
      );
    });
    const target = layout(sketch.beads).nodes;
    function tick(time) {
      if (disposed) return;
      frame = requestAnimationFrame(tick);
      if (time - previous < 32) return;
      previous = time;
      const items = sketch.instanceIds.map((id) => bodies.current.get(id));
      items.forEach((body, i) => {
        if (assembled) {
          body.x += (target[i].x - body.x) * 0.13;
          body.y += (target[i].y - body.y) * 0.13;
          body.vx = body.vy = 0;
          return;
        }
        body.vy += 0.4;
        body.x += body.vx;
        body.y += body.vy;
        body.vx *= 0.994;
        if (body.x < body.r || body.x > 400 - body.r) {
          body.vx *= -0.65;
          body.x = Math.max(body.r, Math.min(400 - body.r, body.x));
        }
        if (body.y > 370 - body.r) {
          if (sound && body.vy > 3 && audio.current) {
            const oscillator = audio.current.createOscillator(),
              gain = audio.current.createGain();
            oscillator.frequency.value = 550 + i * 35;
            gain.gain.setValueAtTime(0.018, audio.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              audio.current.currentTime + 0.045,
            );
            oscillator.connect(gain).connect(audio.current.destination);
            oscillator.start();
            oscillator.stop(audio.current.currentTime + 0.05);
          }
          body.y = 370 - body.r;
          body.vy *= -0.5;
        }
      });
      if (!assembled)
        for (let i = 0; i < items.length; i++)
          for (let j = i + 1; j < items.length; j++) {
            const a = items[i],
              b = items[j],
              dx = b.x - a.x,
              dy = b.y - a.y,
              d = Math.hypot(dx, dy) || 0.1,
              overlap = a.r + b.r - d;
            if (overlap > 0) {
              const nx = dx / d,
                ny = dy / d;
              a.x -= (nx * overlap) / 2;
              a.y -= (ny * overlap) / 2;
              b.x += (nx * overlap) / 2;
              b.y += (ny * overlap) / 2;
              const force = ((b.vx - a.vx) * nx + (b.vy - a.vy) * ny) * 0.7;
              if (force < 0) {
                a.vx += nx * force;
                a.vy += ny * force;
                b.vx -= nx * force;
                b.vy -= ny * force;
              }
            }
          }
      ctx.fillStyle = dark ? "#2d3d32" : "#f6f0e6";
      ctx.fillRect(0, 0, 400, 380);
      items.forEach((body, i) => {
        const id = sketch.beads[i],
          img = images.get(id);
        if (!img) {
          ctx.fillStyle = "#d9d5ca";
          ctx.beginPath();
          ctx.arc(body.x, body.y, body.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#40543d";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("?", body.x, body.y + 4);
          return;
        }
        const [x, y, size] = cropFor(id),
          factor = img.naturalWidth / 500;
        ctx.save();
        if (!["крошка", "самородок", "цилиндр"].includes(material(id).shape)) {
          ctx.beginPath();
          ctx.arc(body.x, body.y, body.r, 0, Math.PI * 2);
          ctx.clip();
        }
        ctx.drawImage(
          img,
          x * factor,
          y * factor,
          size * factor,
          size * factor,
          body.x - body.r,
          body.y - body.r,
          body.r * 2,
          body.r * 2,
        );
        ctx.restore();
      });
    }
    frame = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
    };
  }, [sketch.beads, sketch.instanceIds, dark, sound, assembled]);
  useEffect(
    () => () => {
      audio.current?.close();
    },
    [],
  );
  return (
    <div className="bead-studio">
      <canvas
        ref={canvas}
        width="400"
        height="380"
        style={{ width: "100%" }}
        aria-label="Игровой поднос выбранных бусин"
      />
      <div className="builder-actions">
        <button onClick={() => setAssembled(!assembled)}>
          {assembled ? "Вернуть на поднос" : "Собрать браслет"}
        </button>
        <button aria-pressed={dark} onClick={() => setDark(!dark)}>
          Тёмный поднос
        </button>
        <button
          aria-pressed={sound}
          onClick={() => {
            if (!sound) {
              const Audio = window.AudioContext || window.webkitAudioContext;
              if (Audio) {
                audio.current ||= new Audio();
                audio.current.resume();
              }
            }
            setSound(!sound);
          }}
        >
          Звук {sound ? "включён" : "выключен"}
        </button>
      </div>
      <p>
        Игровое расположение бусин. Состав и порядок эскиза сохраняются при
        переключении режимов.
      </p>
    </div>
  );
}
