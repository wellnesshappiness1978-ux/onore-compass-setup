import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  brilliantCutProfile,
  brushBandEdges,
  crystalRosettePoints,
  GOLDEN_ANGLE,
  layeredSpiralPoint,
  logarithmicSpiralPoint,
  regularPolygonPoints,
  seededUnit,
  starfieldPoints,
  vividHexColor,
} from "@/lib/art-geometry";

export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: string[]; progress: number; reduced: boolean; onCapture: (capture: Capture | null) => void };

const FALLBACK_PALETTE = ["#FFD21C", "#FF168F", "#00CFFF", "#62E000", "#9238FF", "#FF4A16", "#FFB800"];
const GOLD_LIGHT = "#FFD21C";
const COSMIC_BLACK = "#010106";

function pickColor(palette: string[], index: number, fallback = GOLD_LIGHT) {
  return palette[index % Math.max(1, palette.length)] ?? fallback;
}

function shade(hex: string, amount: number) {
  const c = new THREE.Color(hex);
  return amount >= 0 ? c.lerp(new THREE.Color("#ffffff"), amount) : c.multiplyScalar(1 + amount);
}

function CaptureBridge({ onCapture }: { onCapture: Props["onCapture"] }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    onCapture(async () => {
      const size = gl.capabilities.maxTextureSize >= 2048 ? 2048 : 1024;
      const target = new THREE.WebGLRenderTarget(size, size, { samples: 4 });
      try {
        const pixels = new Uint8Array(size * size * 4);
        gl.setRenderTarget(target);
        gl.clear();
        gl.render(scene, camera);
        gl.readRenderTargetPixels(target, 0, 0, size, size, pixels);
        gl.setRenderTarget(null);
        const square = document.createElement("canvas");
        square.width = square.height = size;
        const cx = square.getContext("2d");
        if (!cx) throw new Error("Canvas unavailable");
        const image = cx.createImageData(size, size);
        for (let y = 0; y < size; y++) image.data.set(pixels.subarray((size - y - 1) * size * 4, (size - y) * size * 4), y * size * 4);
        cx.putImageData(image, 0, 0);
        const width = size === 2048 ? 2160 : 1080;
        const height = size === 2048 ? 3840 : 1920;
        const out = document.createElement("canvas");
        out.width = width;
        out.height = height;
        const ctx = out.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable");
        ctx.fillStyle = COSMIC_BLACK;
        ctx.fillRect(0, 0, width, height);
        for (let i = 0; i < 420; i++) {
          ctx.fillStyle = `rgba(255,255,255,${(.12 + seededUnit(5, i) * .35).toFixed(2)})`;
          ctx.fillRect(seededUnit(9, i) * width, seededUnit(13, i) * height, 2, 2);
        }
        ctx.drawImage(square, 0, (height - width) / 2, width, width);
        ctx.fillStyle = GOLD_LIGHT;
        ctx.textAlign = "center";
        ctx.font = `${Math.round(width / 26)}px serif`;
        ctx.fillText("AGOLMEN'S COMPASS", width / 2, height * .16);
        ctx.font = `${Math.round(width / 55)}px sans-serif`;
        ctx.fillText("BIRTH COLOR MANDALA · OVERALL FORTUNE · ILLUSTRATIVE ART", width / 2, height * .83);
        const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
        return { blob, width, height };
      } finally {
        gl.setRenderTarget(null);
        target.dispose();
      }
    });
    return () => onCapture(null);
  }, [camera, gl, onCapture, scene]);
  return null;
}

/** Procedural impasto bump map: overlapping curved brush strokes with ridged edges. */
function makeImpastoTexture(seed: number) {
  if (typeof document === "undefined") return null;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 900; i++) {
    const x = seededUnit(seed + 1, i) * size;
    const y = seededUnit(seed + 2, i) * size;
    const angle = seededUnit(seed + 3, i) * Math.PI;
    const length = 18 + seededUnit(seed + 4, i) * 46;
    const width = 3 + seededUnit(seed + 5, i) * 9;
    const tone = Math.round(70 + seededUnit(seed + 6, i) * 120);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.lineCap = "round";
    ctx.strokeStyle = `rgb(${tone},${tone},${tone})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(-length / 2, 0);
    ctx.quadraticCurveTo(0, (seededUnit(seed + 7, i) - .5) * 14, length / 2, 0);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,.35)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-length / 2, -width / 2);
    ctx.lineTo(length / 2, -width / 2);
    ctx.stroke();
    ctx.restore();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

function Starfield({ seed, reduced }: { seed: number; reduced: boolean }) {
  const material = useRef<THREE.PointsMaterial>(null);
  const { positions, colors } = useMemo(() => {
    const stars = starfieldPoints(seed, 520, 5.7, 13);
    const p = new Float32Array(stars.length * 3);
    const c = new Float32Array(stars.length * 3);
    stars.forEach((s, i) => { p.set([s.x, s.y, -2], i * 3); c.set([s.brightness, s.brightness, s.brightness * 1.05], i * 3); });
    return { positions: p, colors: c };
  }, [seed]);
  useFrame(state => { if (material.current && !reduced) material.current.opacity = .7 + Math.sin(state.clock.elapsedTime * .6) * .12; });
  return <points>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      <bufferAttribute attach="attributes-color" args={[colors, 3]} />
    </bufferGeometry>
    <pointsMaterial ref={material} vertexColors size={.035} transparent opacity={.75} sizeAttenuation depthWrite={false} />
  </points>;
}

/** Thick painted ribbon along a polyline. */
function BrushBand({ points, width, color, z, seed, bump }: { points: [number, number][]; width: number; color: THREE.Color | string; z: number; seed: number; bump: THREE.Texture | null }) {
  const geometry = useMemo(() => {
    const edges = brushBandEdges(points, width, seed);
    const vertices: number[] = [];
    const uvs: number[] = [];
    const index: number[] = [];
    edges.forEach((edge, i) => {
      const t = i / Math.max(1, edges.length - 1);
      vertices.push(edge.left[0], edge.left[1], z, edge.right[0], edge.right[1], z);
      uvs.push(t * 6, 0, t * 6, 1);
      if (i > 0) { const a = (i - 1) * 2; index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(index);
    g.computeVertexNormals();
    return g;
  }, [points, seed, width, z]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry}>
    <meshStandardMaterial color={color} roughness={.42} metalness={.08} bumpMap={bump} envMapIntensity={.2} bumpScale={.06} side={THREE.DoubleSide} />
  </mesh>;
}

function PaintedRings({ palette, bump }: { palette: string[]; bump: THREE.Texture | null }) {
  const birth = palette.slice(1, 7);
  const rings = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const inner = 1.05 + i * .3;
    return { inner, outer: inner + .34, color: shade(pickColor(birth, i), i % 2 ? -.45 : 0), z: -.4 + i * .002 };
  }), [birth]);
  return <>
    {rings.map((ring, i) => <mesh key={i} position-z={ring.z} rotation-z={i * GOLDEN_ANGLE}>
      <ringGeometry args={[ring.inner, ring.outer, 180, 1]} />
      <meshStandardMaterial color={ring.color} roughness={.55} envMapIntensity={.2} bumpMap={bump} bumpScale={.09} />
    </mesh>)}
    <mesh position-z={-.41}><circleGeometry args={[1.1, 96]} /><meshStandardMaterial color={shade(pickColor(palette, 0), -.5)} roughness={.5} bumpMap={bump} bumpScale={.08} /></mesh>
  </>;
}

function DotPaint({ palette, bump }: { palette: string[]; bump: THREE.Texture | null }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const birth = palette.slice(1, 7);
  const dots = useMemo(() => {
    const list: { x: number; y: number; s: number; c: THREE.Color }[] = [];
    for (let ring = 0; ring < 14; ring++) {
      const radius = 1.22 + ring * .3;
      const count = Math.round(radius * 2 * Math.PI / .19);
      for (let i = 0; i < count; i++) {
        const angle = i / count * Math.PI * 2 + ring * .13;
        list.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, s: ring % 3 === 0 ? .075 : .055, c: shade(pickColor(birth, ring + 3), ring % 2 ? .12 : -.25) });
      }
    }
    return list;
  }, [birth]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    dots.forEach((d, i) => {
      dummy.position.set(d.x, d.y, -.2);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
      mesh.current!.setColorAt(i, d.c);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [dots, dummy]);
  return <instancedMesh ref={mesh} args={[undefined, undefined, dots.length]}>
    <sphereGeometry args={[1, 12, 8]} />
    <meshStandardMaterial roughness={.35} envMapIntensity={.25} bumpMap={bump} bumpScale={.02} />
  </instancedMesh>;
}

function SacredBands({ palette, bump }: { palette: string[]; bump: THREE.Texture | null }) {
  const birth = palette.slice(1, 7);
  const polygons = useMemo(() => [
    { sides: 6, r: 1.6, phase: 0 }, { sides: 8, r: 2.3, phase: Math.PI / 8 }, { sides: 6, r: 3.0, phase: Math.PI / 6 },
    { sides: 8, r: 3.7, phase: 0 }, { sides: 12, r: 4.4, phase: Math.PI / 12 }, { sides: 8, r: 5.05, phase: Math.PI / 16 },
  ].map(p => regularPolygonPoints(p.sides, p.r, p.phase).map(([x, y]) => [x, y] as [number, number])), []);
  const rosettes = useMemo(() => [1.9, 2.65, 3.35, 4.1, 4.75].map((r, i) => crystalRosettePoints(12 + i * 4, r, r * .82, i * .1).map(([x, y]) => [x, y] as [number, number])), []);
  const spirals = useMemo(() => Array.from({ length: 6 }, (_, arm) => Array.from({ length: 120 }, (_, i) => {
    const [x, y] = layeredSpiralPoint(i, 120, arm, 6, 5.1);
    return [x, y] as [number, number];
  })), []);
  const golden = useMemo(() => Array.from({ length: 200 }, (_, i) => {
    const [x, y] = logarithmicSpiralPoint(i, 200, 4.7, 3.5);
    return [x, y] as [number, number];
  }).slice(20), []);
  return <>
    {rosettes.map((pts, i) => <BrushBand key={`r${i}`} points={pts} width={.07} color={shade(pickColor(birth, i + 2), .08)} z={-.12 + i * .004} seed={40 + i} bump={bump} />)}
    {polygons.map((pts, i) => <BrushBand key={`p${i}`} points={pts} width={.13} color={shade(pickColor(birth, i), i % 2 ? .1 : -.3)} z={-.06 + i * .004} seed={10 + i} bump={bump} />)}
    {spirals.map((pts, i) => <BrushBand key={`s${i}`} points={pts} width={.09} color={shade(pickColor(birth, i + 1), 0)} z={0 + i * .003} seed={60 + i} bump={bump} />)}
    <BrushBand points={golden} width={.16} color={shade(GOLD_LIGHT, .1)} z={.05} seed={90} bump={bump} />
    <BrushBand points={golden.map(([x, y]) => [-x, -y] as [number, number])} width={.16} color={shade(GOLD_LIGHT, .1)} z={.051} seed={91} bump={bump} />
  </>;
}

function GemCore({ color, reveal, reduced }: { color: string; reveal: number; reduced: boolean }) {
  const gem = useRef<THREE.Mesh>(null);
  const flares = useRef<THREE.Group>(null);
  const points = useMemo(() => brilliantCutProfile(.82).map(([r, h]) => new THREE.Vector2(r, h)), []);
  const halo = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(.25, "rgba(255,255,255,.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  useFrame(state => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    if (gem.current) gem.current.rotation.y = t * .25;
    flares.current?.children.forEach((child, i) => {
      const s = Math.max(0, Math.sin(t * 1.3 + i * 1.7)) ** 6;
      child.scale.set(.05 + s * .9, .012 + s * .03, 1);
    });
  });
  const tint = vividHexColor(color);
  return <group position-z={.5} scale={.3 + reveal * .7}>
    <mesh position-z={-.1} scale={4.2}><planeGeometry /><meshBasicMaterial map={halo} color={shade(tint, .3)} transparent opacity={.32} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
    {Array.from({ length: 16 }, (_, i) => <mesh key={i} rotation-z={i / 16 * Math.PI * 2} position-z={-.08}>
      <planeGeometry args={[i % 2 ? 3.2 : 4.4, .018]} />
      <meshBasicMaterial color={shade(tint, .55)} transparent opacity={.4} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>)}
    <mesh ref={gem} rotation-x={Math.PI / 2 - .5} scale={1.25}>
      <latheGeometry args={[points, 16]} />
      <meshPhysicalMaterial color={tint} flatShading metalness={.05} roughness={.04} transmission={.1} thickness={1.2} ior={2.4} clearcoat={1} clearcoatRoughness={.02} iridescence={.6} envMapIntensity={2.4} emissive={tint} emissiveIntensity={.08} />
    </mesh>
    <group ref={flares} position-z={.4}>
      {Array.from({ length: 6 }, (_, i) => {
        const a = i / 6 * Math.PI * 2;
        return <mesh key={i} position={[Math.cos(a) * .5, Math.sin(a) * .5, 0]} rotation-z={i % 2 ? Math.PI / 4 : 0} scale={[.05, .012, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={.9} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>;
      })}
    </group>
  </group>;
}

function Mandala({ colors, progress, reduced }: Omit<Props, "onCapture">) {
  const mandala = useRef<THREE.Group>(null);
  const palette = useMemo<string[]>(() => Array.from({ length: 7 }, (_, i) => vividHexColor(colors.length ? pickColor(colors, i, FALLBACK_PALETTE[i]) : FALLBACK_PALETTE[i] ?? GOLD_LIGHT)), [colors]);
  const seed = useMemo(() => palette.join("").split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0), [palette]);
  const bump = useMemo(() => makeImpastoTexture(seed), [seed]);
  useEffect(() => () => bump?.dispose(), [bump]);
  useFrame((state, rawDelta) => {
    if (reduced || !mandala.current) return;
    mandala.current.rotation.z += Math.min(rawDelta, .05) * .01;
    mandala.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * .4) * .006);
  });
  const x = Math.min(1, Math.max(0, progress / 6.4));
  const reveal = x * x * (3 - 2 * x);
  return <>
    <color attach="background" args={[COSMIC_BLACK]} />
    <Environment resolution={128}>
      <Lightformer intensity={4} position={[0, 4, 4]} scale={[6, 2, 1]} />
      <Lightformer intensity={3} color={pickColor(palette, 0)} position={[-4, -2, 3]} scale={[3, 3, 1]} />
      <Lightformer intensity={2.5} position={[4, -1, 2]} scale={[2, 5, 1]} />
    </Environment>
    <ambientLight intensity={.3} />
    <directionalLight position={[-4, 5, 6]} intensity={1.8} />
    <directionalLight position={[5, -3, 4]} intensity={.8} color={pickColor(palette, 0)} />
    <Starfield seed={seed} reduced={reduced} />
    <group ref={mandala} scale={.2 + reveal * .8}>
      <PaintedRings palette={palette} bump={bump} />
      <DotPaint palette={palette} bump={bump} />
      <SacredBands palette={palette} bump={bump} />
    </group>
    <GemCore color={pickColor(palette, 0)} reveal={reveal} reduced={reduced} />
  </>;
}

export default function MandalaScene({ onCapture, ...props }: Props) {
  return <Canvas flat aria-label="総合運のバースカラー曼陀羅" camera={{ position: [0, 0, 12], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: true, preserveDrawingBuffer: true }}>
    <Mandala {...props} />
    <CaptureBridge onCapture={onCapture} />
  </Canvas>;
}
