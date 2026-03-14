import { create } from "zustand";

const STORAGE_KEY = "valentine_mute";

const readMuted = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === null) return false;
    return v === "1";
  } catch {
    return false;
  }
};

const writeMuted = (muted) => {
  try {
    localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  } catch {
    console.log("local storage error");
  }
};

export const useStoryStore = create((set, get) => ({
  /* ---------------- SCENE CONTROL ---------------- */
  scene: "SCENE_0",
  setScene: (scene) => set({ scene }),

  /* ---------------- AUDIO ---------------- */
  audioUnlocked: false,
  muted: readMuted(),

  startApp: ({ muted }) => {
    const m = !!muted;
    writeMuted(m);
    set({ audioUnlocked: true, muted: m });
  },

  setMuted: (muted) => {
  const m = !!muted;
  writeMuted(m);
  set({ muted: m, audioUnlocked: true });
},

toggleMuted: () => {
  const next = !get().muted;
  writeMuted(next);
  set({ muted: next, audioUnlocked: true });
},
  /* ---------------- STORY PROGRESSION ---------------- */

  yesNoChoice: null,
  noClicks: 0,
  dayChoice: null,

  chooseYes: () => {
    set({
      yesNoChoice: "YES",
      scene: "SCENE_3", // celebration transition
    });
  },

  chooseNo: () => {
    const next = get().noClicks + 1;

    if (next >= 3) {
      // show video in Scene1 or Scene2 logic
      set({ noClicks: next });
      return "SHOW_VIDEO";
    }

    set({ yesNoChoice: "NO", noClicks: next });
    return next;
  },

  setDayChoice: (choice) =>
    set({
      dayChoice: choice,
      scene:
        choice === "DINNER"
          ? "SCENE_5A"
          : choice === "CITY"
          ? "SCENE_5B"
          : choice === "DESERT"
          ? "SCENE_5C"
          : "SCENE_5D",
    }),

  /* ---------------- RESET ---------------- */

  resetStory: () =>
    set({
      scene: "SCENE_0",
      yesNoChoice: null,
      noClicks: 0,
      dayChoice: null,
    }),
}));