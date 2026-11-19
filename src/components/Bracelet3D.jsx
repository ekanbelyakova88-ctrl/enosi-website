import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadWristModel } from "./wrist-model";
import { material, cropFor } from "./builder-model";
export default function Bracelet3D({ sketch, onWrist = false }) {
  const container = useRef(null),
    controlsRef = useRef(null);
  const [error, setError] = useState("");
  const [modelReady, setModelReady] = useState(!onWrist);
  useEffect(() => {
    const element = container.current;
    setError("");
    setModelReady(!onWrist);
    let renderer, observer, controls, scene;
    let disposed = false;
    const textures = new Map();
    const beads = [];
    let wristObject;
    function fail() {
      setError(
        "3D недоступно на этом устройстве. Состав сохранён, продолжайте сборку в классическом режиме.",
      );
    }
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setClearColor(0xfaf7ef, 1);
      element.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 1000);
      camera.position.set(0, 100, 130);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = false;
      controls.minDistance = 65;
      controls.maxDistance = 300;
      controls.enablePan = false;
      controlsRef.current = { camera, controls, renderer, scene };
      scene.add(new THREE.HemisphereLight(0xfffaf4, 0x586858, 2.5));
      const key = new THREE.DirectionalLight(0xfff6e8, 3);
      key.position.set(40, 80, 90);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 2);
      fill.position.set(-80, 30, -30);
      scene.add(fill);
      const innerRadius =
        (Math.max(8, Math.min(30, Number(sketch.wrist) || 17)) * 10) /
        (2 * Math.PI);
      const radius = innerRadius + 4;
      function photographTexture(m, surface) {
        if (!m.image) return;
        const entry = textures.get(m.id);
        if (entry) {
          if (entry.texture) {
            surface.map = entry.texture;
            surface.color.set("white");
            surface.needsUpdate = true;
          } else entry.waiting.push(surface);
          return;
        }
        const item = { texture: null, waiting: [surface] };
        textures.set(m.id, item);
        const image = new Image();
        image.onload = () => {
          if (disposed) return;
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 128;
          const ctx = canvas.getContext("2d");
          const [x, y, size] = cropFor(m.id),
            scale = image.naturalWidth / 500;
          // Central stone pixels avoid the surrounding photographic background.
          ctx.drawImage(
            image,
            (x + size * 0.3) * scale,
            (y + size * 0.3) * scale,
            size * 0.4 * scale,
            size * 0.4 * scale,
            0,
            0,
            128,
            128,
          );
          item.texture = new THREE.CanvasTexture(canvas);
          item.texture.colorSpace = THREE.SRGBColorSpace;
          item.waiting.forEach((target) => {
            target.map = item.texture;
            target.color.set("white");
            target.needsUpdate = true;
          });
          item.waiting = [];
          renderer.render(scene, camera);
        };
        image.src = m.image;
      }
      const lengths = sketch.beads.map((id) => material(id).mm || 8),
        total = lengths.reduce((a, b) => a + b, 0) || 1;
      let offset = 0;
      sketch.beads.forEach((id, index) => {
        const m = material(id),
          d = m.mm || 8,
          angle = ((offset + d / 2) / total) * 2 * Math.PI;
        offset += d;
        const faceted = m.shape === "гранёная" || m.treatment?.includes("гран");
        const irregular = ["крошка", "самородок"].includes(m.shape);
        let geometry;
        if (irregular) {
          geometry = new THREE.IcosahedronGeometry(d / 2, 1);
          const positions = geometry.attributes.position;
          for (let i = 0; i < positions.count; i++) {
            const factor =
              0.82 +
              0.26 * (0.5 + 0.5 * Math.sin(i * 12.9898 + index * 78.233));
            positions.setXYZ(
              i,
              positions.getX(i) * factor,
              positions.getY(i) * factor,
              positions.getZ(i) * factor,
            );
          }
          geometry.computeVertexNormals();
        } else if (m.shape === "цилиндр")
          geometry = new THREE.CylinderGeometry(
            d * 0.35,
            d * 0.35,
            d,
            faceted ? 8 : 16,
          );
        else if (m.shape === "гранёная")
          geometry = new THREE.IcosahedronGeometry(d / 2, 1);
        else geometry = new THREE.SphereGeometry(d / 2, 24, 16);
        const surface = new THREE.MeshPhysicalMaterial({
          color: m.color || "#b7b7b0",
          roughness: m.id === "m13" ? 0.95 : m.shape === "матовая" ? 0.85 : 0.2,
          transmission:
            m.id === "m01"
              ? 0.65
              : ["m06", "m11", "m28"].includes(m.id)
                ? 0.18
                : 0,
          thickness: d,
          iridescence: m.id === "m08" ? 0.2 : 0,
          metalness: 0,
          clearcoat: m.shape === "матовая" ? 0 : 0.45,
          flatShading: irregular || faceted,
        });
        photographTexture(m, surface);
        const bead = new THREE.Mesh(geometry, surface);
        if (m.shape === "цилиндр")
          bead.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)),
          );
        bead.position.set(
          (innerRadius + d / 2) * Math.cos(angle),
          0,
          (innerRadius + d / 2) * Math.sin(angle),
        );
        bead.userData.instance = sketch.instanceIds[index];
        scene.add(bead);
        beads.push({ bead, angle, d });
      });
      const string = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.18, 6, 100),
        new THREE.MeshStandardMaterial({ color: 0xc1b6a2 }),
      );
      string.rotation.x = Math.PI / 2;
      scene.add(string);
      if (onWrist) {
        string.visible = false;
        camera.position.set(200, -150, 330);
        controls.target.set(0, -80, 0);
        controls.minDistance = 110;
        controls.maxDistance = 650;
        controls.update();
        loadWristModel(innerRadius * 2 * Math.PI)
          .then((model) => {
            if (disposed) {
              model.object.traverse((o) => {
                o.geometry?.dispose();
                o.material?.dispose();
              });
              return;
            }
            wristObject = model.object;
            setModelReady(true);
            scene.add(wristObject);
            beads.forEach(({ bead, angle, d }) => {
              const nx = Math.cos(angle) / model.rx,
                nz = Math.sin(angle) / model.rz,
                length = Math.hypot(nx, nz);
              bead.position.set(
                model.rx * Math.cos(angle) + ((nx / length) * d) / 2,
                0,
                model.rz * Math.sin(angle) + ((nz / length) * d) / 2,
              );
            });
            renderer.render(scene, camera);
          })
          .catch(() =>
            setError(
              "Не удалось загрузить модель запястья. Состав сохранён; вернитесь к сборке и попробуйте снова.",
            ),
          );
      }
      const render = () => renderer.render(scene, camera);
      controls.addEventListener("change", render);
      const resize = () => {
        const width = element.clientWidth,
          height = Math.min(430, Math.max(280, width * 0.8));
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        render();
      };
      observer = new ResizeObserver(resize);
      observer.observe(element);
      resize();
      renderer.domElement.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        fail();
      });
      renderer.domElement.addEventListener("webglcontextrestored", () => {
        setError("");
        render();
      });
    } catch {
      fail();
    }
    return () => {
      disposed = true;
      textures.forEach((entry) => entry.texture?.dispose());
      observer?.disconnect();
      controls?.dispose();
      scene?.traverse((object) => {
        object.geometry?.dispose();
        object.material?.dispose();
      });
      renderer?.dispose();
      renderer?.domElement.remove();
      controlsRef.current = null;
    };
  }, [sketch.beads, sketch.instanceIds, sketch.wrist, onWrist]);
  return (
    <div className={onWrist ? "three-view wrist-three-view" : "three-view"}>
      <div ref={container} />
      {onWrist && !modelReady && !error && (
        <p role="status">Загружаем модель запястья…</p>
      )}
      {error ? (
        <p role="status">{error}</p>
      ) : (
        <>
          <p>
            {onWrist
              ? "Анатомическая 3D-модель запястья. Это условная визуализация размера; реальная посадка уточняется с мастером. "
              : ""}
            Вращайте мышью или пальцем. Масштаб — колесом или двумя пальцами.
          </p>
          <button
            onClick={() => {
              const view = controlsRef.current;
              if (view) {
                if (onWrist) view.camera.position.set(200, -140, 240);
                else view.camera.position.set(0, 100, 130);
                view.controls.target.set(0, onWrist ? -60 : 0, 0);
                view.controls.update();
              }
            }}
          >
            Исходный ракурс
          </button>
          <button
            disabled={onWrist && !modelReady}
            onClick={() => {
              const v = controlsRef.current;
              if (!v) return;
              v.renderer.render(v.scene, v.camera);
              const a = document.createElement("a");
              a.download = onWrist
                ? "ENOSI-wrist-3D.png"
                : "ENOSI-bracelet-3D.png";
              a.href = v.renderer.domElement.toDataURL("image/png");
              a.click();
            }}
          >
            Сохранить этот ракурс
          </button>
          <p>
            Объёмная модель материалов по данным ENOSI. Природный рисунок и
            формы неровных бусин показаны приблизительно.
          </p>
        </>
      )}
    </div>
  );
}
