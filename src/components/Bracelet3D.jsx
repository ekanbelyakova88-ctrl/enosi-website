import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { material } from "./builder-model";
export default function Bracelet3D({ sketch }) {
  const container = useRef(null),
    controlsRef = useRef(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const element = container.current;
    let renderer, observer, controls, scene;
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
      controlsRef.current = { camera, controls };
      scene.add(new THREE.HemisphereLight(0xfffaf4, 0x586858, 2.5));
      const key = new THREE.DirectionalLight(0xfff6e8, 3);
      key.position.set(40, 80, 90);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 2);
      fill.position.set(-80, 30, -30);
      scene.add(fill);
      const radius = Math.max(
        25,
        (Number(sketch.wrist || 17) * 10) / (2 * Math.PI) + 4,
      );
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
          geometry = new THREE.CylinderGeometry(d * 0.35, d * 0.35, d, faceted ? 8 : 16);
        else if (m.shape === "гранёная")
          geometry = new THREE.IcosahedronGeometry(d / 2, 1);
        else geometry = new THREE.SphereGeometry(d / 2, 24, 16);
        const surface = new THREE.MeshPhysicalMaterial({
          color: m.color || "#b7b7b0",
          roughness: m.shape === "матовая" ? 0.85 : 0.2,
          metalness: 0,
          clearcoat: m.shape === "матовая" ? 0 : 0.45,
          flatShading: irregular || faceted,
        });
        const bead = new THREE.Mesh(geometry, surface);
        bead.position.set(
          radius * Math.cos(angle),
          0,
          radius * Math.sin(angle),
        );
        bead.userData.instance = sketch.instanceIds[index];
        scene.add(bead);
      });
      const string = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.18, 6, 100),
        new THREE.MeshStandardMaterial({ color: 0xc1b6a2 }),
      );
      string.rotation.x = Math.PI / 2;
      scene.add(string);
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
      renderer.domElement.addEventListener("webglcontextlost", fail);
      renderer.domElement.addEventListener("webglcontextrestored", render);
    } catch {
      fail();
    }
    return () => {
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
  }, [sketch.beads, sketch.instanceIds, sketch.wrist]);
  return (
    <div className="three-view">
      <div ref={container} />
      {error ? (
        <p role="status">{error}</p>
      ) : (
        <>
          <p>
            Вращайте мышью или пальцем. Масштаб — колесом или двумя пальцами.
          </p>
          <button
            onClick={() => {
              const view = controlsRef.current;
              if (view) {
                view.camera.position.set(0, 100, 130);
                view.controls.target.set(0, 0, 0);
                view.controls.update();
              }
            }}
          >
            Исходный ракурс
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
