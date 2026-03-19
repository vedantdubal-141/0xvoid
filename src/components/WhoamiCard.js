import React from 'react';
import '../App.css';
import { faceHtml } from '../assets/ascii';

const WhoamiCard = React.memo(() => (
  <div className="whoami-glass-card whoami-landscape">
    <div
      className="whoami-mobile-hide"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        maxWidth: '130px',
      }}
      dangerouslySetInnerHTML={{ __html: faceHtml }}
    />
    <div className="whoami-info-col" style={{ overflowY: 'auto' }}>
      <div className="whoami-section" style={{ fontFamily: "'Terminus', monospace", lineHeight: '1.7', fontSize: '1rem' }}>
        <h3 style={{ color: '#5abb9a', marginBottom: '10px', fontWeight: 'bold', fontSize: '1.1rem', borderBottom: '1px solid #5abb9a44', paddingBottom: '4px' }}>
          # Who am I?
        </h3>
        <p style={{ marginBottom: '12px' }}>
          I'm a computer science student who enjoys understanding how systems actually work under the hood.
        </p>
        <p style={{ marginBottom: '12px' }}>
          Linux tinkerer who spends an unreasonable amount of time breaking operating systems and then fixing them.
        </p>
        <p style={{ marginBottom: '12px' }}>
          I like debugging weird problems, experimenting with DevOps setups, and occasionally fighting with Windows bootloaders.
        </p>
        <p style={{ marginBottom: '16px' }}>
          I run Arch Linux (btw), use Neovim, and believe the terminal is the best UI humanity has produced. If something is broken, I'm probably already poking it with logs and random shell commands.
        </p>

        <h3 style={{ color: '#5abb9a', marginBottom: '6px', fontWeight: 'bold', fontSize: '1.05rem' }}>
          ## I like experimenting with things like:
        </h3>
        <ul style={{ marginLeft: '20px', marginBottom: '16px', padding: 0, listStyle: 'none' }}>
          {[
            'Arch Linux setups',
            'system debugging',
            'infrastructure experiments',
            'small developer tools',
            'network troubleshooting',
            'DNS / networking experiments',
            'developer tools',
            'small CLI utilities',
            'automation scripts',
          ].map(item => (
            <li key={item} style={{ margin: '1px 0', lineHeight: '1.5' }}>➜ {item}</li>
          ))}
        </ul>

        <p style={{ marginBottom: '12px' }}>
          You can check some of my experiments with <code style={{ color: '#5abb9a' }}>`projects`</code> or see the tools I use with <code style={{ color: '#5abb9a' }}>`skills`</code>.
        </p>
        <p style={{ marginBottom: '12px' }}>
          Most of my work revolves around Linux, DevOps tooling, and debugging weird system behaviour.
        </p>
        <p style={{ marginBottom: '12px' }}>
          This site is basically a collection of my projects, labs, and experiments.
        </p>
        <p>
          Type <code style={{ color: '#5abb9a' }}>`projects`</code> to see what I've been building.
        </p>
      </div>
    </div>
  </div>
));

export default WhoamiCard;
// update: scaffold layout for the interactive about section
// update: fix: bio text overflowing on small viewports
// update: scaffold layout for the interactive about section
