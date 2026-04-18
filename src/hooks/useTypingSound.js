import { useEffect, useRef } from 'react';

const useTypingSound = (enabled) => {
  const audioCtxRef = useRef(null);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playClick = () => {
    if (!enabled) return;
    try {
      const ctx = getAudioCtx();
      // Short mechanical click via oscillator + gain envelope
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.018);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.022);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.025);
    } catch {
      // Audio context may be unavailable in some environments
    }
  };

  return { playClick };
};

export default useTypingSound;
