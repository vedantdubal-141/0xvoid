import { neofetchAscii as customAscii } from '../assets/ascii';

// Detect OS from user agent
function detectOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) {
    if (ua.includes('Ubuntu')) return 'Ubuntu Linux';
    if (ua.includes('Fedora')) return 'Fedora Linux';
    return 'Linux';
  }
  return navigator.platform || 'Unknown OS';
}

function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox/')) return 'Firefox ' + ua.match(/Firefox\/([\d.]+)/)?.[1];
  if (ua.includes('Edg/')) return 'Edge ' + ua.match(/Edg\/([\d.]+)/)?.[1];
  if (ua.includes('OPR/')) return 'Opera ' + ua.match(/OPR\/([\d.]+)/)?.[1];
  if (ua.includes('Brave')) return 'Brave';
  if (ua.includes('Chrome/')) return 'Chrome ' + ua.match(/Chrome\/([\d.]+)/)?.[1];
  if (ua.includes('Safari/') && ua.includes('Version/')) return 'Safari ' + ua.match(/Version\/([\d.]+)/)?.[1];
  return 'Unknown Browser';
}

function detectGPU() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'Unknown GPU';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      return renderer.replace(/ANGLE \((.+)\)/, '$1').replace(/ \(0x[^)]+\)/g, '').trim();
    }
    return gl.getParameter(gl.RENDERER) || 'Unknown GPU';
  } catch {
    return 'Unavailable';
  }
}

function formatMemory() {
  const mem = navigator.deviceMemory; 
  if (!mem) return 'Unknown';
  return `~${mem} GiB`;
}

function detectScreen() {
  const w = window.screen.width;
  const h = window.screen.height;
  const dpr = window.devicePixelRatio || 1;
  const res = dpr > 1 ? `${Math.round(w * dpr)}x${Math.round(h * dpr)} (logical ${w}h)` : `${w}x${h}`;
  return res;
}

function detectTZ() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Unknown';
  }
}

function row(label, value, width = 28) {
  const content = `  ${label.padEnd(14)}${value}`;
  const pad = Math.max(0, width - content.length);
  return `│${content}${' '.repeat(pad)}│`;
}

function divider(label, width = 28) {
  const side = Math.floor((width - label.length - 2) / 2);
  const left = '─'.repeat(side);
  const right = '─'.repeat(width - side - label.length - 2);
  return `╭${left} ${label} ${right}╮`;
}

function bottom(width = 28) {
  return `╰${'─'.repeat(width)}╯`;
}

export function showNeofetch(addOutput) {
  const os = detectOS();
  const browser = detectBrowser();
  const gpu = "RTX 4070 OC";
  const memory = formatMemory();
  const screenRes = "QHD++ 2560x1600 @ 240Hz";
  const tz = detectTZ();
  const cpuThreads = "32 Threads Intel(R) Core(TM) i7-14700HX @ 5.50 GHz";
  const lang = navigator.language || 'Unknown';
  const now = new Date();
  const uptime = `session started ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const W = 68;
  const infoBlock = [
    divider('VOID', W),
    row('OS', os, W),
    row('Browser', browser, W),
    row('Timezone', tz, W),
    row('Language', lang, W),
    bottom(W),
    '',
    divider('HARDWARE', W),
    row('CPU Threads', cpuThreads, W),
    row('GPU', gpu, W),
    row('Memory', memory, W),
    row('Screen', screenRes, W),
    bottom(W),
    '',
    divider('SESSION', W),
    row('Uptime', uptime, W),
    row('DPR', `${window.devicePixelRatio}x`, W),
    row('Online', navigator.onLine ? 'yes' : 'no', W),
    row('Cookies', navigator.cookieEnabled ? 'enabled' : 'disabled', W),
    bottom(W),
  ].join('\n');

  const neofetchOutput = `
    <div class="neofetch-container" style="display:flex;gap:40px;align-items:center;padding:16px 0;width:100%;overflow-x:auto;">
      <pre style="margin:0; font-size: 8px; line-height: 1.0; color: #5abb9a; opacity: 0.7; flex-shrink: 0; font-family: monospace;">${customAscii}</pre>
      <div style="flex-shrink: 0;">
        <pre style="margin:0;line-height:1.6;color:#5abb9a;font-family:'Terminus','Share Tech Mono','Courier New',monospace;font-size:0.85rem;">vedant@portfolio
<span style="color:#888">──────────────</span>
${infoBlock}

<div style="display:inline-flex;gap:3px;margin-top:6px;">
  <div style="width:18px;height:18px;background:#ff5555;"></div>
  <div style="width:18px;height:18px;background:#55ff55;"></div>
  <div style="width:18px;height:18px;background:#5555ff;"></div>
  <div style="width:18px;height:18px;background:#ffff55;"></div>
  <div style="width:18px;height:18px;background:#ff5555;"></div>
  <div style="width:18px;height:18px;background:#55ffff;"></div>
  <div style="width:18px;height:18px;background:#ffffff;"></div>
  <div style="width:18px;height:18px;background:#aaaaaa;"></div>
</div>
<br/>
<div style="display:inline-flex;gap:3px;">
  <div style="width:18px;height:18px;background:#990000;"></div>
  <div style="width:18px;height:18px;background:#009900;"></div>
  <div style="width:18px;height:18px;background:#000099;"></div>
  <div style="width:18px;height:18px;background:#999900;"></div>
  <div style="width:18px;height:18px;background:#990099;"></div>
  <div style="width:18px;height:18px;background:#009999;"></div>
  <div style="width:18px;height:18px;background:#333333;"></div>
  <div style="width:18px;height:18px;background:#000000;border:1px solid #333;"></div>
</div></pre>
      </div>
    </div>
  `;

  addOutput({ type: 'output', content: neofetchOutput });
}// update: add system detection utility functions
// update: implement initial neofetch command logic
// update: fix: gpu detection failing on certain browser agents
// update: adjust neofetch layout for better mobile display
// update: add unix-style color blocks to neofetch output
// update: add system detection utility functions
// update: add unix-style color blocks to neofetch output
