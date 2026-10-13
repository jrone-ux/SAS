// "The VA Who Touched Grass" — 30 s vertical (1080x1920) 3D comedy short.
// Everything is deterministic: window.renderAt(t) draws the frame at time t (seconds).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const W = 1080, H = 1920;

// ---------------------------------------------------------------- utilities
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const easeOut = (t) => { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
const easeIn = (t) => { t = clamp(t); return t * t * t; };
const easeOutBack = (t) => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const win = (t, a, b, fi = 0.25, fo = 0.25) => Math.min(ease(seg(t, a, a + fi)), 1 - ease(seg(t, b - fo, b)));
// deterministic random
let _seed = 1234567;
const rand = () => { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; };
const rr = (a, b) => a + (b - a) * rand();
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfe9ff, 30, 95);
const camera = new THREE.PerspectiveCamera(45, W / H, 0.02, 200);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.35, 0.55, 0.88);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------------------------------------------------------------- materials
const M = (color, rough = 0.6, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });
const MAT = {
  skin: M(0xf2c3a0, 0.5),
  skinDark: M(0xe6a989, 0.5),
  hair: M(0x3a2218, 0.42),
  hoodie: M(0xe8b443, 0.85),
  hoodieDark: M(0xcf9a30, 0.85),
  pants: M(0x55607a, 0.9),
  slipper: M(0xffb6cb, 1.0),
  slipperIn: M(0xff8fae, 1.0),
  white: M(0xf2f2f2, 0.5),
  black: M(0x141414, 0.35),
  iris: M(0x6b3b1f, 0.25),
  pupil: M(0x0d0806, 0.2),
  shine: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  lash: M(0x1d120d, 0.5),
  mouth: M(0x4a1220, 0.7),
  tongue: M(0xff7f93, 0.5),
  lip: M(0x9a3a40, 0.5),
  blush: M(0xff7b8f, 0.8, { transparent: true, opacity: 0.45, depthWrite: false }),
  bags: M(0x9a6e9a, 0.8, { transparent: true, opacity: 0.0, depthWrite: false }),
  tear: M(0x8fd3ff, 0.05, { transparent: true, opacity: 0.85, emissive: 0x2a6f9a, emissiveIntensity: 0.4 }),
  dirt: M(0x5a3b22, 1.0),
  phones: M(0x26262b, 0.4),
  phonesGold: M(0xe8b443, 0.35),
};

// ---------------------------------------------------------------- helpers
function mesh(geo, mat, parent, x = 0, y = 0, z = 0, cast = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = cast; m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
const box = (w, h, d, mat, parent, x, y, z, r = 0.02) =>
  mesh(r > 0 ? new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)) : new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
const sph = (r, mat, parent, x, y, z, ws = 32, hs = 20) => mesh(new THREE.SphereGeometry(r, ws, hs), mat, parent, x, y, z);
const cyl = (rt, rb, h, mat, parent, x, y, z, seg = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, parent, x, y, z);
const caps = (r, len, mat, parent, x, y, z) => mesh(new THREE.CapsuleGeometry(r, len, 8, 16), mat, parent, x, y, z);
const group = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); if (parent) parent.add(g); return g; };
function canvasTex(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { c, ctx: c.getContext('2d'), tex };
}
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// ================================================================= WORLD ===
// ---- sky
const sunDir = V(0.78, 0.5, 0.2).normalize();
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { sunDir: { value: sunDir } },
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `varying vec3 vDir; uniform vec3 sunDir;
    void main(){ float h = clamp(vDir.y,0.0,1.0);
      vec3 top = vec3(0.16,0.47,0.95); vec3 hor = vec3(0.78,0.91,1.0);
      vec3 col = mix(hor, top, pow(h,0.55));
      float s = max(dot(normalize(vDir), sunDir),0.0);
      col += vec3(1.0,0.93,0.75)*(pow(s,600.0)*6.0 + pow(s,30.0)*0.35);
      if (vDir.y < 0.0) col = hor;
      gl_FragColor = vec4(col,1.0); }`,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(150, 48, 24), skyMat);
scene.add(sky);

// ---- ground
const groundTex = canvasTex(1024, 1024);
{
  const g = groundTex.ctx; g.fillStyle = '#69b844'; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 9000; i++) {
    const l = rr(-14, 14); g.fillStyle = `hsl(${rr(88, 110)},${rr(45, 60)}%,${42 + l}%)`;
    g.fillRect(rr(0, 1024), rr(0, 1024), rr(2, 6), rr(2, 9));
  }
  groundTex.tex.wrapS = groundTex.tex.wrapT = THREE.RepeatWrapping; groundTex.tex.repeat.set(30, 30);
}
const ground = mesh(new THREE.PlaneGeometry(240, 240), M(0xffffff, 1.0, { map: groundTex.tex }), scene, 0, 0, 0, false);
ground.rotation.x = -Math.PI / 2;

// ---- distant hills
const hillMat = M(0x5fae47, 1.0);
[[45, -30, 22], [55, 5, 30], [48, 35, 24], [-10, -60, 30], [20, 60, 26], [70, -15, 28]].forEach(([x, z, r]) => {
  const h = sph(r, hillMat, scene, x, -r * 0.62, z, 48, 24); h.castShadow = false;
});

// ---- grass blades (instanced, wind in vertex shader)
const timeU = { value: 0 };
function bladeGeo() {
  const segs = 4, pos = [], col = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const v = i / segs, w = 0.5 * (1 - v) + 0.02, bend = 0.25 * v * v;
    pos.push(-w, v, bend, w, v, bend);
    const c = 0.45 + 0.55 * v; col.push(c, c, c, c, c, c);
  }
  for (let i = 0; i < segs; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
const grassMat = M(0xffffff, 0.8, { side: THREE.DoubleSide, vertexColors: true });
grassMat.onBeforeCompile = (sh) => {
  sh.uniforms.uTime = timeU;
  sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>',
    `#include <begin_vertex>
     vec4 ip = instanceMatrix[3];
     float hh = position.y;
     transformed.x += sin(uTime*2.1 + ip.x*1.7 + ip.z*1.1) * 0.22 * hh * hh;
     transformed.z += cos(uTime*1.7 + ip.x*0.9) * 0.12 * hh * hh;`);
};
function scatterGrass(n, fx, fz, hmin, hmax) {
  const im = new THREE.InstancedMesh(bladeGeo(), grassMat, n);
  im.receiveShadow = true; im.castShadow = false;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const [x, z] = [fx(), fz()];
    p.set(x, 0, z);
    q.setFromEuler(new THREE.Euler(rr(-0.15, 0.15), rr(0, Math.PI * 2), rr(-0.15, 0.15)));
    const h = rr(hmin, hmax); s.set(h * 0.32, h, h);
    m4.compose(p, q, s); im.setMatrixAt(i, m4);
    c.setHSL(rr(0.22, 0.30), rr(0.55, 0.7), rr(0.33, 0.5)); im.setColorAt(i, c);
  }
  scene.add(im);
  return im;
}
const outsideX = () => rr(2.55, 16);
scatterGrass(26000, outsideX, () => rr(-8, 9), 0.06, 0.16);
scatterGrass(9000, () => 2.55 + Math.pow(rand(), 0.8) * 2.4, () => rr(-0.3, 2.7), 0.07, 0.15);   // patch where she kneels
scatterGrass(5000, () => rr(-12, 2.5), () => (rand() < 0.5 ? rr(-9, -3.05) : rr(2.85, 9)), 0.06, 0.15); // sides of house
scatterGrass(3000, () => rr(-12, -2.6), () => rr(-3.1, 2.9), 0.06, 0.15);

// ---- flowers (instanced)
function flowerHeadGeo() {
  const parts = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const g = new THREE.SphereGeometry(0.5, 12, 8); g.scale(0.55, 0.18, 0.32);
    g.translate(0.45, 0, 0); g.rotateY(a); parts.push(g);
  }
  return mergeGeometries(parts);
}
const FL = 650;
const stemIM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.004, 0.006, 1, 5).translate(0, 0.5, 0), M(0x3f8f2f, 0.8), FL);
const headIM = new THREE.InstancedMesh(flowerHeadGeo(), M(0xffffff, 0.55), FL);
const centIM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 10, 8).scale(1, 0.6, 1), M(0xffcf33, 0.5), FL);
{
  const palette = [0xff6fa3, 0xffffff, 0xffd84a, 0xb88cff, 0xff8a5c, 0x6fb6ff, 0xff4d6d];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  for (let i = 0; i < FL; i++) {
    let x, z;
    if (i < 140) { x = rr(2.8, 5.2); z = rr(-0.6, 3.0); if (Math.abs(z - 1.2) < 0.45 && x < 4.4) z += 0.9 * Math.sign(z - 1.2 || 1); }
    else if (i < 220) { x = rr(2.55, 2.9); z = rr(-2.7, 2.5); if (z > 0.7 && z < 1.7) z -= 3.5; }
    else { x = rr(3, 16); z = rr(-8, 9); }
    const h = rr(0.1, 0.24), tilt = rr(-0.2, 0.2);
    q.setFromEuler(new THREE.Euler(tilt, rr(0, 6.28), rr(-0.2, 0.2)));
    m4.compose(V(x, 0, z), q, V(1, h, 1)); stemIM.setMatrixAt(i, m4);
    const top = V(0, h, 0).applyQuaternion(q).add(V(x, 0, z));
    const fs = rr(0.05, 0.075);
    m4.compose(top, q, V(fs, fs, fs)); headIM.setMatrixAt(i, m4); centIM.setMatrixAt(i, m4);
    c.setHex(palette[Math.floor(rand() * palette.length)]); headIM.setColorAt(i, c);
  }
  [stemIM, headIM, centIM].forEach((im) => { im.castShadow = false; im.receiveShadow = true; scene.add(im); });
}

// ---- trees, bushes, clouds, fence
function lumpy(r, detail = 3, amt = 0.08) {
  const g = new THREE.IcosahedronGeometry(r, detail); const p = g.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const n = Math.sin(v.x * 7.1) * Math.sin(v.y * 6.3 + 1) * Math.sin(v.z * 5.7 + 2);
    v.multiplyScalar(1 + n * amt); p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return g;
}
const leafMats = [M(0x4caf3e, 0.85), M(0x3d9c36, 0.85), M(0x67c24a, 0.85)];
const trunkMat = M(0x8a5a3b, 0.9);
function tree(x, z, s = 1) {
  const g = group(scene, x, 0, z); g.scale.setScalar(s);
  cyl(0.12, 0.17, 1.4, trunkMat, g, 0, 0.7, 0, 12);
  [[0, 1.75, 0, 0.75], [0.45, 1.5, 0.2, 0.55], [-0.4, 1.55, -0.15, 0.55], [0.1, 2.25, -0.05, 0.55], [-0.15, 1.6, 0.4, 0.5]]
    .forEach(([a, b, c, r], i) => mesh(lumpy(r), leafMats[i % 3], g, a, b, c));
  return g;
}
[[7.5, -3.2, 1.3], [9.5, 3.8, 1.5], [12, -0.5, 1.7], [6.2, 5.6, 1.1], [14, 5, 1.6], [11, -6, 1.5], [16, -3, 1.8], [4.4, -5.6, 1.2],
  [17, 2, 1.9], [5.5, 8.5, 1.3], [-4, -6, 1.6], [-5, 5.5, 1.5], [9, 9, 1.4], [19, 7, 2]].forEach(([x, z, s]) => tree(x, z, s));
const bushMat = M(0x3f9e3a, 0.9);
[[2.85, -0.3, 0.32], [2.8, 2.25, 0.3], [2.85, -2.5, 0.35], [6.5, 1.8, 0.4], [8.3, -1.2, 0.45], [5.4, -2.3, 0.35]].forEach(([x, z, r]) => {
  mesh(lumpy(r, 3, 0.1), bushMat, scene, x, r * 0.6, z);
  for (let i = 0; i < 6; i++) sph(0.035, M([0xff6fa3, 0xffffff, 0xffd84a][i % 3], 0.5), scene, x + rr(-r, r) * 0.8, r * 0.6 + rr(0, r * 0.7), z + rr(-r, r) * 0.8, 10, 8);
});
const cloudMat = M(0xffffff, 1.0, { emissive: 0xffffff, emissiveIntensity: 0.25 });
[[40, 18, -18, 1], [55, 24, 10, 1.4], [38, 15, 22, 0.9], [60, 30, -35, 1.6], [30, 20, 3, 0.8]].forEach(([x, y, z, s]) => {
  const g = group(scene, x, y, z); g.scale.setScalar(s * 2.2);
  [[0, 0, 0, 1.4], [1.4, -0.2, 0.3, 1.1], [-1.4, -0.3, -0.2, 1.0], [0.6, 0.6, -0.3, 1.0], [-0.6, 0.4, 0.4, 0.9]].forEach(([a, b, c, r]) => {
    const m = sph(r, cloudMat, g, a, b, c, 24, 16); m.castShadow = false;
  });
});
{ // white picket fence
  const fenceMat = M(0xffffff, 0.6);
  const n = 70, im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.6, 0.03), fenceMat, n);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { m4.makeTranslation(10.5, 0.3, -9 + i * 0.26); im.setMatrixAt(i, m4); }
  im.castShadow = true; scene.add(im);
  box(0.03, 0.06, 18.2, fenceMat, scene, 10.5, 0.45, 0, 0); box(0.03, 0.06, 18.2, fenceMat, scene, 10.5, 0.18, 0, 0);
}
// stepping stones from the door
[[2.75, 1.2], [3.15, 1.12]].forEach(([x, z], i) => {
  const s = cyl(0.19, 0.2, 0.04, M(0xbdb6a8, 0.95), scene, x, 0.012, z, 20); s.scale.set(1, 1, 0.8 + i * 0.1);
});

// ================================================================= HOUSE ===
const HX0 = -2.4, HX1 = 2.4, HZ0 = -2.8, HZ1 = 2.6, HH = 2.2, WT = 0.06;
const DOOR = { z0: 0.825, z1: 1.575, h: 1.5 };
const WIN = { z0: -2.3, z1: -1.5, y0: 0.75, y1: 1.55 };
const wallIn = M(0xf4e1cf, 0.95), wallOut = M(0xfff0d8, 0.9), trim = M(0xffffff, 0.6);
// generic wall (along z at x) with holes, two layers
function wallZ(x, inMat, outMat, holes) {
  const layer = (xx, mat) => {
    let z = HZ0;
    const hs = [...holes].sort((a, b) => a.z0 - b.z0);
    for (const h of hs) {
      if (h.z0 > z) box(WT, HH, h.z0 - z, mat, scene, xx, HH / 2, (z + h.z0) / 2, 0);
      if (h.y0 > 0) box(WT, h.y0, h.z1 - h.z0, mat, scene, xx, h.y0 / 2, (h.z0 + h.z1) / 2, 0);
      box(WT, HH - h.y1, h.z1 - h.z0, mat, scene, xx, (h.y1 + HH) / 2, (h.z0 + h.z1) / 2, 0);
      z = h.z1;
    }
    box(WT, HH, HZ1 - z, mat, scene, xx, HH / 2, (z + HZ1) / 2, 0);
  };
  layer(x - WT / 2, inMat); layer(x + WT / 2, outMat);
}
wallZ(HX1, wallIn, wallOut, [{ z0: DOOR.z0, z1: DOOR.z1, y0: 0, y1: DOOR.h }, WIN]);
box(WT, HH, HZ1 - HZ0, wallIn, scene, HX0 + WT / 2, HH / 2, (HZ0 + HZ1) / 2, 0);
box(WT, HH, HZ1 - HZ0, wallOut, scene, HX0 - WT / 2, HH / 2, (HZ0 + HZ1) / 2, 0);
box(HX1 - HX0, HH, WT, wallIn, scene, 0, HH / 2, HZ0 + WT / 2, 0); box(HX1 - HX0 + 0.12, HH, WT, wallOut, scene, 0, HH / 2, HZ0 - WT / 2, 0);
box(HX1 - HX0, HH, WT, wallIn, scene, 0, HH / 2, HZ1 - WT / 2, 0); box(HX1 - HX0 + 0.12, HH, WT, wallOut, scene, 0, HH / 2, HZ1 + WT / 2, 0);
box(HX1 - HX0 + 0.12, 0.08, HZ1 - HZ0 + 0.12, M(0xfaf3ea, 0.95), scene, 0, HH + 0.04, (HZ0 + HZ1) / 2, 0); // ceiling
// baseboard (exterior) and roof
box(0.1, 0.16, HZ1 - HZ0 + 0.14, M(0xb98f6e, 0.8), scene, HX1 + 0.07, 0.08, (HZ0 + HZ1) / 2, 0);
{
  const shape = new THREE.Shape(); shape.moveTo(-2.95, 0); shape.lineTo(2.95, 0); shape.lineTo(0, 1.6); shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: HZ1 - HZ0 + 0.7, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
  const roof = mesh(g, M(0xe0684f, 0.75), scene, 0, HH + 0.06, HZ0 - 0.35);
  // gable shingles hint: stripes
  for (let i = 0; i < 7; i++) {
    const w = 2.95 * (1 - (i + 0.5) / 7.5);
    box(0.07, 0.03, HZ1 - HZ0 + 0.8, M(0xc9573f, 0.8), scene, w * 0.995, HH + 0.06 + (i + 0.5) / 7.5 * 1.6 * 1.0, (HZ0 + HZ1) / 2, 0).rotation.z = 0.5;
  }
  roof.receiveShadow = true;
}
// interior floor
const floorTex = canvasTex(512, 512);
{
  const g = floorTex.ctx;
  for (let i = 0; i < 8; i++) {
    g.fillStyle = `hsl(28,${45 + (i % 3) * 4}%,${55 + ((i * 7) % 5) * 2}%)`; g.fillRect(0, i * 64, 512, 64);
    g.fillStyle = 'rgba(80,45,20,.35)'; g.fillRect(0, i * 64, 512, 2); g.fillRect((i * 173) % 512, i * 64, 2, 64);
  }
  floorTex.tex.wrapS = floorTex.tex.wrapT = THREE.RepeatWrapping; floorTex.tex.repeat.set(3, 3);
}
mesh(new THREE.BoxGeometry(HX1 - HX0, 0.04, HZ1 - HZ0), M(0xffffff, 0.7, { map: floorTex.tex }), scene, 0, -0.012, (HZ0 + HZ1) / 2, false);
const rug = cyl(0.75, 0.75, 0.012, M(0xb8a4e3, 1.0), scene, 0.1, 0.012, -0.15, 40); rug.castShadow = false;

// ---- door (hinged at z1 edge, swings into the room)
const doorPivot = group(scene, HX1, 0, DOOR.z1);
const doorMat = M(0x37b3a4, 0.55);
const doorSlab = box(0.05, DOOR.h - 0.01, DOOR.z1 - DOOR.z0 - 0.01, doorMat, doorPivot, 0, DOOR.h / 2, -(DOOR.z1 - DOOR.z0) / 2, 0.01);
[[0.38, 0.17], [0.38, -0.17], [1.05, 0.17], [1.05, -0.17]].forEach(([y, dz]) => {
  box(0.065, 0.42, 0.25, M(0x2f9d90, 0.55), doorPivot, 0, y + (y > 1 ? 0 : 0.05), -(DOOR.z1 - DOOR.z0) / 2 + dz, 0.02).scale.set(1, y > 1 ? 0.8 : 1.2, 1);
});
const knobMat = M(0xf2c14e, 0.25, { metalness: 0.6 });
sph(0.032, knobMat, doorPivot, -0.055, 0.78, -0.68); sph(0.032, knobMat, doorPivot, 0.055, 0.78, -0.68);
const knobIn = group(doorPivot, -0.08, 0.78, -0.68);
const knobOut = group(doorPivot, 0.09, 0.8, -0.68);
// frame + step + wall lamp + doormat
box(0.12, 0.08, 0.92, trim, scene, HX1, DOOR.h + 0.04, 1.2, 0.01);
box(0.12, DOOR.h, 0.07, trim, scene, HX1, DOOR.h / 2, DOOR.z0 - 0.03, 0.01); box(0.12, DOOR.h, 0.07, trim, scene, HX1, DOOR.h / 2, DOOR.z1 + 0.03, 0.01);
box(0.4, 0.05, 1.0, M(0xd9cfc0, 0.9), scene, HX1 + 0.2, 0.025, 1.2, 0.01);
const mat = box(0.35, 0.012, 0.6, M(0x7b5e57, 1), scene, HX1 - 0.32, 0.01, 1.2, 0.004); mat.castShadow = false;
cyl(0.05, 0.07, 0.16, M(0x2b2b2b, 0.4), scene, HX1 + 0.08, 1.35, 1.75, 12);
// facade window with flower box + blinds inside
box(0.1, 0.06, 0.95, trim, scene, HX1, WIN.y1 + 0.03, -1.9, 0.01); box(0.14, 0.06, 1.0, trim, scene, HX1 + 0.02, WIN.y0 - 0.03, -1.9, 0.01);
box(0.1, 0.8, 0.05, trim, scene, HX1, (WIN.y0 + WIN.y1) / 2, -1.9, 0.01);
const glass = mesh(new THREE.PlaneGeometry(0.8, 0.8), M(0x9fd4ff, 0.05, { transparent: true, opacity: 0.25, metalness: 0.2 }), scene, HX1 + 0.01, 1.15, -1.9, false);
glass.rotation.y = Math.PI / 2;
for (let i = 0; i < 12; i++) box(0.015, 0.055, 0.8, M(0xefe7dc, 0.7), scene, HX1 - 0.07, WIN.y0 + 0.04 + i * 0.066, -1.9, 0.004).rotation.z = 0.25;
box(0.22, 0.16, 1.0, M(0x9c6b4a, 0.8), scene, HX1 + 0.12, WIN.y0 - 0.12, -1.9, 0.02);
for (let i = 0; i < 9; i++) sph(0.05, M([0xff4d6d, 0xffd84a, 0xffffff][i % 3], 0.5), scene, HX1 + 0.12 + rr(-0.05, 0.05), WIN.y0 - 0.02 + rr(0, 0.06), -2.3 + i * 0.1, 10, 8);
for (let i = 0; i < 6; i++) sph(0.07, bushMat, scene, HX1 + 0.12, WIN.y0 - 0.04, -2.28 + i * 0.15, 10, 8);

// ---- interior furniture & props
const desk = group(scene, 0, 0, -0.95);
const wood = M(0xf4f1ec, 0.5);
box(1.75, 0.04, 0.66, wood, desk, 0, 0.48, 0, 0.015);
[[-0.82, -0.28], [0.82, -0.28], [-0.82, 0.28], [0.82, 0.28]].forEach(([x, z]) => cyl(0.022, 0.022, 0.46, M(0x2b2b2b, 0.4), desk, x, 0.23, z, 10));
// monitors
const screens = {};
function monitor(name, x, z, ry, w = 0.58, h = 0.34) {
  const g = group(scene, x, 0.5, z); g.rotation.y = ry;
  cyl(0.09, 0.1, 0.012, M(0x2b2b2b, 0.4), g, 0, 0.006, -0.05, 20);
  box(0.035, 0.08, 0.02, M(0x2b2b2b, 0.4), g, 0, 0.045, -0.06, 0.008);
  box(w + 0.03, h + 0.03, 0.03, M(0x1d1d22, 0.4), g, 0, 0.07 + h / 2, -0.035, 0.012);
  const ct = canvasTex(1024, Math.round(1024 * h / w));
  const scr = mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false }), g, 0, 0.07 + h / 2, -0.018, false);
  scr.material.color.setScalar(0.9);
  screens[name] = { ...ct, g, w, h, scr };
  return g;
}
monitor('center', 0, -1.12, 0);
monitor('left', -0.62, -1.0, 0.5, 0.5, 0.3);
monitor('right', 0.62, -1.0, -0.5, 0.5, 0.3);
// sticky notes on bezels
const stickyCols = [0xfff176, 0xff9ec7, 0x9be7ff, 0xb9f6ca];
[[-0.3, 0.74, -1.12, 0.2], [0.27, 0.77, -1.12, -0.25], [-0.82, 0.7, -0.88, 0.6], [0.83, 0.69, -0.88, -0.4], [-0.1, 0.9, -1.12, 0.1], [0.12, 0.55, -1.09, 0.3]]
  .forEach(([x, y, z, r], i) => { const s = box(0.07, 0.07, 0.004, M(stickyCols[i % 4], 0.8), scene, x, y, z + 0.03, 0); s.rotation.z = r; s.castShadow = false; });
// laptop (front right)
const laptop = group(scene, 0.6, 0.5, -0.72); laptop.rotation.y = -0.45;
box(0.34, 0.012, 0.23, M(0xc9ced6, 0.3, { metalness: 0.4 }), laptop, 0, 0.006, 0, 0.005);
const lid = group(laptop, 0, 0.012, -0.112); lid.rotation.x = -0.25;
box(0.34, 0.22, 0.01, M(0xc9ced6, 0.3, { metalness: 0.4 }), lid, 0, 0.11, -0.005, 0.005);
const lapCT = canvasTex(1024, 640);
const lapScr = mesh(new THREE.PlaneGeometry(0.31, 0.194), new THREE.MeshBasicMaterial({ map: lapCT.tex, toneMapped: false }), lid, 0, 0.112, 0.0012, false);
screens.laptop = { ...lapCT, scr: lapScr };
// keyboard + mouse
const kb = box(0.44, 0.02, 0.14, M(0xe9e9ee, 0.5), scene, 0, 0.51, -0.7, 0.008);
for (let r = 0; r < 4; r++) for (let c = 0; c < 13; c++) { const k = box(0.026, 0.008, 0.026, M(0xffffff, 0.4), scene, -0.195 + c * 0.0325, 0.523, -0.75 + r * 0.032, 0.004); k.castShadow = false; }
box(0.05, 0.022, 0.08, M(0xe9e9ee, 0.4), scene, 0.33, 0.51, -0.66, 0.02);
// coffee mugs: the graveyard + the current one
const mugMat = [M(0xffffff, 0.4), M(0xff8fae, 0.4), M(0x9be7ff, 0.4), M(0xfff176, 0.4), M(0xe8b443, 0.4)];
function mug(x, y, z, m, parent = scene) {
  const g = group(parent, x, y, z);
  cyl(0.036, 0.032, 0.08, m, g, 0, 0.04, 0, 20);
  const c = cyl(0.03, 0.03, 0.005, M(0x4a2a17, 0.3), g, 0, 0.078, 0, 16); c.castShadow = false;
  const h = mesh(new THREE.TorusGeometry(0.022, 0.007, 8, 16), m, g, 0.038, 0.042, 0); h.rotation.y = 0;
  return g;
}
[[-0.7, 0.5, -0.68], [-0.78, 0.5, -0.78], [-0.62, 0.5, -0.8], [-0.73, 0.58, -0.73], [-0.55, 0.5, -0.66]].forEach(([x, y, z], i) => {
  const m = mug(x, y, z, mugMat[i]); m.rotation.y = i * 1.3; if (i === 3) m.rotation.z = 0.35;
});
const curMug = mug(0.3, 0.5, -0.55, mugMat[4]);
const mugRest = curMug.position.clone();
const steam = [];
for (let i = 0; i < 3; i++) {
  const s = sph(0.02, M(0xffffff, 1, { transparent: true, opacity: 0.35, depthWrite: false }), scene, 0, 0, 0, 12, 8); s.castShadow = false; steam.push(s);
}
// dead plant
{
  const g = group(scene, -0.78, 0.5, -1.12);
  cyl(0.06, 0.045, 0.1, M(0xd9734a, 0.8), g, 0, 0.05, 0, 16);
  for (let i = 0; i < 4; i++) {
    const l = mesh(new THREE.SphereGeometry(0.05, 10, 8).scale(0.35, 1, 0.12), M(0x8b7a3a, 0.9), g, 0, 0.13, 0);
    l.rotation.set(0.9, i * 1.6, 0.4); l.position.set(Math.cos(i * 1.6) * 0.04, 0.12, Math.sin(i * 1.6) * 0.04);
  }
}
// paper stack + pizza box
for (let i = 0; i < 6; i++) box(0.2, 0.012, 0.27, M(0xfbfbfb, 0.9), scene, 0.75 + rr(-0.01, 0.01), 0.507 + i * 0.013, -1.15 + 0.05, 0.002).rotation.y = rr(-0.15, 0.15);
box(0.38, 0.05, 0.38, M(0xd8b98a, 0.9), scene, -1.05, 0.025, -0.35, 0.01);
box(0.38, 0.05, 0.38, M(0xd8b98a, 0.9), scene, -1.03, 0.075, -0.33, 0.01).rotation.y = 0.2;
// chair
const chair = group(scene, 0, 0, -0.35);
cyl(0.2, 0.2, 0.06, M(0x34343c, 0.6), chair, 0, 0.24, 0, 28);
box(0.36, 0.42, 0.05, M(0x34343c, 0.6), chair, 0, 0.52, 0.2, 0.04);
cyl(0.025, 0.025, 0.2, M(0x888888, 0.3, { metalness: 0.6 }), chair, 0, 0.11, 0, 10);
for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const l = box(0.2, 0.025, 0.04, M(0x2b2b2b, 0.4), chair, Math.cos(a) * 0.1, 0.03, Math.sin(a) * 0.1, 0.01); l.rotation.y = -a; }
// wall clock (right wall, inside)
const clockCT = canvasTex(512, 512);
const clock = group(scene, HX1 - WT - 0.01, 1.45, -0.5); clock.rotation.y = -Math.PI / 2;
cyl(0.2, 0.2, 0.03, M(0xe8b443, 0.4), clock, 0, 0, -0.015, 40).rotation.x = Math.PI / 2;
mesh(new THREE.CircleGeometry(0.18, 48), new THREE.MeshBasicMaterial({ map: clockCT.tex }), clock, 0, 0, 0.002, false);
// poster + shelf on left wall
const posterCT = canvasTex(512, 700);
{
  const g = posterCT.ctx; g.fillStyle = '#1b1b1b'; g.fillRect(0, 0, 512, 700);
  g.fillStyle = '#e8b443'; g.font = '900 78px Inter'; g.textAlign = 'center';
  ['INBOX', 'ZERO', 'IS A', 'MYTH'].forEach((s, i) => g.fillText(s, 256, 170 + i * 120));
  g.fillStyle = '#fff'; g.font = '600 30px Inter'; g.fillText('(but we keep trying)', 256, 640);
  const p = mesh(new THREE.PlaneGeometry(0.42, 0.575), M(0xffffff, 0.8, { map: posterCT.tex }), scene, HX0 + WT + 0.01, 1.3, -1.2, false);
  p.rotation.y = Math.PI / 2;
}
// wall art behind her (+z wall) & fairy lights
for (let i = 0; i < 14; i++) {
  const l = sph(0.022, new THREE.MeshBasicMaterial({ color: [0xffd27a, 0xff9ec7, 0x9be7ff][i % 3] }), scene, -1.6 + i * 0.25, 1.9 - Math.sin(i / 13 * Math.PI) * 0.18, -2.7, 10, 8);
  l.castShadow = false;
}

// ================================================================= GIRL ====
const R = 0.25;            // head radius
const HIPS0 = 0.447;       // standing hips height
const L1 = 0.16, L2 = 0.15; // arm segments
const girl = {};
function surf(x, y, out = 0) { return Math.sqrt(Math.max(0, R * R - x * x - y * y)) + out; }
function onHead(obj, x, y, out = 0) {
  const z = surf(x, y, out);
  obj.position.set(x, y, z);
  obj.rotation.set(-Math.atan2(y, z), Math.atan2(x, z), 0, 'YXZ');
  return obj;
}
(function buildGirl() {
  const root = group(scene); girl.root = root;
  const hips = group(root, 0, HIPS0, 0); girl.hips = hips;
  mesh(new THREE.SphereGeometry(0.135, 32, 16).scale(1, 0.78, 0.85), MAT.pants, hips, 0, 0, 0);
  const spine = group(hips, 0, 0.02, 0); girl.spine = spine;
  // hoodie torso (lathe)
  const prof = [[0.0, -0.02], [0.135, -0.02], [0.152, 0.05], [0.15, 0.15], [0.138, 0.23], [0.112, 0.29], [0.06, 0.322], [0.0, 0.33]].map(([a, b]) => new THREE.Vector2(a, b));
  const torso = mesh(new THREE.LatheGeometry(prof, 32), MAT.hoodie, spine); torso.scale.set(1, 1, 0.82);
  box(0.18, 0.075, 0.03, MAT.hoodieDark, spine, 0, 0.08, 0.112, 0.012).rotation.x = -0.1;
  const hood = mesh(new THREE.TorusGeometry(0.1, 0.045, 12, 24), MAT.hoodie, spine, 0, 0.31, -0.035); hood.rotation.x = Math.PI / 2 - 0.25;
  [-1, 1].forEach((s) => { const st = caps(0.006, 0.07, MAT.white, spine, s * 0.035, 0.24, 0.116); st.rotation.x = -0.15; });
  const neck = group(spine, 0, 0.31, 0); girl.neck = neck;
  cyl(0.045, 0.05, 0.08, MAT.skin, neck, 0, 0.02, 0, 16);
  const headP = group(neck, 0, 0.05, 0); girl.headP = headP;
  const head = group(headP, 0, 0.2, 0.0); girl.head = head;
  const skull = sph(R, MAT.skin, head, 0, 0, 0, 48, 32); skull.scale.set(1, 0.97, 0.96);
  // ---- face
  girl.eyes = [];
  [-1, 1].forEach((s) => {
    const eg = onHead(group(head), s * 0.088, -0.005, -0.014);
    const inner = group(eg); // scaled for wide eyes
    const white = sph(0.064, MAT.white, inner, 0, 0, 0, 32, 20); white.scale.set(0.92, 1.12, 0.45); white.castShadow = false;
    const irisG = group(inner, 0, 0, 0);
    const iris = sph(0.051, MAT.iris, irisG, 0, 0, 0.02, 32, 16); iris.scale.set(1, 1.1, 0.3);
    const pupil = sph(0.029, MAT.pupil, irisG, 0, 0, 0.026, 24, 12); pupil.scale.set(1, 1.1, 0.3);
    const h1 = sph(0.016, MAT.shine, irisG, 0.017 * -s * -1, 0.024, 0.036, 12, 8);
    const h2 = sph(0.0075, MAT.shine, irisG, -0.015, -0.019, 0.036, 10, 6);
    // star sparkles
    const st = new THREE.Shape();
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 2, r = i % 2 ? 0.006 : 0.02; i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const star = mesh(new THREE.ShapeGeometry(st), MAT.shine, irisG, 0.012, 0.016, 0.039, false);
    const star2 = mesh(new THREE.ShapeGeometry(st), MAT.shine, irisG, -0.016, -0.014, 0.039, false); star2.scale.setScalar(0.55);
    // eyelid: upper hemisphere of skin that rotates down
    const lidG = group(inner, 0, 0, 0);
    const lidM = mesh(new THREE.SphereGeometry(0.068, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), MAT.skin, lidG, 0, 0, 0, false);
    const lidLine = mesh(new THREE.TorusGeometry(0.068, 0.0085, 6, 40, Math.PI), MAT.lash, lidG, 0, 0, 0, false); lidLine.rotation.x = Math.PI / 2;
    lidG.scale.set(0.95, 1.13, 0.5);
    // lashes flick
    const flick = caps(0.006, 0.025, MAT.lash, inner, s * 0.06, 0.05, 0.005); flick.rotation.z = -s * 1.0;
    // eye bags
    const bag = mesh(new THREE.TorusGeometry(0.05, 0.007, 6, 18, Math.PI * 0.7), MAT.bags, eg, 0, -0.07, 0.008, false);
    bag.rotation.z = -Math.PI / 2 - Math.PI * 0.35;
    // tear
    const tear = sph(0.014, MAT.tear, eg, s * 0.05, -0.06, 0.02, 12, 10); tear.scale.set(1, 1.4, 0.7);
    girl.eyes.push({ s, eg, inner, irisG, pupil, h1, star, star2, lidG, flick, bag, tear });
  });
  girl.brows = [-1, 1].map((s) => {
    const b = onHead(group(head), s * 0.092, 0.105, 0.004);
    const m = caps(0.011, 0.05, MAT.hair, b, 0, 0, 0); m.rotation.z = Math.PI / 2; m.castShadow = false;
    return { s, b, base: b.position.clone() };
  });
  sph(0.013, MAT.skinDark, head, 0, -0.05, surf(0, -0.05) - 0.004, 12, 10).castShadow = false;
  girl.cheeks = [-1, 1].map((s) => { const c = sph(0.042, MAT.blush, head, 0, 0, 0, 16, 12); onHead(c, s * 0.15, -0.065, -0.012); c.scale.set(1, 0.65, 0.3); c.castShadow = false; return c; });
  // mouth
  girl.mouthG = onHead(group(head), 0, -0.105, -0.006);
  girl.mouthLine = mesh(new THREE.BufferGeometry(), MAT.lip, girl.mouthG, 0, 0, 0, false);
  const mo = group(girl.mouthG); girl.mouthOpen = mo;
  girl.mouthHole = sph(0.05, MAT.mouth, mo, 0, 0, 0, 32, 16); girl.mouthHole.castShadow = false;
  girl.mouthHalf = mesh(new THREE.SphereGeometry(0.05, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), MAT.mouth, mo, 0, 0, 0, false);
  girl.tongue = sph(0.03, MAT.tongue, mo, 0, -0.022, 0.012, 16, 10); girl.tongue.scale.set(1, 0.5, 0.4); girl.tongue.castShadow = false;
  girl.teeth = box(0.05, 0.012, 0.01, MAT.white, mo, 0, 0.026, 0.012, 0.004); girl.teeth.castShadow = false;
  // sweat drop
  girl.sweat = sph(0.022, MAT.tear, head, 0, 0, 0, 14, 10); onHead(girl.sweat, -0.16, 0.13, 0.01); girl.sweat.scale.set(1, 1.5, 0.6);
  // ---- hair
  const cap = mesh(new THREE.SphereGeometry(0.266, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.6), MAT.hair, head, 0, 0.005, -0.006);
  cap.rotation.x = -0.82;
  const bangs = [[-0.11, 0.165, 0.5, -0.5], [-0.035, 0.18, 0.45, -0.25], [0.05, 0.175, 0.4, 0.15], [0.13, 0.15, 0.35, 0.5]];
  bangs.forEach(([x, y, sc, rz]) => {
    const b = mesh(new THREE.SphereGeometry(0.075, 20, 14), MAT.hair, head); onHead(b, x, y, -0.03);
    b.scale.set(sc * 2.0, 1.05, 0.45); b.rotateZ(rz);
  });
  [-1, 1].forEach((s) => {
    const lock = caps(0.045, 0.17, MAT.hair, head, s * 0.215, -0.075, 0.055); lock.rotation.set(0.15, 0, s * 0.12); lock.scale.set(1, 1, 0.75);
    const lock2 = caps(0.05, 0.12, MAT.hair, head, s * 0.2, -0.1, -0.09); lock2.rotation.set(-0.2, 0, s * 0.1);
  });
  sph(0.2, MAT.hair, head, 0, -0.05, -0.08).scale.set(1.15, 1.0, 0.9);
  const bun = sph(0.105, MAT.hair, head, 0, 0.255, -0.085, 32, 20); girl.bun = bun;
  const scr = mesh(new THREE.TorusGeometry(0.075, 0.022, 10, 24), M(0xff8fae, 0.9), head, 0, 0.19, -0.065); scr.rotation.x = Math.PI / 2 + 0.35;
  [[0.09, 0.32, -0.05, 0.6], [-0.08, 0.34, -0.12, -0.8], [0.02, 0.36, -0.16, 0.2]].forEach(([x, y, z, r]) => {
    const f = mesh(new THREE.TorusGeometry(0.04, 0.007, 6, 14, Math.PI * 1.1), MAT.hair, head, x, y, z); f.rotation.set(0.3, r, r);
  });
  // pencil through the bun
  const pen = group(head, 0, 0.26, -0.085); pen.rotation.set(0.25, 0.4, 1.05);
  cyl(0.011, 0.011, 0.26, M(0xffc94a, 0.5), pen, 0, 0, 0, 6);
  cyl(0.011, 0.011, 0.025, M(0xff8fae, 0.8), pen, 0, 0.14, 0, 10);
  const tip = cyl(0.0, 0.011, 0.035, M(0xf1d3a8, 0.8), pen, 0, -0.147, 0, 6); tip.rotation.x = Math.PI;
  // ahoge (antenna strand)
  const ah = group(head, 0.02, 0.24, 0.07); girl.ahoge = ah;
  const curve = new THREE.CatmullRomCurve3([V(0, 0, 0), V(0.02, 0.06, 0.02), V(-0.01, 0.11, 0.03), V(-0.05, 0.12, 0.0), V(-0.065, 0.09, -0.02)]);
  mesh(new THREE.TubeGeometry(curve, 24, 0.009, 6), MAT.hair, ah);
  // ---- headset with mic boom
  const ph = group(head); girl.phones = ph;
  const band = mesh(new THREE.TorusGeometry(0.288, 0.02, 12, 48, Math.PI), MAT.phones, ph, 0, -0.005, -0.02); band.scale.set(1, 1.04, 1);
  [-1, 1].forEach((s) => {
    const c = cyl(0.075, 0.075, 0.055, MAT.phones, ph, s * 0.288, -0.03, -0.02, 28); c.rotation.z = Math.PI / 2;
    const cu = mesh(new THREE.TorusGeometry(0.06, 0.02, 10, 24), MAT.phonesGold, ph, s * 0.26, -0.03, -0.02); cu.rotation.y = Math.PI / 2;
  });
  const boom = new THREE.CatmullRomCurve3([V(0.3, -0.06, 0.0), V(0.27, -0.16, 0.12), V(0.15, -0.16, 0.24), V(0.06, -0.12, 0.27)]);
  mesh(new THREE.TubeGeometry(boom, 20, 0.008, 6), MAT.phones, ph);
  sph(0.02, MAT.phones, ph, 0.055, -0.12, 0.272, 12, 8);
  // anchors
  girl.A = {
    mouth: group(head, 0, -0.11, 0.32), forehead: group(head, -0.06, 0.08, 0.3),
    cheekL: group(head, 0.215, -0.08, 0.13), cheekR: group(head, -0.215, -0.08, 0.13),
    cupL: group(head, 0.33, -0.03, -0.02), cupR: group(head, -0.33, -0.03, -0.02),
  };
  // ---- arms
  girl.arms = [-1, 1].map((s) => {
    const sh = group(spine, s * 0.165, 0.265, 0); sh.rotation.order = 'ZXY';
    const up = caps(0.05, 0.1, MAT.hoodie, sh, 0, -0.075, 0);
    const el = group(sh, 0, -L1, 0);
    caps(0.045, 0.1, MAT.hoodie, el, 0, -0.065, 0);
    const cuff = mesh(new THREE.TorusGeometry(0.04, 0.012, 8, 18), MAT.hoodieDark, el, 0, -0.13, 0); cuff.rotation.x = Math.PI / 2;
    const wr = group(el, 0, -L2, 0);
    const palm = sph(0.04, MAT.skin, wr, 0, -0.03, 0, 20, 14); palm.scale.set(0.95, 1.0, 0.72);
    const fingers = [];
    for (let i = 0; i < 4; i++) {
      const fg = group(wr, (i - 1.5) * 0.017, -0.06, 0.0);
      caps(0.0105, 0.026, MAT.skin, fg, 0, -0.016, 0);
      fingers.push(fg);
    }
    const th = group(wr, 0, -0.03, 0.025); th.rotation.x = 0.7;
    caps(0.011, 0.022, MAT.skin, th, 0, -0.012, 0);
    // dirt specks
    const dirt = [];
    for (let i = 0; i < 9; i++) {
      const d = sph(0.0065, MAT.dirt, wr, rr(-0.03, 0.03), rr(-0.08, -0.02), -0.022 + rr(-0.004, 0.004), 6, 5);
      d.castShadow = false; dirt.push(d);
    }
    // put dirt on palm side (local -s x faces inward when hanging; palm side = local -z for our hand basis)
    return { s, sh, el, wr, fingers, th, dirt };
  });
  // ---- legs
  girl.legs = [-1, 1].map((s) => {
    const hp = group(hips, s * 0.072, -0.02, 0); hp.rotation.order = 'ZXY';
    caps(0.068, 0.09, MAT.pants, hp, 0, -0.1, 0);
    const kn = group(hp, 0, -0.2, 0);
    caps(0.055, 0.09, MAT.pants, kn, 0, -0.09, 0);
    const an = group(kn, 0, -0.185, 0);
    const sl = sph(0.07, MAT.slipper, an, 0, -0.022, 0.035, 24, 16); sl.scale.set(0.82, 0.6, 1.3);
    sph(0.012, MAT.black, an, 0.025, 0.012, 0.11, 8, 6); sph(0.012, MAT.black, an, -0.025, 0.012, 0.11, 8, 6);
    sph(0.012, MAT.slipperIn, an, 0, -0.002, 0.123, 8, 6);
    [-1, 1].forEach((e) => { const ear = caps(0.016, 0.06, MAT.slipper, an, e * 0.025, 0.04, 0.05); ear.rotation.set(-0.5, 0, -e * 0.25); });
    return { s, hp, kn, an };
  });
})();
// headset rest position on desk (world), for the "takes off headphones" moment
const phonesDesk = { pos: V(-0.32, 0.55, -0.72), rot: new THREE.Euler(-Math.PI / 2 + 0.15, 0, 0.4) };

// ---- butterflies
function butterfly(c1, c2, s = 1) {
  const g = group(scene); g.scale.setScalar(s);
  const ws = new THREE.Shape();
  ws.moveTo(0, 0); ws.bezierCurveTo(0.03, 0.05, 0.09, 0.07, 0.1, 0.03); ws.bezierCurveTo(0.11, 0.0, 0.07, -0.01, 0.05, -0.005);
  ws.bezierCurveTo(0.09, -0.03, 0.08, -0.07, 0.045, -0.06); ws.bezierCurveTo(0.02, -0.05, 0.01, -0.02, 0, 0);
  const wm = M(c1, 0.6, { side: THREE.DoubleSide, emissive: c1, emissiveIntensity: 0.25 });
  const wings = [-1, 1].map((sd) => {
    const p = group(g); const w = mesh(new THREE.ShapeGeometry(ws), wm, p, 0, 0, 0);
    w.rotation.x = -Math.PI / 2; w.scale.x = sd;
    const dot = mesh(new THREE.CircleGeometry(0.012, 12), M(c2, 0.6, { side: THREE.DoubleSide }), p, sd * 0.065, 0.001, -0.03); dot.rotation.x = -Math.PI / 2;
    return p;
  });
  caps(0.006, 0.05, MAT.black, g, 0, 0, 0).rotation.x = Math.PI / 2;
  return { g, wings };
}
const bfly = butterfly(0xff9a3c, 0x2b2b2b, 1.0);
const bfly2 = butterfly(0x6fb6ff, 0xffffff, 0.9);
const bfly3 = butterfly(0xffe14d, 0x2b2b2b, 0.8);

// ---- dust puffs
const puffMat = M(0xf2efe6, 1, { transparent: true, opacity: 0.7, depthWrite: false });
const puffs = []; for (let i = 0; i < 14; i++) { const p = sph(0.06, puffMat.clone(), scene, 0, -5, 0, 12, 8); p.castShadow = false; puffs.push(p); }

// ---- light shaft through door
const shaftMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: { uO: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
  fragmentShader: `varying vec2 vUv; uniform float uO; void main(){ float a = (1.0 - vUv.y) * smoothstep(0.0,0.25,vUv.x)*smoothstep(1.0,0.75,vUv.x);
    gl_FragColor = vec4(vec3(1.0,0.92,0.7)*a*uO*0.32, 1.0); }`,
});
const shaft = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1, 1, 1, 1), shaftMat);
{ // a slanted box from the door inwards
  const g = new THREE.BoxGeometry(2.2, 1.5, 0.75); g.translate(-1.1, 0.75, 0);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setY(i, p.getY(i) + x * 0.62); }
  shaft.geometry = g; shaft.position.set(HX1, 0, 1.2); scene.add(shaft);
}

// ================================================================= LIGHTS ==
const hemi = new THREE.HemisphereLight(0xcfe8ff, 0x6c8f4a, 1.0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d6, 3.2);
sun.position.copy(sunDir).multiplyScalar(16).add(V(3, 0, 1)); sun.target.position.set(3, 0, 1);
sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
scene.add(sun, sun.target);
const roomLight = new THREE.PointLight(0xffd6a0, 2.2, 7, 1.4); roomLight.position.set(0.2, 2.0, 0.2); scene.add(roomLight);
const screenLight = new THREE.PointLight(0x9cc8ff, 1.6, 2.2, 1.5); screenLight.position.set(0, 0.72, -0.95); scene.add(screenLight);
const fairy = new THREE.PointLight(0xffb36b, 0.8, 3, 1.5); fairy.position.set(0, 1.7, -2.4); scene.add(fairy);
const key = new THREE.DirectionalLight(0xffffff, 0.6); scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0xffe2b0, 0.0); scene.add(rim, rim.target);

// ================================================================= SCREENS ==
const EMAILS = [
  ['Client', 'RE: RE: RE: Quick question'], ['Boss', 'URGENT!!! (not urgent)'], ['Mark', 'Can you hop on a call?'],
  ['Accounting', 'Invoice #4471 — overdue'], ['Lisa', 'Following up on my follow-up'], ['Client', 'Small favor...'],
  ['Calendar', 'Meeting moved (again)'], ['Boss', 'Per my last email'], ['Newsletter', '10 tips to avoid burnout'],
  ['Client', 'Just circling back'], ['IT', 'Password expires today'], ['Mark', 'Thoughts??'],
];
function drawInbox(sc, t) {
  const { ctx: g, c } = sc; const w = c.width, h = c.height;
  g.fillStyle = '#f5f7fb'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1f2a44'; g.fillRect(0, 0, 210, h);
  g.fillStyle = '#ffffff'; g.font = '700 30px Inter'; g.fillText('Mail', 30, 60);
  ['Inbox', 'Starred', 'Sent', 'Drafts', 'Help'].forEach((s, i) => { g.fillStyle = i ? '#9aa6c4' : '#fff'; g.font = '600 24px Inter'; g.fillText(s, 30, 130 + i * 50); });
  const count = Math.floor(2847 + Math.max(0, Math.min(t, 8)) * 9);
  g.fillStyle = '#ff4757'; rrect(g, 120, 104, 82, 34, 17); g.fill(); g.fillStyle = '#fff'; g.font = '800 20px Inter'; g.fillText(count.toLocaleString(), 128, 128);
  g.fillStyle = '#1f2a44'; g.font = '800 34px Inter'; g.fillText(t > 9.3 ? 'Logged off. Bye!' : `Inbox (${count.toLocaleString()})`, 240, 58);
  const scroll = (t * 2.2) % 1, base = Math.floor(t * 2.2);
  for (let i = -1; i < 9; i++) {
    const y = 90 + (i + scroll) * 52; const e = EMAILS[((i - base) % EMAILS.length + EMAILS.length * 50) % EMAILS.length];
    g.fillStyle = i % 2 ? '#ffffff' : '#eef2fa'; g.fillRect(212, y, w - 212, 52);
    g.fillStyle = '#3d7bfd'; g.beginPath(); g.arc(236, y + 26, 8, 0, 7); g.fill();
    g.fillStyle = '#1f2a44'; g.font = '700 22px Inter'; g.fillText(e[0], 256, y + 33);
    g.fillStyle = e[1].includes('URGENT') ? '#e8273b' : '#46506a'; g.font = '600 22px Inter'; g.fillText(e[1], 400, y + 33);
  }
  if (t > 9.3) { g.fillStyle = 'rgba(31,42,68,.85)'; g.fillRect(212, 80, w - 212, h); g.fillStyle = '#e8b443'; g.font = '900 64px Inter'; g.fillText('OFFLINE', 420, h / 2 + 40); }
  sc.tex.needsUpdate = true;
}
function drawSheet(sc, t) {
  const { ctx: g, c } = sc; const w = c.width, h = c.height;
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e8e4e'; g.fillRect(0, 0, w, 54); g.fillStyle = '#fff'; g.font = '700 26px Inter'; g.fillText('Q3_FINAL_final_v7.xlsx', 20, 36);
  const cw = 120, ch = 40;
  for (let r = 0; r < 14; r++) for (let col = 0; col < 9; col++) {
    const x = col * cw, y = 54 + r * ch;
    g.strokeStyle = '#d7dde6'; g.strokeRect(x, y, cw, ch);
    if (r === 0 || col === 0) { g.fillStyle = '#eef1f5'; g.fillRect(x + 1, y + 1, cw - 2, ch - 2); g.fillStyle = '#556'; g.font = '600 18px Inter'; g.fillText(r === 0 ? String.fromCharCode(64 + col) : String(r), x + 10, y + 27); continue; }
    const v = Math.abs(Math.sin(r * 12.9898 + col * 78.233 + Math.floor(t * 3) * (r * col % 3 === 0 ? 1 : 0)) * 43758.5) % 1;
    g.fillStyle = v > 0.85 ? '#e8273b' : '#222'; g.font = '500 18px Inter'; g.fillText((v * 9999).toFixed(2), x + 10, y + 27);
  }
  const cr = 1 + Math.floor(t * 6) % 13, cc = 1 + Math.floor(t * 4.3) % 8;
  g.strokeStyle = '#1e8e4e'; g.lineWidth = 5; g.strokeRect(cc * cw, 54 + cr * ch, cw, ch); g.lineWidth = 1;
  sc.tex.needsUpdate = true;
}
const CHATS = ['Hey! got a sec?', 'Just circling back', 'Quick one...', 'Did you see my email?', 'Can you also...', 'ASAP pls', 'One more thing!'];
function drawChat(sc, t) {
  const { ctx: g, c } = sc; const w = c.width, h = c.height;
  g.fillStyle = '#3f0e40'; g.fillRect(0, 0, 200, h); g.fillStyle = '#fff'; g.fillRect(200, 0, w - 200, h);
  ['# general', '# clients', '# urgent', '# random'].forEach((s, i) => { g.fillStyle = '#d6c4d7'; g.font = '600 24px Inter'; g.fillText(s, 20, 60 + i * 46); });
  const n = Math.min(CHATS.length, Math.floor(t * 1.3) + 2);
  for (let i = 0; i < n; i++) {
    const y = 40 + (i - Math.max(0, n - 6)) * 82; if (y < 20) continue;
    g.fillStyle = ['#3d7bfd', '#e8b443', '#ff4757', '#16a085'][i % 4]; rrect(g, 220, y, 50, 50, 10); g.fill();
    g.fillStyle = '#1d1c1d'; g.font = '800 22px Inter'; g.fillText(['Boss', 'Client', 'Mark', 'Lisa'][i % 4], 285, y + 20);
    g.fillStyle = '#333'; g.font = '500 24px Inter'; g.fillText(CHATS[i], 285, y + 50);
  }
  g.fillStyle = '#ff4757'; g.beginPath(); g.arc(170, 145, 18, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '800 20px Inter'; g.fillText(String(9 + Math.floor(t * 2)), 158, 152);
  sc.tex.needsUpdate = true;
}
function drawLaughEmoji(g, x, y, r) {
  g.save(); g.translate(x, y);
  const grd = g.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.1, 0, 0, r); grd.addColorStop(0, '#ffe680'); grd.addColorStop(1, '#f7b500');
  g.fillStyle = grd; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#6b3a00'; g.lineWidth = r * 0.09; g.lineCap = 'round';
  [-1, 1].forEach((s) => { g.beginPath(); g.moveTo(s * r * 0.55, -r * 0.32); g.lineTo(s * r * 0.22, -r * 0.18); g.lineTo(s * r * 0.55, -r * 0.05); g.stroke(); });
  g.fillStyle = '#6b1a1a'; g.beginPath(); g.moveTo(-r * 0.58, r * 0.1); g.quadraticCurveTo(0, r * 0.12, r * 0.58, r * 0.1); g.quadraticCurveTo(r * 0.5, r * 0.78, 0, r * 0.78); g.quadraticCurveTo(-r * 0.5, r * 0.78, -r * 0.58, r * 0.1); g.fill();
  g.fillStyle = '#fff'; g.fillRect(-r * 0.5, r * 0.12, r, r * 0.13);
  g.fillStyle = '#ff7f93'; g.beginPath(); g.ellipse(0, r * 0.62, r * 0.25, r * 0.12, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#4fc3ff';
  [-1, 1].forEach((s) => { g.beginPath(); g.ellipse(s * r * 0.92, -r * 0.02, r * 0.17, r * 0.34, s * 0.5, 0, Math.PI * 2); g.fill(); });
  g.restore();
}
function drawLaptop(sc, t) {
  const { ctx: g, c } = sc; const w = c.width, h = c.height;
  if (t < 24.9) {
    g.fillStyle = '#eef3ff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1f2a44'; g.font = '800 54px Inter'; g.fillText(t < 9.3 ? "Today's Tasks" : 'All done!', 50, 90);
    const tasks = ['Reply to 47 emails', 'Update spreadsheet', 'Book flights for Mark', 'Clean up calendar', 'Send invoices', 'Prep slides for 9am'];
    tasks.forEach((s, i) => {
      const done = t > 1 + i * 1.3;
      g.strokeStyle = '#3d7bfd'; g.lineWidth = 5; g.strokeRect(60, 140 + i * 78, 42, 42);
      if (done) { g.strokeStyle = '#16a085'; g.lineWidth = 9; g.beginPath(); g.moveTo(68, 162 + i * 78); g.lineTo(80, 175 + i * 78); g.lineTo(100, 146 + i * 78); g.stroke(); }
      g.fillStyle = done ? '#9aa6c4' : '#1f2a44'; g.font = '600 40px Inter'; g.fillText(s, 130, 175 + i * 78);
    });
  } else {
    // URGENT notification takes over
    const k = easeOutBack(seg(t, 24.95, 25.25));
    g.fillStyle = '#1b1f2e'; g.fillRect(0, 0, w, h);
    const flash = Math.sin(t * 18) > 0 ? 1 : 0.75;
    g.fillStyle = `rgba(255,40,60,${0.25 * flash})`; g.fillRect(0, 0, w, h);
    g.save(); g.translate(w / 2, h / 2); g.scale(k, k);
    g.fillStyle = '#ffffff'; rrect(g, -460, -230, 920, 460, 40); g.fill();
    g.fillStyle = '#ff2d45'; rrect(g, -460, -230, 920, 130, 40); g.fill(); g.fillRect(-460, -150, 920, 50);
    g.fillStyle = '#fff'; g.font = '900 92px Inter'; g.textAlign = 'center'; g.fillText('URGENT:', 0, -130);
    g.fillStyle = '#1b1f2e'; g.font = '800 70px Inter'; g.fillText('Just one quick task', -40, 20);
    drawLaughEmoji(g, 385, -5, 48);
    g.fillStyle = '#3d7bfd'; rrect(g, -170, 90, 340, 90, 45); g.fill();
    g.fillStyle = '#fff'; g.font = '800 46px Inter'; g.fillText('Open now', 0, 152);
    g.restore(); g.textAlign = 'left';
  }
  sc.tex.needsUpdate = true;
}
function drawClock(t) {
  const g = clockCT.ctx; const s = 512, cx = 256;
  g.fillStyle = '#fffaf0'; g.fillRect(0, 0, s, s);
  g.fillStyle = '#1f2a44';
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.save(); g.translate(cx, cx); g.rotate(a); g.fillRect(-5, -230, 10, i % 3 ? 22 : 40); g.restore(); }
  // 4:59:55 → 5:00:00 ticking during 7.0–8.0
  const secs = 55 + Math.min(5, Math.floor(seg(t, 7.0, 7.85) * 5 + 1e-6) + easeOutBack(seg((t - 7.0) % 0.17 / 0.17, 0, 0.5)) * (t < 7.85 ? 1 : 0) - (t < 7.85 ? 1 : 0));
  const sec = t < 7 ? 55 + (t / 7) * 4 : Math.min(60, secs);
  const min = 59 + sec / 60, hr = 4 + min / 60;
  const hand = (a, len, wd, col) => { g.save(); g.translate(cx, cx); g.rotate(a); g.fillStyle = col; rrect(g, -wd / 2, -len, wd, len + 20, wd / 2); g.fill(); g.restore(); };
  hand(hr / 12 * Math.PI * 2, 120, 18, '#1f2a44');
  hand(min / 60 * Math.PI * 2, 180, 12, '#1f2a44');
  hand(sec / 60 * Math.PI * 2, 200, 5, '#ff4757');
  g.fillStyle = '#e8b443'; g.beginPath(); g.arc(cx, cx, 14, 0, 7); g.fill();
  clockCT.tex.needsUpdate = true;
}

// ================================================================= UI =======
const ui = document.getElementById('ui');
function el(cls, html, style = {}) { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; Object.assign(d.style, style); ui.appendChild(d); return d; }
const cap1 = el('cap', 'POV: Day 847 of<br>working from home');
const capGrass = el('cap', '*touches grass*', { background: '#e8b443', color: '#1b1b1b' });
const capEnd = el('cap', 'VA life.', { background: '#1b1b1b', color: '#e8b443' });
const BUBBLES = [
  [2.85, 'Inbox', '147 new emails', '#ff4757', 90, 560],
  [3.45, 'Boss', 'Quick call?', '#3d7bfd', 610, 470],
  [4.05, 'Client', 'Can you also...?', '#8e44ad', 560, 1230],
  [4.65, 'Mark', 'Per my last email', '#16a085', 80, 1330],
  [5.25, 'Reminder', 'Drink water!', '#f39c12', 600, 760],
  [5.85, 'Calendar', 'Meeting in 2 min!', '#ff4757', 90, 900],
].map(([t0, small, big, col, x, y]) => ({ t0, d: el('bub', `<small>${small}</small>${big}`, { background: col, left: x + 'px', top: y + 'px' }) }));
const POPS = [
  [7.85, 8.0, '5:00 PM!!', '#e8b443', 150, 520],
  [10.15, 10.55, '*crack*', '#ffffff', 96, 640],
  [25.0, 25.45, 'DING!', '#ff4757', 140, 520],
].map(([t0, t1, txt, col, fs, y]) => ({ t0, t1, d: el('pop', txt, { color: col, fontSize: fs + 'px', top: y + 'px' }) }));
const SPARK_SVG = (c) => `<svg width="90" height="90" viewBox="-50 -50 100 100"><path d="M0,-48 C6,-10 10,-6 48,0 C10,6 6,10 0,48 C-6,10 -10,6 -48,0 C-10,-6 -6,-10 0,-48Z" fill="${c}"/></svg>`;
const sparks = [[200, 640, '#fff6a8'], [860, 600, '#ffffff'], [150, 1050, '#ffffff'], [900, 1000, '#fff6a8'], [780, 420, '#ffd1e3'], [300, 400, '#ffffff']]
  .map(([x, y, c], i) => ({ i, d: el('', SPARK_SVG(c), { position: 'absolute', left: x - 45 + 'px', top: y - 45 + 'px' }) }));
const flashEl = document.getElementById('flash');

function updateUI(t) {
  const show = (d, o, s = 1, extra = '') => { d.style.opacity = o; d.style.transform = (d.className === 'cap' || d.className === 'pop' ? 'translate(-50%,0) ' : '') + `scale(${s}) ${extra}`; d.style.display = o > 0.001 ? 'block' : 'none'; };
  show(cap1, win(t, 0.25, 6.9, 0.2, 0.2), easeOutBack(seg(t, 0.25, 0.6)));
  show(capGrass, win(t, 20.3, 22.3, 0.15, 0.2), easeOutBack(seg(t, 20.3, 20.6)));
  show(capEnd, win(t, 29.35, 31, 0.15, 0.1), easeOutBack(seg(t, 29.35, 29.65)));
  BUBBLES.forEach(({ t0, d }, i) => {
    const o = t >= t0 && t < 7.0 ? 1 : 0;
    const s = easeOutBack(seg(t, t0, t0 + 0.3)), wob = Math.sin((t - t0) * 9 + i) * 2.5;
    show(d, o, s, `rotate(${wob}deg) translateY(${-Math.sin((t - t0) * 2 + i) * 8}px)`);
  });
  POPS.forEach(({ t0, t1, d }) => {
    const o = win(t, t0, t1 + 0.35, 0.05, 0.15);
    const s = easeOutBack(seg(t, t0, t0 + 0.25)) * (1 + 0.04 * Math.sin(t * 30));
    show(d, o, s, `rotate(${-4 + 2 * Math.sin(t * 20)}deg)`);
    d.style.transform = `translate(-50%,-50%) scale(${s}) rotate(${-4 + 2 * Math.sin(t * 20)}deg)`;
  });
  sparks.forEach(({ i, d }) => {
    const a = win(t, 17.45 + i * 0.05, 19.0, 0.2, 0.25) + win(t, 22.45 + i * 0.05, 23.55, 0.2, 0.2);
    const tw = 0.6 + 0.4 * Math.sin(t * 8 + i * 1.7);
    d.style.opacity = a * tw; d.style.transform = `scale(${(0.5 + 0.5 * tw) * a}) rotate(${t * 40 + i * 30}deg)`;
    d.style.display = a > 0.001 ? 'block' : 'none';
  });
  // white flash when the door opens + small one on the cut to the reverse shot
  flashEl.style.opacity = 0.45 * (1 - ease(seg(t, 13.75, 14.2))) * (t > 13.55 ? 1 : 0) * ease(seg(t, 13.55, 13.75)) + 0.5 * (1 - seg(t, 15.2, 15.55)) * (t >= 15.2 ? 1 : 0);
}

// ================================================================= POSE =====
const DEF = {
  x: 0, y: 0, z: 0, ry: 0, hipsY: HIPS0, hipsRx: 0, hipsRz: 0,
  spRx: 0, spRy: 0, spRz: 0, nkRx: 0, nkRy: 0, hdRx: 0, hdRy: 0, hdRz: 0,
  lSx: 0, lSz: 0.12, lSy: 0, lE: 0.15, rSx: 0, rSz: 0.12, rSy: 0, rE: 0.15,
  lHx: 0, lHz: 0.02, lK: 0, lA: 0, rHx: 0, rHz: 0.02, rK: 0, rA: 0,
  lid: 0.12, eyeS: 1, pupS: 1, sparkle: 0, browY: 0, browT: 0, smile: 0.35, mOpen: 0, mW: 1, blush: 0.45, bags: 0, tear: 0, sweat: 0,
  curl: 0.25, wiggle: 0, dirt: 0, lookX: 0, lookY: 0, lookW: 0, headW: 0, ahoge: 0, phones: 1, holdMug: 0, twitch: 0,
  lIkW: 0, rIkW: 0, lHoW: 0, rHoW: 0,
};
const NUM = Object.keys(DEF);
function blend(a, b, w) {
  const o = { ...a };
  for (const k of NUM) o[k] = lerp(a[k], b[k], w);
  for (const k of Object.keys(b)) if (!NUM.includes(k)) o[k] = w > 0.5 ? b[k] : (a[k] ?? b[k]);
  if (a.lIk && b.lIk) o.lIk = { a: a.lIk, b: b.lIk, w }; else o.lIk = b.lIk && (w > 0 || !a.lIk) ? (a.lIk ? o.lIk : b.lIk) : a.lIk;
  if (a.rIk && b.rIk) o.rIk = { a: a.rIk, b: b.rIk, w }; else o.rIk = b.rIk && (w > 0 || !a.rIk) ? (a.rIk ? o.rIk : b.rIk) : a.rIk;
  if (a.lHo && b.lHo) o.lHo = w > 0.5 ? b.lHo : a.lHo; else o.lHo = b.lHo || a.lHo;
  if (a.rHo && b.rHo) o.rHo = w > 0.5 ? b.rHo : a.rHo; else o.rHo = b.rHo || a.rHo;
  o.look = b.look && w > 0.5 ? b.look : (a.look || b.look);
  o.headT = b.headT && w > 0.5 ? b.headT : (a.headT || b.headT);
  return o;
}
const P = (o) => ({ ...DEF, ...o });

const SIT = { x: 0, z: -0.42, ry: Math.PI, hipsY: 0.37, lHx: 1.45, rHx: 1.45, lK: 1.45, rK: 1.45, lA: 0.15, rA: 0.15, spRx: 0.22, nkRx: 0.03 };
const KNEEL_UP = { hipsY: 0.265, lHx: 0.05, rHx: 0.05, lK: Math.PI / 2 + 0.05, rK: Math.PI / 2 + 0.05, lA: 1.25, rA: 1.25, spRx: 0.08, lHz: 0.06, rHz: 0.06 };
const KNEEL_LEAN = { hipsY: 0.235, lHx: 0.5, rHx: 0.5, lK: Math.PI / 2 + 0.5, rK: Math.PI / 2 + 0.5, lA: 1.25, rA: 1.25, spRx: 0.75, nkRx: 0.1, lHz: 0.08, rHz: 0.08 };

function walk(p, ph, amp, bounce = 0.02, armAmp = 0.6) {
  const s = Math.sin(ph), c = Math.cos(ph);
  p.lHx += amp * 0.55 * s; p.rHx -= amp * 0.55 * s;
  p.lK += amp * (0.15 + 0.75 * Math.max(0, Math.sin(ph - 1.2)));
  p.rK += amp * (0.15 + 0.75 * Math.max(0, Math.sin(ph + Math.PI - 1.2)));
  p.lA += amp * 0.25 * Math.max(0, -s); p.rA += amp * 0.25 * Math.max(0, s);
  p.lSx -= armAmp * amp * s; p.rSx += armAmp * amp * s; p.lE += 0.35 * amp; p.rE += 0.35 * amp;
  p.y += bounce * Math.abs(c) - bounce * 0.4; p.spRy += 0.08 * amp * s; p.hdRz += 0.04 * amp * s;
  p.ahoge += Math.sin(ph * 2) * 0.35 * amp;
}
// keyboard hand targets (world), with typing jitter
const kbTarget = (side, t, speed = 1) => {
  const ph = t * 22 * speed + (side > 0 ? 0 : 1.7);
  return V(-side * 0.085 + 0.015 * Math.sin(t * 5.3 + side), 0.565 + 0.016 * Math.max(0, Math.sin(ph)), -0.685 + 0.01 * Math.sin(t * 3.1 + side));
};
const DOWN = V(0, -1, 0);

function rootFwd(p) { return V(Math.sin(p.ry), 0, Math.cos(p.ry)); }
function rootSide(p) { return V(Math.cos(p.ry), 0, -Math.sin(p.ry)); } // her left
function rel(p, f, up, side) { return V(p.x, 0, p.z).add(rootFwd(p).multiplyScalar(f)).add(V(0, up, 0)).add(rootSide(p).multiplyScalar(side)); }

const clockPos = V(HX1 - 0.1, 1.45, -0.5);
const doorLook = V(HX1 + 2, 1.1, 1.2);
const bflyPath = (t) => { // main butterfly
  if (t < 23.9) return V(4.6 + Math.sin(t * 0.7) * 0.6, 1.3 + Math.sin(t * 1.3) * 0.2, 0.2 + Math.cos(t * 0.6) * 0.6);
  if (t < 25.2) {
    const u = seg(t, 23.9, 25.2);
    const a = V(4.35, 1.05, 0.55), b = V(3.97, 0.9, 1.08), c = V(3.98, 0.95, 1.36), d = V(4.4, 1.4, 2.1);
    const cur = new THREE.CatmullRomCurve3([a, b, c, d]);
    return cur.getPoint(ease(u)).add(V(0, 0.02 * Math.sin(t * 20), 0));
  }
  if (t < 28.9) return V(4.6 + Math.sin(t * 0.9) * 0.5, 1.4 + Math.sin(t * 1.7) * 0.2, 2.2 + Math.cos(t * 0.7) * 0.4);
  const u = ease(seg(t, 28.9, 29.75));
  return V(lerp(4.0, HX1 + 0.12, u), lerp(1.4, 0.86, u) + 0.12 * Math.sin(u * Math.PI), lerp(2.3, 0.53, u));
};

function poseAt(t) {
  let p;
  // ===== Scene 1-2: sitting at desk ================================================
  if (t < 9.9) {
    p = P({ ...SIT, lid: 0.42, bags: 0.85, smile: -0.12, browT: 0.18, blush: 0.25, lIkW: 1, rIkW: 1, lHoW: 1, rHoW: 1,
      lIk: kbTarget(1, t), rIk: kbTarget(-1, t), lHo: ['fwd', V(0, 0, -1)], rHo: ['fwd', V(0, 0, -1)], curl: 0.5, wiggle: 1 });
    // darting eyes between screens
    const looks = [V(0, 0.72, -1.1), V(-0.62, 0.7, -1.0), V(0.0, 0.62, -1.1), V(0.62, 0.7, -1.0), V(0.1, 0.78, -1.1)];
    p.look = looks[Math.floor(t * 2.3) % looks.length]; p.lookW = 1;
    p.hdRy = 0.05 * Math.sin(t * 1.7); p.hdRx = 0.03 * Math.sin(t * 2.9);
    p.ahoge = 0.12 * Math.sin(t * 9);
    // coffee sip (right hand) 4.4–5.6
    const sip = win(t, 4.35, 5.65, 0.35, 0.35);
    if (sip > 0) {
      const toMouth = win(t, 4.7, 5.35, 0.25, 0.25);
      p.rIk = { a: kbTarget(-1, t), b: { a: 'mugGrip', b: 'mouth', w: toMouth }, w: sip };
      p.rHo = ['mug']; p.holdMug = win(t, 4.62, 5.4, 0.08, 0.08);
      p.lid = lerp(0.42, 0.55, toMouth); p.hdRx -= 0.12 * toMouth; p.smile = lerp(-0.12, 0.15, toMouth);
    }
    // eye twitch
    p.twitch = t > 6.15 && t < 6.75 ? 1 : 0;
    if (t > 6.15 && t < 6.75) p.browT = 0.35;
    // 8.0+: it's 5 PM
    const done = ease(seg(t, 8.0, 8.25));
    if (done > 0) {
      const hands = 1 - ease(seg(t, 8.0, 8.2));
      p.lIkW = hands; p.rIkW = hands; p.lHoW = hands; p.rHoW = hands;
      p.lSx = 0.5; p.rSx = 0.5; p.lE = 0.9; p.rE = 0.9;
      p.headT = clockPos; p.headW = done * (1 - ease(seg(t, 8.45, 8.65)));
      p.look = clockPos;
      p.lid = lerp(0.42, 0, done); p.eyeS = 1 + 0.25 * done; p.sparkle = done; p.smile = lerp(-0.12, 1, done); p.mOpen = 0.45 * done;
      p.browY = 0.02 * done; p.browT = lerp(0.18, -0.05, done); p.blush = lerp(0.25, 0.8, done);
      p.ahoge = Math.sin(t * 25) * 0.4 * (1 - seg(t, 8.0, 8.8));
    }
    // 8.5–9.4 take off headset
    const off = win(t, 8.5, 9.5, 0.2, 0.18);
    if (off > 0) {
      p.lIkW = off; p.rIkW = off; p.lIk = 'cupL'; p.rIk = 'cupR'; p.lHoW = off * 0.8; p.rHoW = off * 0.8; p.lHo = ['cup']; p.rHo = ['cup'];
      p.look = null; p.lookW = 0; p.lookX = 0; p.lookY = 0.3;
      p.phones = t < 8.82 ? 1 : 1 + ease(seg(t, 8.82, 9.0)) * 0.6 + ease(seg(t, 9.0, 9.3)) * 0.4; // 1 on head → 1.6 lifted → 2.0 on desk
      p.hdRx = -0.05;
    } else if (t >= 9.5) p.phones = 2;
    // 9.45–9.9 stand up (handled below via blend)
    if (t > 9.45) {
      const st = ease(seg(t, 9.45, 9.9));
      const stand = P({ x: 0, z: -0.3, ry: Math.PI, smile: 0.8, mOpen: 0.3, eyeS: 1.15, sparkle: 0.6, bags: 0.85, blush: 0.6, phones: 2 });
      p = blend(p, stand, st);
      p.lIkW *= 1 - st; p.rIkW *= 1 - st;
    }
  }
  // ===== stretch + walk to door ======================================================
  else if (t < 13.0) {
    p = P({ x: 0, z: -0.3, ry: Math.PI, phones: 2, bags: lerp(0.85, 0.2, seg(t, 10.6, 11.0)), blush: 0.7 });
    // stretch 9.9–10.65
    const str = win(t, 9.9, 10.75, 0.35, 0.22);
    p.lSz = lerp(0.12, 2.75, str); p.rSz = lerp(0.12, 2.75, str); p.lSx = 0.25 * str; p.rSx = 0.25 * str; p.lE = lerp(0.15, 0.05, str); p.rE = p.lE;
    p.spRx = -0.22 * str + 0.05 * Math.sin(t * 9) * str; p.spRz = 0.12 * Math.sin((t - 9.9) * 5) * str; p.nkRx = -0.18 * str;
    p.y = 0.025 * str; p.lA = -0.35 * str; p.rA = -0.35 * str;
    p.lid = lerp(0.1, 0.88, str); p.mOpen = 1.0 * str; p.mW = lerp(1, 0.8, str); p.smile = lerp(0.6, 0, str); p.browY = 0.02 * str;
    p.ahoge = 0.3 * Math.sin(t * 14) * str;
    // excited turn + hop 10.65–10.95
    const ex = ease(seg(t, 10.62, 10.85));
    if (ex > 0) {
      p.eyeS = 1 + 0.3 * ex; p.sparkle = ex; p.smile = lerp(p.smile, 1, ex); p.mOpen = lerp(p.mOpen, 0.55, ex); p.lid = lerp(p.lid, 0, ex);
      p.headT = doorLook; p.headW = 0.6 * ex; p.look = doorLook; p.lookW = ex;
      p.y += 0.07 * Math.sin(seg(t, 10.7, 10.95) * Math.PI); p.ry = lerp(Math.PI, 0.96, ease(seg(t, 10.75, 11.1)));
      p.lSz = lerp(p.lSz, 0.5, ex); p.rSz = lerp(p.rSz, 0.5, ex); p.lE = lerp(p.lE, 1.4, ex); p.rE = lerp(p.rE, 1.4, ex); p.lSx += 0.6 * ex; p.rSx += 0.6 * ex;
    }
    // walk 10.95–12.65
    if (t > 10.95) {
      const u = seg(t, 10.95, 12.65), dist = ease(u);
      p.x = lerp(0, 1.97, dist); p.z = lerp(-0.3, 1.0, dist); p.ry = 0.96;
      const ph = (t - 10.95) * Math.PI * 2 * 2.6;
      const amp = Math.min(1, u * 6) * Math.min(1, (1 - u) * 5);
      p.lSz = 0.35; p.rSz = 0.35; p.lE = 0.6; p.rE = 0.6; p.lSx = 0.2; p.rSx = 0.2;
      walk(p, ph, 0.9 * amp, 0.05, 0.9);
      p.headT = null; p.headW = 0; p.look = doorLook; p.lookW = 1;
      p.smile = 1; p.mOpen = 0.45; p.eyeS = 1.25; p.sparkle = 1; p.lid = 0; p.blush = 0.85;
      p.hdRz += 0.08 * Math.sin(ph); p.ahoge += 0.2 * Math.sin(ph * 2);
    }
    // arrive, turn to door, reach for knob
    if (t > 12.6) {
      const a = ease(seg(t, 12.6, 12.9));
      p.ry = lerp(0.96, Math.PI / 2, a);
      p.lIkW = ease(seg(t, 12.7, 12.98)); p.lIk = 'knobIn'; p.lHoW = p.lIkW; p.lHo = ['knob'];
      p.look = knobIn.getWorldPosition(V()); p.lookW = 1;
    }
  }
  // ===== Scene 3: door, sunlight, stepping outside ===================================
  else if (t < 17.3) {
    p = P({ x: 1.97, z: 1.0, ry: Math.PI / 2, phones: 2, smile: 1, mOpen: 0.4, eyeS: 1.25, sparkle: 0.8, blush: 0.8 });
    const pull = ease(seg(t, 13.2, 14.0));
    p.x = lerp(1.97, 1.8, pull);
    p.lIkW = 1 - ease(seg(t, 13.85, 14.15)); p.lIk = 'knobIn'; p.lHoW = p.lIkW; p.lHo = ['knob'];
    p.spRx = -0.08 * pull;
    // light hits: squint + shield
    const sh = win(t, 13.55, 14.75, 0.2, 0.3);
    p.rIkW = sh; p.rIk = 'shield'; p.rHoW = sh; p.rHo = ['shield'];
    p.lid = lerp(0.05, 0.78, win(t, 13.55, 14.8, 0.12, 0.35)); p.smile = lerp(1, 0.1, sh); p.mOpen = lerp(0.4, 0.25, sh); p.browY = -0.01 * sh;
    p.sparkle = lerp(0.8, 0, sh); p.eyeS = lerp(1.25, 1.0, sh); p.nkRx = -0.08 * sh; p.spRx -= 0.06 * sh;
    // eyes adjust, wonder grows; toe-test step
    if (t > 14.6) {
      const w = ease(seg(t, 14.6, 15.1));
      p.eyeS = lerp(p.eyeS, 1.3, w); p.mOpen = lerp(p.mOpen, 0.5, w); p.sparkle = w; p.smile = lerp(p.smile, 0.25, w);
      p.look = doorLook; p.lookW = 1;
      const st = ease(seg(t, 14.65, 14.95)); p.x = lerp(1.8, 2.05, st);
      walk(p, (t - 14.65) * Math.PI * 2 * 1.7 * (t < 14.95 ? 1 : 0), 0.5 * win(t, 14.65, 14.95, 0.1, 0.1), 0.02, 0.3);
      // toe test 14.95–15.2: right foot pokes forward, tap tap
      const toe = win(t, 14.95, 15.25, 0.06, 0.06);
      p.rHx += 0.55 * toe; p.rK += (0.25 + 0.2 * Math.abs(Math.sin((t - 14.95) * 22))) * toe; p.rA -= 0.4 * toe;
      p.spRx -= 0.1 * toe; p.lSz += 0.5 * toe; p.rSz += 0.5 * toe; p.lE += 0.4 * toe; p.rE += 0.4 * toe;
    }
    // walk out into the world (15.2–17.3)
    if (t > 15.2) {
      const u = seg(t, 15.2, 17.2), d = ease(u);
      p.x = lerp(2.05, 3.6, d); p.z = lerp(1.0, 1.2, d);
      const ph = (t - 15.2) * Math.PI * 2 * 1.35;
      walk(p, ph, 0.75 * Math.min(1, u * 5) * Math.min(1, (1 - u) * 5), 0.03, 0.4);
      p.lSz = 0.35; p.rSz = 0.35; p.lE = 0.5; p.rE = 0.5;
      const looks = [V(8, 3.5, -3), V(9, 1.2, 4), V(8, 5, 2), V(10, 1, 1.2)];
      const k = Math.min(3, Math.floor(seg(t, 15.4, 17.3) * 4));
      p.headT = looks[k]; p.headW = 0.9; p.look = looks[k]; p.lookW = 1;
      p.eyeS = 1.35; p.sparkle = 1; p.mOpen = 0.6; p.smile = 0.2; p.lid = 0; p.blush = 0.8; p.browY = 0.02;
      p.ahoge += 0.3 * Math.sin(t * 6);
    }
  }
  // ===== amazement close-up ==========================================================
  else if (t < 19.25) {
    p = P({ x: 3.6, z: 1.2, ry: Math.PI / 2, phones: 2, blush: 0.9, lid: 0, look: V(9, 1.6, 1.2), lookW: 1 });
    const big = easeOutBack(seg(t, 17.35, 17.75));
    p.eyeS = lerp(1.3, 1.62, big); p.sparkle = 1; p.mOpen = lerp(0.6, 0.85, big); p.mW = 0.8; p.smile = 0.1; p.browY = 0.035 * big;
    p.pupS = 1 + 0.25 * big; p.ahoge = Math.sin((t - 17.35) * 18) * 0.6 * Math.exp(-(t - 17.35) * 2.5);
    p.y = 0.04 * Math.sin(seg(t, 17.4, 17.65) * Math.PI);
    p.lookX = 0.15 * Math.sin(t * 2.5);
    p.look = V(9, 1.6 + 0.6 * Math.sin(t * 1.3), 1.2 + 2 * Math.sin(t * 0.9));
    // hands to cheeks 18.15–19.15
    const ch = win(t, 18.1, 19.2, 0.25, 0.2);
    p.lIkW = ch; p.rIkW = ch; p.lIk = 'cheekL'; p.rIk = 'cheekR'; p.lHoW = ch; p.rHoW = ch; p.lHo = ['cheek']; p.rHo = ['cheek'];
    p.smile = lerp(p.smile, 0.9, ch); p.mOpen = lerp(p.mOpen, 0.55, ch); p.hdRz = 0.12 * Math.sin((t - 18.1) * 7) * ch; p.blush = 0.9 + 0.1 * ch;
    p.spRz = 0.05 * Math.sin((t - 18.1) * 7) * ch; p.lHz = 0.02; p.rHz = 0.02;
    p.lid = 0.6 * win(t, 18.35, 19.1, 0.15, 0.2);
  }
  // ===== Scene 4: kneel & touch grass =================================================
  else if (t < 25.0) {
    const base = P({ x: 3.6, z: 1.2, ry: Math.PI / 2, phones: 2, blush: 0.9, lid: 0, eyeS: 1.4, sparkle: 1, mOpen: 0.5, smile: 0.3 });
    const handsG = (side, t2, pat = 0) => {
      const p0 = rel(base, 0.42 + 0.015 * Math.sin(t2 * 3 + side), 0.06 + pat, side * 0.095);
      return p0;
    };
    const kneelUp = blend(base, P({ ...base, ...KNEEL_UP }), ease(seg(t, 19.25, 20.05)));
    p = kneelUp;
    // lean & touch 20.0–22.45
    const lean = win(t, 19.95, 22.55, 0.55, 0.35);
    if (lean > 0) {
      p = blend(p, P({ ...base, ...KNEEL_LEAN }), lean);
      const gp = ease(seg(t, 20.1, 20.6));
      p.lIkW = gp * lean; p.rIkW = gp * lean;
      const press = 0.025 * Math.max(0, Math.sin((t - 20.6) * 5)) * (t > 20.6 ? 1 : 0);
      p.lIk = handsG(1, t, -press); p.rIk = handsG(-1, t + 0.7, -press);
      p.lHoW = gp * lean; p.rHoW = gp * lean; p.lHo = ['ground']; p.rHo = ['ground'];
      p.wiggle = t > 20.55 ? 1 : 0; p.curl = 0.35 + 0.35 * Math.max(0, Math.sin((t - 20.6) * 3.2));
      p.look = rel(base, 0.42, 0.05, 0); p.lookW = 1;
      p.eyeS = 1.45; p.mOpen = 0.55 + 0.1 * Math.sin(t * 6); p.smile = 0.2; p.browY = 0.03;
      p.dirt = ease(seg(t, 20.8, 22.0));
      p.ahoge = 0.25 * Math.sin(t * 7);
    }
    // sit up & look at hands in disbelief 22.45–23.65
    const lookH = win(t, 22.4, 23.75, 0.35, 0.25);
    if (lookH > 0) {
      p.lIkW = lookH; p.rIkW = lookH; p.lHoW = lookH; p.rHoW = lookH; p.lHo = ['face']; p.rHo = ['face'];
      p.lIk = rel(base, 0.3, 0.52, 0.1); p.rIk = rel(base, 0.3, 0.52, -0.1);
      p.dirt = 1; p.curl = 0.25; p.wiggle = 0.5;
      const k = ease(seg(t, 22.45, 22.8));
      p.look = rel(base, 0.32, 0.5, 0); p.lookW = 1; p.nkRx = 0.3;
      p.eyeS = lerp(1.45, 1.7, k); p.pupS = 1.2; p.sparkle = 1; p.mOpen = 0.45 + 0.06 * Math.sin(t * 38); p.mW = 0.75; p.smile = 0.05;
      p.browY = 0.038 * k; p.browT = 0.25 * k; p.tear = ease(seg(t, 22.9, 23.6)); p.blush = 1;
      p.hdRy = 0.12 * Math.sin((t - 22.85) * 11) * win(t, 22.85, 23.3, 0.05, 0.1);
      p.nkRx = 0.15;
    }
    // touch again gently 23.65–24.3
    const again = win(t, 23.6, 24.45, 0.3, 0.25);
    if (again > 0) {
      p = blend(p, P({ ...base, ...KNEEL_LEAN, spRx: 0.62 }), again);
      const pat = 0.03 * Math.max(0, Math.sin((t - 23.85) * 16)) * (t > 23.85 ? 1 : 0);
      p.lIkW = again; p.rIkW = again; p.lHoW = again; p.rHoW = again; p.lHo = ['ground']; p.rHo = ['ground'];
      p.lIk = handsG(1, t, pat); p.rIk = handsG(-1, t, pat);
      p.look = rel(base, 0.42, 0.05, 0); p.lookW = 1; p.eyeS = 1.35; p.mOpen = 0.15; p.smile = 0.85; p.lid = 0.25; p.dirt = 1; p.tear = 1;
      p.blush = 1;
    }
    // butterfly passes 24.2–25.0
    if (t > 24.2) {
      const b = ease(seg(t, 24.2, 24.45));
      p.look = bflyPath(t); p.lookW = 1; p.headT = bflyPath(t); p.headW = 0.45 * b;
      p.eyeS = 1.35; p.mOpen = lerp(0.15, 0.3, b); p.smile = 1; p.sparkle = 1; p.lid = 0; p.dirt = 1; p.tear = 1;
      p.lSx = 0.35; p.rSx = 0.35; p.lE = 0.6; p.rE = 0.6; p.lSz = 0.25; p.rSz = 0.25;
      p.ahoge = 0.3 * Math.sin(t * 9);
    }
    if (t > 24.95) p.lIkW = p.rIkW = 0;
  }
  // ===== Scene 5: the notification ====================================================
  else {
    const base = P({ x: 3.6, z: 1.2, ry: Math.PI / 2, phones: 2, ...KNEEL_UP, dirt: 1, tear: 1, blush: 0.9, lSx: 0.35, rSx: 0.35, lE: 0.6, rE: 0.6, lSz: 0.25, rSz: 0.25 });
    p = { ...base };
    if (t < 26.6) {
      // freeze, then snap head to the house
      p.smile = 1; p.mOpen = 0.3; p.eyeS = lerp(1.35, 0.8, ease(seg(t, 25.0, 25.1))); p.pupS = 0.55; p.sparkle = 0; p.lid = 0;
      p.look = bflyPath(24.99); p.lookW = 1;
      const snap = ease(seg(t, 25.12, 25.3));
      p.spRy = 0.75 * snap; p.nkRy = 0.55 * snap; p.hdRy = 0.45 * snap; p.hdRz = -0.1 * snap;
      p.lookX = 1 * snap; p.lookW = 1 - snap; p.lookY = 0.1;
      p.sweat = ease(seg(t, 25.15, 25.4)); p.browT = 0.2 * snap; p.ahoge = 0.6 * Math.exp(-(t - 25.0) * 6) * Math.sin(t * 40);
      p.y = 0.03 * Math.sin(seg(t, 25.0, 25.12) * Math.PI);
    } else if (t < 28.0) {
      // happiness drains; sad goodbye pat
      const d = ease(seg(t, 26.65, 27.25));
      p.smile = lerp(0.6, -0.85, d); p.mOpen = 0; p.mW = lerp(1, 0.75, d); p.eyeS = lerp(1.1, 0.95, d); p.pupS = 1; p.sparkle = 0;
      p.lid = lerp(0.1, 0.48, d); p.browT = lerp(0.1, 0.55, d); p.browY = 0.01 * d; p.bags = 0.85 * d; p.sweat = 1 - d;
      p.nkRx = lerp(0.05, 0.35, d); p.spRx = lerp(0.08, 0.25, d);
      p.look = rel(base, 0.45, 0.02, -0.05); p.lookW = 1;
      p.tear = 1; p.mOpen = 0.04 * Math.max(0, Math.sin(t * 30)) * d;
      const pat = win(t, 27.15, 27.95, 0.2, 0.2);
      p.rIkW = pat; p.rHoW = pat; p.rHo = ['ground'];
      p.rIk = rel(base, 0.42, 0.075 + 0.035 * Math.max(0, Math.sin((t - 27.25) * 9)), -0.1);
      p.spRx += 0.25 * pat; p.lHx += 0.15 * pat; p.rHx += 0.15 * pat;
      // sigh
      p.spRx -= 0.06 * Math.sin(seg(t, 27.0, 27.5) * Math.PI); p.lSz += 0.05 * Math.sin(seg(t, 27.0, 27.5) * Math.PI);
    } else {
      // stand up fast, turn, sprint inside
      const up = ease(seg(t, 28.0, 28.3));
      p = blend(p, P({ x: 3.6, z: 1.2, ry: Math.PI / 2, phones: 2, dirt: 1, tear: 1 }), up);
      p.smile = -0.7; p.browT = 0.5; p.lid = 0.15; p.eyeS = 1.05; p.mOpen = 0.35; p.mW = 0.8; p.sweat = 1; p.bags = 0.85;
      p.ry = lerp(Math.PI / 2, 3 * Math.PI / 2, ease(seg(t, 28.3, 28.5)));
      if (t > 28.45) {
        const u = seg(t, 28.45, 29.2);
        p.x = lerp(3.6, 1.2, easeIn(u * 0.6) * 0.4 / 0.216 * 0 + (u < 0.15 ? u * u / 0.3 : u - 0.075) / 0.925);
        p.z = lerp(1.2, 1.2, u);
        const ph = (t - 28.45) * Math.PI * 2 * 4.2;
        walk(p, ph, 1.35, 0.06, 1.2); p.spRx = 0.35; p.lE = 1.5; p.rE = 1.5; p.lSz = 0.2; p.rSz = 0.2;
        p.ahoge = -0.6;
      }
      if (t > 29.2) { p.x = -1.0; p.y = -3; } // inside, out of view
    }
  }
  return p;
}

// ---------------------------------------------------------------- apply pose
const _v = V(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4();
function anchorPos(name, p) {
  if (name instanceof THREE.Vector3) return name.clone();
  if (name && name.a !== undefined) { const a = anchorPos(name.a, p), b = anchorPos(name.b, p); return a.lerp(b, name.w); }
  switch (name) {
    case 'mouth': return girl.A.mouth.getWorldPosition(V()).add(V(0.03, -0.05, 0.0));
    case 'cupL': return girl.A.cupL.getWorldPosition(V());
    case 'cupR': return girl.A.cupR.getWorldPosition(V());
    case 'cheekL': return girl.A.cheekL.getWorldPosition(V());
    case 'cheekR': return girl.A.cheekR.getWorldPosition(V());
    case 'shield': return girl.A.forehead.getWorldPosition(V()).add(V(0.02, 0.06, 0));
    case 'knobIn': return knobIn.getWorldPosition(V()).add(V(-0.02, -0.03, 0));
    case 'mugGrip': return mugRest.clone().add(V(0.0, 0.07, 0.05));
  }
  return V();
}
function solveIK(arm, target, pole) {
  const sh = arm.sh, parent = sh.parent;
  parent.updateMatrixWorld(true);
  const inv = _m.copy(parent.matrixWorld).invert();
  const T = target.clone().applyMatrix4(inv);
  const S = sh.position.clone();
  const D = T.clone().sub(S); let d = D.length(); const dir = D.normalize();
  d = clamp(d, Math.abs(L1 - L2) + 0.01, (L1 + L2) * 0.999);
  const A = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  let perp = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir)));
  if (perp.lengthSq() < 1e-8) perp = V(0, 0, -1); perp.normalize();
  const u = dir.clone().multiplyScalar(Math.cos(A)).add(perp.clone().multiplyScalar(Math.sin(A))).normalize();
  const Tc = S.clone().add(dir.clone().multiplyScalar(d));
  const E = S.clone().add(u.clone().multiplyScalar(L1));
  const f = Tc.sub(E).normalize();
  const yAx = u.clone().negate();
  let m = f.clone().sub(u.clone().multiplyScalar(f.dot(u)));
  if (m.lengthSq() < 1e-8) m = perp.clone().negate(); m.normalize();
  const zAx = m.clone().negate();
  const xAx = new THREE.Vector3().crossVectors(yAx, zAx);
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAx, yAx, zAx));
  return { q, bend: Math.acos(clamp(u.dot(f), -1, 1)) };
}
function handBasis(arm, mode, p) {
  // returns world quaternion for wrist given finger direction & palm normal (world)
  const s = arm.s; let fd, pn;
  const fwd = rootFwd(p), side = rootSide(p);
  switch (mode[0]) {
    case 'fwd': fd = mode[1].clone().add(V(0, -0.5, 0)).normalize(); pn = V(0, -1, 0); break;
    case 'ground': fd = fwd.clone().add(V(0, -0.25, 0)).add(side.clone().multiplyScalar(s * 0.25)).normalize(); pn = V(0, -1, 0); break;
    case 'face': fd = fwd.clone().multiplyScalar(0.5).add(V(0, 1, 0)).add(side.clone().multiplyScalar(s * 0.3)).normalize(); pn = fwd.clone().multiplyScalar(-1).add(V(0, -0.2, 0)).normalize(); break;
    case 'cheek': fd = V(0, 1, 0).add(fwd.clone().multiplyScalar(0.25)).normalize(); pn = side.clone().multiplyScalar(-s); break;
    case 'cup': fd = V(0, 1, 0); pn = side.clone().multiplyScalar(-s); break;
    case 'shield': fd = side.clone().multiplyScalar(-s).add(V(0, 0.2, 0)).normalize(); pn = fwd.clone().multiplyScalar(-1).add(V(0, -0.6, 0)).normalize(); break;
    case 'knob': fd = fwd.clone().add(V(0, -0.2, 0)).normalize(); pn = side.clone().multiplyScalar(-s); break;
    case 'mug': fd = fwd.clone().add(V(0, 0.4, 0)).normalize(); pn = side.clone().multiplyScalar(-s); break;
    default: return null;
  }
  const y = fd.clone().negate();
  let x = pn.clone().multiplyScalar(-s); x.sub(y.clone().multiplyScalar(x.dot(y))).normalize();
  const z = new THREE.Vector3().crossVectors(x, y);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}
let mouthKey = '';
function setMouthLine(w, c) {
  const key = w.toFixed(3) + c.toFixed(3); if (key === mouthKey) return; mouthKey = key;
  const curve = new THREE.QuadraticBezierCurve3(V(-w, 0.004 * c, 0), V(0, -c * 0.05, 0.006), V(w, 0.004 * c, 0));
  girl.mouthLine.geometry.dispose();
  girl.mouthLine.geometry = new THREE.TubeGeometry(curve, 16, 0.0085, 6);
}
function applyPose(p, t) {
  const g = girl;
  g.root.position.set(p.x, p.y, p.z); g.root.rotation.set(0, p.ry, 0);
  g.hips.position.y = p.hipsY; g.hips.rotation.set(p.hipsRx, 0, p.hipsRz);
  g.spine.rotation.set(p.spRx, p.spRy, p.spRz);
  g.neck.rotation.set(p.nkRx, p.nkRy, 0);
  g.headP.rotation.set(p.hdRx, p.hdRy, p.hdRz, 'YXZ');
  g.arms.forEach((a) => {
    const L = a.s > 0;
    a.sh.rotation.set(-(L ? p.lSx : p.rSx), (L ? p.lSy : p.rSy) * a.s, a.s * (L ? p.lSz : p.rSz));
    a.el.rotation.set(-(L ? p.lE : p.rE), 0, 0);
    a.wr.rotation.set(0.15, 0, 0);
    a.fingers.forEach((f, i) => { f.rotation.x = p.curl * 0.9 + p.wiggle * 0.35 * Math.sin(t * 14 + i * 1.3 + a.s); });
    a.dirt.forEach((d, i) => { d.visible = p.dirt > i / 9; });
  });
  g.legs.forEach((l) => {
    const L = l.s > 0;
    l.hp.rotation.set(-(L ? p.lHx : p.rHx), 0, l.s * (L ? p.lHz : p.rHz));
    l.kn.rotation.set(L ? p.lK : p.rK, 0, 0);
    l.an.rotation.set(L ? p.lA : p.rA, 0, 0);
  });
  g.root.updateMatrixWorld(true);
  // head tracking toward a world target
  if (p.headT && p.headW > 0) {
    const local = g.neck.worldToLocal(p.headT.clone());
    local.y -= 0.25;
    const yaw = clamp(Math.atan2(local.x, local.z), -1.2, 1.2), pitch = clamp(-Math.atan2(local.y, Math.hypot(local.x, local.z)), -0.6, 0.5);
    g.headP.rotation.y = lerp(g.headP.rotation.y, yaw * 0.85, p.headW);
    g.headP.rotation.x = lerp(g.headP.rotation.x, pitch * 0.8, p.headW);
    g.root.updateMatrixWorld(true);
  }
  // headset
  const ph = g.phones;
  if (p.phones <= 1.6) {
    if (ph.parent !== g.head) g.head.add(ph);
    ph.position.set(0, (p.phones - 1) * 0.25, 0); ph.rotation.set(0, 0, 0);
  } else {
    const u = clamp((p.phones - 1.6) / 0.4);
    // world pose lerp from lifted-on-head to desk
    if (ph.parent !== g.head) g.head.add(ph);
    ph.position.set(0, 0.15, 0); ph.rotation.set(0, 0, 0); g.head.updateMatrixWorld(true);
    const wp = ph.getWorldPosition(V()), wq = ph.getWorldQuaternion(new THREE.Quaternion());
    scene.add(ph);
    ph.position.copy(wp.lerp(phonesDesk.pos, ease(u)).add(V(0, 0.08 * Math.sin(u * Math.PI), 0)));
    ph.quaternion.copy(wq.slerp(new THREE.Quaternion().setFromEuler(phonesDesk.rot), ease(u)));
  }
  ph.updateMatrixWorld(true);
  // IK
  const poleFor = (s, mode) => mode === 'ground' ? V(s * 0.9, 0.3, -0.4) : mode === 'face' ? V(s * 0.6, -1, -0.2) : V(s * 0.8, -0.5, -0.5);
  g.arms.forEach((a) => {
    const L = a.s > 0; const w = L ? p.lIkW : p.rIkW; const spec = L ? p.lIk : p.rIk;
    if (w > 0.001 && spec) {
      const tgt = anchorPos(spec, p);
      const mode = (L ? p.lHo : p.rHo) || [''];
      const r = solveIK(a, tgt, poleFor(a.s, mode[0]));
      a.sh.quaternion.slerp(r.q, w);
      const eq = new THREE.Quaternion().setFromEuler(new THREE.Euler(r.bend, 0, 0));
      a.el.quaternion.slerp(eq, w);
    }
  });
  g.root.updateMatrixWorld(true);
  g.arms.forEach((a) => {
    const L = a.s > 0; const w = L ? p.lHoW : p.rHoW; const mode = L ? p.lHo : p.rHo;
    if (w > 0.001 && mode) {
      const wq = handBasis(a, mode, p); if (!wq) return;
      const pq = a.wr.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
      a.wr.quaternion.slerp(pq.multiply(wq), w);
    }
  });
  g.root.updateMatrixWorld(true);
  // mug in hand
  if (p.holdMug > 0) {
    const a = g.arms[0]; // right hand (s=-1)
    const hp = a.wr.localToWorld(V(-0.035, -0.05, 0.0));
    curMug.position.copy(mugRest).lerp(hp.add(V(0, -0.05, 0)), p.holdMug);
    curMug.rotation.set(0, 0, -0.5 * Math.sin(seg(t, 4.75, 5.3) * Math.PI) * p.holdMug);
  } else { curMug.position.copy(mugRest); curMug.rotation.set(0, 0, 0); }
  // ---- face
  g.eyes.forEach((e) => {
    e.inner.scale.setScalar(p.eyeS);
    let lid = p.lid;
    if (p.twitch && e.s > 0) lid = 0.25 + 0.5 * Math.abs(Math.sin(t * 38));
    // blinks
    const blinkTimes = [1.9, 4.1, 6.8, 11.6, 16.4, 21.4, 26.0];
    for (const bt of blinkTimes) { const k = 1 - Math.abs(t - bt) / 0.09; if (k > 0) lid = Math.max(lid, lerp(lid, 0.98, k)); }
    e.lidG.rotation.x = -Math.PI / 2 + clamp(lid, 0, 1) * Math.PI * 0.98;
    let lx = p.lookX, ly = p.lookY;
    if (p.look && p.lookW > 0) {
      const loc = e.eg.worldToLocal(p.look.clone()).normalize();
      lx = lerp(lx, loc.x * 2.2, p.lookW); ly = lerp(ly, loc.y * 2.2, p.lookW);
    }
    const len = Math.hypot(lx, ly); if (len > 1) { lx /= len; ly /= len; }
    e.irisG.position.set(lx * 0.019, ly * 0.022, 0);
    e.irisG.children[1].scale.set(p.pupS, p.pupS * 1.1, 0.3);
    e.star.visible = e.star2.visible = p.sparkle > 0.05;
    const sp = p.sparkle * (0.85 + 0.15 * Math.sin(t * 12 + e.s));
    e.star.scale.setScalar(sp * 1.1); e.star2.scale.setScalar(sp * 0.6); e.star.rotation.z = t * 2; e.star2.rotation.z = -t * 3;
    e.h1.visible = p.sparkle < 0.6;
    e.bag.material.opacity = 0.55 * p.bags;
    e.tear.visible = p.tear > 0.01;
    const tt = (t * 0.6 + (e.s > 0 ? 0.3 : 0)) % 1;
    e.tear.position.set(e.s * 0.045, -0.06 - tt * 0.07 * p.tear, 0.02);
    e.tear.scale.set(p.tear, 1.4 * p.tear, 0.7 * p.tear);
  });
  g.brows.forEach((b) => {
    b.b.position.copy(b.base).add(V(0, p.browY + 0.012 * (p.eyeS - 1), 0));
    b.b.rotation.z = -b.s * p.browT * 0.6 + (p.twitch && b.s > 0 ? 0.1 * Math.sin(t * 40) : 0);
  });
  g.cheeks.forEach((c) => { c.material.opacity = 0.55 * p.blush; });
  // mouth
  const open = clamp(p.mOpen);
  g.mouthLine.visible = open < 0.08;
  g.mouthOpen.visible = open >= 0.08;
  if (open < 0.08) setMouthLine(0.034 * p.mW + 0.012 * Math.abs(p.smile), p.smile * 0.6);
  else {
    const happy = p.smile > 0.45;
    g.mouthHole.visible = !happy; g.mouthHalf.visible = happy;
    const mw = (0.55 + 0.35 * p.mW) * (happy ? 1.15 : 0.85);
    g.mouthOpen.scale.set(mw, happy ? 0.35 + open * 1.0 : 0.25 + open * 0.95, 0.2);
    g.mouthOpen.position.y = happy ? 0.012 : 0;
    g.tongue.position.y = happy ? -0.028 : -0.022; g.teeth.visible = happy;
  }
  g.sweat.visible = p.sweat > 0.01; g.sweat.scale.set(p.sweat, 1.5 * p.sweat, 0.6 * p.sweat);
  g.ahoge.rotation.set(0.2 * p.ahoge, 0, p.ahoge);
}

// ================================================================= CAMERA ===
const SHOTS = [
  { t0: 0.0, t1: 2.6, a: [[0.95, 1.5, 0.95], [-0.1, 0.7, -1.0], 46], b: [[0.8, 1.42, 0.7], [-0.1, 0.7, -1.0], 44] },
  { t0: 2.6, t1: 7.0, a: [[0.0, 1.42, -2.05], [0, 0.82, -0.47], 44], b: [[0.0, 1.36, -1.8], [0, 0.84, -0.47], 40], interior: true },
  { t0: 7.0, t1: 8.0, a: [[1.25, 1.45, -0.5], [2.4, 1.45, -0.5], 40], b: [[1.6, 1.45, -0.5], [2.4, 1.45, -0.5], 40], shake: [7.85, 0.012] },
  { t0: 8.0, t1: 10.9, a: [[1.45, 1.22, -1.45], [0.0, 0.82, -0.4], 46], b: [[1.4, 1.2, -1.35], [0.0, 0.88, -0.35], 48] },
  { t0: 10.9, t1: 13.0, track: true },
  { t0: 13.0, t1: 15.2, a: [[5.0, 0.92, 1.35], [2.2, 0.86, 1.12], 40], b: [[4.5, 0.92, 1.28], [2.2, 0.86, 1.12], 38] },
  { t0: 15.2, t1: 16.3, a: [[2.35, 0.95, 1.35], [8, 1.7, -0.5], 56], b: [[3.15, 1.0, 1.4], [8, 1.35, 3.0], 56] },
  { t0: 16.3, t1: 17.3, side: true },
  { t0: 17.3, t1: 19.25, a: [[5.05, 0.92, 1.35], [3.6, 0.86, 1.2], 40], b: [[4.85, 0.93, 1.32], [3.6, 0.88, 1.2], 38] },
  { t0: 19.25, t1: 21.0, a: [[5.1, 0.95, 2.6], [3.72, 0.6, 1.2], 44], b: [[5.0, 0.85, 2.45], [3.8, 0.42, 1.2], 42] },
  { t0: 21.0, t1: 22.45, a: [[4.55, 0.42, 1.95], [3.98, 0.1, 1.2], 42], b: [[4.48, 0.38, 1.88], [3.98, 0.1, 1.2], 40] },
  { t0: 22.45, t1: 25.45, a: [[4.75, 1.05, 2.55], [3.75, 0.58, 1.2], 44], b: [[4.65, 1.02, 2.45], [3.75, 0.58, 1.2], 42], shake: [25.0, 0.015] },
  { t0: 25.45, t1: 26.6, laptop: true, shake: [25.45, 0.006] },
  { t0: 26.6, t1: 28.0, a: [[4.9, 0.56, 1.88], [3.68, 0.68, 1.2], 40], b: [[4.82, 0.54, 1.83], [3.68, 0.7, 1.2], 38] },
  { t0: 28.0, t1: 30.01, a: [[6.6, 1.15, 2.7], [3.0, 0.72, 1.2], 42], b: [[6.9, 1.2, 2.6], [2.8, 0.75, 1.2], 42], shake: [29.3, 0.02] },
];
let trackLook = null;
function cameraAt(t, p) {
  const s = SHOTS.find((x) => t >= x.t0 && t < x.t1) || SHOTS[SHOTS.length - 1];
  const u = (t - s.t0) / (s.t1 - s.t0);
  let pos, look, fov;
  if (s.track) {
    const k = ease(seg(t, 10.9, 12.8));
    pos = V(lerp(2.0, 2.25, k), lerp(1.2, 1.12, k), lerp(2.2, 2.45, k));
    look = V(lerp(0.0, 1.97, k), 0.72, lerp(-0.3, 1.0, k)); fov = lerp(46, 54, k);
  } else if (s.side) {
    const hx = girl.root.position.x;
    pos = V(4.75 - 0.1 * u, 1.0, 2.35);
    look = V(hx, 0.72, 1.15); fov = 46;
  } else if (s.laptop) {
    lapScr.updateMatrixWorld(true);
    const c = lapScr.getWorldPosition(V());
    const n = V(0, 0, 1).applyQuaternion(lapScr.getWorldQuaternion(new THREE.Quaternion()));
    pos = c.clone().add(n.multiplyScalar(lerp(0.95, 0.82, ease(u)))).add(V(0, 0.0, 0)); look = c; fov = 40;
  } else {
    const e = ease(u) * 0.7 + u * 0.3;
    pos = V(...s.a[0]).lerp(V(...s.b[0]), e); look = V(...s.a[1]).lerp(V(...s.b[1]), e); fov = lerp(s.a[2], s.b[2], e);
  }
  // gentle handheld drift + impact shakes
  pos.add(V(Math.sin(t * 0.9) * 0.006, Math.sin(t * 1.3 + 1) * 0.005, 0));
  if (s.shake) {
    const k = Math.exp(-(t - s.shake[0]) * 7) * (t >= s.shake[0] ? 1 : 0);
    pos.add(V(Math.sin(t * 61) * s.shake[1] * k, Math.sin(t * 53 + 2) * s.shake[1] * k, 0));
  }
  camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(look);
  // key light from camera side
  key.position.copy(pos).add(V(0, 0.6, 0)); key.target.position.copy(look);
  return s;
}

// ================================================================= LOOK =====
function lookAt(t, shot) {
  const inside = t < 13.0 || (t >= 25.45 && t < 26.6);
  const outsideIn = t >= 13.0 && t < 15.2;
  hemi.intensity = inside ? 0.45 : 1.15;
  hemi.color.set(inside ? 0xd6e2ff : 0xcfe8ff);
  sun.intensity = 3.3;
  roomLight.intensity = inside ? 2.4 : 1.2;
  screenLight.intensity = t < 9.4 ? 0.6 : 0.3;
  key.intensity = inside ? 0.45 : 0.35;
  key.color.set(t < 8.0 ? 0xbcd8ff : 0xffffff);
  rim.intensity = 0;
  let exp = inside ? 1.05 : 1.0;
  if (outsideIn) exp = 1.0;
  if (t >= 15.2 && t < 16.3) exp = lerp(2.4, 1.0, ease(seg(t, 15.2, 16.1)));
  if (t >= 25.45 && t < 26.6) exp = 1.0;
  renderer.toneMappingExposure = exp;
  shaftMat.uniforms.uO.value = ease(seg(t, 13.3, 13.9)) * (t < 17.3 ? 1 : 0.5) * (t > 29.3 ? 0 : 1);
  // door
  let da = 0;
  if (t > 13.2) da = 1.3 * ease(seg(t, 13.2, 14.0));
  if (t > 29.22) { const u = seg(t, 29.22, 29.36); da = 1.3 * (1 - easeIn(u)); if (t > 29.36) da = -0.06 * Math.sin((t - 29.36) * 30) * Math.exp(-(t - 29.36) * 8); }
  doorPivot.rotation.y = da;
  // chair rolls back as she stands
  chair.position.z = -0.35 + 0.28 * ease(seg(t, 9.45, 9.95)); chair.rotation.y = 0.5 * ease(seg(t, 9.45, 10.2));
  bloom.strength = inside ? 0.28 : 0.38;
}

// ================================================================= MISC =====
function updateProps(t) {
  timeU.value = t;
  // steam
  steam.forEach((s, i) => {
    const u = (t * 0.5 + i / 3) % 1;
    s.position.copy(curMug.position).add(V(0.008 * Math.sin(t * 3 + i * 2) + 0.01 * u, 0.09 + u * 0.16, 0));
    s.scale.setScalar(0.6 + u * 1.5); s.material.opacity = 0.32 * Math.sin(u * Math.PI);
  });
  // butterflies
  const flyB = (b, pos, prev, flapSpeed, landed = 0) => {
    b.g.position.copy(pos);
    const d = pos.clone().sub(prev); d.y = 0; if (d.lengthSq() > 1e-8) b.g.rotation.y = Math.atan2(d.x, d.z);
    const flap = landed ? 0.35 + 0.25 * Math.sin(t * 4) : Math.sin(t * flapSpeed) * 1.1;
    b.wings[0].rotation.z = -flap; b.wings[1].rotation.z = flap;
  };
  flyB(bfly, bflyPath(t), bflyPath(t - 0.03), 34, t > 29.75 ? 1 : 0);
  const p2 = (tt) => V(6 + 1.5 * Math.sin(tt * 0.45), 0.9 + 0.3 * Math.sin(tt * 1.9), 0.5 + 1.8 * Math.cos(tt * 0.38));
  flyB(bfly2, p2(t), p2(t - 0.03), 30);
  const p3 = (tt) => V(4.8 + 1.0 * Math.sin(tt * 0.6 + 2), 0.55 + 0.25 * Math.sin(tt * 2.3), 2.4 + 1.2 * Math.cos(tt * 0.5));
  flyB(bfly3, p3(t), p3(t - 0.03), 32);
  // dust puffs from the sprint
  puffs.forEach((pf, i) => {
    const t0 = 28.5 + i * 0.05, age = t - t0;
    if (age < 0 || age > 0.7) { pf.position.y = -5; return; }
    const x = lerp(3.5, 1.4, clamp((t0 - 28.45) / 0.75));
    pf.position.set(x + 0.15 + age * 0.2, 0.05 + age * 0.18, 1.2 + ((i % 3) - 1) * 0.08);
    pf.scale.setScalar(0.6 + age * 2.2); pf.material.opacity = 0.75 * (1 - age / 0.7);
  });
}

// ================================================================= RENDER ===
window.renderAt = (t) => {
  const p = poseAt(t);
  applyPose(p, t);
  const shot = cameraAt(t, p);
  if (window.CAM) { camera.position.set(...window.CAM[0]); camera.fov = window.CAM[2]; camera.updateProjectionMatrix(); camera.lookAt(...window.CAM[1]); key.position.copy(camera.position).add(V(0, 0.6, 0)); key.target.position.set(...window.CAM[1]); }
  lookAt(t, shot);
  updateProps(t);
  // screens
  drawInbox(screens.center, t); drawSheet(screens.left, t); drawChat(screens.right, t); drawLaptop(screens.laptop, t); drawClock(t);
  sky.position.copy(camera.position);
  updateUI(t);
  composer.render();
  return true;
};
document.fonts.ready.then(() => { window.renderAt(0); window.READY = true; });
