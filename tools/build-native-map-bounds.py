"""Use existing native PNG alpha and SWF coordinates; no new artwork."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
rows = json.loads((root / 'reference/native-map-manifest.json').read_text(encoding='utf8'))
groups = {}
for row in rows:
    with Image.open(root / 'assets/takeover/animation/anim' / f"Level{row['level']}Class.png") as image:
        box = image.getchannel('A').getbbox()
        x, y = row['normalization']
        key = (tuple(row['normalization']), image.size)
        bounds = dict(left=box[0]-x, top=box[1]-y, right=box[2]-x, bottom=box[3]-y)
        groups.setdefault(key, []).append((row['level'], bounds))
result = {}
for group in groups.values():
    bounds = dict(left=min(0, *(b['left'] for _, b in group)), top=min(0, *(b['top'] for _, b in group)),
                  right=max(800, *(b['right'] for _, b in group)), bottom=max(600, *(b['bottom'] for _, b in group)))
    for level, _ in group:
        result[level] = bounds
(root / 'native-map-bounds.js').write_text(
    '/* Existing map alpha bounds, normalized to world coordinates; union across native country variants. */\n'
    + 'window.NativeMapBounds=' + json.dumps(result, separators=(',', ':')) + ';\n', encoding='utf8')
print(f'Native map bounds: {len(result)}')
