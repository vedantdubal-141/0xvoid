import { logo, faceAscii, verticalLogo } from '../assets/ascii';

export function getAsciiArt() {
    return `
      <pre>${logo}</pre>
    `;
  }

export function getFaceAsciiArt() {
    return `<pre style="line-height:1.05;font-size:0.52rem;color:#c8ffd4;opacity:0.85;font-family:'Terminus',monospace;">${faceAscii}</pre>`;
}

export function getVerticalAsciiArt() {
    return `
      <pre>${verticalLogo}</pre>
    `;
}
