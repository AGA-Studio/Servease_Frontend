import { Component, Suspense, useEffect, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Bounds, ContactShadows, Html, useProgress } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/servise.glb";

/** Spring-like damped lerp toward pointer position — mouse tracking should have momentum, not snap instantly. */
function PointerRig({ children }: { children: ReactNode }) {
  const outer = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!outer.current) return;
    const targetY = state.pointer.x * 0.32;
    const targetX = -state.pointer.y * 0.16;
    outer.current.rotation.y = THREE.MathUtils.damp(outer.current.rotation.y, targetY, 4, delta);
    outer.current.rotation.x = THREE.MathUtils.damp(outer.current.rotation.x, targetX, 4, delta);
  });

  return <group ref={outer}>{children}</group>;
}

function SearchingCharacter() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions, names } = useAnimations(animations, group);
  const hasBakedAnimation = names.length > 0;

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!hasBakedAnimation) return;
    const action = actions[names[0]];
    action?.reset().fadeIn(0.4).play();
    return () => {
      action?.fadeOut(0.4);
    };
  }, [actions, names, hasBakedAnimation]);

  useFrame((state, delta) => {
    if (!group.current || hasBakedAnimation) return;
    group.current.rotation.y += delta * 0.35;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.08;
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "3px solid rgba(46,188,204,0.2)",
          borderTopColor: "#2EBCCC",
          animation: "servease-spin 0.8s linear infinite",
        }}
        aria-label={`Cargando modelo 3D, ${Math.round(progress)}%`}
      />
    </Html>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, 2, -3]} intensity={18} color="#2EBCCC" />
      <pointLight position={[2, -1, 3]} intensity={6} color="#FFB200" />

      <Bounds fit observe margin={1.85}>
        <PointerRig>
          <SearchingCharacter />
        </PointerRig>
      </Bounds>

      <ContactShadows
        position={[0, -1.01, 0]}
        opacity={0.45}
        scale={10}
        blur={2.6}
        far={4}
        color="#0B1030"
      />
    </>
  );
}

class ModelErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

interface ServiceModel3DProps {
  className?: string;
}

const ServiceModel3D = ({ className }: ServiceModel3DProps) => {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <style>{`@keyframes servease-spin { to { transform: rotate(360deg); } }`}</style>
      <ModelErrorBoundary>
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [0, 1, 5], fov: 35 }}
          gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={<Loader />}>
            <Scene />
          </Suspense>
        </Canvas>
      </ModelErrorBoundary>
    </div>
  );
};

export default ServiceModel3D;
