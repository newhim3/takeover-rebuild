"""Port LevelParser.dynamic: named ed_A_B edges and transformed waypoints."""
import re,json,xml.etree.ElementTree as E
from pathlib import Path
x=Path('../takeover拆解/scratch/swf.xml').read_text(encoding='utf-8-sig')
symbols={name:int(cid) for cid,name in re.findall(r'(\d+);"([^"]+)"',Path('assets/takeover/art/symbols.csv').read_text(encoding='utf-8-sig'))}
p=Path('game-data.js');data=json.loads(p.read_text(encoding='utf-8-sig').split('=',1)[1].rstrip(';'))
cache={}
def placements(cid):
 if cid not in cache:
  try:a=x.index(f'spriteId="{cid}"');b=x.index('</subTags>',a)
  except ValueError:return []
  cache[cid]=[E.fromstring(c) for c in re.findall(r'<item type="PlaceObject\d*Tag".*?</item>',x[a:b],re.S)]
 return cache[cid]
def matrix(e):
 m=e.find('matrix');return [float(m.get('scaleX',1)),float(m.get('rotateSkew0',0)),float(m.get('rotateSkew1',0)),float(m.get('scaleY',1)),float(m.get('translateX',0))/20,float(m.get('translateY',0))/20] if m is not None else [1,0,0,1,0,0]
report=[]
for level in data['levels']:
 root=placements(symbols[f"Level{level['level']}GraphMarkersClass"]);nodes={n['nodeId']:n for n in level['nodes']};points=[];edges=[];indices={};source=[]
 def add(q):
  key=(round(q['x'],4),round(q['y'],4))
  if key not in indices:indices[key]=len(points);points.append({'x':key[0],'y':key[1]})
  return indices[key]
 for e in root:
  match=re.fullmatch(r'[^_]*ed_([^_]+)_([^_]+)',e.get('name',''))
  if not match:continue
  a,b=match.groups()
  if a not in nodes or b not in nodes:raise ValueError((level['level'],a,b))
  transform=matrix(e);chain=[nodes[a]]
  for child in placements(int(e.get('characterId'))):
   # Only DisplayObjectContainer markers are used by the original parser.
   if not placements(int(child.get('characterId',0))):continue
   local=matrix(child);px,py=local[4:];chain.append({'x':transform[0]*px+transform[2]*py+transform[4],'y':transform[1]*px+transform[3]*py+transform[5]})
  chain.append(nodes[b]);route=[add(q) for q in chain]
  for first,last in zip(route,route[1:]):
   if first!=last:edges.append([first,last])
  source.append({'from':a,'to':b,'points':route})
 if not edges:raise ValueError('No native edges: '+str(level['level']))
 level['roads']={'points':points,'edges':edges,'source':'LevelParser.dynamic: original ed_A_B topology and SWF waypoint matrices','routes':source}
 report.append({'level':level['level'],'routes':len(source),'points':len(points),'edges':len(edges)})
p.write_text('window.GAME_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';',encoding='utf8')
Path('reference/road-graph-audit.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print('Restored',len(report),'native road graphs;',sum(r['routes'] for r in report),'original routes including treasure and ogre branches.')
