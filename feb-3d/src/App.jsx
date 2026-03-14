import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import SceneRoot from "./scene/SceneRoot";
import OverlayRoot from "./ui/OverlayRoot";
import AudioSync from "./three/AudioSync";

export default function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AudioSync />
      <Canvas
        style={{ position: "absolute", inset: 0 }}
        camera={{ position: [0, 1, 4], fov: 45 }}
      >
        <Suspense fallback={null}>
          <SceneRoot />
        </Suspense>
      </Canvas>

      <OverlayRoot />
    </div>
  );
}
