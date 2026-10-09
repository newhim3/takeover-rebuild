import json
from pathlib import Path
from PIL import Image
p=Path('game-data.js'); d=json.loads(p.read_text(encoding='utf-8-sig').split('=',1)[1].rstrip(';'))
nodes=json.loads(Path('assets/takeover/data/level_nodes.json').read_text(encoding='utf8'))['levels']
for num in list(range(1,9))+list(range(11,19))+list(range(21,29)):
 if any(l['level']==num for l in d['levels']):continue
 l=next(x for x in nodes if x['level']==num);im=Image.open(f'assets/takeover/animation/anim/Level{num}HitMaskClass.png').convert('RGB')
 grid=[''.join('0' if (lambda p:p[2]>100 and p[0]<100)(im.getpixel((min(im.width-1,x*10+5),min(im.height-1,y*10+5)))) else '1' for x in range(80)) for y in range(60)]
 d['levels'].append(dict(level=num,bounds=l['bounds'],nodes=l['nodes'],grid=grid,nativePlayer='Green' if num<10 else 'Red' if num<20 else 'Blue'))
d['campaigns']={'Green':list(range(1,9)),'Red':list(range(11,19)),'Blue':list(range(21,29)),'Purple':list(range(11,19))}
p.write_text('window.GAME_DATA='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';',encoding='utf8')
