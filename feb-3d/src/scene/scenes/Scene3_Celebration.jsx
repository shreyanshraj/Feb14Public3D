import { useEffect, useRef, useState, useCallback } from "react";
import { Html } from "@react-three/drei";
import { useStoryStore } from "../../store/useStoryStore";
import { audio } from "../../three/Audio";

export default function Scene3_Celebration() {
  const setScene = useStoryStore((s) => s.setScene);
  const muted = useStoryStore((s) => s.muted);

  const [petals, setPetals] = useState([]);
  const intervalRef = useRef(null);
  const idRef = useRef(0);


  useEffect(() => {
    if (!muted) {
      audio.ensure("bgSoft"); 
      audio.play("bgSoft"); 
      try {
        audio.play("cheer");
      } catch {
        audio.play("click");
      }
    }
  }, []); 

  
  useEffect(() => {
    if (muted) {
      audio.stop("bgSoft");
      return;
    }
    audio.ensure("bgSoft");
    audio.play("bgSoft");
  }, [muted]);

  // ✅ petal spawner
  useEffect(() => {
    const spawn = () => {
      const id = idRef.current++;
      const dur = 1.2 + Math.random() * 1.3;
      const delay = Math.random() * 0.25; // small stagger

      const p = {
        id,
        left: Math.random() * 100,
        size: 14 + Math.random() * 20,
        dur,
        delay,
        opacity: 0.45 + Math.random() * 0.35,
      };

      setPetals((prev) => [...prev, p]);

      // remove after it finishes
      const ttl = (dur + delay + 0.2) * 1000;
      window.setTimeout(() => {
        setPetals((prev) => prev.filter((x) => x.id !== id));
      }, ttl);
    };

    // pre-fill a little burst
    for (let i = 0; i < 20; i++) spawn();

    intervalRef.current = window.setInterval(() => {
      // spawn a few per tick for density
      spawn();
      if (Math.random() < 0.6) spawn();
    }, 180);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const onContinue = useCallback(() => {
    // stop spawning immediately
    if (intervalRef.current) window.clearInterval(intervalRef.current);

    if (!muted) audio.play("click");
    setScene("SCENE_4");
  }, [muted, setScene]);

  return (
    <group>
      <Html prepend fullscreen style={{ pointerEvents: "auto" }}>
        <style>{`
          @keyframes floatDown {
            0%   { transform: translate3d(0, -12vh, 0) rotate(0deg); opacity: 0; }
            12%  { opacity: 1; }
            100% { transform: translate3d(0, 110vh, 0) rotate(180deg); opacity: 0; }
          }
          @keyframes popIn {
            0% { transform: scale(0.96); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>

        <div style={styles.wrap}>
          {petals.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.left}vw`,
                top: 0,
                fontSize: p.size,
                opacity: p.opacity,
                animation: `floatDown ${p.dur}s linear ${p.delay}s 1`,
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              💐
            </div>
          ))}

          <div style={styles.card}>
            <div style={styles.big}>🎉</div>
            <div style={styles.title}>
              See? You’re already making smart decisions.❤️
            </div>
            <div style={styles.sub}>
              Should we start planning your day/weekend?
            </div>

            <button style={styles.btn} onClick={onContinue}>
              Let’s do it!
            </button>
          </div>
        </div>
      </Html>
    </group>
  );
}

const styles = {
  wrap: {
    position: "absolute", // ✅ important for zIndex stacking
    inset: 0,
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.72)",
    color: "white",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    zIndex: 999999, // ✅ makes sure this overlay sits above other DOM layers
  },
  card: {
    width: "min(620px, calc(100vw - 44px))",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
    padding: 18,
    textAlign: "center",
    animation: "popIn 220ms ease-out",
  },
  big: { fontSize: 40, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: 800, opacity: 0.95 },
  sub: { marginTop: 8, fontSize: 14, opacity: 0.8 },
  btn: {
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.12)",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
  small: { marginTop: 10, fontSize: 11, opacity: 0.55 },
};
