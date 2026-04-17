import { aboutAscii as asciiArt } from '../assets/ascii';

const infoLeft = `┌──────────── VOID ─────────────┐
│ Name      : Vedant             │
│ Role      : Systems Tinkerer   │
│                                │
│ OS        : Arch Linux (btw)   │
│ Shell     : zsh / fish         │
│ Terminal  : cool-retro-term    │
│ Editor    : Neovim             │
│                                │
│ Interests :                    │
│  → SRE                         │
│  → Linux & system internals    │
│  → DevOps / infra experiments  │
│  → debugging system behaviour  │
│  → networking & DNS            │
│  → building small CLI tools    │
└────────────────────────────────┘`;

const infoRight = `┌─────────── FOCUS ─────────────┐
│  → Linux systems & internals   │
│  → DevOps / infrastructure     │
│  → system reliability (SRE)    │
│  → observability & monitoring  │
│  → debugging weird OS issues   │
│  → containerized environments  │
│                                │
│ Exploring :                    │
│  → observability stacks        │
│  → container runtimes          │
│  → infrastructure automation   │
│                                │
│ Known Bugs:                    │
│  → occasionally breaks own OS  │
│ Status    : tinkering...       │
└────────────────────────────────┘`;

export function showAbout(addOutput) {
  const html = `
    <div style="display:flex; flex-direction: column; gap: 10px; padding: 20px 0;">
      <div style="color: #888; font-family: monospace; font-size: 0.95rem;">guest@void:~$ fastfetch vedant</div>
      <div class="flex-responsive" style="overflow-x:auto; width: 100%;">
        <pre style="
          margin:0;
          font-size:6.5px;
          line-height:1.0;
          color:#5abb9a;
          opacity:0.8;
          font-family:monospace;
          flex-shrink:0;
          user-select:none;
          white-space: pre !important;
        ">${asciiArt}</pre>
        <div style="display:flex; flex-wrap: wrap; gap: 20px; flex-shrink:0;">
          <pre style="
            margin:0;
            font-size:0.95rem;
            line-height:1.6;
            color:#5abb9a;
            font-family:'Terminus','Share Tech Mono','Courier New',monospace;
            white-space:pre;
          ">${infoLeft}</pre>
          <pre style="
            margin:0;
            font-size:0.95rem;
            line-height:1.6;
            color:#5abb9a;
            font-family:'Terminus','Share Tech Mono','Courier New',monospace;
            white-space:pre;
          ">${infoRight}</pre>
        </div>
      </div>
    </div>
  `;
  addOutput({ type: 'output', content: html });
}
// update: refactor about section into split-module layout for balance
// update: perfectly align bio text with vertical ASCII face
// update: refactor about section into split-module layout for balance
// update: perfectly align bio text with vertical ASCII face
