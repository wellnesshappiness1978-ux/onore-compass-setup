import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  crystalRosettePoints,
  GOLDEN_ANGLE,
  goldLeafTransform,
  layeredSpiralPoint,
  logarithmicSpiralPoint,
  radialRayTransform,
  regularPolygonPoints,
  seededUnit,
  sparkleTransform,
  spiralPoint,
  vividHexColor,
  type MandalaIntention,
} from "@/lib/art-geometry";

export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: string[]; intention: MandalaIntention; progress: number; reduced: boolean; onCapture: (capture: Capture | null) => void };

const FALLBACK_PALETTE = ["#FFD21C", "#FF168F", "#00CFFF", "#62E000", "#9238FF", "#FF4A16", "#FFB800"];
const GOLD_LIGHT = "#FFD21C";
const COSMIC_BLACK = "#010106";

function pickColor(palette: string[], index: number, fallback = GOLD_LIGHT) {
  return palette[index % Math.max(1, palette.length)] ?? fallback;
}

function CaptureBridge({ colors, onCapture }: { colors: string[]; onCapture: Props["onCapture"] }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    onCapture(async () => {
      const max = Math.min(gl.capabilities.maxTextureSize, 3840);
      const size = max >= 2048 ? 2048 : 1024;
      const target = new THREE.WebGLRenderTarget(size, size, { samples: 0 });
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
        const palette = colors.length ? colors : FALLBACK_PALETTE;
        ctx.fillStyle = COSMIC_BLACK;
        ctx.fillRect(0, 0, width, height);
        const halo = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, height * .62);
        halo.addColorStop(0, `${palette[0] ?? FALLBACK_PALETTE[0]}B8`);
        halo.addColorStop(.3, `${palette[1] ?? FALLBACK_PALETTE[1]}54`);
        halo.addColorStop(.64, `${palette[4] ?? FALLBACK_PALETTE[4]}22`);
        halo.addColorStop(1, `${COSMIC_BLACK}00`);
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(square, 0, (height - width) / 2, width, width);
        ctx.fillStyle = pickColor(palette, 6);
        ctx.textAlign = "center";
        ctx.font = `${Math.round(width / 26)}px serif`;
        ctx.fillText("AGOLMEN'S COMPASS", width / 2, height * .16);
        ctx.font = `${Math.round(width / 55)}px sans-serif`;
        ctx.fillText("BIRTH COLOR MANDALA · ILLUSTRATIVE ART", width / 2, height * .83);
        const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
        return { blob, width, height };
      } finally {
        gl.setRenderTarget(null);
        target.dispose();
      }
    });
    return () => onCapture(null);
  }, [camera, colors, gl, onCapture, scene]);
  return null;
}

const BACKDROP_VERTEX = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const BACKDROP_FRAGMENT = `
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uColors[7];
  uniform float uTime;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float a = atan(p.y, p.x) / 6.2831853 + 0.5;
    float sector = a * 6.0;
    int i = int(floor(sector));
    float f = smoothstep(0.0, 1.0, fract(sector));
    vec3 angular = mix(uColors[i], uColors[(i + 1) % 6], f);
    float wave = sin(r * 38.0 - uTime * 0.16 + a * 24.0) * 0.5 + 0.5;
    float grain = hash(floor(vUv * 260.0)) * 0.008;
    float aura = pow(max(0.0, 1.0 - r / 1.36), 2.15);
    float filament = smoothstep(0.76, 1.0, wave) * aura * 0.12;
    vec3 black = vec3(0.001, 0.0015, 0.006);
    vec3 color = black + angular * (aura * 0.28 + filament);
    color += uColors[0] * pow(max(0.0, 1.0 - r * 1.7), 4.0) * 0.3;
    color += vec3(grain) * aura;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function AuraBackdrop({ palette, reduced }: { palette: string[]; reduced: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uColors: { value: Array.from({ length: 7 }, (_, index) => new THREE.Color(pickColor(palette, index, FALLBACK_PALETTE[index] ?? GOLD_LIGHT))) },
    uTime: { value: 0 },
  }), [palette]);
  useEffect(() => {
    const values = uniforms.uColors.value as THREE.Color[];
    values.forEach((color, index) => color.set(pickColor(palette, index, FALLBACK_PALETTE[index] ?? GOLD_LIGHT)));
  }, [palette, uniforms]);
  useFrame((state) => {
    const timeUniform = material.current?.uniforms["uTime"];
    if (timeUniform && !reduced) timeUniform.value = state.clock.elapsedTime;
  });
  return <mesh position={[0, 0, -1.2]} scale={[1.25, 1.25, 1]}>
    <planeGeometry args={[12.8, 12.8, 1, 1]} />
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={BACKDROP_VERTEX} fragmentShader={BACKDROP_FRAGMENT} depthWrite={false} />
  </mesh>;
}

function RayField({ seed, color, progress }: { seed: number; color: string; progress: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = 96;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      const ray = radialRayTransform(seed, i, count, 6.5);
      dummy.position.set(Math.cos(ray.angle) * ray.length * .48, Math.sin(ray.angle) * ray.length * .48, -.66 + i % 3 * .012);
      dummy.rotation.set(0, 0, ray.angle - Math.PI / 2);
      dummy.scale.set(ray.width * (i % 4 === 0 ? 1.7 : .72), ray.length, 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [dummy, seed]);
  return <instancedMesh ref={mesh} args={[undefined, undefined, count]} scale={Math.max(.02, progress)}>
    <planeGeometry args={[1, 1]} />
    <meshBasicMaterial color={color} transparent opacity={.32} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
  </instancedMesh>;
}

function SparkleField({ seed, palette, reduced }: { seed: number; palette: string[]; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = 120;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      const sparkle = sparkleTransform(seed, i, 5.75);
      dummy.position.set(sparkle.x, sparkle.y, .28 + i % 7 * .009);
      dummy.rotation.set(0, 0, sparkle.rotation);
      const size = .01 * sparkle.scale * (i % 13 === 0 ? 1.8 : 1);
      dummy.scale.set(size * .46, size * 2.6, 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      color.set(pickColor(palette, i, FALLBACK_PALETTE[i % FALLBACK_PALETTE.length] ?? GOLD_LIGHT));
      color.set(GOLD_LIGHT);
      mesh.current.setColorAt(i, color);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [color, dummy, palette, seed]);
  useFrame((state, rawDelta) => {
    if (!group.current || reduced) return;
    const delta = Math.min(rawDelta, .05);
    group.current.rotation.z -= delta * .008;
    const pulse = .96 + Math.sin(state.clock.elapsedTime * .65) * .04;
    group.current.scale.setScalar(pulse);
  });
  return <group ref={group}><instancedMesh ref={mesh} args={[undefined, undefined, count]}>
    <planeGeometry args={[1, 1]} />
    <meshBasicMaterial vertexColors transparent opacity={.68} blending={THREE.AdditiveBlending} depthWrite={false} />
  </instancedMesh></group>;
}

function GoldLeafField({ seed, count, radius, progress }: { seed: number; count: number; radius: number; progress: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      const leaf = goldLeafTransform(seed, i, radius);
      dummy.position.set(leaf.x, leaf.y, .19 + seededUnit(seed + 93, i) * .12);
      dummy.rotation.set(0, 0, leaf.rotation);
      dummy.scale.set(.008 * leaf.scale * (1 + i % 3), .032 * leaf.scale, 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy, radius, seed]);
  return <instancedMesh ref={mesh} args={[undefined, undefined, count]} scale={Math.max(.01, progress)}>
    <planeGeometry args={[1, 1]} />
    <meshBasicMaterial color={GOLD_LIGHT} transparent opacity={.76} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
  </instancedMesh>;
}

function DotField({ palette, progress }: { palette: string[]; progress: number }) {
  const { positions, colors, sizes } = useMemo(() => {
    const points: number[] = [];
    const pointColors: number[] = [];
    const pointSizes: number[] = [];
    const color = new THREE.Color();
    for (let ring = 0; ring < 18; ring++) {
      const radius = .54 + ring * .278;
      const count = 34 + ring * 7;
      for (let index = 0; index < count; index++) {
        const angle = index / count * Math.PI * 2 + ring * GOLDEN_ANGLE;
        points.push(Math.cos(angle) * radius, Math.sin(angle) * radius, .04 + ring * .008);
        color.set(pickColor(palette, index + ring, "#F5C85B"));
        pointColors.push(color.r, color.g, color.b);
        pointSizes.push(index % 11 === 0 ? .054 : .026);
      }
    }
    return { positions: new Float32Array(points), colors: new Float32Array(pointColors), sizes: new Float32Array(pointSizes) };
  }, [palette]);
  return <points scale={Math.max(.02, progress)}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
    </bufferGeometry>
    <pointsMaterial vertexColors size={.052} transparent opacity={.96} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
  </points>;
}

function SacredGeometry({ palette, progress }: { palette: string[]; progress: number }) {
  const layers = useMemo(() => [
    { sides: 6, radius: 2.05, phase: 0, color: 1 },
    { sides: 8, radius: 2.62, phase: Math.PI / 8, color: 2 },
    { sides: 6, radius: 3.24, phase: Math.PI / 6, color: 3 },
    { sides: 8, radius: 3.86, phase: 0, color: 4 },
    { sides: 6, radius: 4.48, phase: Math.PI / 12, color: 5 },
    { sides: 8, radius: 5.02, phase: Math.PI / 16, color: 6 },
  ], []);
  const spirals = useMemo(() => Array.from({ length: 6 }, (_, arm) => Array.from({ length: 180 }, (_, index) => {
    const [x, y] = layeredSpiralPoint(index, 180, arm, 6, 5.25);
    return [x, y, .15 + arm * .008] as [number, number, number];
  })), []);
  return <group scale={Math.max(.02, progress)}>
    {layers.map((layer, index) => <Line key={`polygon-${layer.radius}`} points={regularPolygonPoints(layer.sides, layer.radius, layer.phase, -.14 + index * .025)} color={pickColor(palette, layer.color, FALLBACK_PALETTE[layer.color] ?? GOLD_LIGHT)} lineWidth={index % 2 ? 1.35 : 2} transparent opacity={.78} />)}
    {[1.28, 1.72, 2.18, 2.72, 3.3, 3.88, 4.44, 4.96].map((radius, index) => <Line key={`rosette-${radius}`} points={crystalRosettePoints(12 + index * 2, radius, radius * (.46 + index * .025), index * .09, .02 + index * .014)} color={pickColor(palette, index + 2, FALLBACK_PALETTE[index % 7] ?? GOLD_LIGHT)} lineWidth={index % 2 ? .85 : 1.3} transparent opacity={.58 + index * .025} />)}
    {spirals.map((points, index) => <Line key={`spiral-${index}`} points={points} color={pickColor(palette, index, FALLBACK_PALETTE[index] ?? GOLD_LIGHT)} lineWidth={index % 2 ? .85 : 1.25} transparent opacity={.5} />)}
    {Array.from({ length: 48 }, (_, index) => {
      const angle = index / 48 * Math.PI * 2;
      return <Line key={`crystal-${index}`} points={[[Math.cos(angle) * .74, Math.sin(angle) * .74, .2], [Math.cos(angle + .08) * 3.1, Math.sin(angle + .08) * 3.1, .21], [Math.cos(angle) * 5.12, Math.sin(angle) * 5.12, .2]]} color={pickColor(palette, index, "#F5C85B")} lineWidth={index % 3 === 0 ? 1.35 : .72} transparent opacity={index % 3 === 0 ? .62 : .36} />;
    })}
  </group>;
}

function Mandala({ colors, progress, reduced }: Omit<Props, "onCapture" | "intention">) {
  const mandala = useRef<THREE.Group>(null);
  const counter = useRef<THREE.Group>(null);
  const palette = useMemo<string[]>(() => colors.length ? Array.from({ length: 7 }, (_, index) => vividHexColor(pickColor(colors, index, FALLBACK_PALETTE[index] ?? GOLD_LIGHT))) : [...FALLBACK_PALETTE], [colors]);
  const main = pickColor(palette, 0, "#F5C85B");
  const sub = pickColor(palette, 1, "#F7A8D0");
  const seed = useMemo(() => palette.join("").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0), [palette]);
  const goldenSpiral = useMemo(() => Array.from({ length: 260 }, (_, index) => {
    const [x, y] = logarithmicSpiralPoint(index, 260, 5.3, 3.5);
    return [x, y, .23] as [number, number, number];
  }), []);
  useFrame((state, rawDelta) => {
    if (reduced) return;
    const delta = Math.min(rawDelta, .05);
    if (mandala.current) {
      mandala.current.rotation.z += delta * .0028;
      const breath = 1 + Math.sin(state.clock.elapsedTime * .42) * .008;
      mandala.current.scale.setScalar(breath);
    }
    if (counter.current) counter.current.rotation.z -= delta * .0052;
  });
  const ease = (value: number) => { const x = Math.min(1, Math.max(0, value)); return x * x * (3 - 2 * x); };
  const reveal = ease(progress / 6.4);
  return <>
    <color attach="background" args={[COSMIC_BLACK]} />
    <ambientLight intensity={.5} />
    <directionalLight position={[3.5, 5.5, 8]} intensity={3.2} color={main} />
    <directionalLight position={[-5, -2, 5]} intensity={2.2} color={sub} />
    <AuraBackdrop palette={palette} reduced={reduced} />
    <RayField seed={seed} color={pickColor(palette, 6)} progress={reveal} />
    <group ref={mandala}>
      {[5.4, 4.78, 4.18, 3.6, 3.04, 2.5, 1.98].map((radius, index) => <mesh key={`wash-${radius}`} position={[0, 0, -.48 + index * .025]} rotation-z={index * GOLDEN_ANGLE} scale={[1 + index % 2 * .025, 1 - index % 3 * .018, 1]}>
        <ringGeometry args={[Math.max(.1, radius - .32), radius, 160]} />
        <meshBasicMaterial color={pickColor(palette, index, main)} transparent opacity={.24 + index * .012} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>)}
      <DotField palette={palette} progress={reveal} />
      <SacredGeometry palette={palette} progress={reveal} />
      <Line points={goldenSpiral} color={pickColor(palette, 2, main)} lineWidth={1.75} transparent opacity={.72} />
      <Line points={goldenSpiral.map(([x, y, z]) => [-x, y, z + .01] as [number, number, number])} color={pickColor(palette, 4, sub)} lineWidth={1.25} transparent opacity={.58} />
      <GoldLeafField seed={seed} count={92} radius={5.28} progress={reveal} />
      <SparkleField seed={seed} palette={palette} reduced={reduced} />
      <group ref={counter}>
        {[1.34, 1.06, .8].map((radius, index) => <Line key={`core-rosette-${radius}`} points={crystalRosettePoints(12 + index * 4, radius, radius * .54, index * .11, .32 + index * .02)} color={pickColor(palette, index + 3, main)} lineWidth={2.1 - index * .35} transparent opacity={.82} />)}
      </group>
      <mesh position-z={.26} scale={.25 + reveal * .75}><circleGeometry args={[.82, 96]} /><meshPhysicalMaterial color={main} emissive={main} emissiveIntensity={.72} roughness={.36} clearcoat={.8} transparent opacity={.84} /></mesh>
      <mesh position-z={.34} scale={.25 + reveal * .75}><circleGeometry args={[.6, 96]} /><meshPhysicalMaterial color={main} emissive={main} emissiveIntensity={1.05} roughness={.18} clearcoat={1} clearcoatRoughness={.08} /></mesh>
      <mesh position-z={.37} scale={.25 + reveal * .75}><ringGeometry args={[.68, .78, 96]} /><meshBasicMaterial color={pickColor(palette, 6)} transparent opacity={.9} blending={THREE.AdditiveBlending} /></mesh>
      <pointLight color={main} intensity={4.2 * reveal} distance={7} />
    </group>
  </>;
}

export default function MandalaScene({ onCapture, ...props }: Props) {
  return <Canvas aria-label="7つのバースカラーによる神彩結晶の幾何学曼陀羅" camera={{ position: [0, 0, 12], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: true, preserveDrawingBuffer: true }}>
    <Mandala {...props} />
    <CaptureBridge colors={props.colors} onCapture={onCapture} />
  </Canvas>;
}