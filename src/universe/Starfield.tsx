import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const VERT = `
attribute float aSize;
attribute float aPhase;
uniform float uTime;
uniform float uTwinkle;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float tw = mix(0.9, 0.55 + 0.45 * sin(uTime * 0.65 + aPhase), uTwinkle);
  float depth = max(10.0, -mv.z);
  gl_PointSize = clamp(aSize * tw * (260.0 / depth), 0.6, 5.5);
  gl_Position = projectionMatrix * mv;
  vAlpha = tw;
}
`;

const FRAG = `
precision mediump float;
varying float vAlpha;
void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p);
  float alpha = smoothstep(0.5, 0.08, d) * vAlpha;
  if (alpha < 0.03) discard;
  gl_FragColor = vec4(0.82, 0.93, 1.0, alpha);
}
`;

export function Starfield({ count, twinkle }: { count: number; twinkle: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTwinkle: { value: 1 },
    }),
    [],
  );
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let index = 0; index < count; index += 1) {
      const radius = 42 + Math.random() * 96;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.cos(phi) * 0.62;
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      sizes[index] = Math.random() < 0.07 ? 2.6 : 0.85 + Math.random() * 1.15;
      phases[index] = Math.random() * Math.PI * 2;
    }
    const next = new THREE.BufferGeometry();
    next.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    next.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    next.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    return next;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    const mat = material.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uTwinkle.value = twinkle ? 1 : 0;
  });

  return (
    <points geometry={geometry} dispose={null} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
