"""Separate original faction, health and proficiency timelines (never selection)."""
import copy,json,re,sys,xml.etree.ElementTree as E
from pathlib import Path
sys.path.insert(0,str(Path('.tools/video').resolve()))
from PIL import Image
exec(Path('tools/restore-native-world.py').read_text(encoding='utf-8-sig').split('for frame in range')[0])
badge=Path('reference/native-badges/DefineSprite_7163_SquadRoundIconClass_SquadRoundIconClass')
def bget(frame):return E.parse(badge/f'{frame}.svg').getroot()
for color,frame in [('Green',1),('Red',2),('Blue',3),('Purple',4),('Gray',5)]:
 save('badge-color-'+color,bget(frame),lambda r:[e for e in r[0] if e.get('id')=='mcColor'],'-20 -20 40 40',False)
for rank in range(1,4):
 save('badge-rank-'+str(rank),bget(rank),lambda r:[e for e in r[0] if e.get('id')=='_-JC'],'-20 -20 40 40',False)
for frame in range(1,101):
 save('badge-health-'+str(frame),bget(frame),lambda r:[e for e in r[0] if e.tag==S+'g'],'-20 -20 40 40',False)
# Actual gameplay sign, not the level editor's NodeBuildHere marker.
manifest=json.loads(Path('assets/takeover/animation/anim_manifest.json').read_text(encoding='utf-8-sig'))
for name,key in [('build-site','BuildHereTopClass'),('unit-Gray-Magic','IconT1_N_MagicClass')]:
 s=next(s for s in manifest['sheets'] if s['key']==key)
 im=Image.open(Path('assets/takeover/animation')/s['sheet']).convert('RGBA').crop((0,0,s['fw'],s['fh']))
 im.save(out/(name+'.png'))
# Source LevelInfoPanel variants: same anchor as the selected map node.
popup=[]
for variant,frame in enumerate([1,11,21,31],1):
 root=read('DefineSprite_1552_LevelInfoPanelClass_LevelInfoPanelClass',frame)
 keep=lambda r:[e for e in uses(r) if e.get('id') not in ['mcBack','_-w3','mcEnemyCrest1','mcEnemyCrest2','mcEnemyCrest3'] and e.get(F+'characterId')!='1523']
 save('native-level-info-'+str(variant),root,keep,'-650 -160 1300 320')
 button=next(e for e in root[0] if e.get('id')=='_-9t')
 color=next(e for e in root[0] if e.get('id')=='mcColor')
 def position(identity):return list(map(float,re.findall(r'[-\d.]+',next(e for e in root[0] if e.get('id')==identity).get('transform'))))[-2:]
 popup.append({'button':position('_-9t'),'title':position('_-qw'),'xp':position('_-0Q'),'info':position('_-9l')})
 for country,palette in [('Green',1),('Red',2),('Blue',3),('Purple',2)]:
  combined=copy.deepcopy(root)
  for identity in ['mcColor','mcRing']:
   # Middle placements use the split panel (1548), border placements use
   # the wide panel (1501). A palette donor must retain that geometry.
   donorFrame=(10 if variant in [2,3] else 0)+palette if identity=='mcColor' else (4 if country=='Purple' else palette)
   donor=read('DefineSprite_1552_LevelInfoPanelClass_LevelInfoPanelClass',donorFrame)
   prefix=country+'_'+identity+'_';renames={e.get('id'):prefix+e.get('id') for e in donor.iter() if e.get('id')}
   for e in donor.iter():
    for key,value in list(e.attrib.items()):
     if key=='id':e.set(key,renames[value])
     elif key==X and value.startswith('#'):e.set(key,'#'+renames[value[1:]])
     elif 'url(#' in value:e.set(key,re.sub(r'url\(#([^)]*)\)',lambda m:'url(#'+renames[m[1]]+')',value))
   target=next(e for e in combined[0] if e.get('id')==identity)
   source=next(e for e in donor[0] if e.get('id')==prefix+identity)
   target.set(X,source.get(X))
   E.SubElement(combined,S+'defs').append(donor)
  save(f'native-level-info-{country}-{variant}',combined,keep,'-650 -160 1300 320')
Path('level-popup-layout.js').write_text('window.LevelPopupLayout='+json.dumps(popup)+';\n',encoding='utf8')
root=read('DefineSprite_6708_scrChooseCampaignClass_scrChooseCampaignClass')
save('native-campaign-background',root,lambda r:[e for e in uses(r) if e.get('id') not in ['_-me','_-Qq','_-hP','mcSoundBlock'] and e.get(F+'characterId') not in ['6649','6707']],'0 0 800 600')
for color,identity in [('Green','_-me'),('Blue','_-Qq'),('Red','_-hP')]:
 def flag(r,identity=identity):
  e=copy.deepcopy(next(e for e in uses(r) if e.get('id')==identity));e.set('transform','matrix(1 0 0 1 0 0)');e.attrib.pop('filter',None);return [e]
 save('native-campaign-flag-'+color,root,flag,'-150 -245 300 490')
import runpy
runpy.run_path('tools/restore-empire-campaign.py')
print('Restored native badge layers, gameplay sign, map popups and four matching campaign entrances.')
