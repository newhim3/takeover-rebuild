from PIL import Image,ImageDraw
from pathlib import Path
items=[p for p in Path('assets/takeover/art/images').glob('*.png') if p.stem.isdigit() and 300<int(p.stem)<1000];out=Image.new('RGB',(1000,((len(items)+9)//10)*100),'#35453a');d=ImageDraw.Draw(out)
for i,p in enumerate(items):
 im=Image.open(p).convert('RGBA');im.thumbnail((93,75));x=i%10*100;y=i//10*100;out.paste(im,(x,y),im);d.text((x,y+78),p.stem,fill='white')
out.save('reference/terrain-pieces.jpg')
