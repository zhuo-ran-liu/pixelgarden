// Patternflow live editor starter.
export function setup(params) {
  params.time = 0;
  params.scale = 1;
}
export function update(dt, input, params) {
  const knobs = input.knobValues || [0.5, 2.0, 1.0, 0.6];
  params.hue = knobs[0] * 360;
  params.speed = Math.max(0.05, knobs[1]);
  params.spread = 1 + knobs[3] * 6.0;
  params.tiles = Math.max(1, Math.round(1 + knobs[2] * 7));
  params.time += dt * params.speed;
}
// palette
const pal = ["#ffffffff","#ffffffff","#595d5e","#ffffffff","#000000ff"];
// 0 = off, 1 = first color for LED panel
const led = [
[3,3,3,3,3,3,3,1,3,3,1,1,3,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,3],
[3,3,3,3,3,3,3,3,3,3,1,1,3,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[3,3,3,3,3,3,3,3,3,3,3,1,1,1,3,1,3,1,3,3,1,1,3,1,1,1,1,1,1,1,1,1],
[3,3,3,3,3,3,1,2,4,4,4,3,3,1,3,3,1,1,1,1,4,4,4,4,1,1,1,1,1,1,1,1],
[3,3,3,3,3,3,3,3,4,4,4,3,1,1,1,3,1,1,3,1,4,4,4,2,1,1,1,1,1,3,1,1],
[3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,1,1,4,4,4,4,4,4,2,1,1,1,1,1,1,1,1],
[3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,1,1,4,4,4,4,1,1,3,1,1,1,1,1,1,1,1],
[3,3,3,3,3,3,3,3,3,3,1,3,4,2,4,4,4,4,4,4,3,1,1,1,3,1,1,1,1,1,1,3],
[3,3,3,3,3,3,3,3,3,3,3,1,3,1,4,4,4,4,1,1,3,1,1,1,1,1,1,1,1,1,1,1],
[3,3,3,3,3,3,3,3,3,3,3,2,4,4,4,4,3,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1],
[3,3,3,3,3,3,3,3,3,3,3,2,4,4,4,1,3,3,4,4,4,4,3,1,1,1,1,1,1,1,1,1],
[3,3,3,3,3,3,3,3,4,4,4,2,3,3,3,1,1,1,1,3,1,4,4,4,4,1,1,1,1,1,1,1],
[3,3,3,3,3,3,3,3,4,4,4,4,1,1,3,3,3,3,1,3,1,4,4,4,4,3,1,1,1,1,1,1],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1,1,1,1],
[3,3,3,3,3,3,3,3,3,3,3,3,1,3,3,3,3,3,3,3,1,1,1,1,3,1,1,3,1,1,1,1],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1,1,1,1]
];
function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}
// simple hue shift
function shiftColor({ r, g, b }, shift) {
  const t = shift / 360;
  const s = Math.sin(t * Math.PI * 2);
  const c = Math.cos(t * Math.PI * 2);
  return {
    r: r * c + g * s,
    g: g * c - r * s,
    b: b,
  };
}
export function draw(display, params, globalTime) {
  const rows = led.length;
  const cols = led[0].length;
  const tiles = params.tiles || 1;

  // Each tile occupies (display.width / tiles) x (display.height / tiles) pixels
  const tileW = display.width / tiles;
  const tileH = display.height / tiles;

  // Size of each LED cell within a single tile
  const cellW = tileW / cols;
  const cellH = tileH / rows;

  for (let ty = 0; ty < tiles; ty++) {
    for (let tx = 0; tx < tiles; tx++) {
      // pixel offset for this tile
      const offsetX = tx * tileW;
      const offsetY = ty * tileH;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = led[y][x];
          if (idx === 0) continue;

          const base = hexToRgb(pal[idx % pal.length]);
          const wave = Math.sin(
            globalTime * 2 +
            x / params.spread +
            y / params.spread
          );
          const pulse = 0.5 + 0.5 * wave;
          const shifted = shiftColor(base, params.hue);
          const r = shifted.r * pulse;
          const g = shifted.g * pulse;
          const b = shifted.b * pulse;

          // pixel bounds for this cell within the tile
          const px0 = Math.floor(offsetX + x * cellW);
          const py0 = Math.floor(offsetY + y * cellH);
          const px1 = Math.floor(offsetX + (x + 1) * cellW);
          const py1 = Math.floor(offsetY + (y + 1) * cellH);

          for (let py = py0; py < py1; py++) {
            for (let px = px0; px < px1; px++) {
              display.setPixel(px, py, r, g, b);
            }
          }
        }
      }
    }
  }
}