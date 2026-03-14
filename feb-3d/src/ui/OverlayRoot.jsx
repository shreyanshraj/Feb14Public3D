import { useEffect, useRef, useState } from "react";
import { useStoryStore } from "../store/useStoryStore";
import { audio } from "../three/Audio";

export default function OverlayRoot() {
  const scene = useStoryStore((s) => s.scene);

  const audioUnlocked = useStoryStore((s) => s.audioUnlocked);
  const muted = useStoryStore((s) => s.muted);

  const startApp = useStoryStore((s) => s.startApp);
  const toggleMuted = useStoryStore((s) => s.toggleMuted);

  const didInit = useRef(false);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    if (!audioUnlocked) {
      audio.setMuted(muted);
      return;
    }

    if (!didInit.current) {
      didInit.current = true;
      audio.setMuted(muted);
      return;
    }

    audio.setMutedSmooth(muted, 280);
  }, [muted, audioUnlocked]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const onStart = (startMuted) => {
    // user gesture -> unlock audio + persist preference
    startApp({ muted: startMuted });

    // apply immediately
    audio.setMuted(startMuted);

    // play click only if NOT muted
    if (!startMuted) audio.play("click");
  };

  const showToast = (message) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 900);
  };

  return (
    <div style={styles.root}>
      {!audioUnlocked && (
        <div style={styles.centerCard}>
          <div style={styles.title}>I made something special ✨</div>
          <div style={styles.subtitle}>
            Music is buggy on some scenes, press mute/unmute icon on top right
            to play/pause music!
          </div>

          <div style={styles.row}>
            <button style={styles.primaryBtn} onClick={() => onStart(false)}>
              Music Enabled 🔊
            </button>
            <button style={styles.secondaryBtn} onClick={() => onStart(true)}>
              No Music 🔇
            </button>
          </div>

          <div style={styles.note}>Your choice will be remembered.</div>
        </div>
      )}

      {audioUnlocked && scene === "SCENE_0" && (
        <div style={styles.loadingText}>Loading something special for you…</div>
      )}

      {audioUnlocked && (
        <button
          onClick={() => {
            const willUnmute = muted; // if muted now, toggle will unmute
            toggleMuted();

            // play click only if currently unmuted
            if (!muted) audio.play("click");

            showToast(willUnmute ? "Sound on" : "Muted");
          }}
          style={styles.muteToggle}
          aria-label={muted ? "Unmute" : "Mute"}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      )}

      {audioUnlocked && toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

const styles = {
  root: {
    position: "absolute",
    inset: 0,
    color: "white",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    pointerEvents: "none",
    zIndex: 9999000, // keep overlay layer above canvas
  },
  centerCard: {
    pointerEvents: "auto",
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "min(520px, calc(100vw - 48px))",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 20,
    textAlign: "center",
    backdropFilter: "blur(10px)",
    zIndex: 9999998,
  },
  title: { fontSize: 18, fontWeight: 600, marginBottom: 6, opacity: 0.95 },
  subtitle: { fontSize: 13, opacity: 0.7, marginBottom: 16 },
  row: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  primaryBtn: {
    borderRadius: 12,
    padding: "12px 16px",
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.12)",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
  },
  secondaryBtn: {
    borderRadius: 12,
    padding: "12px 16px",
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(0,0,0,0.25)",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
  },
  note: { fontSize: 12, opacity: 0.55, marginTop: 12 },
  loadingText: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    opacity: 0.9,
    fontSize: 18,
    zIndex: 9999998,
  },
  muteToggle: {
    pointerEvents: "auto",
    position: "absolute",
    right: 16,
    top: 16,
    width: 44,
    height: 44,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
    fontSize: 18,
    display: "grid",
    placeItems: "center",
    backdropFilter: "blur(10px)",
    zIndex: 9999999,
  },
  toast: {
    pointerEvents: "none",
    position: "absolute",
    right: 16,
    top: 70,
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
    fontSize: 12,
    opacity: 0.9,
    zIndex: 9999999,
  },
  sceneHud: {
    pointerEvents: "none",
    position: "absolute",
    left: 12,
    bottom: 12,
    padding: "6px 10px",
    borderRadius: 12,
    background: "rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: 12,
    opacity: 0.9,
    zIndex: 9999999,
  },
};
