import json
from PIL import Image
from pathlib import Path
base=Path('assets/takeover/animation');manifest=json.loads((base/'anim_manifest.json').read_text(encoding='utf8'))['sheets'];s=next(s for s in manifest if s['key']=='WindowCastleClass');atlas=Image.open(base/s['sheet']).convert('RGBA')
for color,f in [('Green',0),('Red',1),('Blue',2),('Purple',3)]:
 x=f%s['cols']*s['fw'];y=f//s['cols']*s['fh'];im=atlas.crop((x,y,x+s['fw'],y+s['fh']));out=Image.new('RGBA',(582,174));out.alpha_composite(im.crop((574,0,852,174)),(0,0));out.alpha_composite(im.crop((420,0,584,174)),(268,0));out.alpha_composite(im.crop((850,0,1000,174)),(432,0));out.save('assets/takeover/ui/recruit-window-'+color+'.png')
