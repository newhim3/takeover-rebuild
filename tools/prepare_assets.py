import json
from pathlib import Path
from PIL import Image
base=Path('assets/takeover/animation')
m=json.loads((base/'anim_manifest.json').read_text(encoding='utf-8'))
nodes=json.loads(Path('assets/takeover/data/level_nodes.json').read_text(encoding='utf-8'))
levels=[]
for num in [1,3,5,99]:
 l=next(x for x in nodes['levels'] if x['level']==num)
 im=Image.open(base/f'anim/Level{num}HitMaskClass.png').convert('RGB')
 grid=[]
 for y in range(60):
  row=''
  for x in range(80):
   rgb=im.getpixel((min(im.width-1,x*10+5),min(im.height-1,y*10+5)))
   row+='0' if rgb[2]>100 and rgb[0]<100 else '1'
  grid.append(row)
 levels.append({'level':num,'bounds':l['bounds'],'nodes':l['nodes'],'grid':grid})
keys={}
for s in m['sheets']:
 k=s['key']
 if any(k.startswith(c) and any(t in k for t in ['Infantry','Archers','Cavalry','Siege']) for c in ['Green','Red','Blue','Purple']) or any(k.startswith(t) for t in ['Castle','Town','MageTower','Mine','Village','Obelisk','Warcamp','NodeBuildHere','Level1Class','Level3Class','Level5Class','Level99Class','SkyClouds']):
  keys[k]={p:s[p] for p in ['fw','fh','frames','cols']}
Path('game-data.js').write_text('window.GAME_DATA='+json.dumps({'levels':levels,'sprites':keys},ensure_ascii=False,separators=(',',':'))+';',encoding='utf-8')
print('Prepared maps, walkable grids and',len(keys),'sprite definitions')
