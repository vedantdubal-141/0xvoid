import { 
  rustAscii, 
  jsAscii, 
  linuxAscii, 
  bashAscii, 
  cAscii, 
  cppAscii, 
  gitAscii, 
  mongodbAscii, 
  ollamaAscii, 
  qwenAscii 
} from '../assets/ascii/skills';

const skillsContent = `
<div class="skills-super-container">
  <div class="skills-layout-wrapper">
    <!-- Left side: Scattered Logos -->
    <div class="logos-scatter-container">
      <div class="logo-tier tier-top">
        <pre class="ascii-logo logo-left">${linuxAscii}</pre>
        <pre class="ascii-logo logo-center" style="margin-top: 30px;">${rustAscii}</pre>
        <pre class="ascii-logo logo-right">${ollamaAscii}</pre>
      </div>
      
      <div class="logo-tier tier-mid">
        <pre class="ascii-logo">${mongodbAscii}</pre>
        <pre class="ascii-logo" style="margin-left: 50px;">${jsAscii}</pre>
        <pre class="ascii-logo">${cppAscii}</pre>
      </div>
      
      <div class="logo-tier tier-bottom">
        <pre class="ascii-logo">${bashAscii}</pre>
        <pre class="ascii-logo" style="transform: translateY(-30px); margin-left: 20px;">${gitAscii}</pre>
        <pre class="ascii-logo" style="margin-left: 20px;">${qwenAscii}</pre>
        <pre class="ascii-logo" style="margin-left: 20px;">${cAscii}</pre>
      </div>
    </div>

    <!-- Right side: Centered Skills Box -->
    <div class="skills-box-container">
      <pre class="skills-terminal-box">
┌──────────────────── SKILLS ────────────────────┐
│                                                │
│  󰌠 Systems :                                   │
│       Rust, C, C++, Bash, Linux                │
│                                                │
│  󰌠 Web & Databases :                           │
│       HTML, CSS, JS, React, Node, Express      │
│       MongoDB, PostgreSQL, REST APIs           │
│                                                │
│  󰌠 Tools & AI :                                │
│       Git, Neovim, Postman, Figma              │
│       Ollama, qwen, LM Studio                  │
│                                                │
│  󰬸 Learning :                                  │
│       Docker, Kubernetes, Infra automation     │
│       Distributed Systems, Low-level Opt       │
│                                                │
└────────────────────────────────────────────────┘
      </pre>
    </div>
  </div>
</div>

<style>
.skills-super-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 60px 0;
  overflow-x: auto;
}

.skills-layout-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 60px;
  width: fit-content;
  max-width: 1400px;
}

.logos-scatter-container {
  display: flex;
  flex-direction: column;
  gap: 70px;
  width: 600px; /* Give it a fixed width so justify-content actually spreads things */
}

.logo-tier {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  width: 100%;
}

.tier-top { 
  justify-content: space-between; 
}

.tier-mid { 
  justify-content: space-around;
}

.tier-bottom { 
  justify-content: flex-end; 
  gap: 30px;
}

.ascii-logo {
  font-size: 4.8px; /* Slightly bigger as requested */
  line-height: 1.1;
  color: #56b494;
  margin: 0;
  opacity: 0.65;
  transition: all 0.3s ease;
}

.ascii-logo:hover {
  opacity: 1;
  transform: scale(1.05);
}

.skills-box-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.skills-terminal-box {
  color: #56b494;
  font-family: 'Terminus', 'Courier New', monospace;
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
  background: rgba(0, 0, 0, 0.3);
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(86, 180, 148, 0.1);
}

@media (max-width: 1250px) {
  .skills-layout-wrapper {
    flex-direction: column;
    gap: 50px;
  }
  
  .logos-scatter-container {
    width: 100%;
    max-width: 600px;
  }
}

@media (max-width: 600px) {
  .logos-scatter-container {
    width: 100%;
    gap: 40px;
  }

  .ascii-logo {
    font-size: 3.5px;
  }
  
  .skills-terminal-box {
    font-size: 12px;
    padding: 15px;
  }
}
</style>
`;

export default skillsContent;
