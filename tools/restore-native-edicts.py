"""Restore the original throne room, scroll ribbons and 27 dedicated edict icons."""
import copy,json,re,sys,xml.etree.ElementTree as E
from pathlib import Path
sys.path.insert(0,str(Path('.tools/video').resolve()))
from PIL import Image
S='{http://www.w3.org/2000/svg}';X='{http://www.w3.org/1999/xlink}href';F='{https://www.free-decompiler.com/flash}'
E.register_namespace('',S[1:-1]);E.register_namespace('xlink',X[1:-5]);out=Path('assets/takeover/ui')
def export(name,root,selections,view):
 for parent in root.iter():
  for child in list(parent):
   href=child.get(X,'')
   if href.startswith('#text') or child.get('id','').startswith('txt') or child.get('id')=='_hitArea':parent.remove(child)
   # FFDec's bitmap colour matrix renders the green panel as fluorescent
   # blocks in SVG. Keep the native texture without that export filter.
   elif child.get(F+'characterId')=='2239':child.attrib.pop('filter',None)
 ids={e.get('id'):e for e in root.iter() if e.get('id')};wanted=set()
 def refs(e):
  for n in e.iter():
   names=([n.get(X)[1:]] if n.get(X,'').startswith('#') else [])
   for v in n.attrib.values():names+=re.findall(r'url\(#([^)]*)\)',v)
   for k in names:
    if k not in wanted:wanted.add(k);refs(ids[k])
 svg=E.Element(S+'svg',{'viewBox':view});defs=E.SubElement(svg,S+'defs')
 for e in selections:refs(e);svg.append(copy.deepcopy(e))
 for k in wanted:defs.append(copy.deepcopy(ids[k]))
 E.ElementTree(svg).write(out/(name+'.svg'),encoding='utf8',xml_declaration=True)
for color,frame in [('Green',1),('Red',2),('Blue',3),('Purple',2)]:
 root=E.parse(Path('reference/native-ui/DefineSprite_6877_scrThroneRoomClass_scrThroneRoomClass')/f'{frame}.svg').getroot()
 keep=[e for e in root[0] if e.tag==S+'use' and (e.get(F+'characterId') in ['6743','2236'] or e.get('id') in ['_-WQ','butOk','_-ZC'])]
 export('native-edicts-'+color,root,keep,'0 0 800 600')
for side,char in [('left',6833),('right',6852)]:
 root=E.parse(Path('reference/native-ui')/f'DefineSprite_{char}'/'1.svg').getroot()
 keep=[e for e in root[0] if e.tag==S+'use' and e.get('id','').startswith(('mcStripe','mcScrollIcon'))]
 export('native-edict-row-'+side,root,keep,'-40 10 420 90')
root=E.parse('reference/native-ui/DefineSprite_2258/1.svg').getroot()
ids={e.get('id'):e for e in root.iter() if e.get('id')}
fill=next(e for e in root.iter() if e.get(F+'characterId')=='2248')
export('native-edict-xp-fill',root,[fill],'-17.45 .95 201.35 21.3')
meta=next(s for s in json.loads(Path('assets/takeover/animation/anim_manifest.json').read_text(encoding='utf8'))['sheets'] if s['key']=='#6821')
atlas=Image.open(Path('assets/takeover/animation')/meta['sheet'])
for n in range(27):
 x=n%meta['cols']*meta['fw'];y=n//meta['cols']*meta['fh']
 atlas.crop((x,y,x+meta['fw'],y+meta['fh'])).save(out/f'edict-{n+1}.png')
print('Restored throne backgrounds, original scroll ribbons, and 27 edict icons')
