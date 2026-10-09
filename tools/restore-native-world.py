"""Restore original campaign artwork without baked-in buttons or hover effects."""
import copy,json,re,xml.etree.ElementTree as E
from pathlib import Path
S='{http://www.w3.org/2000/svg}';X='{http://www.w3.org/1999/xlink}href';F='{https://www.free-decompiler.com/flash}'
E.register_namespace('',S[1:-1]);E.register_namespace('xlink',X[1:-5])
base=Path('reference/native-ui');out=Path('assets/takeover/ui');out.mkdir(exist_ok=True)
def read(folder,frame=1):return E.parse(base/folder/f'{frame}.svg').getroot()
def save(name,root,selections,view,strip_text=True):
 root=copy.deepcopy(root)
 # Runtime text and profile placeholders are supplied once by the game.
 for parent in root.iter():
  for child in list(parent):
   identity=child.get('id','');plain=re.sub(r'^(Green|Red|Blue|Purple)_','',identity)
   if plain in ['mcNewGameMessage','mcRankBlock','_hitArea','mcXPIndicator'] or (strip_text and (re.match(r'^#(?:(?:Green|Red|Blue|Purple)_)?text',child.get(X,'')) or plain.startswith('txt'))):parent.remove(child)
   elif child.get(F+'characterId')=='2239':child.attrib.pop('filter',None)
 ids={e.get('id'):e for e in root.iter() if e.get('id')};parents={c:p for p in root.iter() for c in p};wanted=set()
 def refs(e):
  for n in e.iter():
   keys=([n.get(X)[1:]] if n.get(X,'').startswith('#') else [])
   for v in n.attrib.values():keys+=re.findall(r'url\(#([^)]*)\)',v)
   for k in keys:
    if k not in wanted:wanted.add(k);refs(ids[k])
 svg=E.Element(S+'svg',{'viewBox':view});defs=E.SubElement(svg,S+'defs')
 # Selections refer to the cleaned clone, not to the unmodified export.
 for selection in selections(root):refs(selection);svg.append(copy.deepcopy(selection))
 for k in sorted(wanted):
  ancestor=parents.get(ids[k]);contained=False
  while ancestor is not None:
   if ancestor.get('id') in wanted:contained=True;break
   ancestor=parents.get(ancestor)
  if not contained:defs.append(copy.deepcopy(ids[k]))
 E.ElementTree(svg).write(out/(name+'.svg'),encoding='utf8',xml_declaration=True)
def uses(root):return [e for e in root[0] if e.tag==S+'use']
for frame in range(1,28):save(f'native-world-{frame}',read('DefineSprite_8465',frame),uses,'-400 -300 800 600',False)
root=read('DefineSprite_8534_scrCompaignMapClass_scrCompaignMapClass')
save('native-world-controls',root,lambda r:[e for e in uses(r) if e.get('id') in ['butQuit','_-9R','_-WQ']],'0 0 800 600')
for color,frame in [('Green',1),('Red',2),('Blue',3),('Purple',2)]:
 combined=copy.deepcopy(root);stat=read('DefineSprite_6877_scrThroneRoomClass_scrThroneRoomClass',frame)
 renames={e.get('id'):color+'_'+e.get('id') for e in stat.iter() if e.get('id')}
 for e in stat.iter():
  for k,v in list(e.attrib.items()):
   if k=='id':e.set(k,renames[v])
   elif k==X and v.startswith('#'):e.set(k,'#'+renames[v[1:]])
   elif 'url(#' in v:e.set(k,re.sub(r'url\(#([^)]*)\)',lambda m:'url(#'+renames[m[1]]+')',v))
 original=next(e for e in combined[0] if e.get('id')=='_-WQ');index=list(combined[0]).index(original);combined[0].remove(original)
 replacement=copy.deepcopy(next(e for e in stat[0] if e.get('id')==color+'__-WQ'));replacement.set('id','_-WQ');combined[0].insert(index,replacement)
 dependencies=E.SubElement(combined,S+'defs');dependencies.append(stat)
 save('native-world-controls-'+color,combined,lambda r:[e for e in uses(r) if e.get('id') in ['butQuit','_-9R','_-WQ']],'0 0 800 600')
layouts={}
for color,frame in [('Green',1),('Red',2),('Blue',3),('Purple',2)]:
 root=read('DefineSprite_8533',frame)
 nodes=sorted([e for e in root.iter() if re.fullmatch(r'level[0-7]',e.get('id',''))],key=lambda e:e.get('id'))
 layouts[color]=[list(map(float,re.findall(r'[-\d.]+',e.get('transform'))))[-2:] for e in nodes]
 href=nodes[0].get(X)[1:]
 def castle(r,key=href):
  group=next(e for e in r.iter() if e.get('id')==key)
  return [e for e in group if e.tag==S+'use' and e.get('id')!='mcStatus' and e.get(F+'characterId')!='8475']
 save('native-world-node-'+color,root,castle,'-60 -100 120 150')
for frame in range(1,5):
 def badge(r):
  g=E.Element(S+'g',{'transform':'translate(-.1 -23.5)'})
  for e in uses(r):
   if e.get(F+'characterId')!='2331':g.append(e)
  return [g]
 save('native-world-badge-'+str(frame),read('DefineSprite_2357',frame),badge,'-60 -100 120 150',False)
for frame in range(1,61):
 def swords(r):
  g=E.Element(S+'g',{'transform':'translate(-.1 -23.5) scale(.45) translate(-.05 -6)'})
  for e in uses(r):g.append(e)
  return [g]
 save('native-world-swords-'+str(frame),read('DefineSprite_2331',frame),swords,'-60 -100 120 150',False)
root=read('DefineSprite_6708_scrChooseCampaignClass_scrChooseCampaignClass')
save('native-campaign',root,lambda r:[e for e in uses(r) if e.get('id')!='mcSoundBlock' and e.get(F+'characterId') not in ['6649','6707']],'0 0 800 600')
Path('world-layout.js').write_text('/* Original SWF level anchors, in the 800 × 600 campaign space. */\n(function(r){const layouts='+json.dumps(layouts)+';if(typeof module!=="undefined")module.exports=layouts;else r.WorldLayout=layouts;})(globalThis);\n',encoding='utf8')
print('Restored 27 world frames, four country layouts, original level artwork and 60 hover-only sword frames.')
