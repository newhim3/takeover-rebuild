"""Recover spell cursor registration and the shared original range artwork."""
import copy, json, math, re
from pathlib import Path
import xml.etree.ElementTree as E

ROOT = Path(__file__).resolve().parents[1]
S = '{http://www.w3.org/2000/svg}'
F = '{https://www.free-decompiler.com/flash}'
E.register_namespace('', S[1:-1])
E.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
source = ROOT / 'reference/native-cursors'
manifest = json.loads((ROOT / 'assets/takeover/animation/anim_manifest.json').read_text('utf-8'))
sizes = {s['key']: s for s in manifest['sheets']}
pivots = {}
for path in sorted(source.glob('*/1.svg')):
    key = re.search(r'(Cursor(?:On|Off)_\w+?Class)', path.parent.name)[1]
    root = E.parse(path).getroot()
    matrix = list(map(float, re.findall(r'[-+]?(?:\d*\.\d+|\d+)', root[0].get('transform'))))
    assert matrix[:4] == [1, 0, 0, 1]
    m = sizes[key]
    pad_x = math.floor((m['fw'] - math.floor(float(root.get('width').removesuffix('px')))) / 2)
    pad_y = math.floor((m['fh'] - math.floor(float(root.get('height').removesuffix('px')))) / 2)
    pivots[key] = [matrix[4] + pad_x, matrix[5] + pad_y]

for key in ['BulletClass', 'GunbotBulletClass', 'GiantbotBulletClass',
            'ZealotBulletClass', 'AcolytesBulletClass', 'CatapultMissileClass']:
    path = next((ROOT / 'reference/native-projectiles').glob(f'*_{key}_{key}/1.svg'))
    root = E.parse(path).getroot()
    matrix = list(map(float, re.findall(r'[-+]?(?:\d*\.\d+|\d+)', root[0].get('transform'))))
    assert matrix[:4] == [1, 0, 0, 1]
    m = sizes[key]
    padding = [math.floor((m['fw']-math.floor(float(root.get('width').removesuffix('px'))))/2),
               math.floor((m['fh']-math.floor(float(root.get('height').removesuffix('px'))))/2)]
    pivots[key] = [matrix[4]+padding[0], matrix[5]+padding[1]]

# Sprite 608 is the same unlettered range ring in the original three nations.
# Retain its exact paths, filters and definitions; omit the Heal-only glyph.
path = next(source.glob('DefineSprite_3264*/1.svg'))
root = copy.deepcopy(E.parse(path).getroot())
group = root[0]
for child in list(group):
    if child.tag == S + 'use':
        if child.get(F + 'characterId') != '608':
            group.remove(child)
        else:
            child.set('transform', 'matrix(1 0 0 1 -70 -35)')
group.set('transform', 'translate(77 42)')
root.set('width', '154'); root.set('height', '84'); root.set('viewBox', '0 0 154 84')
E.ElementTree(root).write(ROOT / 'assets/takeover/ui/native-range.svg', encoding='utf-8', xml_declaration=True)
(source / 'cursor-registration.json').write_text(json.dumps(pivots, indent=2), 'utf-8')
print('Recovered 18 cursor and 6 projectile pivots and shared Sprite 608 range ring.')
