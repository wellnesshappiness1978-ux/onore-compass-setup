import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GOLDEN_ANGLE, colorsForIntention, logarithmicSpiralPoint, seededUnit, spiralPoint, type MandalaIntention } from "@/lib/art-geometry";

export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: string[]; intention: MandalaIntention; progress: number; reduced: boolean; onCapture: (capture: Capture | null) => void };

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
        ctx.fillStyle = css.getPropertyValue("--card").trim() || "#15101f";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(square, 0, (height - width) / 2, width, width);
        ctx.fillStyle = css.getPropertyValue("--gold-glow").trim() || "#F3E5AB";
        ctx.textAlign = "center";
        ctx.font = `${Math.round(width / 26)}px serif`;
        ctx.fillText("AGOLMEN'S COMPASS", width / 2, height * .16);
        ctx.font = `${Math.round(width / 55)}px sans-serif`;
        ctx.fillText("BIRTH COLOR MANDALA · ILLUSTRATIVE ART", width / 2, height * .83);
        const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(b => b ? resolve(b) : reject(new Error("PNG unavailable")), "image/png"));
        return { blob, width, height };
      } finally { gl.setRenderTarget(null); target.dispose(); }
    });
    return () => onCapture(null);
  }, [gl, scene, camera, onCapture]);
  return null;
}

function DotRing({ count, radius, dot, colors, offset = 0, opacity = .9 }: { count: number; radius: number; dot: number; colors: string[]; offset?: number; opacity?: number }) {
  return <group>{Array.from({ length: count }, (_, i) => {
    const angle = i / count * Math.PI * 2 + offset;
    const pulse = i % 6 === 0 ? 1.45 : i % 3 === 0 ? 1.18 : 1;
    return <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, .02]}><circleGeometry args={[dot * pulse, 10]} /><meshBasicMaterial color={colors[i % colors.length] ?? "#D4AF37"} transparent opacity={opacity} blending={THREE.AdditiveBlending} /></mesh>;
  })}</group>;
}

function Mandala({ colors, intention, progress, reduced }: Omit<Props, "onCapture">) {
  const aura = useRef<THREE.Points>(null);
  const mandala = useRef<THREE.Group>(null);
  const main = colors[0] ?? "#D4AF37";
  const sub = colors[1] ?? "#F3E5AB";
  const seed = useMemo(() => colors.join("").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0), [colors]);
  const palette = useMemo(() => colorsForIntention(colors.length > 0 ? colors.slice(0, 7) : ["#D4AF37"], intention), [colors, intention]);
  const spiral = useMemo(() => Array.from({ length: 320 }, (_, i) => { const [x, y] = logarithmicSpiralPoint(i, 320, 5.25, 3.35); return [x, y, .16] as [number, number, number]; }), []);
  const particles = useMemo(() => {
    const count = 1440;
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const [x, y] = spiralPoint(i, count, 5.35);
      pts[i * 3] = x;
      pts[i * 3 + 1] = y;
      pts[i * 3 + 2] = (seededUnit(seed, i) - .5) * .12;
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
  return <>
    <color attach="background" args={["#09080d"]} />
    <ambientLight intensity={1.8} />
    <directionalLight position={[3, 5, 8]} intensity={2.2} color={main} />
    <pointLight position={[-4, -2, 4]} intensity={2.6} color={sub} />
    <group ref={mandala}>
      <points ref={aura} scale={.08 + ease(progress / 2.2) * .92}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
        <pointsMaterial color={main} size={.02} transparent opacity={.85} sizeAttenuation depthWrite={false} />
      </points>
      <points scale={.82 + flower * .18} rotation-z={Math.PI / 7}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
        <pointsMaterial color={sub} size={.009} transparent opacity={.42} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {Array.from({ length: 48 }, (_, i) => <group key={`petal-${i}`} rotation-z={i * Math.PI / 24} scale={.08 + flower * .92}>
        <mesh position={[0, 3.34, -.12]} scale={[.42, 1.48, 1]}><torusGeometry args={[.64, .009, 5, 80]} /><meshBasicMaterial color={palette[(i + 2) % palette.length] ?? main} transparent opacity={i % 2 ? .33 : .61} blending={THREE.AdditiveBlending} /></mesh>
        <mesh position={[0, 4.08, -.1]} scale={[.3, .78, 1]}><torusGeometry args={[.42, .008, 5, 56]} /><meshBasicMaterial color={palette[(i + 4) % palette.length] ?? sub} transparent opacity={.55} /></mesh>
      </group>)}
      {Array.from({ length: 24 }, (_, i) => <group key={`inner-${i}`} rotation-z={i * Math.PI / 12} scale={.1 + flower * .9}><mesh position={[0, 1.85, -.16]} scale={[.38, 1.18, 1]}><torusGeometry args={[.59, .011, 5, 72]} /><meshBasicMaterial color={palette[i % palette.length] ?? main} transparent opacity={.68} /></mesh></group>)}
      {Array.from({ length: 233 }, (_, i) => { const angle = i * GOLDEN_ANGLE; const radius = .115 * Math.sqrt(i) * flower; return <mesh key={`golden-${i}`} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, .08]}><circleGeometry args={[.016 + (i % 13 === 0 ? .019 : 0), 8]} /><meshBasicMaterial color={palette[i % palette.length] ?? main} transparent opacity={.45 + (i % 4) * .12} blending={THREE.AdditiveBlending} /></mesh>; })}
      <group scale={.12 + flower * .88}><Line points={spiral} color={palette[2] ?? main} lineWidth={1} transparent opacity={.42} /><Line points={spiral.map(([x, y, z]) => [-x, y, z + .01] as [number, number, number])} color={palette[4] ?? sub} lineWidth={.7} transparent opacity={.34} /></group>
      {[.82, 1.18, 1.55, 2.38, 2.82, 3.78, 4.72].map((radius, index) => <DotRing key={radius} count={24 + index * 12} radius={radius} dot={.032 - index * .0017} colors={palette} offset={index * GOLDEN_ANGLE} opacity={.94 - index * .06} />)}
      <mesh scale={.16 + flower * .84}><circleGeometry args={[.52, 64]} /><meshBasicMaterial color={main} transparent opacity={.96} blending={THREE.AdditiveBlending} /></mesh>
      <mesh scale={.2 + flower * .8}><ringGeometry args={[.54, .68, 72]} /><meshBasicMaterial color={sub} transparent opacity={.86} blending={THREE.AdditiveBlending} /></mesh>
      <pointLight color={main} intensity={3.4 * flower} distance={5} />
    </group>
  </>;
}

export default function MandalaScene({ onCapture, ...props }: Props) {
  return <Canvas aria-label="7つのバースカラーによる光の幾何学曼陀羅" camera={{ position: [0, 0, 12], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
    <Mandala {...props} />
    <CaptureBridge onCapture={onCapture} />
  </Canvas>;
}
