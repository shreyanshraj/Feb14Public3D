/* eslint-disable react-hooks/immutability */
// src/scene/scenes/Scene5A_Dinner.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { Html, Sparkles, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useStoryStore } from "../../store/useStoryStore";
import { audio } from "../../three/Audio";
import { useHelper } from "@react-three/drei";
import * as THREE from "three";

export default function Scene5A_Dinner() {
  const setScene = useStoryStore((s) => s.setScene);
  const muted = useStoryStore((s) => s.muted);
  const plRef = useRef();
  useHelper(plRef, THREE.PointLightHelper, 0.3);

  const [choice, setChoice] = useState(null);
  const [reaction, setReaction] = useState(null);

  const { scene } = useGLTF("/models/Dinner_Scene.glb");

  const modelRef = useRef();

  // soft ambience (optional if your audio system has these keys)
  useEffect(() => {
    if (muted) return;
    try {
      audio.play("fireplace");
    } catch {
      console.log("====================================");
      console.log("Audio error for fireplace_loop");
      console.log("====================================");
    }
    return () => {
      try {
        audio.stop?.("fireplace");
      } catch {
        console.log("====================================");
        console.log("Audio error for fireplace_loop");
        console.log("====================================");
      }
    };
  }, [muted]);

  const flicker = useMemo(() => ({ t: 0 }), []);
  useFrame((_, dt) => {
    flicker.t += dt;

    
    if (modelRef.current) {
      modelRef.current.rotation.x = 0.35; // ~20° top view
      modelRef.current.rotation.y = 0;
      modelRef.current.position.y = 0;
    }
  });

  const pick = (val) => {
    setChoice(val);
    const map = {
      TOGETHER: "That was such a you decision… and I love that😌",
      JUDGE: "I’m nervous… impressing you isn’t easy 😉",
      PRETEND: "Made it with love… and a delivery app 😅",
    };
    setReaction(map[val]);
    if (!muted) {
      try {
        audio.play("click");
      } catch {
        console.log("====================================");
        console.log("Audio error for click sound");
        console.log("====================================");
      }
    }
  };

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 3, 4]} intensity={1.1} />
      <pointLight
        position={[0.25, 1.05, 0]} // adjust to candle flame height
        intensity={0.9}
        distance={2}
        decay={2}
        color="#ff9e4a"
      />

      {/* wrap the model so tilt/scale doesn't affect Html UI */}
      <group ref={modelRef} scale={2.5}>
        <primitive object={scene} />
      </group>


      <Sparkles
        count={45}
        scale={[2.5, 1.5, 2.5]}
        size={1.2}
        speed={0.25}
        opacity={0.35}
        position={[0, 0.9, 0]}
      />

      {/* UI (stays fixed; NOT affected by model tilt) */}
      <Html fullscreen style={{ pointerEvents: "auto" }}>
        <div style={ui.wrap}>
          <div style={ui.panel}>
            <div style={ui.headRow}>
              <div>
                <div style={ui.title}>Cozy Home Dinner 🍽️</div>
                <div style={ui.sub}>Pick one — I’ll match your vibe.</div>
              </div>
              <button style={ui.btnGhost} onClick={() => setScene("SCENE_4")}>
                ← Back
              </button>
            </div>

            <div style={ui.options}>
              <label style={ui.option}>
                <input
                  type="radio"
                  name="dinner"
                  checked={choice === "TOGETHER"}
                  onChange={() => pick("TOGETHER")}
                />
                Cook together
              </label>

              <label style={ui.option}>
                <input
                  type="radio"
                  name="dinner"
                  checked={choice === "JUDGE"}
                  onChange={() => pick("JUDGE")}
                />
                I cook, you judge
              </label>

              <label style={ui.option}>
                <input
                  type="radio"
                  name="dinner"
                  checked={choice === "PRETEND"}
                  onChange={() => pick("PRETEND")}
                />
                Order food and pretend we cooked
              </label>
            </div>

            {reaction && <div style={ui.reaction}> {reaction}</div>}

            <div style={ui.footerRow}>
              <button
                style={{ ...ui.btn, opacity: choice ? 1 : 0.5 }}
                disabled={!choice}
                onClick={() => setScene("SCENE_FINAL")}
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

useGLTF.preload("/models/Dinner_Scene.glb");

const ui = {
  wrap: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "end center",
    padding: 18,
  },
  panel: {
    width: "min(620px, 100%)",
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
  options: { marginTop: 14, display: "grid", gap: 10 },
  option: { display: "flex", gap: 10, alignItems: "center", fontSize: 14 },
  reaction: { marginTop: 12, fontWeight: 900, opacity: 0.9 },
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
