"""Recover the Flash origin used by each unit's packed bitmap animation."""
from pathlib import Path
import json
import re
import subprocess
import xml.etree.ElementTree as E

root=Path(__file__).resolve().parents[1]
source=root.parent/'takeover拆解'
data=json.loads((source/'data/animations.json').read_text(encoding='utf-8-sig'))
keys={k:v for k,v in data['animations'].items() if re.match(r'^(Green|Red|Blue|Purple|Gray)(Infantry|Archers|Cavalry|Siege|Magic)\d*(Down|Up|Left|Right)_(Go|Attack|Die)$',k)}
out=root/'reference/unit-pivots'
out.mkdir(exist_ok=True)
ids=','.join(str(v['charId']) for v in keys.values())
with (out/'export.log').open('w',encoding='utf-8') as log:
 subprocess.run([str(source/'tools/ffdec/ffdec-cli.exe'),'-format','sprite:svg','-select','1','-selectid',ids,'-export','sprite',str(out),str(source/'scratch/surgery/nohit.swf')],stdout=log,stderr=log,check=True)
anchors={}
for key,v in keys.items():
 paths=list(out.glob('DefineSprite_'+str(v['charId'])+'*/1.svg'))
 if not paths:continue
 sprite=E.parse(paths[0]).getroot()
 matrix=list(map(float,re.findall(r'[-\d.]+',sprite[0].get('transform',''))))
 if len(matrix)!=6:continue
 # FFDec translates the SWF origin into the uniformly sized bitmap canvas.
 anchors[key]=[matrix[4],matrix[5]]
assert len(anchors)==len(keys),(len(anchors),len(keys))
(root/'unit-pivots.js').write_text('(function(root){const pivots='+json.dumps(anchors,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=pivots;else root.UnitPivots=pivots;})(typeof window!=="undefined"?window:globalThis);\n',encoding='utf-8')
print('Restored original Flash pivots for',len(anchors),'direction/action animations.')
