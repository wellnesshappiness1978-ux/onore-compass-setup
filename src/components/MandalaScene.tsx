import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GOLDEN_ANGLE, seededUnit } from "@/lib/art-geometry";

export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: string[]; element: string; progress: number; reduced: boolean; onCapture: (capture: Capture | null) => void };

function CaptureBridge({ onCapture }: { onCapture: Props["onCapture"] }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    onCapture(async () => {
      const max = Math.min(gl.capabilities.maxTextureSize, 3840);
      const size = max >= 2048 ? 2048 : 1024;
      const target = new THREE.WebGLRenderTarget(size, size);
      try {
        const pixels = new Uint8Array(size * size * 4);
        gl.setRenderTarget(target); gl.clear(); gl.render(scene, camera);
        gl.readRenderTargetPixels(target, 0, 0, size, size, pixels); gl.setRenderTarget(null);
        const square = document.createElement("canvas"); square.width = square.height = size;
        const cx = square.getContext("2d"); if (!cx) throw new Error("Canvas unavailable");
        const image = cx.createImageData(size, size);
        for (let y = 0; y < size; y++) image.data.set(pixels.subarray((size - y - 1) * size * 4, (size - y) * size * 4), y * size * 4);
        cx.putImageData(image, 0, 0);
        const width = size === 2048 ? 2160 : 1080, height = size === 2048 ? 3840 : 1920;
        const out = document.createElement("canvas"); out.width = width; out.height = height;
        const ctx = out.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
        ctx.fillStyle = colorsToBackdrop(scene.userData["palette"] as string[] | undefined); ctx.fillRect(0, 0, width, height);
        ctx.drawImage(square, 0, (height - width) / 2, width, width);
        ctx.fillStyle = scene.userData["main"] as string || "#D4AF37"; ctx.textAlign = "center";
        ctx.font = `${Math.round(width / 27)}px serif`; ctx.fillText("AGOLMEN'S COMPASS", width / 2, height * .16);
        ctx.font = `${Math.round(width / 58)}px sans-serif`; ctx.fillText("BIRTH COLOR MANDALA · ILLUSTRATIVE ART", width / 2, height * .83);
        const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(b => b ? resolve(b) : reject(new Error("PNG unavailable")), "image/png"));
        return { blob, width, height };
      } finally { gl.setRenderTarget(null); target.dispose(); }
    });
    return () => onCapture(null);
  }, [gl, scene, camera, onCapture]);
  return null;
}

function colorsToBackdrop(colors?: string[]) { return colors?.[5] ?? colors?.[0] ?? "#100d18"; }
const point = (radius: number, angle: number, z = 0): [number, number, number] => [Math.cos(angle) * radius, Math.sin(angle) * radius, z];

function Diamond({ color, scale = 1 }: { color: string; scale?: number }) {
  return <mesh rotation-z={Math.PI / 4} scale={scale}><planeGeometry args={[.095, .095]} /><meshBasicMaterial color={color} transparent opacity={.78} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} /></mesh>;
}

function Mandala({ colors, progress, reduced }: Omit<Props, "onCapture" | "element">) {
  const work = useRef<THREE.Group>(null);
  const palette = useMemo<[string, string, string, string, string, string]>(() => {
    const fallback = colors[0] ?? "#D4AF37";
    return [colors[0] ?? fallback, colors[1] ?? fallback, colors[2] ?? fallback, colors[3] ?? fallback, colors[4] ?? fallback, colors[5] ?? fallback];
  }, [colors]);
  const main = palette[0];
  const seed = useMemo(() => palette.join("").split("").reduce((n, c) => n + c.charCodeAt(0), 0), [palette]);
  const bloom = Math.min(1, Math.max(0, progress / 7));
  const ease = bloom * bloom * (3 - 2 * bloom);
  const shell = useMemo(() => Array.from({ length: 340 }, (_, i) => {
    const a = i * .065, r = .018 * Math.exp(.154 * a);
    return [Math.cos(a) * r - .32, Math.sin(a) * r - .12, -.5] as [number, number, number];
  }), []);
  const dust = useMemo(() => {
    const positions = new Float32Array(2600 * 3);
    for (let i = 0; i < 2600; i++) {
      const a = i * GOLDEN_ANGLE, r = .32 + Math.sqrt(i / 2600) * 4.65;
      positions[i * 3] = Math.cos(a) * r; positions[i * 3 + 1] = Math.sin(a) * r;
      positions[i * 3 + 2] = -.34 + seededUnit(seed, i) * .24;
    }
    return positions;
  }, [seed]);
  useFrame((state, delta) => {
    if (!reduced && work.current) {
      work.current.rotation.z += Math.min(delta, .04) * .008;
      work.current.scale.setScalar(.985 + Math.sin(state.clock.elapsedTime * .42) * .012);
    }
  });
  return <>
    <color attach="background" args={[colorsToBackdrop(palette)]} />
    <group ref={work} scale={.12 + ease * .88}>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[dust, 3]} /></bufferGeometry>
        <pointsMaterial color={palette[4]} size={.012} transparent opacity={.38} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {/* A nearly hidden nautilus proportion system, never a literal shell illustration. */}
      <group rotation-z={-.42} scale={1.06}>
        <Line points={shell} color={palette[2]} lineWidth={.55} transparent opacity={.14} />
        {[.42, .58, .78, 1].map((s, i) => <Line key={s} points={shell.map(([x,y,z]) => [x*s, y*s, z - i*.002] as [number,number,number])} color={palette[(i + 3) % 6]} lineWidth={.28} transparent opacity={.09} />)}
      </group>

      {/* Dot-painted concentric fields. */}
      {Array.from({ length: 14 }, (_, ring) => {
        const count = 18 + ring * 8, radius = .44 + ring * .31;
        return <group key={`dots-${ring}`} rotation-z={ring * GOLDEN_ANGLE}>
          {Array.from({ length: count }, (_, i) => {
            const a = i / count * Math.PI * 2;
            const size = .028 + (ring % 4 === 0 ? .026 : 0) + seededUnit(seed + ring, i) * .012;
            return <mesh key={i} position={point(radius, a, -.18 + ring * .008)} rotation-z={a + Math.PI / 4}>
              <circleGeometry args={[size, 10]} /><meshBasicMaterial color={palette[(ring + i) % 6]} transparent opacity={.5 + (i % 5) * .08} blending={THREE.AdditiveBlending} />
            </mesh>;
          })}
        </group>;
      })}

      {/* Interlaced pointed petals and jewel facets replace repetitive round forms. */}
      {[12, 18, 24, 36].map((count, layer) => {
        const radius = 1.1 + layer * .82;
        return <group key={`petals-${count}`} rotation-z={layer * Math.PI / count}>
          {Array.from({ length: count }, (_, i) => {
            const a = i / count * Math.PI * 2, length = .72 + layer * .13;
            const p = point(radius, a, .01 + layer * .015);
            const left = point(radius - length * .58, a - Math.PI / count * .78, p[2]);
            const tip = point(radius + length, a, p[2]);
            const right = point(radius - length * .58, a + Math.PI / count * .78, p[2]);
            return <group key={i}>
              <Line points={[left, tip, right]} color={palette[(i + layer) % 6]} lineWidth={layer < 2 ? 1.1 : .65} transparent opacity={.34 + layer * .07} />
              <mesh position={tip} rotation-z={a + Math.PI / 4}><Diamond color={palette[(i + layer + 2) % 6]} scale={layer < 2 ? .8 : .55} /></mesh>
            </group>;
          })}
        </group>;
      })}

      {/* Main color is the unmistakable center, built as a cut-gem rosette rather than a sphere. */}
      {Array.from({ length: 24 }, (_, i) => {
        const a = i / 24 * Math.PI * 2;
        return <mesh key={`core-${i}`} position={point(.31, a, .35)} rotation-z={a} scale={[.28, 1.18, 1]}>
          <circleGeometry args={[.34, 3]} /><meshBasicMaterial color={main} transparent opacity={.9} blending={THREE.AdditiveBlending} />
        </mesh>;
      })}
      <mesh position={[0,0,.42]} rotation-z={Math.PI/4}><circleGeometry args={[.2, 8]} /><meshBasicMaterial color={main} /></mesh>
    </group>
  </>;
}

export default function MandalaScene({ onCapture, ...props }: Props) {
  return <Canvas aria-label="6つのバースカラーによる光と幾何学の曼陀羅" camera={{ position: [0, 0, 11.5], fov: 48 }} dpr={[1, 1.6]} gl={{ antialias: true, preserveDrawingBuffer: true }} onCreated={({ scene }) => { scene.userData["palette"] = props.colors; scene.userData["main"] = props.colors[0]; }}>
    <Mandala {...props} /><CaptureBridge onCapture={onCapture} />
  </Canvas>;
}