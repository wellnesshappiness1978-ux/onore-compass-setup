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
  type MandalaIntention,
} from "@/lib/art-geometry";

export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: string[]; intention: MandalaIntention; progress: number; reduced: boolean; onCapture: (capture: Capture | null) => void };

const FALLBACK_PALETTE = ["#F5C85B", "#F7A8D0", "#79D7F2", "#A5D96A", "#BDA5F4", "#FF9D76", "#FFF0A8"];

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
        const background = ctx.createLinearGradient(0, 0, width, height);
        palette.forEach((color, index) => background.addColorStop(index / Math.max(1, palette.length - 1), color));
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
        const halo = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, height * .7);
        halo.addColorStop(0, `${palette[0] ?? FALLBACK_PALETTE[0]}EE`);
        halo.addColorStop(.42, `${palette[1] ?? FALLBACK_PALETTE[1]}88`);
        halo.addColorStop(1, `${palette[6] ?? FALLBACK_PALETTE[6]}CC`);
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(square, 0, (height - width) / 2, width, width);
        ctx.fillStyle = palette[6] ?? FALLBACK_PALETTE[6];
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
    vec3 radial = mix(uColors[0], uColors[6], smoothstep(0.0, 1.35, r));
    float wave = sin(r * 34.0 - uTime * 0.18 + a * 18.0) * 0.5 + 0.5;
    float brush = hash(floor(vUv * 180.0)) * 0.06 + sin((p.x + p.y) * 55.0) * 0.025;
    vec3 color = mix(radial, angular, 0.48 + 0.13 * sin(r * 15.0 + a * 12.0));
    color = mix(color, uColors[6], wave * 0.1);
    color += vec3(0.14 + brush) * (1.0 - smoothstep(0.0, 1.45, r));
    color = mix(color, vec3(1.0), 0.12 + 0.12 * pow(max(0.0, 1.0 - r), 3.0));
    gl_FragColor = vec4(color, 1.0);
  }
`;

function AuraBackdrop({ palette, reduced }: { palette: string[]; reduced: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uColors: { value: Array.from({ length: 7 }, (_, index) => new THREE.Color(palette[index % palette.length] ?? FALLBACK_PALETTE[index])) },
    uTime: { value: 0 },
  }), [palette]);
  useEffect(() => {
    const values = uniforms.uColors.value as THREE.Color[];
    values.forEach((color, index) => color.set(palette[index % palette.length] ?? FALLBACK_PALETTE[index]));
  }, [palette, uniforms]);
  useFrame((state) => {
    if (material.current && !reduced) material.current.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return <mesh position={[0, 0, -1.2]} scale={[1.25, 1.25, 1]}>
    <planeGeometry args={[12.8, 12.8, 1, 1]} />
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={BACKDROP_VERTEX} fragmentShader={BACKDROP_FRAGMENT} depthWrite={false} />
  </mesh>;
}

function RayField({ seed, color, progress }: { seed: number; color: string; progress: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = 72;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      const ray = radialRayTransform(seed, i, count, 6.5);
      dummy.position.set(Math.cos(ray.angle) * ray.length * .48, Math.sin(ray.angle) * ray.length * .48, -.66 + i % 3 * .012);
      dummy.rotation.set(0, 0, ray.angle - Math.PI / 2);
      dummy.scale.set(ray.width * (i % 4 === 0 ? 2.2 : 1), ray.length, 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [dummy, seed]);
  return <instancedMesh ref={mesh} args={[undefined, undefined, count]} scale={Math.max(.02, progress)}>
    <planeGeometry args={[1, 1]} />
    <meshBasicMaterial color={color} transparent opacity={.22} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
  </instancedMesh>;
}

function SparkleField({ seed, palette, reduced }: { seed: number; palette: string[]; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = 260;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      const sparkle = sparkleTransform(seed, i, 5.75);
      dummy.position.set(sparkle.x, sparkle.y, .28 + i % 7 * .009);
      dummy.rotation.set(0, 0, sparkle.rotation);
      const size = .018 * sparkle.scale * (i % 17 === 0 ? 3.8 : i % 7 === 0 ? 2.2 : 1);
      dummy.scale.set(size, size * (i % 5 === 0 ? 2.8 : 1), 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      color.set(palette[i % palette.length] ?? FALLBACK_PALETTE[i % FALLBACK_PALETTE.length]);
      color.lerp(new THREE.Color(FALLBACK_PALETTE[6]), .28);
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
    <circleGeometry args={[1, 4]} />
    <meshBasicMaterial vertexColors transparent opacity={.9} blending={THREE.AdditiveBlending} depthWrite={false} />
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
    <meshBasicMaterial color={FALLBACK_PALETTE[6]} transparent opacity={.76} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
  </instancedMesh>;
}

function DotField({ palette, progress }: { palette: string[]; progress: number }) {
  const { positions, colors, sizes } = useMemo(() => {
    const points: number[] = [];
    const pointColors: number[] = [];
    const pointSizes: number[] = [];
    const color = new THREE.Color();
    for (let ring = 0; ring < 12; ring++) {
      const radius = .72 + ring * .38;
      const count = 30 + ring * 8;
      for (let index = 0; index < count; index++) {
        const angle = index / count * Math.PI * 2 + ring * GOLDEN_ANGLE;
        points.push(Math.cos(angle) * radius, Math.sin(angle) * radius, .04 + ring * .008);
        color.set(palette[(index + ring) % palette.length] ?? FALLBACK_PALETTE[0]);
        pointColors.push(color.r, color.g, color.b);
        pointSizes.push(index % 9 === 0 ? .062 : .035);
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
    <pointsMaterial vertexColors size={.055} transparent opacity={.86} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
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
    {layers.map((layer, index) => <Line key={`polygon-${layer.radius}`} points={regularPolygonPoints(layer.sides, layer.radius, layer.phase, -.14 + index * .025)} color={palette[layer.color % palette.length] ?? FALLBACK_PALETTE[layer.color]} lineWidth={index % 2 ? 1.2 : 1.8} transparent opacity={.62} />)}
    {[1.55, 2.32, 3.12, 4.05, 4.86].map((radius, index) => <Line key={`rosette-${radius}`} points={crystalRosettePoints(12 + index * 2, radius, radius * (.52 + index * .03), index * .07, .02 + index * .018)} color={palette[(index + 2) % palette.length] ?? FALLBACK_PALETTE[index]} lineWidth={index % 2 ? .9 : 1.35} transparent opacity={.48 + index * .05} />)}
    {spirals.map((points, index) => <Line key={`spiral-${index}`} points={points} color={palette[index % palette.length] ?? FALLBACK_PALETTE[index]} lineWidth={index % 2 ? .85 : 1.25} transparent opacity={.5} />)}
    {Array.from({ length: 24 }, (_, index) => {
      const angle = index / 24 * Math.PI * 2;
      return <Line key={`crystal-${index}`} points={[[Math.cos(angle) * .74, Math.sin(angle) * .74, .2], [Math.cos(angle + .08) * 3.1, Math.sin(angle + .08) * 3.1, .21], [Math.cos(angle) * 5.12, Math.sin(angle) * 5.12, .2]]} color={palette[index % palette.length] ?? FALLBACK_PALETTE[0]} lineWidth={index % 3 === 0 ? 1.35 : .72} transparent opacity={index % 3 === 0 ? .62 : .36} />;
    })}
  </group>;
}

function Mandala({ colors, progress, reduced }: Omit<Props, "onCapture" | "intention">) {
  const mandala = useRef<THREE.Group>(null);
  const counter = useRef<THREE.Group>(null);
  const palette = useMemo(() => colors.length ? Array.from({ length: 7 }, (_, index) => colors[index % colors.length] ?? FALLBACK_PALETTE[index]) : FALLBACK_PALETTE, [colors]);
  const main = palette[0] ?? FALLBACK_PALETTE[0];
  const sub = palette[1] ?? FALLBACK_PALETTE[1];
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
    <color attach="background" args={[palette[6] ?? FALLBACK_PALETTE[6]]} />
    <ambientLight intensity={1.25} />
    <directionalLight position={[3.5, 5.5, 8]} intensity={2.5} color={main} />
    <directionalLight position={[-5, -2, 5]} intensity={1.8} color={sub} />
    <AuraBackdrop palette={palette} reduced={reduced} />
    <RayField seed={seed} color={palette[6] ?? FALLBACK_PALETTE[6]} progress={reveal} />
    <group ref={mandala}>
      {[5.4, 4.82, 4.22, 3.62, 3.02, 2.42, 1.82].map((radius, index) => <mesh key={`wash-${radius}`} position={[0, 0, -.48 + index * .025]} rotation-z={index * GOLDEN_ANGLE} scale={[1 + index % 2 * .025, 1 - index % 3 * .018, 1]}>
        <ringGeometry args={[Math.max(.1, radius - .72), radius, 128]} />
        <meshBasicMaterial color={palette[index] ?? main} transparent opacity={.16 + index * .012} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>)}
      <DotField palette={palette} progress={reveal} />
      <SacredGeometry palette={palette} progress={reveal} />
      <Line points={goldenSpiral} color={palette[2] ?? main} lineWidth={1.75} transparent opacity={.72} />
      <Line points={goldenSpiral.map(([x, y, z]) => [-x, y, z + .01] as [number, number, number])} color={palette[4] ?? sub} lineWidth={1.25} transparent opacity={.58} />
      <GoldLeafField seed={seed} count={128} radius={5.28} progress={reveal} />
      <SparkleField seed={seed} palette={palette} reduced={reduced} />
      <group ref={counter}>
        {[1.34, 1.06, .8].map((radius, index) => <Line key={`core-rosette-${radius}`} points={crystalRosettePoints(12 + index * 4, radius, radius * .54, index * .11, .32 + index * .02)} color={palette[(index + 3) % palette.length] ?? main} lineWidth={2.1 - index * .35} transparent opacity={.82} />)}
      </group>
      <mesh position-z={.26} scale={.25 + reveal * .75}><circleGeometry args={[.82, 96]} /><meshPhysicalMaterial color={palette[3] ?? sub} emissive={palette[3] ?? sub} emissiveIntensity={.22} roughness={.42} clearcoat={.65} transparent opacity={.72} /></mesh>
      <mesh position-z={.34} scale={.25 + reveal * .75}><circleGeometry args={[.6, 96]} /><meshPhysicalMaterial color={main} emissive={main} emissiveIntensity={.5} roughness={.22} clearcoat={1} clearcoatRoughness={.12} /></mesh>
      <mesh position-z={.37} scale={.25 + reveal * .75}><ringGeometry args={[.68, .78, 96]} /><meshBasicMaterial color={palette[6] ?? FALLBACK_PALETTE[6]} transparent opacity={.9} blending={THREE.AdditiveBlending} /></mesh>
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