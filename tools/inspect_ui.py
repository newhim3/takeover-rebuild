import json
from pathlib import Path
from PIL import Image,ImageDraw
base=Path('assets/takeover/animation');m=json.loads((base/'anim_manifest.json').read_text(encoding='utf-8'))['sheets']
chosen=[s for s in m if s['key'].startswith('#') or s['key'] in ['SquadRoundIconClass','GameButtonClass','GamePanelClass','ResourcePanelClass','SpellIconSetClass','WindowCastleClass','WindowTownClass','WindowBuildingSiteClass','SlotIconNotEmptyClass','KeyNodeHealthBarClass','IconsHighligtSetClass','IconGoInClass','ASTRepairingClass']]
Path('reference').mkdir(exist_ok=True)
for page in range((len(chosen)+35)//36):
 sheet=Image.new('RGB',(1000,720),'#28332e');d=ImageDraw.Draw(sheet)
 for i,s in enumerate(chosen[page*36:(page+1)*36]):
  im=Image.open(base/s['sheet']).crop((0,0,s['fw'],s['fh']));im.thumbnail((150,85));x=i%6*166;y=i//6*120;sheet.paste(im,(x+(160-im.width)//2,y),im);d.text((x+3,y+88),s['key'],fill='white');d.text((x+3,y+103),f"{s['fw']}x{s['fh']} {s['frames']}f",fill='#bacab2')
 sheet.save(f'reference/ui-atlas-{page}.jpg')
print('pages', (len(chosen)+35)//36,'items',len(chosen))
