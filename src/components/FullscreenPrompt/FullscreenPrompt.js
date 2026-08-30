import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './FullscreenPrompt.css';

const FullscreenPrompt = ({ onEnter }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

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

  return ReactDOM.createPortal(
    <div
      className="fsp-overlay"
      onClick={handleEnter}
      onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div className="fsp-inner">
        <div className="fsp-logo">VOID</div>
        <div className="fsp-subtitle">TERMINAL PORTFOLIO</div>
        <div className="fsp-divider" />
        <div className="fsp-cta">[ CLICK ANYWHERE TO ENTER ]</div>
        <div className="fsp-hint">press F11 for manual fullscreen</div>
      </div>
    </div>,
    document.body
  );
};

export default FullscreenPrompt;
