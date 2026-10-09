import json
from PIL import Image,ImageDraw
m=json.load(open('assets/takeover/animation/anim_manifest.json',encoding='utf8'))['sheets'];s=next(s for s in m if s['key']=='WindowCastleClass');print(s)
im=Image.open('assets/takeover/animation/'+s['sheet']);out=Image.new('RGB',(1000,((s['frames']+3)//4)*85),'#24332a');d=ImageDraw.Draw(out)
for f in range(s['frames']):
 x=f%s['cols']*s['fw'];y=f//s['cols']*s['fh'];p=im.crop((x,y,x+s['fw'],y+s['fh']));p.thumbnail((245,65));dx=f%4*250;dy=f//4*85;out.paste(p,(dx,dy),p);d.text((dx,dy+65),str(f),fill='white')
out.save('reference/castle-frames.jpg')
