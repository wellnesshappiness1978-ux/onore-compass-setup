import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Line } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  crystalRosettePoints,
  facetTone,
  flowerOfLifeCenters,
  GOLDEN_ANGLE,
  goldLeafTransform,
  layeredSpiralPoint,
  logarithmicSpiralPoint,
  MANDALA_STYLES,
  pairedWavePoint,
  radialRayTransform,
  regularPolygonPoints,
  seededUnit,
  sparkleTransform,
  vividHexColor,
  type MandalaIntention,
} from "@/lib/art-geometry";

export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: string[]; intention: MandalaIntention; progress: number; reduced: boolean; onCapture: (capture: Capture | null) => void };

const FALLBACK_PALETTE = ["#FFD21C", "#FF168F", "#00CFFF", "#62E000", "#9238FF", "#FF4A16", "#FFB800"];
const COSMIC_BLACK = "#010106";
const GOLD_LIGHT = "#FFD21C";

function pickColor(palette: string[], index: number, fallback = GOLD_LIGHT) {
  return palette[index % Math.max(1, palette.length)] ?? fallback;
}

function CaptureBridge({ colors, intention, onCapture }: { colors: string[]; intention: MandalaIntention; onCapture: Props["onCapture"] }) {
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
        ctx.fillStyle = COSMIC_BLACK;
        ctx.fillRect(0, 0, width, height);
        const halo = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, height * .6);
        halo.addColorStop(0, `${pickColor(colors, 0)}D8`);
        halo.addColorStop(.28, `${MANDALA_STYLES[intention].accent}66`);
        halo.addColorStop(.7, `${pickColor(colors, 4)}20`);
        halo.addColorStop(1, `${COSMIC_BLACK}00`);
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(square, 0, (height - width) / 2, width, width);
        ctx.fillStyle = MANDALA_STYLES[intention].accent;
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
  }, [camera, colors, gl, intention, onCapture, scene]);
  return null;
}

const BACKDROP_VERTEX = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const BACKDROP_FRAGMENT = `
precision highp float; varying vec2 vUv; uniform vec3 uColors[7]; uniform vec3 uAccent; uniform float uTime;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
void main(){vec2 p=vUv*2.0-1.0;float r=length(p);float a=atan(p.y,p.x)/6.2831853+.5;float sector=a*6.0;int i=int(floor(sector));float f=smoothstep(0.0,1.0,fract(sector));vec3 angular=mix(uColors[i],uColors[(i+1)%6],f);float aura=pow(max(0.0,1.0-r/1.3),2.4);float wave=pow(max(0.0,sin(r*44.0-uTime*.12+a*18.0)),8.0);vec3 black=vec3(.001,.0015,.006);vec3 color=black+angular*aura*.23+uAccent*wave*aura*.07;color+=vec3(hash(floor(vUv*320.0))*.006)*aura;gl_FragColor=vec4(color,1.0);}`;

function AuraBackdrop({ palette, accent, reduced }: { palette: string[]; accent: string; reduced: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uColors: { value: Array.from({ length: 7 }, (_, i) => new THREE.Color(pickColor(palette, i))) },
    uAccent: { value: new THREE.Color(accent) },
    uTime: { value: 0 },
  }), [accent, palette]);
  useFrame(state => { const time = material.current?.uniforms["uTime"]; if (time && !reduced) time.value = state.clock.elapsedTime; });
  return <mesh position={[0, 0, -1.4]} scale={[1.25, 1.25, 1]}><planeGeometry args={[12.8, 12.8]} /><shaderMaterial ref={material} uniforms={uniforms} vertexShader={BACKDROP_VERTEX} fragmentShader={BACKDROP_FRAGMENT} depthWrite={false} /></mesh>;
}

function SolidColorField({ palette, intention, progress }: { palette: string[]; intention: MandalaIntention; progress: number }) {
  const style = MANDALA_STYLES[intention];
  const petals = style.pattern === "paired-waves" ? 20 : style.pattern === "octagonal" ? 24 : 30;
  return <group scale={Math.max(.04, progress)}>
    <mesh position-z={-.82}><circleGeometry args={[5.48, 192]} /><meshBasicMaterial color={pickColor(palette, intention === "wealth" ? 2 : intention === "work" ? 3 : intention === "love" ? 4 : intention === "health" ? 5 : 1)} /></mesh>
    {Array.from({ length: petals }, (_, index) => {
      const ring = index % 3;
      const angle = index / petals * Math.PI * 2;
      const radius = 2.2 + ring * 1.02;
      const width = intention === "work" ? .72 : intention === "love" ? 1.2 : .94;
      return <mesh key={`solid-${index}`} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, -.74 + ring * .045]} rotation-z={angle + Math.PI / 2} scale={[width, 1.7 + ring * .38, 1]}>
        <circleGeometry args={[1, intention === "work" ? 6 : intention === "wealth" ? 8 : 48]} />
        <meshBasicMaterial color={pickColor(palette, index + ring)} opacity={1} />
      </mesh>;
    })}
    {[4.95, 4.32, 3.68, 3.02, 2.4, 1.82].map((radius, index) => <mesh key={`dense-ring-${radius}`} position-z={-.58 + index * .03} rotation-z={index * GOLDEN_ANGLE}>
      <ringGeometry args={[radius - .38, radius, style.sides * 12]} />
      <meshBasicMaterial color={pickColor(palette, index + 1)} opacity={1} side={THREE.DoubleSide} />
    </mesh>)}
  </group>;
}

function RayField({ seed, intention, progress }: { seed: number; intention: MandalaIntention; progress: number }) {
  const style = MANDALA_STYLES[intention];
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < style.rays; i++) {
      const ray = radialRayTransform(seed, i, style.rays, 6.3);
      dummy.position.set(Math.cos(ray.angle) * ray.length * .5, Math.sin(ray.angle) * ray.length * .5, -.12 + i % 3 * .012);
      dummy.rotation.set(0, 0, ray.angle - Math.PI / 2);
      dummy.scale.set(ray.width * (intention === "work" ? 1.8 : 1.15), ray.length, 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [dummy, intention, seed, style.rays]);
  return <instancedMesh ref={mesh} args={[undefined, undefined, style.rays]} scale={Math.max(.04, progress)}><planeGeometry args={[1, 1]} /><meshBasicMaterial color={style.accent} transparent opacity={intention === "work" ? .72 : .45} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></instancedMesh>;
}

function ParticleField({ seed, intention, reduced }: { seed: number; intention: MandalaIntention; reduced: boolean }) {
  const style = MANDALA_STYLES[intention];
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < style.particles; i++) {
      const sparkle = sparkleTransform(seed + intention.length * 71, i, 5.35);
      dummy.position.set(sparkle.x, sparkle.y, .3 + i % 7 * .01);
      dummy.rotation.set(0, 0, sparkle.rotation);
      const long = intention === "wealth" || i % 9 === 0;
      dummy.scale.set(.009 * sparkle.scale * (long ? .55 : 1), .009 * sparkle.scale * (long ? 3.5 : 1.4), 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      color.set(i % 4 === 0 ? style.secondaryAccent : style.accent);
      mesh.current.setColorAt(i, color);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [color, dummy, intention, seed, style]);
  useFrame((_, rawDelta) => { if (!group.current || reduced) return; group.current.rotation.z -= Math.min(rawDelta, .05) * style.rotationSpeed * 1.7; });
  return <group ref={group}><instancedMesh ref={mesh} args={[undefined, undefined, style.particles]}><planeGeometry args={[1, 1]} /><meshBasicMaterial vertexColors transparent opacity={.92} blending={THREE.AdditiveBlending} depthWrite={false} /></instancedMesh></group>;
}

function GoldLeafField({ seed, count, radius, color }: { seed: number; count: number; radius: number; color: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      const leaf = goldLeafTransform(seed, i, radius);
      dummy.position.set(leaf.x, leaf.y, .16 + seededUnit(seed + 93, i) * .12);
      dummy.rotation.set(0, 0, leaf.rotation);
      dummy.scale.set(.009 * leaf.scale * (1 + i % 3), .038 * leaf.scale, 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy, radius, seed]);
  return <instancedMesh ref={mesh} args={[undefined, undefined, count]}><planeGeometry args={[1, 1]} /><meshBasicMaterial color={color} transparent opacity={.9} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></instancedMesh>;
}

function OverallPattern({ palette }: { palette: string[] }) {
  const spirals = useMemo(() => Array.from({ length: 7 }, (_, arm) => Array.from({ length: 190 }, (_, index) => {
    const [x, y] = layeredSpiralPoint(index, 190, arm, 7, 5.2);
    return [x, y, .12 + arm * .008] as [number, number, number];
  })), []);
  return <>{spirals.map((points, i) => <Line key={i} points={points} color={pickColor(palette, i)} lineWidth={1.6} />)}{[2.05, 2.75, 3.5, 4.3, 5.02].map((r, i) => <Line key={r} points={regularPolygonPoints(i % 2 ? 8 : 6, r, i * .15, .16)} color={pickColor(palette, i + 2)} lineWidth={1.7} />)}</>;
}

function WealthPattern({ palette }: { palette: string[] }) {
  return <>{[1.35, 1.92, 2.5, 3.12, 3.76, 4.4, 5.02].map((r, i) => <Line key={r} points={regularPolygonPoints(8, r, i * Math.PI / 16, .13 + i * .008)} color={i % 2 ? "#FF8A00" : "#FFD21C"} lineWidth={2.4 - i * .12} />)}{Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return <Line key={`bar-${i}`} points={[[Math.cos(a) * 1.1, Math.sin(a) * 1.1, .16], [Math.cos(a) * 5.15, Math.sin(a) * 5.15, .16]]} color={pickColor(palette, i)} lineWidth={1.2} />; })}</>;
}

function WorkPattern() {
  return <>{[1.45, 2.05, 2.72, 3.42, 4.16, 4.92].map((r, i) => <Line key={r} points={crystalRosettePoints(6 + i * 3, r, r * .56, i * .1, .14)} color={i % 2 ? "#00E5FF" : "#1677FF"} lineWidth={2.2} />)}{Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2; return <Line key={`axis-${i}`} points={[[Math.cos(a) * .9, Math.sin(a) * .9, .2], [Math.cos(a + (i % 2 ? .05 : -.05)) * 5.22, Math.sin(a + (i % 2 ? .05 : -.05)) * 5.22, .2]]} color={i % 3 ? "#00E5FF" : "#1677FF"} lineWidth={i % 3 ? 1 : 2.2} />; })}</>;
}

function LovePattern({ palette }: { palette: string[] }) {
  const waves = useMemo(() => Array.from({ length: 8 }, (_, layer) => Array.from({ length: 170 }, (_, i) => {
    const [x, y] = pairedWavePoint(i, 170, 1.5 + layer * .48, layer * .7);
    return [x, y, .14 + layer * .01] as [number, number, number];
  })), []);
  return <>{waves.map((points, i) => <Line key={i} points={points} color={i % 2 ? "#A733FF" : "#FF176B"} lineWidth={2.5 - i * .14} />)}{[2.2, 3.3, 4.4].map((r, i) => <Line key={r} points={crystalRosettePoints(10 + i * 4, r, r * .74, .15 * i, .22)} color={pickColor(palette, i + 4)} lineWidth={1.4} />)}</>;
}

function HealthPattern({ palette }: { palette: string[] }) {
  const centers = useMemo(() => flowerOfLifeCenters(3, 1.18, .13), []);
  const spirals = useMemo(() => [0, 1, 2].map(arm => Array.from({ length: 180 }, (_, i) => {
    const [x, y] = logarithmicSpiralPoint(i, 180, 5.05, 2.8);
    const a = arm * Math.PI * 2 / 3;
    return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), .2] as [number, number, number];
  })), []);
  return <>{centers.map(([x, y, z], i) => <mesh key={`life-${i}`} position={[x, y, z]}><ringGeometry args={[.56, .59, 48]} /><meshBasicMaterial color={i % 2 ? "#00D8C8" : "#00D96F"} /></mesh>)}{spirals.map((points, i) => <Line key={`bio-${i}`} points={points} color={pickColor(palette, i + 5)} lineWidth={2.1} />)}</>;
}

function IntentionPattern({ intention, palette, progress }: { intention: MandalaIntention; palette: string[]; progress: number }) {
  return <group scale={Math.max(.04, progress)}>{intention === "overall" ? <OverallPattern palette={palette} /> : intention === "wealth" ? <WealthPattern palette={palette} /> : intention === "work" ? <WorkPattern /> : intention === "love" ? <LovePattern palette={palette} /> : <HealthPattern palette={palette} />}</group>;
}

function GemstoneCore({ intention, main, reveal, reduced }: { intention: MandalaIntention; main: string; reveal: number; reduced: boolean }) {
  const style = MANDALA_STYLES[intention];
  const gemColor = intention === "overall" ? main : style.accent;
  const gem = useRef<THREE.Group>(null);
  const facets = style.gem === "diamond" ? 16 : style.gem === "citrine" ? 12 : style.gem === "sapphire" ? 10 : style.gem === "ruby" ? 14 : 12;
  useFrame((state, rawDelta) => {
    if (!gem.current || reduced) return;
    const delta = Math.min(rawDelta, .05);
    gem.current.rotation.z += delta * .045;
    gem.current.rotation.x = .2 + Math.sin(state.clock.elapsedTime * .38) * .045;
    gem.current.rotation.y = Math.sin(state.clock.elapsedTime * .3) * .08;
  });
  return <group ref={gem} position-z={.48} scale={(.18 + reveal * .82) * (intention === "overall" ? 1.05 : .96)}>
    <mesh rotation={[Math.PI / 2, 0, Math.PI / facets]}>
      <cylinderGeometry args={[.7, 1.02, .55, facets, 1, false]} />
      <meshPhysicalMaterial color={gemColor} emissive={gemColor} emissiveIntensity={.32} metalness={.34} roughness={.06} clearcoat={1} clearcoatRoughness={.02} flatShading />
    </mesh>
    <mesh position-z={.47} rotation={[Math.PI / 2, 0, Math.PI / facets]}>
      <coneGeometry args={[.72, .42, facets]} />
      <meshPhysicalMaterial color={style.accent} emissive={gemColor} emissiveIntensity={.5} metalness={.45} roughness={.04} clearcoat={1} flatShading />
    </mesh>
    {Array.from({ length: facets }, (_, index) => {
      const angle = index / facets * Math.PI * 2;
      const tone = facetTone(index, facets);
      return <mesh key={`facet-${index}`} position={[Math.cos(angle) * .62, Math.sin(angle) * .62, .6]} rotation={[0, 0, angle]} scale={[.22, .7, 1]}>
        <circleGeometry args={[.42, 3]} />
        <meshBasicMaterial color={index % 3 === 0 ? style.secondaryAccent : style.accent} transparent opacity={tone} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>;
    })}
    {[1.14, 1.34, 1.58].map((r, i) => <mesh key={`halo-${r}`} position-z={-.08 - i * .02}><ringGeometry args={[r, r + .035 + i * .012, 96]} /><meshBasicMaterial color={i % 2 ? style.secondaryAccent : style.accent} transparent opacity={.9 - i * .18} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>)}
    <pointLight position={[0, 0, 2]} color={style.accent} intensity={7.5 * reveal} distance={8} />
  </group>;
}

function Mandala({ colors, intention, progress, reduced }: Omit<Props, "onCapture">) {
  const mandala = useRef<THREE.Group>(null);
  const style = MANDALA_STYLES[intention];
  const palette = useMemo(() => colors.length ? Array.from({ length: 7 }, (_, i) => vividHexColor(pickColor(colors, i, FALLBACK_PALETTE[i] ?? GOLD_LIGHT))) : [...FALLBACK_PALETTE], [colors]);
  const main = pickColor(palette, 0);
  const seed = useMemo(() => `${palette.join("")}-${intention}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0), [intention, palette]);
  useFrame((state, rawDelta) => {
    if (!mandala.current || reduced) return;
    const delta = Math.min(rawDelta, .05);
    mandala.current.rotation.z += delta * style.rotationSpeed;
    mandala.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * .42) * .006);
  });
  const x = Math.min(1, Math.max(0, progress / 6.4));
  const reveal = x * x * (3 - 2 * x);
  return <>
    <color attach="background" args={[COSMIC_BLACK]} />
    <ambientLight intensity={.72} />
    <directionalLight position={[4, 6, 8]} intensity={4.2} color={style.accent} />
    <directionalLight position={[-5, -2, 6]} intensity={3.4} color={style.secondaryAccent} />
    <pointLight position={[0, 0, 6]} intensity={2.5} color={main} />
    <Environment>
      <Lightformer intensity={3.5} color={style.accent} position={[0, 3, 5]} scale={[7, 2, 1]} />
      <Lightformer intensity={2.5} color={style.secondaryAccent} position={[-4, -1, 3]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
      <Lightformer intensity={2} color="#FFFFFF" position={[4, 0, 4]} rotation-y={-Math.PI / 2} scale={[4, 1, 1]} />
    </Environment>
    <AuraBackdrop palette={palette} accent={style.accent} reduced={reduced} />
    <RayField seed={seed} intention={intention} progress={reveal} />
    <group ref={mandala}>
      <SolidColorField palette={palette} intention={intention} progress={reveal} />
      <IntentionPattern intention={intention} palette={palette} progress={reveal} />
      <GoldLeafField seed={seed} count={intention === "wealth" ? 156 : 72} radius={5.12} color={style.accent} />
      <ParticleField seed={seed} intention={intention} reduced={reduced} />
      <GemstoneCore intention={intention} main={main} reveal={reveal} reduced={reduced} />
    </group>
  </>;
}

export default function MandalaScene({ onCapture, ...props }: Props) {
  return <Canvas aria-label="7つのバースカラーによる五運宝冠の幾何学曼陀羅" camera={{ position: [0, 0, 12], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: true, preserveDrawingBuffer: true }}>
    <Mandala {...props} />
    <CaptureBridge colors={props.colors} intention={props.intention} onCapture={onCapture} />
  </Canvas>;
}
