import { Canvas } from "@react-three/fiber";
import { Component, useState, type ReactNode } from "react";
import { WebGLFallback } from "@/components/shell/chrome";
import { useDocumentHidden, useQualityTier, useReducedMotion } from "@/hooks/use-nexus-ready";
import { CameraRig } from "@/universe/CameraRig";
import { Connections } from "@/universe/Connections";
import { GeometryScope } from "@/universe/geometry";
import { CoreNode, Galaxies, Horizon } from "@/universe/Nodes";
import { scenePointer } from "@/universe/scene-pointer";
import { Starfield } from "@/universe/Starfield";
import { useNexus } from "@/stores/nexus-store";

function detectWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

class SceneBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null };

  static getDerivedStateFromError(error: unknown) {
    return { message: error instanceof Error ? error.message : "The 3D universe failed to start." };
  }

  render() {
    if (this.state.message) {
      return <WebGLFallback message="The 3D universe failed to start. Explorer and Control Center still work." />;
    }
    return this.props.children;
  }
}

function SceneContents({ tier, reduced }: { tier: "high" | "low"; reduced: boolean }) {
  return (
    <GeometryScope>
      <color attach="background" args={["#050812"]} />
      <fogExp2 attach="fog" args={["#050812", 0.011]} />
      <Starfield count={tier === "low" ? 420 : 1000} twinkle={!reduced && tier === "high"} />
      <Horizon />
      <CoreNode reduced={reduced} />
      <Galaxies reduced={reduced} />
      <Connections flow={tier === "high" && !reduced} />
      <CameraRig reduced={reduced} />
    </GeometryScope>
  );
}

export default function UniverseScene() {
  const [supported] = useState(detectWebGL);
  const hidden = useDocumentHidden();
  const tier = useQualityTier();
  const reduced = useReducedMotion();

  if (!supported) {
    return <WebGLFallback message="This browser cannot start WebGL. Explorer and Control Center still work." />;
  }

  return (
    <SceneBoundary>
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 9, 30], fov: 46, near: 0.1, far: 280 }}
        dpr={tier === "low" ? 1 : [1, 1.6]}
        frameloop={hidden ? "never" : "always"}
        gl={{
          antialias: tier === "high",
          alpha: false,
          powerPreference: tier === "low" ? "low-power" : "high-performance",
          stencil: false,
        }}
        onPointerMissed={() => {
          if (!scenePointer.dragged) useNexus.getState().select(null);
        }}
      >
        <SceneContents tier={tier} reduced={reduced} />
      </Canvas>
    </SceneBoundary>
  );
}
