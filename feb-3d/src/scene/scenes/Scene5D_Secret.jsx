// src/scene/scenes/Scene5D_Secret.jsx
import { useRef, useEffect, useCallback, useState } from "react";
import {
  useGLTF,
  PerspectiveCamera,
  OrbitControls,
  useAnimations,
  Sparkles,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { useStoryStore } from "../../store/useStoryStore";

const CONFETTI_AT = 0.45; // 0..1 (when in Open_Reveal to fire confetti)

export default function Scene5D_Secret() {
  const setScene = useStoryStore((s) => s.setScene);

  const wrapperRef = useRef();
  const animRootRef = useRef();
  const openedRef = useRef(false);

  // ✅ panel shows only after animation finishes
  const [opened, setOpened] = useState(false);

  // ✅ hint shows after 2s of no click
  const [showHint, setShowHint] = useState(false);
  const hintTimerRef = useRef(null);

  // confetti sync
  const confettiTimerRef = useRef(null);

  const gltf = useGLTF("/models/treasure_chest_adv.glb");
  const { actions } = useAnimations(gltf.animations, animRootRef);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const box = new THREE.Box3().setFromObject(wrapperRef.current);
    const center = new THREE.Vector3();
    box.getCenter(center);
    wrapperRef.current.position.sub(center);
  }, []);

  // start hint timer (2s after load, only if not opened)
  useEffect(() => {
    hintTimerRef.current = setTimeout(() => {
      if (!openedRef.current) setShowHint(true);
    }, 2000);

    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      document.body.style.cursor = "default";
    };
  }, []);

  const shootConfetti = () => {
    const end = Date.now() + 450;
    (function frame() {
      confetti({
        particleCount: 35,
        spread: 70,
        startVelocity: 32,
        scalar: 0.9,
        origin: { x: 0.5, y: 0.55 },
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const playOpenReveal = useCallback(() => {
    const open = actions?.Open_Reveal;
    if (!open) {
      console.log("Open_Reveal not found:", Object.keys(actions || {}));
      return;
    }

    if (openedRef.current) return;
    openedRef.current = true;

    // hide hint immediately on click
    setShowHint(false);
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }

    if (confettiTimerRef.current) {
      clearTimeout(confettiTimerRef.current);
      confettiTimerRef.current = null;
    }

    Object.values(actions || {}).forEach((a) => a?.stop?.());

    open.reset();
    open.enabled = true;
    open.setLoop(THREE.LoopOnce, 1);
    open.clampWhenFinished = true;
    open.fadeIn(0.15);
    open.play();

    // Wait until animation fully finishes, then show panel
    const mixer = open.getMixer();
    const onFinish = (e) => {
      if (e.action === open) {
        setOpened(true);
        mixer.removeEventListener("finished", onFinish);
      }
    };
    mixer.addEventListener("finished", onFinish);

    // confetti timing (synced to clip)
    const durationSec = open.getClip()?.duration ?? 1.0;
    const delayMs = Math.max(0, Math.min(1, CONFETTI_AT)) * durationSec * 1000;

    confettiTimerRef.current = window.setTimeout(() => {
      shootConfetti();
      confettiTimerRef.current = null;
    }, delayMs);
  }, [actions]);

  return (
    <group>
      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={[0.4, 1.4, 6]}
        fov={45}
        onUpdate={(cam) => cam.lookAt(0, 0.35, 0)}
      />

      {/* Controls */}
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={6}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 3}
        enableDamping
        dampingFactor={0.08}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
      />

      {/* Lights */}
      <ambientLight intensity={1.4} />
      <directionalLight position={[6, 10, 6]} intensity={1.8} />
      <directionalLight position={[-6, 5, -4]} intensity={0.7} />

      {/* Model */}
      <group ref={wrapperRef} scale={2.2}>
        {/* Sparkles */}
        <group position={[0, 0.35, 0]}>
          <Sparkles
            count={70}
            speed={0.9}
            size={3.2}
            scale={[1.2, 1.0, 1.2]}
            noise={1.2}
            opacity={0.85}
            color="#ffe7a8"
          />
        </group>

        {/* ✅ Hint after 2s idle (anchored to chest) */}
        {showHint && !openedRef.current && (
          <Html position={[0, 0.85, 0]} center>
            <div style={ui.hint}>Click to see surprise ✨</div>
          </Html>
        )}

        <group
          ref={animRootRef}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "default")}
          onPointerDown={(e) => {
            e.stopPropagation();
            playOpenReveal();
          }}
        >
          <primitive object={gltf.scene} />
        </group>
      </group>

      {/* ✅ Show panel ONLY after open, centered with overlay */}
      {opened && (
        <Html fullscreen style={{ pointerEvents: "none" }}>
          <div style={ui.overlay}>
            <div style={ui.card}>
              <div style={ui.header}>
                <div>
                  <div style={ui.title}>The best (Just like you ❤️)</div>
                  <div style={ui.subtitle}>
                    Best of all is that we get to spend time together, no matter
                    what we do!
                  </div>
                </div>

                <button style={ui.btnGhost} onClick={() => setScene("SCENE_4")}>
                  ← Back
                </button>
              </div>

              <ul style={ui.list}>
                <li style={ui.li}>
                  <span style={ui.emoji}>🚗</span>
                  <span>Cozy Dinner at Home on Saturday</span>
                </li>
                <li style={ui.li}>
                  <span style={ui.emoji}>🌇</span>
                  <span>Watching the sunset together on Sunday</span>
                </li>
                <li style={ui.li}>
                  <span style={ui.emoji}>✨</span>
                  <span>Road trip on Monday</span>
                </li>
              </ul>

              <div style={ui.footer}>
                <button
                  style={ui.btnPrimary}
                  onClick={() => setScene("SCENE_FINAL")}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

useGLTF.preload("/models/treasure_chest_adv.glb");

const ui = {
  overlay: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.35)",
    pointerEvents: "none",
  },

  card: {
    position: "fixed",
    top: "30%",
    left: "30%",
    transform: "translate(-50%, -50%)",

    width: "min(560px, 60vw)",
    maxWidth: 560,

    maxHeight: "60vh",
    overflowY: "auto",

    borderRadius: 22,
    padding: 18,
    color: "rgba(255,255,255,0.92)",
    background: "rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
    backdropFilter: "blur(12px)",

    pointerEvents: "auto",
    animation: "panelIn 680ms ease-out both",
  },

  hint: {
    padding: "8px 12px",
    borderRadius: 14,
    background: "rgba(0,0,0,0.65)",
    color: "rgba(255,255,255,0.95)",
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(6px)",
    animation: "hintPulse 1.6s ease-in-out infinite",
  },

  header: {
    display: "flex",
    gap: 14,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: { fontSize: 28, fontWeight: 900, letterSpacing: 0.2 },
  subtitle: { marginTop: 6, fontSize: 14, opacity: 0.75 },
  list: { margin: "14px 0 0", padding: 0, listStyle: "none" },
  li: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: "8px 0",
    fontSize: 15,
    fontWeight: 700,
    opacity: 0.92,
  },
  emoji: { width: 22, textAlign: "center", opacity: 0.95 },
  footer: { display: "flex", justifyContent: "flex-end", marginTop: 14 },
  btnGhost: {
    borderRadius: 14,
    padding: "10px 14px",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    fontWeight: 800,
    pointerEvents: "auto",
  },
  btnPrimary: {
    borderRadius: 16,
    padding: "12px 16px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    fontWeight: 900,
    pointerEvents: "auto",
  },
};
