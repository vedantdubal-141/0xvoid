import React, { useEffect, useState } from 'react';
import './BSOD.css';

const FAKE_HEX = () => {
  const lines = [];
  for (let i = 0; i < 6; i++) {
    const chunks = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')
    );
    lines.push(chunks.join(' '));
  }
  return lines;
};

const BSOD = ({ onComplete }) => {
  const [phase, setPhase] = useState('bsod');   // bsod → crack → crt → done
  const [hexLines] = useState(FAKE_HEX);

  useEffect(() => {
    // Phase 1: show BSOD for 2.5s, then crack
    const t1 = setTimeout(() => setPhase('crack'), 2500);
    // Phase 2: crack anim for 0.8s, then CRT shutdown
    const t2 = setTimeout(() => setPhase('crt'), 3300);
    // Phase 3: CRT line collapses for 1.2s, then done
    const t3 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 4600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className={`bsod-overlay bsod-phase-${phase}`}>
      {/* Crack shards */}
      {phase === 'crack' && (
        <div className="bsod-crack-container">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`bsod-shard bsod-shard-${i}`} />
          ))}
        </div>
      )}

      {/* CRT power-off bar */}
      {phase === 'crt' && <div className="crt-shutdown-bar" />}

      {/* Main BSOD content */}
      {(phase === 'bsod' || phase === 'crack') && (
        <div className="bsod-content">
          <div className="bsod-sad">:(</div>
          <p className="bsod-main-text">
            Your terminal ran into a problem and needs to restart.
            We're just collecting some error info, and then we'll restart for you.
          </p>
          <div className="bsod-progress-container">
            <div className="bsod-progress-bar" />
          </div>
          <p className="bsod-small-text">
            For more information about this issue and possible fixes, visit<br />
            <span className="bsod-url">https://vedantdubal.com/kernel_panic_lol</span>
          </p>
          <div className="bsod-stopcode">
            <span>Stop code: </span>
            <strong>VOID_KERNEL_PANIC</strong>
          </div>
          <div className="bsod-hex">
            {hexLines.map((line, i) => (
              <div key={i} className="bsod-hex-line">{line}</div>
            ))}
          </div>
          <div className="bsod-footer">
            What failed: <strong>vedant.sys</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default BSOD;
