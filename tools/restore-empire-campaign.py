"""Compose the Empire entrance from its actual intro crest, never a rival portrait.

GameIntroClass (6389), frame 181, places crest 6282. The original campaign
screen supplies a shared cloth silhouette and embroidered edge (6651/6657).
Its Green portrait/emblem group is omitted before adapting the empty cloth.
"""
import base64, copy, re, xml.etree.ElementTree as E
from pathlib import Path

S = '{http://www.w3.org/2000/svg}'
X = '{http://www.w3.org/1999/xlink}href'
F = '{https://www.free-decompiler.com/flash}'
E.register_namespace('', S[1:-1])
E.register_namespace('xlink', X[1:-5])
out = Path('assets/takeover/ui')
source = Path('reference/dark-art/vector/DefineSprite_6282/1.svg')
crest = E.parse(source).getroot()
crest.set('viewBox', '0 0 439 471')
E.ElementTree(crest).write(out / 'empire-crest.svg', encoding='utf8', xml_declaration=True)

# Reuse only the empty original cloth and edge; the clipped portrait group
# (including Westaria's crest) is not selected and never enters the output.
namespace = {}
exec(Path('tools/restore-native-world.py').read_text(encoding='utf-8-sig').split('for frame in range')[0], namespace)
root = namespace['read']('DefineSprite_6708_scrChooseCampaignClass_scrChooseCampaignClass')
cloth = next(e for e in root.iter() if e.get('id') == 'sprite2')
def empty_flag(r):
    return [copy.deepcopy(e) for e in next(e for e in r.iter() if e.get('id') == 'sprite2')
            if e.tag == S + 'use' and e.get(F + 'characterId') in ['6651', '6657']]
namespace['save']('native-campaign-flag-Purple', root, empty_flag, '-150 -245 300 490', False)
flag = E.parse(out / 'native-campaign-flag-Purple.svg').getroot()
palette = {'#9bce02': '#39313f', '#99cc00': '#2a242f', '#ee7a09': '#aaa2b5'}
for e in flag.iter():
    for key, value in list(e.attrib.items()):
        if value.lower() in palette:
            e.set(key, palette[value.lower()])
E.SubElement(flag, S + 'desc').text = 'Rivadis Empire necromancer crest: original GameIntroClass frame 181, symbol 6282. Empty native cloth: symbols 6651 and 6657; no Khaganate artwork.'
crest_data = base64.b64encode((out / 'empire-crest.svg').read_bytes()).decode('ascii')
E.SubElement(flag, S + 'image', {'x': '-109', 'y': '-115', 'width': '218', 'height': '234',
    'preserveAspectRatio': 'xMidYMid meet', X: 'data:image/svg+xml;base64,' + crest_data})
E.ElementTree(flag).write(out / 'native-campaign-flag-Purple.svg', encoding='utf8', xml_declaration=True)
print('Restored the genuine Rivadis Empire intro crest on native blank cloth.')
