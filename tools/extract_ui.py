import json
from pathlib import Path
from PIL import Image
base=Path('assets/takeover/animation');m={x['key']:x for x in json.loads((base/'anim_manifest.json').read_text(encoding='utf-8'))['sheets']};out=Path('assets/takeover/ui');out.mkdir(exist_ok=True);manifest={}
def extract(name,key,frame=0,trim=False,crop=None):
 s=m[key];im=Image.open(base/s['sheet']).convert('RGBA');x=frame%s['cols']*s['fw'];y=frame//s['cols']*s['fh'];im=im.crop((x,y,x+s['fw'],y+s['fh']));region=None
 if trim:
  region=im.getbbox();im=im.crop(region)
 if crop:im=im.crop(crop)
 im.save(out/(name+'.png'));manifest[name]={'source':key,'frame':frame,'trim':region,'crop':crop,'width':im.width,'height':im.height}
for name,key in {'button':'GameButtonClass','tab':'#4695','frame':'#7429','slot':'SlotIconNotEmptyClass','level':'#8478','menu':'#6528','help':'#6533','speed':'#6520','speed-fast':'#6539','build-farm':'#4986','build-mine':'#4989','build-obelisk':'#4992','build-site':'NodeBuildHereClass','repair':'ASTRepairingClass','enter':'IconGoInClass','attack':'IconAttackClass','move':'IconGoPathClass','defend':'ASTDefendingClass','star-gold':'GoldStarIconClass','star-silver':'SilverStarIconClass','resource':'ResourcePanelClass','spell-frame':'#6868','crest':'SmallLogoPanelClass'}.items():extract(name,key,trim=True)
extract('button-hover','GameButtonClass',7,True);extract('upgrade','#1763',0,True,(0,0,73,45))
for color,i in [('Green',0),('Red',1),('Blue',2),('Purple',3)]:
 for type in ['Infantry','Archers','Cavalry','Siege']:
  faction={'Green':'W','Red':'K','Blue':'B','Purple':'E'}[color];extract(f'unit-{color}-{type}',f'IconT1_{faction}_{type}Class')
 extract('tile-'+color,'#1771',i,True);extract('tile-hover-'+color,'#1771',i+4,True)
 extract('panel-'+color,'WindowEnemyPanelClass',i,True)
for color,idle,selected in [('Green',0,5),('Red',6,11),('Blue',12,2),('Purple',3,8)]:
 extract('circle-'+color,'SquadRoundIconClass',idle);extract('circle-selected-'+color,'SquadRoundIconClass',selected)
for n,f in [('heal',1),('fire',7),('summon',9)]:extract('spell-'+n,'SpellIconSetClass',f)
# Speaker and music are two separate controls in the source strip.
extract('sound','#2387',crop=(0,0,69,76));extract('music','#2387',crop=(65,0,130,76))
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('Extracted',len(manifest),'original UI assets; source mapping saved.')
