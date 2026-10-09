"""Restore native vector UI components and original timeline transforms."""
import copy,re,json,xml.etree.ElementTree as E
from pathlib import Path
S='{http://www.w3.org/2000/svg}';X='{http://www.w3.org/1999/xlink}'
E.register_namespace('',S[1:-1]);E.register_namespace('xlink',X[1:-1])
def load(base,n,prefix):
 r=E.parse(base/f'{n}.svg').getroot();ids={e.get('id'):prefix+e.get('id') for e in r.iter() if e.get('id')}
 for e in r.iter():
  for k,v in list(e.attrib.items()):
   if k=='id':e.set(k,ids[v])
   elif k==X+'href' and v.startswith('#'):e.set(k,'#'+ids.get(v[1:],v[1:]))
   elif 'url(#' in v:e.set(k,re.sub(r'url\(#([^)]*)\)',lambda m:'url(#'+ids.get(m[1],m[1])+')',v))
 return r
native=Path('../takeover拆解/scratch/surgery/ui_windows_svg');layout={}
sources=[('Castle',590,next(native.glob('*WindowCastleClass_WindowCastleClass'))),('Town',480,next(Path('reference/native-ui').glob('*WindowTownClass_WindowTownClass'))),('Site',420,next(native.glob('*WindowBuildingSiteClass_WindowBuildingSiteClass')))]
for kind,width,base in sources:
 layout[kind]={}
 for color,style,left in [('Green',1,35),('Red',2,36),('Blue',3,33),('Purple',4,34)]:
  for direction,geometry in [('right',style),('left',left)]:
   if kind=='Site' and direction=='left':geometry-=22
   a=load(base,style,'style_');b=load(base,geometry,'geo_');x0=-90 if direction=='right' else 90-width
   root=E.Element(S+'svg',{'viewBox':f'{x0} -87 {width} 174','width':str(width),'height':'174'});defs=E.SubElement(root,S+'defs')
   for r in [a,b]:
    for elem in r:
     if elem.tag==S+'defs':
      for child in elem:defs.append(copy.deepcopy(child))
    for elem in r[0]:
     if elem.tag==S+'filter':defs.append(copy.deepcopy(elem))
   coords={e.get('id','').replace('geo_',''):e.get('transform') for e in b[0] if e.tag==S+'use'}
   root.append(copy.deepcopy(next(e for e in b[0] if e.get('id')=='geo_mcPanel')))
   for e in a[0]:
    if e.tag!=S+'use':continue
    key=e.get('id','').replace('style_','')
    if key=='mcPanel' or key=='butUpgrade' or key.startswith('txt'):continue
    e=copy.deepcopy(e);e.set('transform',coords[key]);root.append(e)
   for parent in root.iter():
    for child in list(parent):
     if child.get('id','').endswith('mcLockMessage') or '_mcStripe' in child.get('id',''):parent.remove(child)
   E.ElementTree(root).write(Path('assets/takeover/ui')/f'native-recruit-{kind}-{color}-{direction}.svg',encoding='utf-8',xml_declaration=True)
   if color=='Green':
    def center(key):return float(coords[key].split(',')[-2])
    unit_keys=sorted(k for k in coords if k.startswith('butUnit') or k.startswith('butBuild'))
    layout[kind][direction]={'width':width,'height':174,'anchor':-x0,'start':center(unit_keys[0])-31.1-x0,'step':center(unit_keys[1])-center(unit_keys[0]),'button':62.2,'upgrade':center('butUpgrade')-31.1-x0 if 'butUpgrade' in coords else None,'count':len(unit_keys)}
Path('recruit-layout.js').write_text('window.NATIVE_RECRUIT_LAYOUT='+json.dumps(layout,separators=(',',':'))+';',encoding='utf8')
