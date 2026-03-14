/* eslint-disable react-hooks/immutability */
// src/scene/scenes/Scene5C_Phoenix.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Html, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useStoryStore } from "../../store/useStoryStore";
import { audio } from "../../three/Audio";
import * as THREE from "three";

export default function Scene5C_Phoenix() {
  const setScene = useStoryStore((s) => s.setScene);
  const muted = useStoryStore((s) => s.muted);

  const [sunsetStart] = useState(false);

  const gltf = useGLTF("/models/phx.glb");

  const localScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const sunRef = useRef();

  const modelRef = useRef();
  const pivotRef = useRef();

  const sky = useMemo(() => ({ t: 0, k: 0 }), []);
  const flicker = useMemo(() => ({ t: 0 }), []);

  const lampSpotRef = useRef(null);
  const lampTargetRef = useRef(null);

  // Shows a cone helper so you can adjust spotlight visually
  // useHelper(lampSpotRef, THREE.SpotLightHelper);

  // ambience
  useEffect(() => {
    if (muted) return;
    try {
      audio.play("city_ambience");
    } catch {
      console.log("====================================");
      console.log("city ambience audio failed");
      console.log("====================================");
    }
    return () => {
      try {
        audio.stop?.("city_ambience");
      } catch {
        console.log("====================================");
        console.log("city ambience audio failed");
        console.log("====================================");
      }
    };
  }, [muted]);

  useEffect(() => {
    if (!pivotRef.current) return;

    pivotRef.current.position.set(-1, 0.5, 0);
    pivotRef.current.rotation.set(0, -0.35, 0);

    localScene.updateWorldMatrix(true, true);

    const box = new THREE.Box3().setFromObject(localScene);
    if (box.isEmpty()) return;

    const center = new THREE.Vector3();
    box.getCenter(center);

    pivotRef.current.position.set(-center.x, -center.y, -center.z);
  }, [localScene]);

  const cactusRef = useRef(null);
  useEffect(() => {
    let found = null;
    localScene.traverse((o) => {
      if (!o.isMesh) return;
      const n = (o.name || "").toLowerCase();
      if (!found && (n.includes("cactus") || n.includes("saguaro"))) found = o;
    });
    cactusRef.current = found;
  }, [localScene]);

  useEffect(() => {
    localScene.traverse((o) => {
      if (!o.isMesh) return;
      const m = o.material;
      const mats = Array.isArray(m) ? m : [m];

      const converted = mats.map((mat) => {
        if (!mat || mat.type !== "MeshBasicMaterial") return mat;

        const std = new THREE.MeshStandardMaterial({
          map: mat.map || null,
          color: mat.color || new THREE.Color("white"),
          roughness: 1,
          metalness: 0,
        });
        std.name = `${mat.name || "Basic"}_toStandard`;
        return std;
      });

      o.material = Array.isArray(m) ? converted : converted[0];
      o.castShadow = true;
      o.receiveShadow = true;
    });
  }, [localScene]);

  useFrame((_, dt) => {
    flicker.t += dt;
    sky.t += dt;

    if (modelRef.current) {
      modelRef.current.rotation.x = 0;
      modelRef.current.rotation.y = -0.35;
      modelRef.current.position.set(-1, 0.5, 0);
    }

    if (cactusRef.current) {
      cactusRef.current.rotation.z = Math.sin(sky.t * 0.7) * 0.06;
    }

    if (lampSpotRef.current && lampTargetRef.current) {
      lampSpotRef.current.position.set(1.4, 0.3, -0.2);
      lampTargetRef.current.position.set(1.4, 0.0, -0.1);

      lampSpotRef.current.target = lampTargetRef.current;
      lampSpotRef.current.target.updateMatrixWorld();
    }

    if (sunsetStart) {
      sky.k = Math.min(1, sky.k + dt / 2.6);
    } else {
      sky.k = Math.max(0, sky.k - dt / 3);
    }

    if (sunRef.current) {
      const k = sky.k;
      sunRef.current.position.y = 6 - k * 4.2;
      sunRef.current.position.x = 4 - k * 1.2;
      sunRef.current.intensity = 1.1 - k * 0.55;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.18} />

      <spotLight
        ref={lampSpotRef}
        intensity={12}
        color="#ab9068"
        angle={0.2}
        penumbra={0.5}
        distance={15}
        decay={2}
        castShadow
      />

      <object3D ref={lampTargetRef} />

      <group ref={modelRef} scale={0.8}>
        <group ref={pivotRef}>
          <primitive object={localScene} />
        </group>
      </group>

      <Html
        fullscreen
        portal={document.body}
        prepend
        style={{ pointerEvents: "none" }}
      >
        <div style={ui.wrap}>
          <div style={ui.panel}>
            <div style={ui.headRow}>
              <div>
                <div style={ui.title}>Exploring City 🌆</div>
                <div style={ui.sub}>Good vibes + Food + Shopping</div>
              </div>
              <button style={ui.btnGhost} onClick={() => setScene("SCENE_4")}>
                ← Back
              </button>
            </div>

            <ul style={ui.options}>
              <li>🏛️ Exploring local museums/shopping</li>
              <li>🚶 Walk by Canal Path</li>
              <li>🍦 Late-night Ice cream</li>
            </ul>

            <div style={ui.footerRow}>
              <button style={ui.btn} onClick={() => setScene("SCENE_FINAL")}>
                Continue →
              </button>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

useGLTF.preload("/models/phx.glb");

const ui = {
  wrap: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 9999,
  },

  panel: {
    position: "fixed",
    top: 18,
    right: 18,
    zIndex: 10000,

    width: "min(380px, 92vw)",
    maxHeight: "calc(100vh - 36px)",
    overflowY: "auto",

    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(0,0,0,0.55)",
    color: "white",
    padding: 16,
    backdropFilter: "blur(10px)",

    pointerEvents: "auto",
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
    paddingLeft: 20,
    lineHeight: 1.8,
    fontSize: 14,
    listStyleType: "disc",
    marginBottom: 0,
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
