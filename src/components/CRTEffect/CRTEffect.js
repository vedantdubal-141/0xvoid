import React, { useEffect, useRef } from 'react';

const CRTEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let animId;
    let scanY = 0;
    let lastTime = performance.now();
    let nextGlitchBand = 300;
    let glitchBands = [];
    let nextFlicker = 2000 + Math.random() * 3000;

    // Monochrome-first palette with occasional blue/purple
    const BAND_COLORS = [
      [220, 220, 220], // white-gray
      [180, 180, 200], // blue-gray
      [160, 160, 160], // mid-gray
      [100, 100, 140], // muted blue
      [130, 120, 180], // muted purple
      [200, 200, 210], // near-white
      [80,  80, 120],  // dark blue
      [110, 100, 160], // dusty purple
    ];

    const draw = (now) => {
      const dt = now - lastTime;
      lastTime = now;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ─── 1. DENSE BOLD SCANLINES ─────────────────────────────────────────
      // 3px bright / 3px dark = bolder, more retro CRT grid
      for (let y = 0; y < H; y += 6) {
        ctx.fillStyle = 'rgba(255,255,255,0.04)';  // lower contrast bright band
        ctx.fillRect(0, y, W, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';         // moderate dark gap
        ctx.fillRect(0, y + 3, W, 3);
      }

      // ─── 2. DENSE MONOCHROME NOISE ───────────────────────────────────────
      // 6.5x increase in density vs before, but halved alpha
      const imageData = ctx.createImageData(W, H);
      const data = imageData.data;
      const totalPixels = W * H;
      const noisePx = Math.floor(totalPixels * 0.18); // was 0.028, now ~6.4x
      
      for (let i = 0; i < noisePx; i++) {
        const idx = Math.floor(Math.random() * totalPixels) * 4;
        const isColor = Math.random() < 0.08; // only 8% colored (was 25%)
        
        if (isColor) {
          // only blue or purple tints
          const isBlue = Math.random() < 0.5;
          const val = 60 + Math.random() * 100;
          if (isBlue) {
            data[idx]     = val * 0.4;  // R low
            data[idx + 1] = val * 0.5;  // G low
            data[idx + 2] = val;         // B full = blue
          } else {
            data[idx]     = val * 0.6;  // R mid = purple
            data[idx + 1] = val * 0.3;  // G low
            data[idx + 2] = val;         // B full
          }
          data[idx + 3] = 18 + Math.random() * 28; // half of before (was 80-180)
        } else {
          // grayscale
          const g = Math.random() * 200;
          data[idx] = g; data[idx + 1] = g; data[idx + 2] = g;
          data[idx + 3] = 15 + Math.random() * 30; // was 40-110, now halved
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // ─── 3. ROLLING SCAN BEAM ────────────────────────────────────────────
      scanY = (scanY + dt * 0.45) % H;
      const beamGrad = ctx.createLinearGradient(0, scanY - 35, 0, scanY + 35);
      beamGrad.addColorStop(0,    'rgba(255,255,255,0)');
      beamGrad.addColorStop(0.35, 'rgba(220,220,255,0.025)'); // slight blue tint
      beamGrad.addColorStop(0.5,  'rgba(255,255,255,0.07)');  // lower than before (was 0.12)
      beamGrad.addColorStop(0.65, 'rgba(220,220,255,0.025)');
      beamGrad.addColorStop(1,    'rgba(255,255,255,0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, scanY - 35, W, 70);

      // ─── 4. BOLD MONOCHROME GLITCH BANDS ─────────────────────────────────
      // Thicker lines, mostly gray/white, occasional blue/purple
      nextGlitchBand -= dt;
      if (nextGlitchBand <= 0) {
        const count = 2 + Math.floor(Math.random() * 5); // more bands
        for (let i = 0; i < count; i++) {
          const col = BAND_COLORS[Math.floor(Math.random() * BAND_COLORS.length)];
          glitchBands.push({
            y: Math.random() * H,
            h: 2 + Math.random() * 8,   // bolder: was 1-5px now 2-10px
            r: col[0], g: col[1], b: col[2],
            alpha: 0.12 + Math.random() * 0.22, // flatter: was 0.3-0.8 now 0.12-0.34
            life: 50 + Math.random() * 120,
          });
        }
        nextGlitchBand = 60 + Math.random() * 150;
      }

      glitchBands = glitchBands.filter(b => b.life > 0);
      for (const b of glitchBands) {
        const xShift = (Math.random() - 0.5) * 12;
        ctx.fillStyle = `rgba(${b.r},${b.g},${b.b},${b.alpha})`;
        ctx.fillRect(xShift, b.y, W, b.h);
        b.life -= dt;
        b.alpha *= 0.96;
      }

      // ─── 5. SPARSE WIDE INTERFERENCE BANDS ───────────────────────────────
      if (Math.random() < 0.004) {
        const bandY = Math.random() * H;
        const bandH = 8 + Math.random() * 40;
        // gray-white tones only
        const bandGrad = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
        bandGrad.addColorStop(0,   'rgba(200,200,220,0.03)');
        bandGrad.addColorStop(0.5, 'rgba(220,220,255,0.10)'); // slight blue
        bandGrad.addColorStop(1,   'rgba(200,200,220,0.03)');
        ctx.fillStyle = bandGrad;
        ctx.fillRect(0, bandY, W, bandH);
      }

      // ─── 6. FLICKER ───────────────────────────────────────────────────────
      nextFlicker -= dt;
      if (nextFlicker <= 0) {
        ctx.fillStyle = 'rgba(200,200,255,0.025)'; // blue-tinted flicker
        ctx.fillRect(0, 0, W, H);
        nextFlicker = 1200 + Math.random() * 4000;
      }

      // ─── 7. VIGNETTE ──────────────────────────────────────────────────────
      const vig = ctx.createRadialGradient(W/2, H/2, H * 0.25, W/2, H/2, H * 0.85);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.52)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default CRTEffect;
