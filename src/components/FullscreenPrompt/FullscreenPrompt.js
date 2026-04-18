import React, { useEffect, useState } from 'react';
import './FullscreenPrompt.css';

const FullscreenPrompt = ({ onEnter }) => {
  const [visible, setVisible] = useState(true);

  const handleEnter = () => {
    // Request fullscreen on user gesture (required by browsers)
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();

    setVisible(false);
    if (onEnter) onEnter();
  };

  if (!visible) return null;

  return (
    <div className="fsp-overlay" onClick={handleEnter}>
      <div className="fsp-inner">
        <div className="fsp-logo">VOID</div>
        <div className="fsp-subtitle">TERMINAL PORTFOLIO</div>
        <div className="fsp-divider" />
        <div className="fsp-cta">[ CLICK ANYWHERE TO ENTER ]</div>
        <div className="fsp-hint">press F11 for manual fullscreen</div>
      </div>
    </div>
  );
};

export default FullscreenPrompt;
