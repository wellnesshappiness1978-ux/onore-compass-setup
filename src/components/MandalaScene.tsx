import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GOLDEN_ANGLE, goldLeafTransform, layeredSpiralPoint, logarithmicSpiralPoint, seededUnit, spiralPoint, type MandalaIntention } from "@/lib/art-geometry";

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

function makeImpastoTexture(seed: number) {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const broad = Math.sin(x * .18 + Math.sin(y * .035) * 5) * 34;
    const bristle = Math.sin((x + y) * .61) * 18;
    const grain = (seededUnit(seed + x * 17, y * 31) - .5) * 62;
    const value = Math.max(24, Math.min(238, 128 + broad + bristle + grain));
    data[i] = value; data[i + 1] = value; data[i + 2] = value; data[i + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

function DotRing({ count, radius, dot, colors, texture, offset = 0, opacity = .9 }: { count: number; radius: number; dot: number; colors: string[]; texture: THREE.Texture; offset?: number; opacity?: number }) {
  return <group>{Array.from({ length: count }, (_, i) => {
    const angle = i / count * Math.PI * 2 + offset;
    const pulse = i % 6 === 0 ? 1.65 : i % 3 === 0 ? 1.25 : .86 + (i % 5) * .055;
    return <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, .02 + (i % 4) * .008]} rotation-z={angle * .7} scale={[1.3, .82, 1]}><circleGeometry args={[dot * pulse, 12]} /><meshStandardMaterial color={colors[i % colors.length] ?? "#D4AF37"} bumpMap={texture} bumpScale={.06} roughness={.44} metalness={.08} transparent opacity={opacity} emissive={colors[i % colors.length] ?? "#D4AF37"} emissiveIntensity={.18} /></mesh>;
  })}</group>;
}

function GoldLeafField({ seed, count, radius, texture, progress }: { seed: number; count: number; radius: number; texture: THREE.Texture; progress: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      const leaf = goldLeafTransform(seed, i, radius);
      dummy.position.set(leaf.x, leaf.y, .2 + seededUnit(seed + 93, i) * .18);
      dummy.rotation.set(seededUnit(seed, i) * .45, seededUnit(seed + 5, i) * .45, leaf.rotation);
      dummy.scale.set(.025 * leaf.scale * (1 + i % 3), .07 * leaf.scale, .45);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy, radius, seed]);
  return <instancedMesh ref={mesh} args={[undefined, undefined, count]} scale={Math.max(.01, progress)}>
    <circleGeometry args={[1, 5]} />
    <meshPhysicalMaterial color="#D4AF37" emissive="#F3E5AB" emissiveIntensity={.2} metalness={.92} roughness={.2} clearcoat={1} clearcoatRoughness={.16} bumpMap={texture} bumpScale={.09} side={THREE.DoubleSide} />
  </instancedMesh>;
}

function ImpastoSpiral({ arm, colors, texture, progress }: { arm: number; colors: string[]; texture: THREE.Texture; progress: number }) {
  const count = 76;
  return <group scale={Math.max(.02, progress)}>{Array.from({ length: count }, (_, i) => {
    const [x, y] = layeredSpiralPoint(i, count, arm, 6, 5.05);
    const color = colors[(arm + i) % colors.length] ?? colors[0] ?? "#D4AF37";
    const size = .035 + (i % 9 === 0 ? .045 : 0) + i / count * .018;
    return <mesh key={i} position={[x, y, .1 + arm * .012]} rotation-z={i * GOLDEN_ANGLE} scale={[1.8, .72, 1]}>
      <circleGeometry args={[size, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={.2} bumpMap={texture} bumpScale={.08} roughness={.46} metalness={.06} transparent opacity={.58 + (i % 4) * .09} />
    </mesh>;
  })}</group>;
}

function Mandala({ colors, intention, progress, reduced }: Omit<Props, "onCapture">) {
  const aura = useRef<THREE.Points>(null);
  const mandala = useRef<THREE.Group>(null);
  const main = colors[0] ?? "#D4AF37";
  const sub = colors[1] ?? "#F3E5AB";
  const seed = useMemo(() => colors.join("").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0), [colors]);
  const palette = useMemo(() => colors.length > 0 ? colors.slice(0, 7) : ["#D4AF37"], [colors]);
  const texture = useMemo(() => makeImpastoTexture(seed), [seed]);
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
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame((_, raw) => {
    if (reduced) return;
    const dt = Math.min(raw, .05);
    // Keep calculated planet directions fixed; only decorative particles move.
    if (aura.current) aura.current.rotation.z -= dt * .012;
    if (mandala.current) {
      mandala.current.rotation.z += dt * .0025;
      mandala.current.rotation.x = Math.sin(performance.now() * .00013) * .026;
      const breath = 1 + Math.sin(performance.now() * .00042) * .008;
      mandala.current.scale.setScalar(breath);
    }
  });
  const ease = (t: number) => { const x = Math.min(1, Math.max(0, t)); return x * x * (3 - 2 * x); };
  const ring = ease((progress - 1.8) / 2.6);
  const flower = ease((progress - 4.4) / 2.6);
  return <>
    <color attach="background" args={["#09080d"]} />
    <ambientLight intensity={.82} />
    <directionalLight position={[3.5, 5.5, 8]} intensity={3.4} color={main} />
    <directionalLight position={[-5, -2, 5]} intensity={2.1} color={sub} />
    <pointLight position={[0, 0, 5]} intensity={3.2} color="#F3E5AB" distance={13} />
    <group ref={mandala}>
      <mesh position={[0, 0, -.48]}>
        <circleGeometry args={[5.48, 160]} />
        <meshStandardMaterial color="#09080d" bumpMap={texture} bumpScale={.2} roughness={.88} metalness={.02} />
      </mesh>
      {[5.08, 4.58, 3.96, 3.34, 2.72, 2.1, 1.48].map((radius, i) => <mesh key={`paint-wash-${radius}`} position={[0, 0, -.38 + i * .025]}>
        <ringGeometry args={[Math.max(.1, radius - .65), radius, 128]} />
        <meshStandardMaterial color={palette[i % palette.length] ?? main} emissive={palette[i % palette.length] ?? main} emissiveIntensity={.04} bumpMap={texture} bumpScale={.14} roughness={.74} metalness={.03} transparent opacity={.11 + i * .012} side={THREE.DoubleSide} />
      </mesh>)}
      <points ref={aura} scale={.08 + ease(progress / 2.2) * .92}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
        <pointsMaterial color={main} size={.023} transparent opacity={.68} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points scale={.82 + flower * .18} rotation-z={Math.PI / 7}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
        <pointsMaterial color={sub} size={.009} transparent opacity={.42} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {Array.from({ length: 48 }, (_, i) => <group key={`petal-${i}`} rotation-z={i * Math.PI / 24} scale={.08 + flower * .92}>
        <mesh position={[0, 3.34, -.08]} scale={[.42, 1.48, 1]}><torusGeometry args={[.64, .017 + i % 3 * .004, 7, 80]} /><meshStandardMaterial color={palette[(i + 2) % palette.length] ?? main} emissive={palette[(i + 2) % palette.length] ?? main} emissiveIntensity={.15} bumpMap={texture} bumpScale={.1} roughness={.5} transparent opacity={i % 2 ? .4 : .72} /></mesh>
        <mesh position={[0, 4.08, -.04]} scale={[.3, .78, 1]}><torusGeometry args={[.42, .014, 7, 56]} /><meshPhysicalMaterial color={palette[(i + 4) % palette.length] ?? sub} emissive={palette[(i + 4) % palette.length] ?? sub} emissiveIntensity={.16} roughness={.38} clearcoat={.5} transparent opacity={.68} /></mesh>
      </group>)}
      {Array.from({ length: 24 }, (_, i) => <group key={`inner-${i}`} rotation-z={i * Math.PI / 12} scale={.1 + flower * .9}><mesh position={[0, 1.85, -.02]} scale={[.38, 1.18, 1]}><torusGeometry args={[.59, .022, 7, 72]} /><meshStandardMaterial color={palette[i % palette.length] ?? main} emissive={palette[i % palette.length] ?? main} emissiveIntensity={.12} bumpMap={texture} bumpScale={.09} roughness={.48} transparent opacity={.75} /></mesh></group>)}
      {Array.from({ length: 377 }, (_, i) => { const angle = i * GOLDEN_ANGLE; const radius = .1 * Math.sqrt(i) * flower; return <mesh key={`golden-${i}`} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, .12 + i % 5 * .006]} rotation-z={angle} scale={[1.4, .78, 1]}><circleGeometry args={[.014 + (i % 13 === 0 ? .024 : 0), 10]} /><meshStandardMaterial color={palette[i % palette.length] ?? main} emissive={palette[i % palette.length] ?? main} emissiveIntensity={.26} bumpMap={texture} bumpScale={.07} roughness={.42} transparent opacity={.48 + (i % 4) * .11} /></mesh>; })}
      {Array.from({ length: 6 }, (_, arm) => <ImpastoSpiral key={`impasto-${arm}`} arm={arm} colors={palette} texture={texture} progress={flower} />)}
      <group scale={.12 + flower * .88}><Line points={spiral} color={palette[2] ?? main} lineWidth={1.45} transparent opacity={.55} /><Line points={spiral.map(([x, y, z]) => [-x, y, z + .01] as [number, number, number])} color={palette[4] ?? sub} lineWidth={1.1} transparent opacity={.48} /></group>
      {[.82, 1.18, 1.55, 2.08, 2.48, 2.92, 3.42, 3.94, 4.48, 4.92].map((radius, index) => <DotRing key={radius} count={24 + index * 10} radius={radius} dot={.034 - index * .0015} colors={palette} texture={texture} offset={index * GOLDEN_ANGLE} opacity={.96 - index * .045} />)}
      <GoldLeafField seed={seed} count={168} radius={5.05} texture={texture} progress={flower} />
      <mesh scale={.16 + flower * .84} position-z={.32}><circleGeometry args={[.58, 96]} /><meshPhysicalMaterial color={main} emissive={main} emissiveIntensity={.28} bumpMap={texture} bumpScale={.18} roughness={.3} metalness={.12} clearcoat={.72} clearcoatRoughness={.22} /></mesh>
      <mesh scale={.2 + flower * .8} position-z={.34}><ringGeometry args={[.59, .73, 96]} /><meshPhysicalMaterial color="#D4AF37" emissive={sub} emissiveIntensity={.2} metalness={.88} roughness={.22} clearcoat={1} /></mesh>
      <mesh scale={.2 + flower * .8} position-z={.36}><ringGeometry args={[.73, .79, 96]} /><meshBasicMaterial color={sub} transparent opacity={.56} blending={THREE.AdditiveBlending} /></mesh>
      <pointLight color={main} intensity={3.4 * flower} distance={5} />
    </group>
  </>;
}

export default function MandalaScene({ onCapture, ...props }: Props) {
  return <Canvas aria-label="7つのバースカラーによる油彩の幾何学曼陀羅" camera={{ position: [0, 0, 12], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: true, preserveDrawingBuffer: true }}>
    <Mandala {...props} />
    <CaptureBridge onCapture={onCapture} />
  </Canvas>;
}
