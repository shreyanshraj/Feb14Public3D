import { useEffect, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useStoryStore } from "../../store/useStoryStore";
import { audio } from "../../three/Audio";

export default function Scene0_Loading() {
  const setScene = useStoryStore((s) => s.setScene);
  const audioUnlocked = useStoryStore((s) => s.audioUnlocked);
  const muted = useStoryStore((s) => s.muted);

  const [showHint, setShowHint] = useState(false);

  const hintTimerRef = useRef(null);
  const goTimerRef = useRef(null);

  useEffect(() => {
    if (!audioUnlocked) return;

    // Go to Scene1 quickly so envelope is visible,
    // but DO NOT stop heartbeat here.
    goTimerRef.current = setTimeout(() => {
      setScene("SCENE_1");
    }, 600);

    if (!muted) {
      audio.ensure("heartbeat");
      audio.fade("heartbeat", 0, 0.8, 500);
    }

    // Show hint if user hasn't interacted for ~2.5s
    hintTimerRef.current = setTimeout(() => {
      setShowHint(true);
      if (!muted) audio.play("whisper"); // whisper_psst
    }, 2500);

    return () => {
      if (goTimerRef.current) clearTimeout(goTimerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [audioUnlocked, muted, setScene]);

  if (!showHint) return null;

  return (
    <Html
      fullscreen
      portal={document.body}
      prepend
      style={{ pointerEvents: "none" }}
    >
      <div style={hintStyles.wrap}>
        <div style={hintStyles.bubble}>👆 Click on the envelope</div>
      </div>
    </Html>
  );
}

const hintStyles = {
  wrap: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingBottom: 110,
    zIndex: 2147483647,
  },
  bubble: {
    pointerEvents: "none",
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.55)",
    color: "white",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    fontSize: 13,
    fontWeight: 700,
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
  },
};
