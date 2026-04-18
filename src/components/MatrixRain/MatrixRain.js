import React, { useEffect, useRef } from 'react';

const COLS_CHAR = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF';

const MatrixRain = () => {
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

    const fontSize = 14;
    let cols = Math.floor(canvas.width / fontSize);
    const drops = Array(cols).fill(1);

    const draw = () => {
      // Fade trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      cols = Math.floor(canvas.width / fontSize);
      while (drops.length < cols) drops.push(Math.random() * canvas.height);

      for (let i = 0; i < cols; i++) {
        const char = COLS_CHAR[Math.floor(Math.random() * COLS_CHAR.length)];

        // Leading character: bright white
        if (drops[i] * fontSize < canvas.height * 0.1 + 30) {
          ctx.fillStyle = '#ffffff';
        } else {
          // Trail: green with varying intensity
          const intensity = Math.random() * 0.5 + 0.5;
          ctx.fillStyle = `rgba(90, 187, 154, ${intensity})`;
        }

        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        // Reset drop randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 45);
    return () => {
      clearInterval(interval);
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
        zIndex: 0,
        opacity: 0.45,
      }}
    />
  );
};

export default MatrixRain;
