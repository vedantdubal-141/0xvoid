import React, { useState, useEffect } from 'react';
import { bootLogo } from '../assets/ascii';

const bootLines = [
  '[  0.000000] VOID terminal v1.6.9 bootloader initializing...',
  '[  0.012841] Loading kernel modules...',
  '[  0.058203] Mounting virtual filesystem...',
  '[  0.134762] Initializing entropy pool...',
  '[  0.201394] Starting font subsystem... OK',
  '[  0.278521] Detecting hardware capabilities...',
  '[  0.356109] GPU context initialized',
  '[  0.421883] Loading ASCII assets...',
  '[  0.512047] Parsing user profile data...',
  '[  0.603291] Establishing session context...',
  '[  0.711845] Starting terminal emulator...',
  '[  0.823964] All systems nominal.',
  '',
  ...bootLogo,
  '',
  '  Starting VOID TERMINAL...',
];

const CHAR_DELAY = 18;    // ms per character for typing effect
const LINE_DELAY = 70;    // ms between lines

export default function BootScreen({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (done) return;

    const line = bootLines[currentLineIdx];

    // Empty line — just add it immediately
    if (line === '') {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, '']);
        if (currentLineIdx + 1 >= bootLines.length) {
          finishBoot();
        } else {
          setCurrentLineIdx(i => i + 1);
          setCurrentChar(0);
        }
      }, LINE_DELAY);
      return () => clearTimeout(timer);
    }

    // Still typing current line
    if (currentChar < line.length) {
      const timer = setTimeout(() => {
        setLines(prev => {
          const updated = [...prev];
          updated[currentLineIdx] = line.slice(0, currentChar + 1);
          return updated;
        });
        setCurrentChar(c => c + 1);
      }, line.startsWith('  ') ? 12 : CHAR_DELAY);
      return () => clearTimeout(timer);
    }

    // Line done — move to next
    const timer = setTimeout(() => {
      if (currentLineIdx + 1 >= bootLines.length) {
        finishBoot();
      } else {
        setCurrentLineIdx(i => i + 1);
        setCurrentChar(0);
      }
    }, LINE_DELAY);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLineIdx, currentChar, done]);

  function finishBoot() {
    setDone(true);
    setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 600);
    }, 600);
  }

  const isVoidLine = (line) => (line && line.trimStart().startsWith('█')) || line === '  Starting VOID TERMINAL...';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '48px 64px',
        fontFamily: "'Terminus', 'Share Tech Mono', 'Courier New', monospace",
        fontSize: '14px',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.6s ease',
        overflowY: 'hidden',
      }}
    >
      <pre style={{ margin: 0, lineHeight: '1.7', textAlign: 'left' }}>
        {lines.map((line, i) => {
          const isVoid = isVoidLine(line);
          const isHeader = line.startsWith('[');
          const isOK = line.endsWith('OK');
          return (
            <div key={i}>
              {isVoid ? (
                <span style={{ color: '#5abb9a', fontWeight: 'bold' }}>{line}</span>
              ) : isOK ? (
                <span style={{ color: '#888' }}>
                  {line.slice(0, -2)}
                  <span style={{ color: '#5abb9a', fontWeight: 'bold' }}>OK</span>
                </span>
              ) : isHeader ? (
                <span style={{ color: '#666' }}>{line}</span>
              ) : (
                <span style={{ color: '#5abb9a' }}>{line}</span>
              )}
            </div>
          );
        })}
        {!done && (
          <span style={{ color: '#5abb9a', animation: 'blink 1s step-end infinite' }}>▊</span>
        )}
      </pre>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}
// update: implement typing animation logic for boot screen
// update: fix: kernel log timing was too fast, adjusted delays
// update: add ASCII boot logo and styling
// update: optimize boot sequence render cycle to prevent flickering
// update: implement typing animation logic for boot screen
// update: add ASCII boot logo and styling
