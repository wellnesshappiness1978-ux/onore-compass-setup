import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Line } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ReturnTypeNatal } from "@/lib/natal-sky-types";
import { GOLDEN_ANGLE, seededUnit, spiralPoint } from "@/lib/art-geometry";

export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { sky: ReturnTypeNatal; colors: string[]; element: string; progress: number; reduced: boolean; onCapture: (capture: Capture | null) => void };

function CaptureBridge({ onCapture }: { onCapture: Props["onCapture"] }) {
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
        const square = document.createElement("canvas"); square.width = square.height = size;
        const cx = square.getContext("2d");
        if (!cx) throw new Error("Canvas unavailable");
        const image = cx.createImageData(size, size);
        for (let y = 0; y < size; y++) image.data.set(pixels.subarray((size - y - 1) * size * 4, (size - y) * size * 4), y * size * 4);
        cx.putImageData(image, 0, 0);
        const width = size === 2048 ? 2160 : 1080, height = size === 2048 ? 3840 : 1920;
        const out = document.createElement("canvas"); out.width = width; out.height = height;
        const ctx = out.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
        const css = getComputedStyle(gl.domElement);
        ctx.fillStyle = css.getPropertyValue("--art-void").trim() || "#050B18";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(square, 0, (height - width) / 2, width, width);
        ctx.fillStyle = css.getPropertyValue("--gold-glow").trim() || "#F3E5AB";
        ctx.textAlign = "center";
        ctx.font = `${Math.round(width / 26)}px serif`;
        ctx.fillText("AGOLMEN'S COMPASS", width / 2, height * .16);
        ctx.font = `${Math.round(width / 55)}px sans-serif`;
        ctx.fillText("CELESTIAL MANDALA · ILLUSTRATIVE ART", width / 2, height * .83);
        const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(b => b ? resolve(b) : reject(new Error("PNG unavailable")), "image/png"));
        return { blob, width, height };
      } finally { gl.setRenderTarget(null); target.dispose(); }
    });
    return () => onCapture(null);
  }, [gl, scene, camera, onCapture]);
  return null;
}

function Mandala({ sky, colors, element, progress, reduced }: Omit<Props, "onCapture">) {
  const aura = useRef<THREE.Points>(null);
  const mandala = useRef<THREE.Group>(null);
  const main = colors[0] ?? "#D4AF37";
  const sub = colors[1] ?? "#F3E5AB";
  const seed = useMemo(() => sky.bodies.reduce((sum, body) => sum + Math.round(body.longitude * 10), 0), [sky]);
  const particles = useMemo(() => {
    const count = 1440;
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const [x, y] = spiralPoint(i, count, 5.35);
      pts[i * 3] = x;
      pts[i * 3 + 1] = y;
      pts[i * 3 + 2] = (seededUnit(seed, i) - .5) * 1.8;
    }
    return pts;
  }, [seed]);
  useFrame((_, raw) => {
    if (reduced) return;
    const dt = Math.min(raw, .05);
    // Keep calculated planet directions fixed; only decorative particles move.
    if (aura.current) aura.current.rotation.z -= dt * .025;
    if (mandala.current) {
      mandala.current.rotation.z += dt * .006;
      mandala.current.rotation.x = Math.sin(performance.now() * .00018) * .035;
    }
  });
  const ease = (t: number) => { const x = Math.min(1, Math.max(0, t)); return x * x * (3 - 2 * x); };
  const ring = ease((progress - 1.8) / 2.6);
  const flower = ease((progress - 4.4) / 2.6);
  const planet = ease((progress - 2.7) / 3);
  const gold = "#F3E5AB"; // scene fallback; DOM tokens passed in from computed CSS
  return <>
    <color attach="background" args={["#050B18"]} />
    <ambientLight intensity={1.3} />
    <directionalLight position={[3, 5, 8]} intensity={2.4} color={gold} />
    <pointLight position={[-4, -2, 4]} intensity={2.2} color={sub} />
    <Environment><Lightformer intensity={2} position={[0, 5, 5]} scale={[10, 10, 1]} /><Lightformer intensity={1} color={main} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[10, 1, 1]} /></Environment>
    <group ref={mandala}>
      <points ref={aura} scale={.08 + ease(progress / 2.2) * .92}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
        <pointsMaterial color={main} size={.02} transparent opacity={.85} sizeAttenuation depthWrite={false} />
      </points>
      <points scale={.82 + flower * .18} rotation-z={Math.PI / 7}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
        <pointsMaterial color={sub} size={.009} transparent opacity={.42} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {Array.from({ length: 5 }, (_, i) => <mesh key={`element-${i}`} scale={ring} rotation={[.15 * i, .12 * i, i * .19]}>
        <torusGeometry args={[2.7 + i * .32, .008 + (i === 0 ? .014 : 0), 6, 128]} />
        <meshBasicMaterial color={i % 2 ? sub : gold} transparent opacity={element === ["木", "火", "土", "金", "水"][i] ? .9 : .37} />
      </mesh>)}
      {Array.from({ length: 8 }, (_, i) => <mesh key={`facet-${i}`} rotation-z={i * Math.PI / 4 + (1 - ring) * .3} scale={.08 + ring * .92}>
        <torusGeometry args={[3.16 + i % 2 * .14, .005, 3, 8]} />
        <meshBasicMaterial color={i % 2 ? main : gold} transparent opacity={i % 2 ? .28 : .44} />
      </mesh>)}
      {Array.from({ length: 36 }, (_, i) => <group key={`ray-${i}`} rotation-z={i * Math.PI / 18} scale={.1 + flower * .9}>
        <mesh position={[0, 3.98, -.12]}><boxGeometry args={[.012, i % 3 === 0 ? .34 : .16, .01]} /><meshBasicMaterial color={i % 3 ? main : gold} transparent opacity={i % 3 ? .45 : .8} /></mesh>
        {i % 3 === 0 && <mesh position={[0, 4.29, -.12]} rotation-z={Math.PI / 4}><planeGeometry args={[.065, .065]} /><meshBasicMaterial color={gold} transparent opacity={.88} side={THREE.DoubleSide} /></mesh>}
      </group>)}
      {Array.from({ length: 24 }, (_, i) => <group key={`petal-${i}`} rotation-z={i * Math.PI / 12} scale={.1 + flower * .9}>
        <mesh position={[0, 2.65, -.17]} scale={[.5, 1.15, 1]}><torusGeometry args={[.48, .009, 5, 64]} /><meshBasicMaterial color={colors[i % colors.length] ?? main} transparent opacity={.58} blending={THREE.AdditiveBlending} /></mesh>
        <mesh position={[0, 3.12, -.15]} rotation-z={Math.PI / 4}><octahedronGeometry args={[.075]} /><meshBasicMaterial color={colors[(i + 1) % colors.length] ?? sub} transparent opacity={.82} /></mesh>
      </group>)}
      {Array.from({ length: 12 }, (_, i) => <group key={`inner-${i}`} rotation-z={i * Math.PI / 6} scale={.1 + flower * .9}>
        <mesh position={[0, 1.55, -.16]} scale={[.38, 1, 1]}><torusGeometry args={[.56, .012, 5, 64]} /><meshBasicMaterial color={gold} transparent opacity={.7} /></mesh>
      </group>)}
      {Array.from({ length: 19 }, (_, i) => {
        const outer = i >= 7;
        const n = outer ? 12 : 6;
        const k = outer ? i - 7 : i - 1;
        const a = (k / n) * Math.PI * 2;
        const radius = outer ? 2.03 : 1.03;
        return <mesh key={`flower-${i}`} position={i === 0 ? [0, 0, -.23] : [Math.cos(a) * radius, Math.sin(a) * radius, -.23]} scale={.1 + flower * .9}>
          <torusGeometry args={[outer ? 1.05 : 1.03, outer ? .008 : .012, 5, 96]} />
          <meshBasicMaterial color={i % 3 ? gold : main} transparent opacity={outer ? .38 : .7} side={THREE.DoubleSide} />
        </mesh>;
      })}
      {Array.from({ length: 3 }, (_, i) => <mesh key={`oct-${i}`} rotation-z={i * Math.PI / 12} scale={.1 + flower * .9}>
        <torusGeometry args={[3.7 + i * .12, .014, 5, 8]} />
        <meshBasicMaterial color={i === 1 ? main : gold} transparent opacity={.7} />
      </mesh>)}
      {Array.from({ length: 89 }, (_, i) => { const angle = i * GOLDEN_ANGLE; const radius = .16 * Math.sqrt(i) * flower; return <mesh key={`golden-${i}`} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, .08 + i * .001]} scale={.15 + flower * .85}><sphereGeometry args={[.018 + (i % 8 === 0 ? .015 : 0), 8, 8]} /><meshBasicMaterial color={colors[i % colors.length] ?? gold} transparent opacity={.35 + (i % 5) * .1} blending={THREE.AdditiveBlending} /></mesh>; })}
      <mesh scale={.55 + flower * .3}><icosahedronGeometry args={[.86, 3]} /><meshPhysicalMaterial color={main} metalness={.6} roughness={.15} emissive={main} emissiveIntensity={.3} clearcoat={1} /></mesh>
      <pointLight color={main} intensity={5 * flower} distance={8} />
      <mesh scale={1.1 + flower * .25}><torusGeometry args={[.85, .025, 8, 96]} /><meshBasicMaterial color={gold} /></mesh>
      <group scale={planet}>
        {sky.bodies.map((body) => <group key={`chart-${body.name}`}>
          <Line points={[[0, 0, .25], body.chartPosition]} color={gold} lineWidth={.7} transparent opacity={.25} />
          <mesh position={body.chartPosition}><octahedronGeometry args={[.075]} /><meshBasicMaterial color={main} /></mesh>
        </group>)}
        {sky.bodies.flatMap((a, i) => sky.bodies.slice(i + 1).map(b => {
          const separation = Math.abs(a.longitude - b.longitude);
          const angle = Math.min(separation, 360 - separation);
          const harmony = [60, 120].some(target => Math.abs(angle - target) <= 6);
          const tension = [90, 180].some(target => Math.abs(angle - target) <= 6);
          return harmony || tension ? <Line key={`${a.name}-${b.name}`} points={[a.chartPosition, b.chartPosition]} color={harmony ? main : sub} lineWidth={1} transparent opacity={.6} /> : null;
        }))}
      </group>
      {sky.bodies.map((body, i) => <group key={body.name} position={body.position} scale={planet}>
        <mesh><sphereGeometry args={[i === 0 ? .16 : i === 1 ? .12 : .085 + i * .014, 20, 16]} /><meshStandardMaterial color={i % 2 ? sub : gold} emissive={i % 2 ? sub : gold} emissiveIntensity={.32} metalness={.48} roughness={.27} /></mesh>
        <mesh rotation-x={i * .3}><torusGeometry args={[.21 + i * .015, .006, 4, 48]} /><meshBasicMaterial color={gold} transparent opacity={.55} /></mesh>
      </group>)}
    </group>
  </>;
}

export default function MandalaScene({ onCapture, ...props }: Props) {
  return <Canvas aria-label="出生10天体の黄経と角度を重ねた固定カメラ曼陀羅" camera={{ position: [0, 0, 12], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
    <Mandala {...props} />
    <CaptureBridge onCapture={onCapture} />
  </Canvas>;
}
