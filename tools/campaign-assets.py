import json
from pathlib import Path
from PIL import Image
p=Path('game-data.js');data=json.loads(p.read_text(encoding='utf8').split('=',1)[1].rstrip(';'));nodes=json.load(open('assets/takeover/data/level_nodes.json',encoding='utf8'));nums=[11,12,13,14,21,22,23,24]
for n in nums:
 level=next(l for l in nodes['levels'] if l['level']==n);im=Image.open(f'assets/takeover/animation/anim/Level{n}HitMaskClass.png').convert('RGB');grid=[]
 for y in range(60):
  row=''
  for x in range(80):
   r,g,b=im.getpixel((min(im.width-1,x*10+5),min(im.height-1,y*10+5)));row+='0' if b>100 and r<100 else '1'
  grid.append(row)
 if not any(l['level']==n for l in data['levels']):data['levels'].append({'level':n,'bounds':level['bounds'],'nodes':level['nodes'],'grid':grid,'nativePlayer':'Red' if n<20 else 'Blue'})
data['campaigns']={'Green':[1,3,5,99],'Red':[11,12,13,14],'Blue':[21,22,23,24],'Purple':[1,3,5,99]}
m=json.load(open('assets/takeover/animation/anim_manifest.json',encoding='utf8'))['sheets']
for s in m:
 if not s['key'].startswith('#'):data['sprites'][s['key']]={k:s[k] for k in ['fw','fh','frames','cols']}
p.write_text('window.GAME_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';',encoding='utf8')
