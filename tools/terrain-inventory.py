from PIL import Image,ImageDraw
from pathlib import Path
items=[]
for p in Path('assets/takeover/art/images').glob('*.png'):
 im=Image.open(p)
 if im.width>=90 and im.height>=60:items.append((p,im))
print(len(items))
for page in range((len(items)+79)//80):
 out=Image.new('RGB',(1200,((len(items[page*80:(page+1)*80])+9)//10)*100),'#3b4540');d=ImageDraw.Draw(out)
 for i,(p,im) in enumerate(items[page*80:(page+1)*80]):
  im=im.convert('RGBA');im.thumbnail((110,76));x=i%10*120;y=i//10*100;out.paste(im,(x,y),im);d.text((x,y+78),p.stem,fill='white')
 out.save(f'reference/art-images-{page}.jpg')
