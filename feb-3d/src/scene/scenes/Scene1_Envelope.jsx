/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Html, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStoryStore } from "../../store/useStoryStore";
import { audio } from "../../three/Audio";
import { PerspectiveCamera } from "@react-three/drei";

function TypewriterText({ text, start, speed = 28, onDone }) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(true);

  const hasRunRef = useRef(false);
  const onDoneRef = useRef(onDone);

  // keep latest callback without retriggering the typing effect
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // allow re-run only if start goes false again (new session)
    if (!start) {
      hasRunRef.current = false;
      return;
    }

    // if we already ran for this "start=true" session, do nothing
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    setOut("");
    setDone(false);

    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(t);
        setDone(true);
        onDoneRef.current?.();
      }
    }, speed);

    return () => clearInterval(t);
  }, [start, text, speed]);

  return (
    <div style={twStyles.text}>
      {out}
      {start && !done && <span style={twStyles.cursor}>|</span>}
    </div>
  );
}

export default function Scene1_Envelope() {
  const group = useRef();
  const letterAnchor = useRef();

  const startedRef = useRef(false);
  const htmlDelayRef = useRef(null);

  // ✅ Hint timer refs (new)
  const hintTimerRef = useRef(null);

  const setScene = useStoryStore((s) => s.setScene);
  const muted = useStoryStore((s) => s.muted);

  const [opened, setOpened] = useState(false);
  const [startTyping, setStartTyping] = useState(false);
  const [showLetterHtml, setShowLetterHtml] = useState(false);
  const [typingDone, setTypingDone] = useState(false);

  // ✅ Hint bubble state (new)
  const [showHint, setShowHint] = useState(false);

  const [noCount, setNoCount] = useState(0);
  const [nudgeText, setNudgeText] = useState("");
  const [showVideo, setShowVideo] = useState(false);

  const gltf = useGLTF("/models/envelope_new.glb");
  const { actions, mixer } = useAnimations(gltf.animations, group);

  const clips = useMemo(
    () => ({
      hover: "ENV_hover",
      body: "ENV_bodyAction",
      open: "Open_Flap",
      letter: "Letter_Slide",
    }),
    [],
  );

  const letterNode = useMemo(
    () => gltf.scene.getObjectByName("ENV_Letter"),
    [gltf],
  );

  // ---- stick-to-letter anchor ----
  const tmpM = useMemo(() => new THREE.Matrix4(), []);
  const tmpInv = useMemo(() => new THREE.Matrix4(), []);
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpQuat = useMemo(() => new THREE.Quaternion(), []);
  const tmpScale = useMemo(() => new THREE.Vector3(), []);
  const SNAP = 1e-4; // tune: 1e-3 to 1e-5

  useFrame(() => {
    if (!letterNode || !letterAnchor.current) return;

    letterNode.updateWorldMatrix(true, false);
    letterAnchor.current.parent?.updateWorldMatrix(true, false);

    tmpM.copy(letterNode.matrixWorld);

    const parent = letterAnchor.current.parent;
    if (parent) {
      tmpInv.copy(parent.matrixWorld).invert();
      tmpM.premultiply(tmpInv);
    }

    tmpM.decompose(tmpPos, tmpQuat, tmpScale);

    tmpM.decompose(tmpPos, tmpQuat, tmpScale);

    // snap position slightly to reduce jitter
    tmpPos.x = Math.round(tmpPos.x / SNAP) * SNAP;
    tmpPos.y = Math.round(tmpPos.y / SNAP) * SNAP;
    tmpPos.z = Math.round(tmpPos.z / SNAP) * SNAP;

    letterAnchor.current.position.copy(tmpPos);
    letterAnchor.current.quaternion.copy(tmpQuat);
    letterAnchor.current.scale.copy(tmpScale);

    letterAnchor.current.position.copy(tmpPos);
    letterAnchor.current.quaternion.copy(tmpQuat);
    letterAnchor.current.scale.copy(tmpScale);
  });

  // Clear pending timers on unmount
  useEffect(() => {
    return () => {
      if (htmlDelayRef.current) clearTimeout(htmlDelayRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  // ✅ Hint + whisper after 2.5s if envelope not opened (new)
  useEffect(() => {
    // only show hint before opening the envelope
    if (opened) {
      setShowHint(false);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      return;
    }

    setShowHint(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);

    hintTimerRef.current = setTimeout(() => {
      setShowHint(true);
      if (!muted) audio.play("whisper"); // whisper_psst
    }, 2500);

    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [opened, muted]);

  // Start idle loop
  useEffect(() => {
    if (!actions) return;

    Object.values(actions).forEach((a) => {
      if (!a) return;
      a.stop();
      a.enabled = false;
      a.setEffectiveWeight(0);
    });

    const body = actions[clips.body];
    if (body) {
      body.reset();
      body.enabled = true;
      body.setEffectiveWeight(1);
      body.setLoop(THREE.LoopRepeat, Infinity);
      body.clampWhenFinished = false;
      body.fadeIn(0.2).play();
    }
  }, [actions, clips.body]);

  const playHover = () => {
    if (opened) return;
    const hover = actions?.[clips.hover];
    if (!hover) return;

    hover.reset();
    hover.enabled = true;
    hover.setEffectiveWeight(1);
    hover.setLoop(THREE.LoopOnce, 1);
    hover.clampWhenFinished = false;
    hover.fadeIn(0.05).play();

    // optional: hover paper sfx
    // if (!muted) audio.play("paper");
  };

  const stopHover = () => {
    const hover = actions?.[clips.hover];
    if (!hover) return;
    hover.fadeOut(0.08);
  };

  const startLetterAndTyping = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const letter = actions?.[clips.letter];
    if (!mixer || !letter) return;

    letter.reset();
    letter.enabled = true;
    letter.setEffectiveWeight(1);
    letter.setLoop(THREE.LoopOnce, 1);
    letter.clampWhenFinished = true;
    letter.fadeIn(0.05).play();

    const handleLetterFinished = (e) => {
      if (e.action !== letter) return;
      mixer.removeEventListener("finished", handleLetterFinished);

      if (htmlDelayRef.current) clearTimeout(htmlDelayRef.current);
      htmlDelayRef.current = setTimeout(() => {
        setShowLetterHtml(true);
        setStartTyping(true);
      }, 500);
    };

    mixer.addEventListener("finished", handleLetterFinished);

    // fallback
    const letterMs = (letter.getClip()?.duration ?? 0.8) * 1000;
    if (htmlDelayRef.current) clearTimeout(htmlDelayRef.current);
    htmlDelayRef.current = setTimeout(() => {
      setShowLetterHtml(true);
      setStartTyping(true);
    }, letterMs + 500);
  }, [actions, clips.letter, mixer]);

  const onEnvelopeClick = () => {
    // stop heartbeat when user clicks envelope
    audio.fade("heartbeat", 0.8, 0, 250);
    setTimeout(() => audio.stop("heartbeat"), 260);

    // hide hint immediately on click
    setShowHint(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);

    // user gesture — start bg music here
    if (!muted) audio.ensure("bgSoft");

    if (opened) return;

    setOpened(true);
    setShowLetterHtml(false);
    setStartTyping(false);
    setTypingDone(false);
    setNoCount(0);
    setNudgeText("");
    setShowVideo(false);
    startedRef.current = false;

    if (htmlDelayRef.current) clearTimeout(htmlDelayRef.current);

    const open = actions?.[clips.open];
    if (!mixer || !open) return;

    [clips.hover, clips.body].forEach((k) => {
      const a = actions?.[k];
      if (!a) return;
      a.fadeOut(0.1);
      a.stop();
      a.enabled = false;
      a.setEffectiveWeight(0);
    });

    open.reset();
    open.enabled = true;
    open.setEffectiveWeight(1);
    open.setLoop(THREE.LoopOnce, 1);
    open.clampWhenFinished = true;
    open.fadeIn(0.05).play();

    const handleOpenFinished = (e) => {
      if (e.action !== open) return;
      mixer.removeEventListener("finished", handleOpenFinished);
      startLetterAndTyping();
    };
    mixer.addEventListener("finished", handleOpenFinished);

    const openMs = (open.getClip()?.duration ?? 0.8) * 1000;
    setTimeout(() => startLetterAndTyping(), openMs + 80);
  };

  const onYes = useCallback(
    (e) => {
      e?.stopPropagation?.();
      setScene("SCENE_2");
    },
    [setScene],
  );

  const onNo = useCallback(
    (e) => {
      e?.stopPropagation?.();

      setNoCount((prev) => {
        const next = prev + 1;

        // play SFX only first two times
        if (next <= 2 && !muted) {
          audio.play("click");
        }

        if (next === 1) setNudgeText("Are you sure? 😶 (think again)");
        if (next === 2) setNudgeText("Okay… last chance 🙃");

        if (next >= 3) {
          // hide letter UI
          setShowLetterHtml(false);
          setStartTyping(false);
          setTypingDone(false);
          setNudgeText("");

          // stop bg music so video audio is clear
          audio.fade("bgSoft", 0.4, 0, 250);
          setTimeout(() => audio.stop("bgSoft"), 300);

          // show video
          setShowVideo(true);
        }

        return next;
      });
    },
    [muted],
  );

  const onVideoEnded = useCallback(() => {
    setShowVideo(false);
    setScene("SCENE_0");
  }, [setScene]);

  const showChoices = showLetterHtml && typingDone && !showVideo;
  const handleTypingDone = useCallback(() => setTypingDone(true), []);

  return (
    <>
      {/* Lighting for Scene 1 */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 3, 4]} intensity={1.1} />
      <pointLight position={[0, 1.5, 1.5]} intensity={0.5} />

      <PerspectiveCamera makeDefault position={[0, 0.5, 3]} fov={55} />

      <group position={[0, 0.3, 0]}>
        <Html prepend fullscreen style={{ pointerEvents: "none" }}>
          <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
        </Html>

        {/* ✅ Hint bubble overlay (new) */}
        {showHint && !opened && (
          <Html
            fullscreen
            portal={document.body}
            prepend
            style={{ pointerEvents: "none" }}
          >
            <div style={hintStyles.wrap}>
              <div style={hintStyles.bubble}>👆 Click to continue</div>
            </div>
          </Html>
        )}

        {showVideo && (
          <Html prepend fullscreen style={{ pointerEvents: "auto" }}>
            <div style={uiStyles.videoOverlay}>
              {/* ✅ Top text */}
              <div style={uiStyles.videoTopText}>
                This feels incomplete without you next to me.
              </div>

              <video
                style={uiStyles.video}
                src="/video/rej_video.mp4"
                autoPlay
                playsInline
                controls={false}
                onEnded={onVideoEnded}
              />
            </div>
          </Html>
        )}

        <group
          ref={group}
          position={[0, -0.5, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <primitive
            object={gltf.scene}
            scale={1}
            onPointerOver={playHover}
            onPointerOut={stopHover}
            onClick={onEnvelopeClick}
          />

          {opened && letterNode && (
            <group ref={letterAnchor}>
              {showLetterHtml && (
                <Html
                  transform
                  occlude={false}
                  position={[0, 0.002, 0.002]}
                  rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
                  distanceFactor={3.5}
                  center
                  style={{
                    pointerEvents: "auto",
                    width: "auto",
                    transformStyle: "preserve-3d",
                    WebkitTransformStyle: "preserve-3d",
                    willChange: "transform",
                  }}
                >
                  <div
                    style={twStyles.paper}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TypewriterText
                      start={startTyping}
                      text={
                        "Hi 😊\n\nI wanted to ask you out in a slightly different way — not just the usual text or casual ask — because you’re genuinely special to me, and I wanted that to show.\n\nI’d love to plan something memorable together for this Valentine's weekend.\n\nWill you go on a date with me?"
                      }
                      speed={26}
                      onDone={handleTypingDone}
                    />

                    {nudgeText ? (
                      <div style={uiStyles.nudge}>{nudgeText}</div>
                    ) : null}

                    {showChoices && (
                      <div style={uiStyles.btnRow}>
                        <button style={uiStyles.yesBtn} onClick={onYes}>
                          Yes 💛
                        </button>
                        <button style={uiStyles.noBtn} onClick={onNo}>
                          No
                        </button>
                      </div>
                    )}
                  </div>
                </Html>
              )}
            </group>
          )}
        </group>
      </group>
    </>
  );
}

useGLTF.preload("/models/envelope_new.glb");

const twStyles = {
  paper: {
    width: 220, // make the panel larger in CSS px
    maxWidth: 420,
    padding: "14px",
    borderRadius: 14,
    background: "rgba(169, 138, 138, 0.92)",
    color: "#222",
    boxShadow: "0 10px 24px rgba(0,0,0,0.28)",
    whiteSpace: "pre-wrap",

    // key: make text bigger so it rasterizes with more pixels
    fontSize: 18,
    lineHeight: 1.35,

    // keep these
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    textRendering: "geometricPrecision",

    // helps compositing under transforms
    transform: "translateZ(0)",
    willChange: "transform",
    backfaceVisibility: "hidden",
  },
  text: {
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    fontSize: 18,
    lineHeight: 1.35,
    whiteSpace: "pre-wrap",
    color: "#ffffff",

    transform: "translateZ(0)",
    willChange: "transform",
  },
  cursor: {
    display: "inline-block",
    marginLeft: 0.5,
    animation: "blink 0.9s step-end infinite",
  },
};

const uiStyles = {
  btnRow: {
    display: "flex",
    gap: 10,
    marginTop: 10,
    justifyContent: "center",
  },
  yesBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.18)",
    color: "white",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  noBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.25)",
    color: "white",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  nudge: {
    marginTop: 8,
    padding: "6px 8px",
    borderRadius: 10,
    background: "rgba(0,0,0,0.25)",
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  videoOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
  },
  video: {
    width: "min(900px, 92vw)",
    height: "auto",
    borderRadius: 16,
    boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
  },
  videoTopText: {
    position: "absolute",
    top: -350,
    left: "50%",
    transform: "translateX(-50%)",

    width: 220,
    padding: "14px 16px",

    borderRadius: 18,
    background: "rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.18)",

    color: "white",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.35,
    textAlign: "center",

    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 26px rgba(0,0,0,0.35)",

    pointerEvents: "none",
    zIndex: 1000000,
  },
};

const hintStyles = {
  wrap: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingBottom: 100,
    zIndex: 2147483647,
  },
  bubble: {
    pointerEvents: "none",
    padding: "10px 20px",
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
