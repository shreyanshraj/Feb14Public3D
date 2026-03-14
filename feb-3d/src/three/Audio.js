import { Howl, Howler } from "howler";

const sounds = {
  bgSoft: new Howl({ src: ["/audio/bg_soft.mp3"], loop: true, volume: 0.4 }),
  cheer : new Howl({ src: ["/audio/cheer.mp3"], volume: 0.3 }),
  chest_open: new Howl({ src: ["/audio/chest_open.mp3"], volume: 0.9 }),
  city_ambience: new Howl({ src: ["/audio/city_ambience.mp3"], loop: true, volume: 0.2 }),
  click: new Howl({ src: ["/audio/click.mp3"], volume: 0.9 }),
  fireplace: new Howl({ src: ["/audio/fireplace.mp3"], loop: true, volume: 0.6 }),
  heartbeat: new Howl({ src: ["/audio/heartbeat.mp3"], loop: true, volume: 0.8 }),
  noEffect: new Howl({ src: ["/audio/no_effect.mp3"], volume: 0.85 }),
  paper: new Howl({ src: ["/audio/paper_rustle.mp3"], volume: 0.9 }),
  sad: new Howl({ src: ["/audio/sad_trombone.mp3"], volume: 0.9 }),
  tick: new Howl({ src: ["/audio/tick.mp3"], volume: 0.9 }),
  whisper: new Howl({ src: ["/audio/whisper_psst.mp3"], volume: 0.2 }),
  wind : new Howl({ src: ["/audio/wind.mp3"], loop: true, volume: 0.5 }),

};

const DEFAULT_VOLUMES = {
  heartbeat: 0.8,
  bgSoft: 0.4,
  paper: 0.9,
  click: 0.9,
  noEffect: 0.85,
  cheer: 0.9,
  sad: 0.9,
  wind: 0.5,
  fireplace: 0.6,
  city_ambience: 0.2,
  whisper: 0.7,
  tick: 0.9,
  chest_open: 0.9,
};

function forEachSound(fn) {
  Object.values(sounds).forEach((s) => {
    try {
      fn(s);
    } catch {
      // ignore
    }
  });
}

export const audio = {
  play(name) {
    sounds[name]?.play();
  },

  stop(name) {
    sounds[name]?.stop();
  },

  ensure(name) {
    const s = sounds[name];
    if (!s) return;
    if (!s.playing()) s.play();
  },

  // ✅ Add back: per-sound fade (used by Scene0_Loading)
  fade(name, from, to, ms = 300) {
    const s = sounds[name];
    if (!s) return;
    s.volume(from);
    s.fade(from, to, ms);
  },

  setMuted(muted) {
    Howler.mute(!!muted);
  },

  // ✅ Smooth toggle without Howler.fade
  setMutedSmooth(muted, ms = 280) {
    if (muted) {
      // Fade out currently-playing sounds
      forEachSound((s) => {
        if (s.playing()) s.fade(s.volume(), 0, ms);
      });

      // After fade completes, hard mute to guarantee silence
      setTimeout(() => {
        Howler.mute(true);

        // Restore volumes to defaults (so unmute behaves nicely)
        Object.entries(DEFAULT_VOLUMES).forEach(([k, v]) => {
          sounds[k]?.volume(v);
        });
      }, ms);
    } else {
      // Unmute first
      Howler.mute(false);

      // Fade in only background tracks if they are playing
      if (sounds.heartbeat.playing()) {
        sounds.heartbeat.volume(0);
        sounds.heartbeat.fade(0, DEFAULT_VOLUMES.heartbeat, ms);
      }
      if (sounds.bgSoft.playing()) {
        sounds.bgSoft.volume(0);
        sounds.bgSoft.fade(0, DEFAULT_VOLUMES.bgSoft, ms);
      }
    }
  },
};