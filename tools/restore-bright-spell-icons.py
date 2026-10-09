"""Use native spell IDs and the update video with enough mana for all three Empire spells."""
from pathlib import Path
import json,sys
sys.path.insert(0,str(Path('.tools/video').resolve()))
from PIL import Image
base=Path('assets/takeover/animation');out=Path('assets/takeover/ui')
m=next(s for s in json.loads((base/'anim_manifest.json').read_text(encoding='utf-8'))['sheets'] if s['key']=='SpellIconSetClass')
atlas=Image.open(base/m['sheet']);notes={}
for country,start in [('Green',0),('Red',4),('Blue',8)]:
 for index,key in enumerate(['fire','heal','summon','ultimate']):
  n=start+index;x=n%m['cols']*m['fw'];y=n//m['cols']*m['fh'];atlas.crop((x,y,x+m['fw'],y+m['fh'])).save(out/f'spell-{country}-{key}.png')
  notes[f'{country}-{key}']={'source':'SpellIconSetClass','nativeSpellId':n,'frame':n+1,'state':'native icon without a disabled overlay'}
# At 85 s the original update HUD has 770 mana, enough for 75 / 50 / 225.
# Retain the real icon proportions; the previous 28 x 20 crop was stretched square.
video=Image.open('reference/dark-art/spells-video-85.png').convert('RGBA')
for key,x in [('heal',250),('fire',296),('summon',342)]:
 box=(x,355,x+32,379);im=video.crop(box);im.thumbnail((53,53),Image.Resampling.LANCZOS);target=Image.new('RGBA',(53,53));target.paste(im,((53-im.width)//2,(53-im.height)//2));target.save(out/f'spell-Purple-{key}.png')
 notes[f'Purple-{key}']={'source':'reference/dark-art/spells-video-85.png','crop':box,'manaAtSource':770,'state':'ready above the original price label, no cooldown curtain baked in'}
Image.open('assets/takeover/art/images/1519.png').save(out/'spell-Purple-ultimate.png')
notes['Purple-ultimate']={'source':'original bitmap 1519','state':'Empire crest; recharge is a separate runtime curtain'}
(out/'spell-bright-icons-provenance.json').write_text(json.dumps(notes,ensure_ascii=False,indent=2),encoding='utf-8')
print('Native bright icon sources restored; Empire crop keeps its aspect ratio.')
