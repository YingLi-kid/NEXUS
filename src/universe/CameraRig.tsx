import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { scenePointer } from "@/universe/scene-pointer";
import { useNexus } from "@/stores/nexus-store";

export function CameraRig({ reduced }: { reduced: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const ignoreNonce = useRef<number | null>(null);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  useEffect(() => {
    controls.current?.target.set(0, 0.4, 0);
    const element = gl.domElement;
    let x = 0;
    let y = 0;
    let down = false;
    const onDown = (event: PointerEvent) => {
      down = true;
      x = event.clientX;
      y = event.clientY;
      scenePointer.dragged = false;
    };
    const onMove = (event: PointerEvent) => {
      if (!down) return;
      if (Math.hypot(event.clientX - x, event.clientY - y) > 6) {
        scenePointer.dragged = true;
        ignoreNonce.current = useNexus.getState().focus?.nonce ?? null;
      }
    };
    const onUp = () => {
      down = false;
      window.setTimeout(() => {
        scenePointer.dragged = false;
      }, 80);
    };
    element.addEventListener("pointerdown", onDown);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerup", onUp);
    return () => {
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const control = controls.current;
    const focus = useNexus.getState().focus;
    if (!control || !focus) return;
    if (ignoreNonce.current === focus.nonce) return;
    const step = Math.min(delta, 0.05);
    const lambda = reducedRef.current ? 28 : 3.1;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, focus.cam[0], lambda, step);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, focus.cam[1], lambda, step);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, focus.cam[2], lambda, step);
    control.target.x = THREE.MathUtils.damp(control.target.x, focus.target[0], lambda, step);
    control.target.y = THREE.MathUtils.damp(control.target.y, focus.target[1], lambda, step);
    control.target.z = THREE.MathUtils.damp(control.target.z, focus.target[2], lambda, step);
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      enablePan={false}
      dampingFactor={0.08}
      rotateSpeed={0.42}
      zoomSpeed={0.55}
      minDistance={6}
      maxDistance={72}
      minPolarAngle={0.18}
      maxPolarAngle={Math.PI * 0.84}
    />
  );
}
