import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
export async function loadWristModel(wristMm) {
  const url = new URL("models/enosi-neutral-hand.glb", document.baseURI).href;
  const gltf = await new GLTFLoader().loadAsync(url);
  const hand = gltf.scene;
  hand.updateMatrixWorld(true);
  const joint = hand.getObjectByName("wrist");
  if (!joint) throw new Error("Missing wrist anchor");
  const anchor = joint.getWorldPosition(new THREE.Vector3());
  const vertices = [];
  hand.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const attribute = mesh.geometry.attributes.position;
    for (let i = 0; i < attribute.count; i++) {
      const p = mesh
        .getVertexPosition(i, new THREE.Vector3())
        .applyMatrix4(mesh.matrixWorld);
      if (Math.abs(p.y - (anchor.y + 0.004)) < 0.0025) vertices.push(p);
    }
  });
  if (vertices.length < 3) throw new Error("Missing calibration section");
  const box = new THREE.Box3().setFromPoints(vertices),
    center = box.getCenter(new THREE.Vector3());
  const a = (box.max.x - box.min.x) / 2,
    b = (box.max.z - box.min.z) / 2;
  const circumference =
    Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
  if (circumference <= 0) throw new Error("Invalid wrist geometry");
  const scale = wristMm / circumference;
  const group = new THREE.Group();
  group.add(hand);
  hand.scale.setScalar(scale);
  hand.position.copy(center).multiplyScalar(-scale);
  hand.traverse((mesh) => {
    if (mesh.isMesh) {
      mesh.material = new THREE.MeshStandardMaterial({
        color: "#d6a98d",
        roughness: 0.7,
        metalness: 0,
      });
    }
  });
  return { object: group, rx: a * scale, rz: b * scale };
}
