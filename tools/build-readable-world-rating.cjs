'use strict';

// Readability adaptation of the original medal's central ornament only.
// The crown, gems, frame, background, alpha and Flash registration stay intact.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'); }

const root = path.resolve(__dirname, '..');
const ui = path.join(root, 'assets/takeover/ui');
const width = 168, height = 140, gain = 1.4, lift = 58;
const sources = [
  { rank: 1, shape: 'shape4', color: '#883c1b' },
  { rank: 2, shape: 'shape3', color: '#1c727b' },
  { rank: 3, shape: 'shape3', color: '#770000' }
];

function brighter(color) {
  return '#' + [1, 3, 5].map(offset => Math.min(255, Math.round(parseInt(color.slice(offset, offset + 2), 16) * gain + lift)).toString(16).padStart(2, '0')).join('');
}

async function pixels(svg) {
  return sharp(Buffer.from(svg), { density: 144 }).resize(width, height, { fit: 'fill' })
    .ensureAlpha().raw().toBuffer();
}

async function png(raw) {
  return sharp(raw, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

async function main() {
  const metadata = {}, checks = [], originals = new Map(), adapted = new Map();
  for (const item of sources) {
    const relative = 'assets/takeover/ui/native-world-rating-' + item.rank + '.svg';
    const source = fs.readFileSync(path.join(root, relative), 'utf8');
    assert.ok(source.includes('viewBox="-42 -48 84 70"'), 'original frame and registration');
    const pattern = new RegExp('(<g id="' + item.shape + '">)([\\s\\S]*?)(</g>)');
    const match = source.match(pattern);
    assert.ok(match, 'original ornament group ' + item.rank);
    assert.equal((match[2].match(/<path /g) || []).length, 1, 'single original ornament path');
    assert.ok(match[2].includes('fill="' + item.color + '"'), 'original ornament color');
    const color = brighter(item.color);
    const altered = source.replace(pattern, (_, open, group, close) => open + group.replace('fill="' + item.color + '"', 'fill="' + color + '"') + close);
    assert.equal(altered.replace('fill="' + color + '"', 'fill="' + item.color + '"'), source, 'only ornament fill changes in source');
    const original = await pixels(source), changed = await pixels(altered);
    let alphaDifferences = 0, changedPixels = 0, unchangedPixels = 0;
    let left = width, top = height, right = -1, bottom = -1;
    for (let i = 0; i < original.length; i += 4) {
      if (original[i + 3] !== changed[i + 3]) alphaDifferences++;
      if (original[i] !== changed[i] || original[i + 1] !== changed[i + 1] || original[i + 2] !== changed[i + 2]) {
        const x = (i / 4) % width, y = Math.floor(i / 4 / width);
        left = Math.min(left, x); top = Math.min(top, y);
        right = Math.max(right, x); bottom = Math.max(bottom, y); changedPixels++;
      } else unchangedPixels++;
    }
    assert.equal(alphaDifferences, 0, 'exact unchanged alpha');
    assert.ok(changedPixels > 0, 'ornament is brighter');
    // At the original registration, the clipped ornament sits under the stars.
    // Above this y coordinate crown/star/gem pixels must remain byte-identical.
    assert.ok(top >= 85 && bottom <= 108 && left >= 36 && right <= 133, 'delta remains inside central plaque');
    const file = 'assets/takeover/ui/world-rating-readable-' + item.rank + '.webp';
    const encoded = await sharp(changed, { raw: { width, height, channels: 4 } }).webp({ lossless: true, effort: 6 }).toBuffer();
    const decoded = await sharp(encoded).ensureAlpha().raw().toBuffer();
    for (let i = 0; i < changed.length; i += 4) {
      assert.equal(decoded[i + 3], changed[i + 3], 'lossless encoded alpha');
      // WebP may optimize RGB behind alpha = 0; those bytes never contribute.
      if (changed[i + 3]) for (let c = 0; c < 3; c++) assert.equal(decoded[i + c], changed[i + c], 'lossless visible RGB');
    }
    const hash = crypto.createHash('sha256').update(encoded).digest('hex').slice(0, 16);
    fs.writeFileSync(path.join(root, file), encoded);
    metadata[item.rank] = { file, hash, width, height };
    originals.set(item.rank, await png(original)); adapted.set(item.rank, await png(changed));
    checks.push({ rank: item.rank, source: relative, sourceHash: crypto.createHash('sha256').update(source).digest('hex'), originalColor: item.color, readableColor: color, pattern: item.shape, alphaDifferences, changedPixels, unchangedPixels, changedBounds: { left, top, right, bottom }, exactOutsideOrnament: true, losslessEncoding: true });
  }
  fs.writeFileSync(path.join(ui, 'world-rating-readable.js'), 'window.NativeWorldRatingArt=' + JSON.stringify(metadata) + ';\n');

  // Offline inspection image only; no new game UI is introduced here.
  const compareWidth = 560, rowHeight = 250, compareHeight = 48 + sources.length * rowHeight;
  const composites = [], labels = ['<text x="28" y="30">Original</text>', '<text x="308" y="30">Brighter original ornament</text>'];
  for (let row = 0; row < sources.length; row++) {
    const rank = sources[row].rank, top = 48 + row * rowHeight;
    for (let column = 0; column < 2; column++) {
      const input = (column ? adapted : originals).get(rank), left = 56 + column * 280;
      composites.push({ input, left, top });
      composites.push({ input: await sharp(input).resize(84, 70).png().toBuffer(), left: left + 42, top: top + 148 });
    }
    labels.push('<text x="12" y="' + (top + 30) + '">' + rank + '</text>');
  }
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="' + compareWidth + '" height="' + compareHeight + '"><g font-family="Arial" font-size="17" fill="#ffffff">' + labels.join('') + '</g></svg>');
  await sharp({ create: { width: compareWidth, height: compareHeight, channels: 3, background: '#41443c' } }).composite([...composites, { input: svg, left: 0, top: 0 }]).png().toFile(path.join(root, 'reference/r21-world-rating-compare.png'));
  const record = { name: 'Original world-rating ornament readability adaptation', logicalWidth: 84, logicalHeight: 70, viewBox: '-42 -48 84 70', rasterWidth: width, rasterHeight: height, rgb: { gain, lift }, checks, metadata };
  fs.writeFileSync(path.join(root, 'reference/r21-world-rating-check.json'), JSON.stringify(record, null, 2) + '\n');
  process.stdout.write(JSON.stringify(record, null, 2) + '\n');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
