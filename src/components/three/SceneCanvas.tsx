'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function Stars({ count = 600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#8b93ff" transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function WireIcosahedron() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.x = t * 0.22;
    mesh.current.rotation.y = t * 0.3;
    mesh.current.position.x = Math.sin(t * 0.35) * 1.6;
    mesh.current.position.y = Math.cos(t * 0.28) * 0.9;
    mesh.current.rotation.z += delta * 0.1;
  });
  return (
    <mesh ref={mesh} scale={1.35}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#6366f1"
        wireframe
        emissive="#4f46e5"
        emissiveIntensity={0.55}
        roughness={0.2}
        metalness={0.6}
      />
    </mesh>
  );
}

function TorusKnot() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.x -= delta * 0.25;
    mesh.current.rotation.y = t * 0.4;
    mesh.current.position.x = Math.cos(t * 0.3) * 2.4;
    mesh.current.position.y = Math.sin(t * 0.22) * 1.2;
  });
  return (
    <mesh ref={mesh}>
      <torusKnotGeometry args={[0.62, 0.18, 96, 14]} />
      <meshStandardMaterial
        color="#a855f7"
        emissive="#7e22ce"
        emissiveIntensity={0.5}
        roughness={0.25}
        metalness={0.7}
      />
    </mesh>
  );
}

function OrbitSpheres() {
  const group = useRef<THREE.Group>(null);
  const spheres = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const radius = 3.4;
        const size = 0.045 + Math.random() * 0.06;
        return {
          pos: [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.5, (Math.random() - 0.5) * 1.5] as [number, number, number],
          size,
          color: ['#22d3ee', '#2dd4bf', '#a5b4fc', '#fbbf24'][i % 4],
        };
      }),
    []
  );

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.z += delta * 0.2;
  });

  return (
    <group ref={group}>
      {spheres.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[s.size, 16, 16]} />
          <meshBasicMaterial color={s.color} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Rig() {
  useFrame((state) => {
    const { pointer, camera } = state;
    const x = pointer.x * 0.5;
    const y = pointer.y * 0.35;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, x, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, y, 0.04);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function SceneCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 55 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <fog attach="fog" args={['#05060f', 9, 22]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[6, 6, 6]} intensity={60} color="#6366f1" />
      <pointLight position={[-6, -4, 4]} intensity={45} color="#a855f7" />
      <Rig />
      <Stars />
      <WireIcosahedron />
      <TorusKnot />
      <OrbitSpheres />
    </Canvas>
  );
}