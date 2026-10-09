"""Split native health, faction, shield/rebuild status and castle star timelines."""
import copy
import re
import xml.etree.ElementTree as E
from pathlib import Path

exec(Path('tools/restore-native-world.py').read_text(encoding='utf-8-sig').split('for frame in range')[0])
health=Path('reference/native-health')
view='-120 -30 240 60'
def read_health(frame):return E.parse(health/'DefineSprite_7885_KeyNodeHealthBarClass_KeyNodeHealthBarClass'/f'{frame}.svg').getroot()
def import_component(root,donor,prefix,selection):
 donor=copy.deepcopy(donor)
 for parent in donor.iter():
  for child in list(parent):
   if child.get('id','').startswith('txt') or child.get(X,'').startswith('#text'):parent.remove(child)
 renames={e.get('id'):prefix+e.get('id') for e in donor.iter() if e.get('id')}
 for e in donor.iter():
  for key,value in list(e.attrib.items()):
   if key=='id':e.set(key,renames[value])
   elif key==X and value.startswith('#'):e.set(key,'#'+renames.get(value[1:],value[1:]))
   elif 'url(#' in value:e.set(key,re.sub(r'url\(#([^)]*)\)',lambda m:'url(#'+renames[m[1]]+')',value))
 g=E.SubElement(donor,S+'g',{'id':prefix+'component'})
 for e in selection(donor):g.append(copy.deepcopy(e))
 E.SubElement(root,S+'defs').append(donor)
 return '#'+prefix+'component'

for country,palette in [('Green',2),('Red',1),('Blue',3),('Purple',4)]:
 for frame in range(1,101):
  root=read_health(frame)
  target=next(e for e in root.iter() if e.get('id')=='mcColor')
  donor=read_health(palette)
  # The donor already has the original color fill in its own local space.
  original=next(e for e in donor.iter() if e.get('id')=='mcColor')
  original.attrib.pop('transform',None)
  target.set(X,import_component(root,donor,country+'_',lambda r:[next(e for e in r.iter() if e.get('id')==country+'_mcColor')]))
  save(f'building-health-{country}-{frame}',root,lambda r:[e for e in r[0] if e.get('id') not in ['mcStatusIcon','mcStarIcon']],view)
 for state,frame,cid,identity in [('shield',1,7874,'mcShield'),('repair',2,7882,'mcRebuild')]:
  root=read_health(frame)
  donor=E.parse(health/f'DefineSprite_{cid}'/f'{palette}.svg').getroot()
  target=next(e for e in root.iter() if e.get('id')==identity)
  target.set(X,import_component(root,donor,country+'_',uses))
  save(f'building-status-{country}-{state}',root,lambda r:[next(e for e in r[0] if e.get('id')=='mcStatusIcon')],view)
for rank,frame in [(1,3),(2,2),(3,1)]:
 save(f'building-rank-{rank}',read_health(frame),lambda r:[] if rank==1 else [next(e for e in r[0] if e.get('id')=='mcStarIcon')],view)
print('Restored 400 native building HP states, eight faction shield/rebuild states and three castle rank markers.')
