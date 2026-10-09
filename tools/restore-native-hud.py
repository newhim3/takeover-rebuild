"""Keep native vector artwork; runtime alpha-zero layers and labels are excluded."""
import copy,re,xml.etree.ElementTree as E
from pathlib import Path
S='{http://www.w3.org/2000/svg}';X='{http://www.w3.org/1999/xlink}href';E.register_namespace('',S[1:-1]);E.register_namespace('xlink',X[1:-5])
r=E.parse('../takeover拆解/scratch/surgery/ui_gamepanel_svg/DefineSprite_6540_GamePanelClass_GamePanelClass/1.svg').getroot();ids={e.get('id'):e for e in r.iter() if e.get('id')}
def export(name,view,selections):
 root=E.Element(S+'svg',{'viewBox':view,'preserveAspectRatio':'none'});defs=E.SubElement(root,S+'defs');wanted=set()
 def refs(e):
  for n in e.iter():
   values=[]
   if n.get(X,"").startswith("#"):values.append(n.get(X)[1:])
   for v in n.attrib.values():values+=re.findall(r'url\(#([^)]*)\)',v)
   for k in values:
    if k not in wanted:wanted.add(k);refs(ids[k])
 for e in selections:refs(e);root.append(copy.deepcopy(e))
 for k in wanted:defs.append(copy.deepcopy(ids[k]))
 E.ElementTree(root).write(Path('assets/takeover/ui')/(name+'.svg'),encoding='utf8',xml_declaration=True)
resources=copy.deepcopy(ids['sprite7'])
for e in list(resources):
 if e.get('id') in ['_-oj','_-yD','_-Vy'] or e.get(X)=='#sprite11':resources.remove(e)
export('native-resource-icons','-279 -5 500 36',[resources])
back=ids['sprite0']
for color,frame in [('Green',1),('Red',2),('Blue',3),('Purple',3)]:
 panel=E.parse(Path('reference/native-ui/DefineSprite_6457')/f'{frame}.svg').getroot()
 renames={e.get('id'):color+'_'+e.get('id') for e in panel.iter() if e.get('id')}
 for e in panel.iter():
  for k,v in list(e.attrib.items()):
   if k=='id':e.set(k,renames[v])
   elif k==X and v.startswith('#'):e.set(k,'#'+renames[v[1:]])
   elif 'url(#' in v:e.set(k,re.sub(r'url\(#([^)]*)\)',lambda m:'url(#'+renames[m[1]]+')',v))
 for e in panel.iter():
  if e.get('id'):ids[e.get('id')]=e
 native=copy.deepcopy(panel[0]);native.attrib={'id':'nativePanel'+color};ids[native.get('id')]=native
 selections=[]
 for e in back:
  if e.get('id') in ['mcPanelBack','mcHousePanel','mcGoldPanel','mcManaPanel'] or e.get('{https://www.free-decompiler.com/flash}characterId')=='6447':
   e=copy.deepcopy(e)
   if e.get('id') in ['mcHousePanel','mcGoldPanel','mcManaPanel']:e.set(X,'#nativePanel'+color)
   selections.append(e)
 icons=copy.deepcopy(resources);icons.set('transform','matrix(0.8082,0,0,0.8082,621,-25.75)');selections.append(icons)
 export('native-hud-back-'+color,'0 -120 800 120',selections)
# mcIconSet's second layer is a runtime placeholder icon, not a frame.
export('native-spell-slot','-1.5 -1.5 54 54',[ids['shape19']])

