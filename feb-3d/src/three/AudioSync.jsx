// src/three/AudioSync.jsx
import { useEffect } from "react";
import { useStoryStore } from "../store/useStoryStore";
import { audio } from "./Audio";

export default function AudioSync() {
  const muted = useStoryStore((s) => s.muted);
  const audioUnlocked = useStoryStore((s) => s.audioUnlocked);

  useEffect(() => {
    if (!audioUnlocked) return;
    // this is the IMPORTANT part: sync store muted -> Howler mute
    audio.setMutedSmooth(muted); // or audio.setMuted(muted)
  }, [muted, audioUnlocked]);

  return null;
}
