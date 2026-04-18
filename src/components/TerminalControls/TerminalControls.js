import React from 'react';
import './TerminalControls.css';

// SVG icons — clean monochrome
const MatrixIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <text x="1" y="13" fontFamily="monospace" fontSize="11" fill={active ? '#fff' : '#666'}>01</text>
    <text x="1" y="18" fontFamily="monospace" fontSize="11" fill={active ? '#aaa' : '#444'}>10</text>
  </svg>
);

const ScanlineIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    {[2, 5, 8, 11, 14, 17].map(y => (
      <line key={y} x1="0" y1={y} x2="18" y2={y}
        stroke={active ? '#fff' : '#555'} strokeWidth="1.5" />
    ))}
  </svg>
);

const SoundIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill={active ? '#fff' : '#666'}>
    <polygon points="2,6 7,6 11,2 11,16 7,12 2,12" />
    {active && <>
      <path d="M13 5 Q16 9 13 13" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M14.5 3 Q18.5 9 14.5 15" stroke="#aaa" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>}
    {!active && <line x1="13" y1="5" x2="17" y2="13" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />}
  </svg>
);

const TerminalControls = ({
  matrixEnabled, onToggleMatrix,
  scanlinesEnabled, onToggleScanlines,
  soundEnabled, onToggleSound,
}) => (
  <div className="terminal-controls">
    <button
      className={`tc-btn ${matrixEnabled ? 'tc-active' : ''}`}
      onClick={onToggleMatrix}
      title={matrixEnabled ? 'Matrix Rain: ON' : 'Matrix Rain: OFF'}
      aria-label="Toggle Matrix Rain"
    >
      <MatrixIcon active={matrixEnabled} />
    </button>

    <button
      className={`tc-btn ${scanlinesEnabled ? 'tc-active' : ''}`}
      onClick={onToggleScanlines}
      title={scanlinesEnabled ? 'Scanlines: ON' : 'Scanlines: OFF'}
      aria-label="Toggle Scanlines"
    >
      <ScanlineIcon active={scanlinesEnabled} />
    </button>

    <button
      className={`tc-btn ${soundEnabled ? 'tc-active' : ''}`}
      onClick={onToggleSound}
      title={soundEnabled ? 'Sound: ON' : 'Sound: OFF'}
      aria-label="Toggle Typing Sound"
    >
      <SoundIcon active={soundEnabled} />
    </button>
  </div>
);

export default TerminalControls;
