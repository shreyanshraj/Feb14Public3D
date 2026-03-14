import { useEffect, useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useStoryStore } from "../../store/useStoryStore";
import { audio } from "../../three/Audio";

export default function Scene2_YesNo() {
  const setScene = useStoryStore((s) => s.setScene);
  const muted = useStoryStore((s) => s.muted);

  const [noCount, setNoCount] = useState(0);
  const [mode, setMode] = useState("CHOICE"); 
  const [glitchOn, setGlitchOn] = useState(false);

  const redirectTimer = useRef(null);

  const noMessages = useMemo(
    () => [
      "Error 404: You’re too cute to say no.",
      "Error 404: ‘No’ not found. Try again 😤",
      "Error 404: Permission denied (because I like you).",
    ],
    [],
  );

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const goScene3 = () => {
    setScene("SCENE_3");
  };

  const backToScene1 = () => {
    setScene("SCENE_1");
  };

  const playHappy = () => {
    if (!muted) audio.play("bgSoft"); // replace with "happy" when you add it
  };

  const playSad = () => {
    if (!muted) audio.play("noEffect"); // replace with "sadTrombone" when you add it
  };

  const triggerGlitch = () => {
    setMode("GLITCH");
    setGlitchOn(true);

    // quick glitch burst
    setTimeout(() => setGlitchOn(false), 180);
    setTimeout(() => setGlitchOn(true), 320);
    setTimeout(() => setGlitchOn(false), 520);
  };

  const onYes = (e) => {
    e?.stopPropagation?.();
    playHappy();
    // optional: stop bg music before celebration, or keep it
    audio.fade("bgSoft", 0.4, 0.0, 250);
    setTimeout(() => audio.stop("bgSoft"), 300);
    goScene3();
  };

  const onNo = (e) => {
    e?.stopPropagation?.();
    playSad();

    setNoCount((prev) => {
      const next = prev + 1;

      triggerGlitch();

      // After 2–3 clicks, show the “avatar” plea, then auto-redirect back
      if (next >= 3) {
        setMode("AVATAR");
        if (redirectTimer.current) clearTimeout(redirectTimer.current);

        redirectTimer.current = setTimeout(() => {
          backToScene1();
        }, 1800);
      }

      return next;
    });
  };

  const errorText = noMessages[Math.min(noCount, noMessages.length - 1)];

  return (
    <>
      {/* Optional: subtle 3D ambient hint in canvas space */}
      <group position={[0, 0, 0]} />

      {/* Fullscreen UI */}
      <Html prepend fullscreen style={{ pointerEvents: "auto" }}>
        <div style={styles.root}>
          {/* glitch overlay */}
          {glitchOn && <div style={styles.glitchOverlay} />}

          {mode === "CHOICE" && (
            <div style={styles.card}>
              <div style={styles.title}>
                I Might Have Weekend Plans (Hint: You)
              </div>
              <div style={styles.subtitle}>
                Spoiler: It involves smiles and maybe food.
              </div>

              <div style={styles.row}>
                <button style={styles.yesBtn} onClick={onYes}>
                  💖 Okay, I’m listening
                </button>
                <button style={styles.noBtn} onClick={onNo}>
                  🙄 No, I’m busy
                </button>
              </div>

              <div style={styles.hint}>Pick one. I’m not nervous at all 😅</div>
            </div>
          )}

          {mode === "GLITCH" && (
            <div style={styles.errorWrap}>
              <div style={styles.errorCard}>
                <div style={styles.errorTop}>404</div>
                <div style={styles.errorMsg}>{errorText}</div>
                <button
                  style={styles.tryAgainBtn}
                  onClick={() => setMode("CHOICE")}
                >
                  Go back
                </button>
              </div>
            </div>
          )}

          {mode === "AVATAR" && (
            <div style={styles.errorWrap}>
              <div style={styles.avatarCard}>
                <div style={styles.avatarTitle}>Wait—</div>
                <div style={styles.avatarMsg}>
                  Please reconsider. I worked hard. 🥲
                </div>
                <div style={styles.avatarSub}>
                  Redirecting you back in a sec…
                </div>

                <button style={styles.tryAgainBtn} onClick={backToScene1}>
                  Okay okay, take me back
                </button>
              </div>
            </div>
          )}
        </div>
      </Html>
    </>
  );
}

const styles = {
  root: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.35)",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    color: "white",
  },

  card: {
    width: "min(620px, calc(100vw - 40px))",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    padding: 22,
    textAlign: "center",
    backdropFilter: "blur(12px)",
  },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  subtitle: { fontSize: 14, opacity: 0.75, marginBottom: 16 },
  row: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  hint: { marginTop: 14, fontSize: 12, opacity: 0.6 },

  yesBtn: {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.14)",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
  noBtn: {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.28)",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },

  glitchOverlay: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    background:
      "linear-gradient(90deg, rgba(255,0,80,0.10), rgba(0,255,255,0.08), rgba(255,255,255,0.05))",
    mixBlendMode: "screen",
    animation: "glitch 0.12s steps(2) infinite",
  },

  errorWrap: {
    width: "min(720px, calc(100vw - 40px))",
    display: "grid",
    placeItems: "center",
  },
  errorCard: {
    width: "100%",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.55)",
    padding: 22,
    textAlign: "center",
    backdropFilter: "blur(10px)",
  },
  errorTop: { fontSize: 54, fontWeight: 900, letterSpacing: 2, opacity: 0.9 },
  errorMsg: { fontSize: 14, opacity: 0.85, marginTop: 6, marginBottom: 14 },

  avatarCard: {
    width: "100%",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.55)",
    padding: 22,
    textAlign: "center",
    backdropFilter: "blur(10px)",
  },
  avatarTitle: { fontSize: 22, fontWeight: 800, marginBottom: 6 },
  avatarMsg: { fontSize: 14, opacity: 0.9, marginBottom: 6 },
  avatarSub: { fontSize: 12, opacity: 0.65, marginBottom: 14 },

  tryAgainBtn: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.10)",
    color: "white",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
  },
};
