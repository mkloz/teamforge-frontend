const seedMediaPathPattern = /^\/?uploads\/seed-media\//u;

export function resolveScenarioMediaUrl(path: string) {
  if (!seedMediaPathPattern.test(path)) {
    return null;
  }

  const hash = hashString(path);
  const hue = hash % 360;
  const accentHue = (hue + 52 + (hash % 41)) % 360;
  const angle = 18 + (hash % 145);
  const circleX = 18 + (hash % 65);
  const circleY = 22 + ((hash >>> 5) % 58);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} .5 .5)"><stop stop-color="hsl(${hue} 42% 18%)"/><stop offset="1" stop-color="hsl(${accentHue} 54% 34%)"/></linearGradient><filter id="b"><feGaussianBlur stdDeviation="28"/></filter></defs><rect width="800" height="600" fill="url(#g)"/><circle cx="${circleX}%" cy="${circleY}%" r="210" fill="hsl(${accentHue} 62% 58% / .34)" filter="url(#b)"/><path d="M-40 490C160 340 305 565 500 395S760 230 860 330V660H-40Z" fill="hsl(${hue} 35% 8% / .58)"/><path d="M-30 175C170 75 270 230 455 150S710 45 840 120" fill="none" stroke="white" stroke-opacity=".14" stroke-width="28" stroke-linecap="round"/></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function hashString(value: string) {
  let hash = 2_166_136_261;

  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
}
