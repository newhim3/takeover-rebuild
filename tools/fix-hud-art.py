from PIL import Image
from pathlib import Path
p=Path('assets/takeover/ui');im=Image.open(p/'resource-bar.png');w,h=im.size;a=w//3;out=Image.new('RGBA',(w,h));out.paste(im.crop((2*a,0,w,h)),(0,0));out.paste(im.crop((a,0,2*a,h)),(w-2*a,0));out.paste(im.crop((0,0,a,h)),(w-a,0));out.save(p/'resource-bar.png')
for name in ['sound','music']:
 im=Image.open(p/(name+'.png'));im.crop(im.getbbox()).save(p/(name+'.png'))
