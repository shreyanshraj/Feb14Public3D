import { useEffect, useMemo, useState, useCallback } from "react";
import { Html } from "@react-three/drei";
import { useStoryStore } from "../../store/useStoryStore";
import { audio } from "../../three/Audio";

export default function Scene4_Cards() {
  const setScene = useStoryStore((s) => s.setScene);
  const setDayChoice = useStoryStore((s) => s.setDayChoice);
  const muted = useStoryStore((s) => s.muted);
  const toggleMuted = useStoryStore((s) => s.toggleMuted);

  const [selected, setSelected] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    // start/resume bg music for this scene (muting is handled globally by AudioSync)
    audio.ensure("bgSoft");
  }, []);

  useEffect(() => {
    console.log("Scene4 muted:", muted);
  }, [muted]);

  const cards = useMemo(
    () => [
      {
        id: "DINNER",
        title: "Dinner 🍽️",
        desc: "A cozy plan. Soft lights, good food, and you.",
        img: "images/dinner.png",
      },
      {
        id: "CITY",
        title: "City Night 🌆",
        desc: "A night drive + skyline + music vibes.",
        img: "images/city.png",
      },
      {
        id: "DESERT",
        title: "Desert Sunset 🌵",
        desc: "Golden hour, quiet moments, warm breeze.",
        img: "images/desert.png",
      },
      {
        id: "CHEST",
        title: "Secret Choice ✨",
        desc: "Dangerously cute. Click if you’re curious.",
        img: "images/test.png",
        special: true,
      },
    ],
    [],
  );

  const playClick = useCallback(() => {
    if (muted) return;
    try {
      audio.play("click");
    } catch {
      // ignore
    }
  }, [muted]);

  const go = useCallback(
    (choiceId) => {
      setSelected(choiceId);
      playClick();
      setDayChoice(choiceId); // routes to SCENE_5A–5D
    },
    [playClick, setDayChoice],
  );

  return (
    <group>
      <Html
        fullscreen
        portal={document.body}
        prepend
        style={{ pointerEvents: "auto" }}
        zIndexRange={[2147483647, 0]}
      >
        <div style={styles.wrap}>
          <button
            style={styles.muteBtn}
            onClick={(e) => {
              e.stopPropagation();
              toggleMuted();
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.08)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <div style={styles.panel}>
            <div style={styles.header}>
              <div style={styles.kicker}>
                How would you like to spend your day?
              </div>
              <div style={styles.subKicker}>Choose one card 👇</div>

              <button
                style={styles.backBtn}
                onClick={() => {
                  playClick();
                  setScene("SCENE_3");
                }}
              >
                ← Back
              </button>
            </div>

            
            <div style={styles.grid} aria-label="Options">
              {cards.map((c) => {
                const isHovered = hoveredId === c.id;
                const isSelected = selected === c.id;

                return (
                  <button
                    key={c.id}
                    style={{
                      ...styles.card,
                      ...(c.special ? styles.specialCard : null),

                      transform: isHovered
                        ? "translateY(-6px) scale(1.01)"
                        : isSelected
                          ? "translateY(-2px) scale(1.005)"
                          : "translateY(0px) scale(1)",

                      border: isHovered
                        ? "1px solid rgba(255,255,255,0.32)"
                        : isSelected
                          ? "1px solid rgba(255,255,255,0.28)"
                          : "1px solid rgba(255,255,255,0.16)",

                      background: isHovered
                        ? "rgba(255,255,255,0.10)"
                        : isSelected
                          ? "rgba(255,255,255,0.09)"
                          : c.special
                            ? "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))"
                            : "rgba(255,255,255,0.06)",
                    }}
                    onMouseEnter={() => setHoveredId(c.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(c.id)}
                    onBlur={() => setHoveredId(null)}
                    onClick={() => go(c.id)}
                  >
                    <div style={styles.cardTitle}>{c.title}</div>

                    <div style={styles.imgWrap}>
                      <img src={c.img} alt="" style={styles.img} />
                    </div>

                    <div style={styles.cardDesc}>{c.desc}</div>
                    <div style={styles.cta}>Choose →</div>
                  </button>
                );
              })}
            </div>

            <div style={styles.footer}>
              Tip: You can still mute/unmute from the top-right 🔊/🔇
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

const styles = {
  wrap: {
    position: "fiexed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    boxSizing: "border-box",
    background:
      "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.06), rgba(0,0,0,0.92))",
    color: "white",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    display: "grid",
    placeItems: "center",
    padding: 18,
    overflow: "hidden", 
  },
  muteBtn: {
    position: "absolute",
    top: 17,
    right: 18,
    zIndex: 2147483647,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.55)",
    color: "white",
    cursor: "pointer",

    fontWeight: 900,
    backdropFilter: "blur(8px)",
    transition: "transform .15s ease, background .15s ease",
  },
  panel: {
    width: "min(980px, 100%)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

 
  header: {
    position: "relative",
    textAlign: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  kicker: { fontSize: 18, fontWeight: 900, opacity: 0.95 },
  subKicker: { marginTop: 6, fontSize: 12, opacity: 0.6 },

  backBtn: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
    alignItems: "stretch",
  },

  card: {
    textAlign: "left",
    borderRadius: 18,
    padding: 16,
    cursor: "pointer",
    transition:
      "transform 180ms cubic-bezier(.2,.8,.2,1), background 180ms ease, border 180ms ease",
    minHeight: 220,
    overflow: "hidden",
  },

  specialCard: {},

  cardTitle: { fontSize: 18, fontWeight: 900, opacity: 0.95 },

  imgWrap: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    height: 110,
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  cardDesc: { marginTop: 10, fontSize: 13, opacity: 0.72, lineHeight: 1.35 },
  cta: { marginTop: 12, fontSize: 12, opacity: 0.7, fontWeight: 900 },

  footer: { textAlign: "center", fontSize: 12, opacity: 0.55 },
};
