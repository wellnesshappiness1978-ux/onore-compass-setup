import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GOLDEN_ANGLE, seededUnit, spiralPoint } from "@/lib/art-geometry";

export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: string[]; element: string; progress: number; reduced: boolean; onCapture: (capture: Capture | null) => void };

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

function Mandala({ colors, element, progress, reduced }: Omit<Props, "onCapture">) {
  const aura = useRef<THREE.Points>(null);
  const mandala = useRef<THREE.Group>(null);
  const main = colors[0] ?? "#D4AF37";
  const sub = colors[1] ?? "#F3E5AB";
  const seed = useMemo(() => colors.join("").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0), [colors]);
  const palette = colors.length > 0 ? colors.slice(0, 6) : ["#D4AF37"];
  const shell = useMemo(() => Array.from({ length: 240 }, (_, i) => {
    const angle = i * .09;
    const radius = .075 * Math.exp(.155 * angle);
    return [Math.cos(angle) * radius - .34, Math.sin(angle) * radius * .84, .18] as [number, number, number];
  }), []);
  const particles = useMemo(() => {
    const count = 1440;
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const [x, y] = spiralPoint(i, count, 5.35);
      pts[i * 3] = x;
      pts[i * 3 + 1] = y;
      pts[i * 3 + 2] = (seededUnit(seed, i) - .5) * .45;
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
    <color attach="background" args={["#15101f"]} />
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
      {Array.from({ length: 5 }, (_, i) => <mesh key={`element-${i}`} scale={ring} rotation={[.15 * i, .12 * i, i * .19]}>
        <torusGeometry args={[2.7 + i * .32, .008 + (i === 0 ? .014 : 0), 6, 128]} />
        <meshBasicMaterial color={palette[(i + 1) % palette.length]} transparent opacity={element === ["木", "火", "土", "金", "水"][i] ? .9 : .37} />
      </mesh>)}
      {Array.from({ length: 8 }, (_, i) => <mesh key={`facet-${i}`} rotation-z={i * Math.PI / 4 + (1 - ring) * .3} scale={.08 + ring * .92}>
        <torusGeometry args={[3.16 + i % 2 * .14, .005, 3, 8]} />
        <meshBasicMaterial color={palette[(i + 2) % palette.length]} transparent opacity={i % 2 ? .28 : .44} />
      </mesh>)}
      {Array.from({ length: 36 }, (_, i) => <group key={`ray-${i}`} rotation-z={i * Math.PI / 18} scale={.1 + flower * .9}>
        <mesh position={[0, 3.98, -.12]}><boxGeometry args={[.012, i % 3 === 0 ? .34 : .16, .01]} /><meshBasicMaterial color={palette[i % palette.length]} transparent opacity={i % 3 ? .45 : .8} /></mesh>
        {i % 3 === 0 && <mesh position={[0, 4.29, -.12]} rotation-z={Math.PI / 4}><planeGeometry args={[.065, .065]} /><meshBasicMaterial color={palette[(i + 3) % palette.length]} transparent opacity={.88} side={THREE.DoubleSide} /></mesh>}
      </group>)}
      {Array.from({ length: 24 }, (_, i) => <group key={`petal-${i}`} rotation-z={i * Math.PI / 12} scale={.1 + flower * .9}>
        <mesh position={[0, 2.65, -.17]} scale={[.5, 1.15, 1]}><torusGeometry args={[.48, .009, 5, 64]} /><meshBasicMaterial color={colors[i % colors.length] ?? main} transparent opacity={.58} blending={THREE.AdditiveBlending} /></mesh>
        <mesh position={[0, 3.12, -.15]} rotation-z={Math.PI / 4}><octahedronGeometry args={[.075]} /><meshBasicMaterial color={colors[(i + 1) % colors.length] ?? sub} transparent opacity={.82} /></mesh>
      </group>)}
      {Array.from({ length: 12 }, (_, i) => <group key={`inner-${i}`} rotation-z={i * Math.PI / 6} scale={.1 + flower * .9}>
        <mesh position={[0, 1.55, -.16]} scale={[.38, 1, 1]}><torusGeometry args={[.56, .012, 5, 64]} /><meshBasicMaterial color={palette[i % palette.length]} transparent opacity={.7} /></mesh>
      </group>)}
      {Array.from({ length: 19 }, (_, i) => {
        const outer = i >= 7;
        const n = outer ? 12 : 6;
        const k = outer ? i - 7 : i - 1;
        const a = (k / n) * Math.PI * 2;
        const radius = outer ? 2.03 : 1.03;
        return <mesh key={`flower-${i}`} position={i === 0 ? [0, 0, -.23] : [Math.cos(a) * radius, Math.sin(a) * radius, -.23]} scale={.1 + flower * .9}>
          <torusGeometry args={[outer ? 1.05 : 1.03, outer ? .008 : .012, 5, 96]} />
          <meshBasicMaterial color={palette[i % palette.length]} transparent opacity={outer ? .38 : .7} side={THREE.DoubleSide} />
        </mesh>;
      })}
      {Array.from({ length: 3 }, (_, i) => <mesh key={`oct-${i}`} rotation-z={i * Math.PI / 12} scale={.1 + flower * .9}>
        <torusGeometry args={[3.7 + i * .12, .014, 5, 8]} />
        <meshBasicMaterial color={palette[(i + 4) % palette.length]} transparent opacity={.7} />
      </mesh>)}
      {Array.from({ length: 89 }, (_, i) => { const angle = i * GOLDEN_ANGLE; const radius = .16 * Math.sqrt(i) * flower; return <mesh key={`golden-${i}`} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, .08 + i * .001]} scale={.15 + flower * .85}><sphereGeometry args={[.018 + (i % 8 === 0 ? .015 : 0), 8, 8]} /><meshBasicMaterial color={palette[i % palette.length]} transparent opacity={.35 + (i % 5) * .1} blending={THREE.AdditiveBlending} /></mesh>; })}
      <group scale={.18 + flower * .82} rotation-z={-.48}><Line points={shell} color={palette[4 % palette.length]} lineWidth={1.05} transparent opacity={.22} /><Line points={shell.map(([x, y, z]) => [x * 1.035, y * 1.035, z + .01] as [number, number, number])} color={palette[2 % palette.length]} lineWidth={.45} transparent opacity={.32} /></group>
      <mesh scale={.55 + flower * .3}><icosahedronGeometry args={[.86, 3]} /><meshPhysicalMaterial color={main} metalness={.6} roughness={.15} emissive={main} emissiveIntensity={.3} clearcoat={1} /></mesh>
      <pointLight color={main} intensity={5 * flower} distance={8} />
      <mesh scale={1.1 + flower * .25}><torusGeometry args={[.85, .025, 8, 96]} /><meshBasicMaterial color={main} /></mesh>
      {Array.from({ length: 6 }, (_, ringIndex) => {
        const count = 6 + ringIndex * 6;
        const radius = .75 + ringIndex * .58;
        return <group key={`color-ring-${ringIndex}`} scale={.1 + flower * .9}>{Array.from({ length: count }, (_, i) => {
          const angle = i / count * Math.PI * 2 + ringIndex * GOLDEN_ANGLE;
          const color = colors[(i + ringIndex) % colors.length] ?? main;
          const point: [number, number, number] = [Math.cos(angle) * radius, Math.sin(angle) * radius, -.05 + ringIndex * .015];
          const nextAngle = (i + 1) / count * Math.PI * 2 + ringIndex * GOLDEN_ANGLE;
          const next: [number, number, number] = [Math.cos(nextAngle) * radius, Math.sin(nextAngle) * radius, -.05 + ringIndex * .015];
          return <group key={i}><Line points={[point, next]} color={color} lineWidth={.7} transparent opacity={.48} /><mesh position={point} rotation-z={angle}><circleGeometry args={[.045 + ringIndex * .006, 6]} /><meshBasicMaterial color={color} transparent opacity={.82} /></mesh></group>;
        })}</group>;
      })}
    </group>
  </>;
}

export default function MandalaScene({ onCapture, ...props }: Props) {
  return <Canvas aria-label="6つのバースカラーによる光の幾何学曼陀羅" camera={{ position: [0, 0, 12], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
    <Mandala {...props} />
    <CaptureBridge onCapture={onCapture} />
  </Canvas>;
}
