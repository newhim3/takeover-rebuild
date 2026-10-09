"""Preserve the original campaign captions and mission introductions."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[1]
source = (root.parent / 'takeover拆解/extracted/swf2/scripts_clean/scripts/data/LevelInfo.as').read_text(encoding='utf-8-sig')
result = {'Green': [{} for _ in range(8)], 'Red': [{} for _ in range(8)], 'Blue': [{} for _ in range(8)]}
for method, key in [('_-Gz', 'caption'), ('_-TB', 'intro')]:
    body = source.split('public function §'+method+'§()', 1)[1].split('public function ', 1)[0]
    parts = re.split(r'case CompanyInfo\.(WESTARIA|KHAGANATE|CULT):', body)
    for campaign, text in zip(parts[1::2], parts[2::2]):
        country = {'WESTARIA': 'Green', 'KHAGANATE': 'Red', 'CULT': 'Blue'}[campaign]
        for stage, value in re.findall(r'case (\d+):\s+return "((?:\\.|[^"\\])*)";', text):
            result[country][int(stage)][key] = value.replace("\\'", "'").replace('\\n', '\n').strip()
assert all(len(entry) == 2 for entries in result.values() for entry in entries)
(root / 'mission-info.js').write_text('(function(root){const data='+json.dumps(result, ensure_ascii=False, separators=(',', ':'))+';if(typeof module!=="undefined")module.exports=data;else root.NativeLevelInfo=data;})(typeof window!=="undefined"?window:globalThis);\n', encoding='utf-8')
print('Restored 24 original mission captions and introductions.')
