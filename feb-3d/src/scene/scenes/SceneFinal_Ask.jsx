import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import confetti from "canvas-confetti";
import { Fireworks } from "fireworks-js";
import { Html } from "@react-three/drei";
import { useStoryStore } from "../../store/useStoryStore";

export default function SceneFinal_Ask() {
  const setScene = useStoryStore((s) => s.setScene);
  const resetStory = useStoryStore((s) => s.resetStory);

  const fireworksRef = useRef(null);
  const fireworksInstanceRef = useRef(null);

  const confettiCanvasRef = useRef(null);
  const confettiInstanceRef = useRef(null);

  const [sparkle, setSparkle] = useState(0);

  const hearts = useMemo(() => {
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: 26 }).map((_, i) => ({
      id: i,
      left: seededRandom(i * 1.1) * 100,
      size: 10 + seededRandom(i * 1.2) * 26,
      duration: 8 + seededRandom(i * 1.3) * 10,
      delay: seededRandom(i * 1.4) * 6,
      sway: 12 + seededRandom(i * 1.5) * 26,
      blur: seededRandom(i * 1.6) < 0.25 ? 2 : 0,
      opacity: 0.35 + seededRandom(i * 1.7) * 0.55,
      rotation: -20 + seededRandom(i * 1.8) * 40,
    }));
  }, []);

  // ✅ BIG CONFETTI BOOM (used by click anywhere + buttons)
  const handleBigBoom = useCallback(() => {
    const myConfetti = confettiInstanceRef.current;
    if (!myConfetti) return;

    const end = Date.now() + 1100;

    const frame = () => {
      const timeLeft = end - Date.now();

      myConfetti({
        particleCount: 18,
        spread: 70,
        startVelocity: 55,
        gravity: 0.95,
        decay: 0.92,
        scalar: 1.05,
        origin: { x: Math.random(), y: 0.55 + Math.random() * 0.2 },
      });

      if (timeLeft > 0) requestAnimationFrame(frame);
    };

    frame();
    setSparkle((v) => v + 2);
  }, []);

  // ✅ robust fireworks restart (works even if not initialized yet)
  const restartFireworks = useCallback(() => {
    const fwEl = fireworksRef.current;

    if (!fireworksInstanceRef.current && fwEl) {
      fireworksInstanceRef.current = new Fireworks(fwEl, {
        autoresize: true,
        opacity: 0.9,
        acceleration: 1.04,
        friction: 0.985,
        gravity: 1.5,
        particles: 110,
        traceLength: 3,
        traceSpeed: 8,
        intensity: 38,
        explosion: 6,
        hue: { min: 0, max: 360 },
        sound: { enabled: false },
        delay: { min: 18, max: 34 },
        rocketsPoint: { min: 25, max: 75 },
        lineWidth: {
          explosion: { min: 1, max: 3 },
          trace: { min: 1, max: 2 },
        },
        brightness: { min: 55, max: 90 },
        decay: { min: 0.012, max: 0.02 },
        mouse: { click: true, move: false, max: 1 },
      });

      fireworksInstanceRef.current.start();
      return;
    }

    try {
      fireworksInstanceRef.current?.stop();
      fireworksInstanceRef.current?.start();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let raf = 0;
    let intervalId = null;

    const initWhenReady = () => {
      const canvas = confettiCanvasRef.current;
      const fwEl = fireworksRef.current;

      // Wait until Html portal has mounted and refs exist
      if (!canvas || !fwEl) {
        raf = requestAnimationFrame(initWhenReady);
        return;
      }

      // CONFETTI INSTANCE
      confettiInstanceRef.current = confetti.create(canvas, {
        resize: true,
        useWorker: true,
      });

      // FIREWORKS INSTANCE
      if (!fireworksInstanceRef.current) {
        fireworksInstanceRef.current = new Fireworks(fwEl, {
          autoresize: true,
          opacity: 0.9,
          acceleration: 1.04,
          friction: 0.985,
          gravity: 1.5,
          particles: 110,
          traceLength: 3,
          traceSpeed: 8,
          intensity: 38,
          explosion: 6,
          hue: { min: 0, max: 360 },
          sound: { enabled: false },
          delay: { min: 18, max: 34 },
          rocketsPoint: { min: 25, max: 75 },
          lineWidth: {
            explosion: { min: 1, max: 3 },
            trace: { min: 1, max: 2 },
          },
          brightness: { min: 55, max: 90 },
          decay: { min: 0.012, max: 0.02 },
          mouse: { click: true, move: false, max: 1 },
        });

        fireworksInstanceRef.current.start();
      }

      // AUTO BURSTS
      const burst = (power = 1) => {
        const myConfetti = confettiInstanceRef.current;
        if (!myConfetti) return;

        const base = 120 * power;

        myConfetti({
          particleCount: Math.floor(base),
          spread: 70,
          startVelocity: 55,
          decay: 0.92,
          scalar: 1.05,
          origin: { x: 0.5, y: 0.6 },
        });

        myConfetti({
          particleCount: Math.floor(base * 0.55),
          spread: 55,
          startVelocity: 65,
          angle: 60,
          origin: { x: 0.05, y: 0.65 },
        });

        myConfetti({
          particleCount: Math.floor(base * 0.55),
          spread: 55,
          startVelocity: 65,
          angle: 120,
          origin: { x: 0.95, y: 0.65 },
        });

        myConfetti({
          particleCount: Math.floor(base * 0.45),
          spread: 110,
          startVelocity: 25,
          drift: 0.6,
          gravity: 0.8,
          scalar: 0.9,
          origin: { x: 0.5, y: 0.35 },
        });

        setSparkle((v) => v + 1);
      };

      burst(1.15);
      intervalId = setInterval(() => burst(0.85 + Math.random() * 0.65), 2600);

      const onPointerDown = (e) => {
        // don’t trigger when clicking buttons
        if (e.target.closest("button")) return;
        handleBigBoom();
      };

      window.addEventListener("pointerdown", onPointerDown);

      // Cleanup function for after init
      return () => {
        window.removeEventListener("pointerdown", onPointerDown);
      };
    };

    let initCleanup = null;

    const start = () => {
      initCleanup = initWhenReady();
    };

    start();

    return () => {
      cancelAnimationFrame(raf);
      if (intervalId) clearInterval(intervalId);

      if (typeof initCleanup === "function") initCleanup();

      try {
        fireworksInstanceRef.current?.stop();
      } catch {
        console.log("====================================");
        console.log("Error stopping fireworks instance");
        console.log("====================================");
      }
      fireworksInstanceRef.current = null;

      try {
        confettiInstanceRef.current?.reset?.();
      } catch {
        console.log("====================================");
        console.log("Error resetting confetti instance");
        console.log("====================================");
      }
      confettiInstanceRef.current = null;
    };
  }, [handleBigBoom]);

  return (
    <group>
      <Html
        fullscreen
        portal={document.body}
        prepend
        style={{ pointerEvents: "auto" }}
      >
        <div className="vday">
          {/* full-page background FX */}
          <div ref={fireworksRef} className="fireworks" aria-hidden="true" />
          <canvas
            ref={confettiCanvasRef}
            className="confetti"
            aria-hidden="true"
          />
          <div className="grain" aria-hidden="true" />

          {/* floating hearts */}
          <div className="hearts" aria-hidden="true">
            {hearts.map((h) => (
              <span
                key={h.id}
                className="heart"
                style={{
                  left: `${h.left}vw`,
                  fontSize: `${h.size}px`,
                  animationDuration: `${h.duration}s`,
                  animationDelay: `${h.delay}s`,
                  filter: `blur(${h.blur}px)`,
                  opacity: h.opacity,
                  transform: `rotate(${h.rotation}deg)`,
                  ["--sway"]: `${h.sway}px`,
                }}
              >
                ❤
              </span>
            ))}
          </div>

          <main className="content" role="button" tabIndex={0}>
            <div className="badge">
              <span className="dot" />
              <span>John's and Jane's Valentine 2026</span>
              <span className="dot" />
            </div>

            <h1 className="headline">
              We will have an <span className="shine">amazing</span>
              <br />
              14th february weekend
            </h1>

            {/* <p className="sub">
              Tap anywhere for a <span className="pop">big celebration</span>.
            </p> */}

            <div className="ctaRow">
              <button
                className="cta"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBigBoom();
                }}
              >
                Make it rain ✨
              </button>

              <button
                className="cta secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  restartFireworks();
                  handleBigBoom();
                }}
              >
                Fireworks + Confetti 🎆
              </button>
            </div>

            <div className="ctaRow" style={{ marginTop: 14 }}>
              <button
                className="cta secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setScene("SCENE_4");
                }}
              >
                ← Back
              </button>

              <button
                className="cta"
                onClick={(e) => {
                  e.stopPropagation();
                  resetStory();
                }}
              >
                Restart ♻️
              </button>
            </div>

            <div className="sparkles" aria-hidden="true">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={`${sparkle}-${i}`}
                  className="spark"
                  style={{ left: `${10 + i * 8}%` }}
                />
              ))}
            </div>
          </main>

          <style>{`
            :root{
              --bg1:#0b0620;
              --bg2:#220b2d;
              --bg3:#420d2e;
              --pink:#ff4fd8;
              --rose:#ff3b7c;
              --gold:#ffd37a;
              --ice:#a7f1ff;
              --white:rgba(255,255,255,.92);
            }

            .vday{
              position:absolute;
              inset:0;
              width:100vw;
              height:100vh;
              overflow:hidden;
              background:
                radial-gradient(1200px 600px at 20% 20%, rgba(255,79,216,.24), transparent 60%),
                radial-gradient(900px 500px at 80% 30%, rgba(167,241,255,.18), transparent 60%),
                radial-gradient(900px 650px at 55% 85%, rgba(255,59,124,.20), transparent 65%),
                linear-gradient(135deg, var(--bg1), var(--bg2) 45%, var(--bg3));
              display:flex;
              align-items:center;
              justify-content:center;
              padding:24px;
              font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji","Segoe UI Emoji";
            }

            .fireworks{
              position:absolute;
              inset:0;
              width:100vw;
              height:100vh;
              z-index:1;
              opacity:.9;
              pointer-events:none;
            }

            /* ✅ Put confetti ABOVE grain + hearts so it's visible */
            .confetti{
              position:absolute;
              inset:0;
              width:100vw;
              height:100vh;
              display:block;
              z-index:4;
              pointer-events:none;
            }

            .grain{
              position:absolute;
              inset:-20%;
              z-index:3;
              pointer-events:none;
              opacity:.25;
              background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E");
              animation: grainMove 6s steps(8) infinite;
              mix-blend-mode: overlay;
            }
            @keyframes grainMove{
              0%{ transform:translate(0,0) }
              20%{ transform:translate(-5%,3%) }
              40%{ transform:translate(4%,-6%) }
              60%{ transform:translate(-3%,-2%) }
              80%{ transform:translate(6%,4%) }
              100%{ transform:translate(0,0) }
            }

            .hearts{
              position:absolute;
              inset:0;
              z-index:2;
              pointer-events:none;
            }

            .heart{
              position:absolute;
              bottom:-40px;
              color:rgba(255,79,216,.85);
              text-shadow:
                0 0 12px rgba(255,79,216,.45),
                0 0 28px rgba(255,59,124,.35);
              animation-name: floatUp;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
              will-change: transform, opacity;
            }

            @keyframes floatUp{
              0%{ transform:translateY(0) translateX(0); opacity:0; }
              10%{ opacity:1; }
              50%{ transform:translateY(-55vh) translateX(calc(var(--sway) * -1)) rotate(8deg); }
              100%{ transform:translateY(-110vh) translateX(var(--sway)) rotate(-10deg); opacity:0; }
            }

            .content{
              position:relative;
              z-index:5;
              width:min(980px, 92vw);
              border-radius:28px;
              padding:42px 26px;
              text-align:center;
              cursor:pointer;
              user-select:none;

              background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.04));
              border:1px solid rgba(255,255,255,.16);
              box-shadow:
                0 24px 80px rgba(0,0,0,.55),
                inset 0 0 0 1px rgba(255,255,255,.08);

              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              transform: translateY(0);
              transition: transform .25s ease, box-shadow .25s ease;
              outline:none;
            }
            .content:hover{
              transform: translateY(-2px);
              box-shadow:
                0 28px 90px rgba(0,0,0,.60),
                0 0 0 1px rgba(255,79,216,.18),
                inset 0 0 0 1px rgba(255,255,255,.08);
            }

            .badge{
              display:inline-flex;
              gap:10px;
              align-items:center;
              justify-content:center;
              padding:10px 14px;
              border-radius:999px;
              background: rgba(0,0,0,.25);
              border:1px solid rgba(255,255,255,.14);
              color: rgba(255,255,255,.86);
              letter-spacing:.4px;
              font-size:13px;
              margin-bottom:18px;
            }
            .dot{
              width:8px; height:8px;
              border-radius:999px;
              background: radial-gradient(circle at 30% 30%, var(--ice), var(--pink));
              box-shadow: 0 0 16px rgba(167,241,255,.5);
            }

            .headline{
              margin:0;
              padding-bottom:.5em;
              line-height:1.02;
              font-weight:800;
              font-size: clamp(38px, 6vw, 74px);
              letter-spacing: -1px;
              color: var(--white);
              text-transform: lowercase;
              text-shadow:
                0 10px 40px rgba(0,0,0,.55),
                0 0 22px rgba(255,79,216,.22);
            }

            .shine{
              display:inline-block;
              background: linear-gradient(90deg, rgba(255,255,255,.6), rgba(255,211,122,.95), rgba(255,79,216,.95), rgba(255,255,255,.65));
              background-size: 220% 100%;
              -webkit-background-clip:text;
              background-clip:text;
              color:transparent;
              animation: shimmer 2.6s ease-in-out infinite;
            }
            @keyframes shimmer{
              0%{ background-position: 0% 0%;}
              50%{ background-position: 100% 0%;}
              100%{ background-position: 0% 0%;}
            }

            .sub{
              margin:14px 0 22px;
              color: rgba(255,255,255,.78);
              font-size: clamp(14px, 2.1vw, 18px);
            }
            .pop{
              color: rgba(255,211,122,.95);
              text-shadow: 0 0 18px rgba(255,211,122,.22);
              font-weight:700;
            }

            .ctaRow{
              display:flex;
              gap:12px;
              justify-content:center;
              flex-wrap:wrap;
              margin-top:8px;
            }

            .cta{
              appearance:none;
              border:none;
              border-radius:16px;
              padding:12px 16px;
              min-width: 180px;
              font-weight:800;
              letter-spacing:.2px;
              color: rgba(0,0,0,.85);
              background: linear-gradient(90deg, var(--gold), rgba(255,79,216,.92));
              box-shadow:
                0 16px 40px rgba(0,0,0,.35),
                0 0 0 1px rgba(255,255,255,.12) inset,
                0 0 26px rgba(255,79,216,.22);
              cursor:pointer;
              transform: translateY(0);
              transition: transform .15s ease, filter .15s ease;
            }
            .cta:hover{ transform: translateY(-1px); filter: brightness(1.05); }
            .cta:active{ transform: translateY(1px) scale(.99); }

            .cta.secondary{
              color: rgba(255,255,255,.90);
              background: linear-gradient(90deg, rgba(255,59,124,.85), rgba(167,241,255,.45));
              border: 1px solid rgba(255,255,255,.18);
            }

            .sparkles{
              position:absolute;
              left:8%;
              right:8%;
              bottom:18px;
              height:24px;
              pointer-events:none;
              overflow:hidden;
              opacity:.9;
            }
            .spark{
              position:absolute;
              bottom:0;
              width:12px;
              height:12px;
              border-radius:999px;
              background: radial-gradient(circle at 35% 35%, rgba(255,255,255,.95), rgba(167,241,255,.55), rgba(255,79,216,.20));
              filter: blur(.1px);
              animation: sparkRise 1.4s ease-in-out forwards;
              box-shadow: 0 0 18px rgba(167,241,255,.25);
            }
            @keyframes sparkRise{
              0%{ transform: translateY(10px) scale(.5); opacity:0; }
              25%{ opacity:1; }
              100%{ transform: translateY(-34px) scale(1.05); opacity:0; }
            }

            @media (prefers-reduced-motion: reduce){
              .heart, .shine, .grain, .spark{ animation:none !important; }
              .content{ transition:none; }
            }
          `}</style>
        </div>
      </Html>
    </group>
  );
}
