import json, math
from PIL import Image
from pathlib import Path
p=Path('game-data.js');data=json.loads(p.read_text(encoding='utf-8-sig').split('=',1)[1].rstrip(';'))
def components(im,pred):
 w,h=im.size;px=im.load();seen=set();out=[]
 for y in range(h):
  for x in range(w):
   if (x,y) in seen or not pred(px[x,y]):continue
   q=[(x,y)];seen.add((x,y));pts=[]
   while q:
    a,b=q.pop();pts.append((a,b))
    for c,d in [(a-1,b),(a+1,b),(a,b-1),(a,b+1)]:
     if 0<=c<w and 0<=d<h and (c,d) not in seen and pred(px[c,d]):seen.add((c,d));q.append((c,d))
   out.append((sum(a for a,b in pts)/len(pts),sum(b for a,b in pts)/len(pts),len(pts)))
 return out
for level in data['levels']:
 im=Image.open(f"assets/takeover/animation/anim/Level{level['level']}GraphMarkersClass.png").convert('RGBA')
 green=components(im,lambda c:c[1]>190 and c[0]<80 and c[2]<80 and c[3]>128)
 anchors=[n for n in level['nodes'] if n['markerClass']=='EmptyNodeClass']
 candidates=[(n['x']-x,n['y']-y) for n in anchors for x,y,s in green]
 def score(t):return sum(min((math.hypot(n['x']-x-t[0],n['y']-y-t[1]) for x,y,s in green),default=999)<4 for n in anchors)
 offset=max(candidates,key=score) if candidates else (0,0)
 red=components(im,lambda c:c[0]>220 and c[1]<60 and c[2]<60 and c[3]>128)
 points=[{'x':round(x+offset[0],2),'y':round(y+offset[1],2)} for x,y,s in red if 2<=s<=70]
 points += [{'x':n['x'],'y':n['y']} for n in level['nodes'] if n['markerClass']=='EmptyNodeClass' or ('Node' in n['markerClass'] and any(t in n['markerClass'] for t in ['Castle','Town','MageTower','Camp']))]
 edges=[];pairs=sorted((math.hypot(a['x']-b['x'],a['y']-b['y']),i,j) for i,a in enumerate(points) for j,b in enumerate(points) if j>i);parent=list(range(len(points)))
 def root(i):
  while parent[i]!=i:i=parent[i]
  return i
 for distance,i,j in pairs:
  ri,rj=root(i),root(j)
  if ri!=rj:parent[ri]=rj;edges.append([i,j])
 level['roads']={'points':points,'edges':edges,'source':'Original GraphMarkers red road points and EmptyNode anchors'}
 print(level['level'],'anchors',score(offset),'road points',len(points),'offset',offset)
p.write_text('window.GAME_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';',encoding='utf8')
