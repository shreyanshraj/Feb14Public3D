/* eslint-disable react-hooks/refs */
/* eslint-disable react-hooks/immutability */
// src/scene/scenes/Scene5B_City.jsx
import { useEffect, useRef, useState } from "react";
import { Html, useGLTF, PerspectiveCamera } from "@react-three/drei";
import { useStoryStore } from "../../store/useStoryStore";
import { audio } from "../../three/Audio";

export default function Scene5B_City() {
  const setScene = useStoryStore((s) => s.setScene);
  const muted = useStoryStore((s) => s.muted);

  const [toast, setToast] = useState(null);

  const rootRef = useRef();
  const { scene } = useGLTF("/models/City.glb");

  // ✅ Portal target for Html overlay (escapes any Canvas/transform wrappers)
  const portalRef = useRef(null);
  useEffect(() => {
    portalRef.current = document.body;
  }, []);

  // optional ambience
  useEffect(() => {
    if (muted) return;
    try {
      audio.play("city_ambience_loop");
    } catch {
      console.log("====================================");
      console.log("city ambience audio failed");
      console.log("====================================");
    }
    return () => {
      try {
        audio.stop?.("city_ambience_loop");
      } catch {
        console.log("====================================");
        console.log("city ambience audio failed");
        console.log("====================================");
      }
    };
  }, [muted]);

  // Easter egg: click lamp post mesh (best-effort find)
  const lampMeshRef = useRef(null);
  useEffect(() => {
    let found = null;
    scene.traverse((o) => {
      if (!o.isMesh) return;
      const n = (o.name || "").toLowerCase();
      if (
        !found &&
        (n.includes("lamp") || n.includes("street") || n.includes("post"))
      ) {
        found = o;
      }
    });
    lampMeshRef.current = found;
  }, [scene]);

  const onLampClick = (e) => {
    e.stopPropagation();
    setToast("👀 Easter egg: inside joke unlocked.");
    if (!muted) {
      try {
        audio.play("inside_joke_voiceline");
      } catch {
        console.log("====================================");
        console.log("inside joke audio failed");
        console.log("====================================");
      }
    }
    window.clearTimeout(onLampClick._t);
    onLampClick._t = window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <group>
      <PerspectiveCamera
        makeDefault
        position={[0, 3.8, 8.5]} // higher + farther
        rotation={[-0.28, 0, 0]} // slight downward tilt (~16°)
        fov={50} // natural perspective
      />

      <ambientLight intensity={2.35} />
      <directionalLight position={[3, 5, 2]} intensity={0.8} />

      <group ref={rootRef} scale={0.35} position={[-1, -0.3, 0]}>
        <primitive object={scene} />
        {lampMeshRef.current && (
          <mesh
            geometry={lampMeshRef.current.geometry}
            position={lampMeshRef.current.position}
            rotation={lampMeshRef.current.rotation}
            scale={lampMeshRef.current.scale}
            onPointerDown={onLampClick}
          >
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}
      </group>

      <Html
        fullscreen
        transform={false}
        portal={portalRef}
        style={ui.fullscreen}
      >
        <div style={ui.panel}>
          <div style={ui.headRow}>
            <div>
              <div style={ui.title}>Road Trip 🌵</div>
              <div style={ui.sub}>Here’s the vibe for this plan.</div>
            </div>
            <button style={ui.btnGhost} onClick={() => setScene("SCENE_4")}>
              ← Back
            </button>
          </div>

          <ul style={ui.options}>
            <li style={ui.optionItem}>🚗 Exploring Payson and Greer</li>
            <li style={ui.optionItem}>
              👑 Passenger Princess Treatment for the Queen
            </li>
            <li style={ui.optionItem}>
              ✨ Lots of happy memories and pictures
            </li>
          </ul>

          {toast && <div style={ui.toast}>{toast}</div>}

          <div style={ui.footerRow}>
            <button style={ui.btn} onClick={() => setScene("SCENE_FINAL")}>
              Continue →
            </button>
          </div>
        </div>
      </Html>
    </group>
  );
}

useGLTF.preload("/models/City.glb");

const ui = {
  // Fullscreen overlay pinned to top-center
  fullscreen: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 999999,
  },

  panel: {
    pointerEvents: "auto",
    position: "fixed",
    top: -400,
    left: "50%",
    transform: "translateX(-150%)",

    display: "inline-block",
    width: "fit-content",
    maxWidth: "96vw",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(0,0,0,0.55)",
    color: "white",
    padding: 16,
    backdropFilter: "blur(10px)",
  },

  headRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: 900 },
  sub: { marginTop: 4, fontSize: 12, opacity: 0.7 },
  options: {
    marginTop: 14,
    paddingLeft: 0,
    listStyleType: "none",
    display: "grid",
    gap: 6,
    lineHeight: 1.8,
    fontSize: 14,
    opacity: 0.95,
  },
  optionItem: {
    padding: 0,
    border: "none",
    background: "transparent",
    fontSize: 14,
    lineHeight: 1.8,
    whiteSpace: "nowrap",
  },
  toast: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 800,
  },
  footerRow: { marginTop: 14, display: "flex", justifyContent: "flex-end" },
  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: "white",
    cursor: "pointer",
    fontWeight: 900,
  },
  btnGhost: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
  },
};
