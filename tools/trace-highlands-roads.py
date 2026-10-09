"""Prepare navigation data from B's painted roads; does not modify the image."""
from PIL import Image
from pathlib import Path
import json,heapq,math,subprocess
node=r'C:\Users\文韬武略\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
data=json.loads(subprocess.check_output([node,'-e',"console.log(JSON.stringify(require('./multiplayer-map').create(null,[],{map:'highlands'}).roads))"],text=True,encoding='utf-8'))
im=Image.open('assets/takeover/maps/highlands-B.png').convert('RGB');w,h=im.size;step=5;W=w//step;H=h//step
def isroad(r,g,b):return r>175 and g>125 and b<195 and r-b>38 and g-b>22 and r<g*1.65
cost=[]
for y in range(H):
    for x in range(W):
        rgb=im.getpixel((x*step+2,y*step+2));cost.append(1 if isroad(*rgb) else 18)
def snap(p):
    x,y=int(p['x']/step),int(p['y']/step);choices=[]
    for dy in range(-5,6):
        for dx in range(-5,6):
            nx,ny=x+dx,y+dy
            if 0<=nx<W and 0<=ny<H and cost[ny*W+nx]==1:choices.append((dx*dx+dy*dy,ny*W+nx))
    return min(choices)[1] if choices else y*W+x
def simplify(path,epsilon=2.5):
    if len(path)<3:return path
    a,b=path[0],path[-1];dx,dy=b[0]-a[0],b[1]-a[1];norm=math.hypot(dx,dy)
    distances=[abs(dx*(a[1]-p[1])-(a[0]-p[0])*dy)/norm if norm else math.dist(a,p) for p in path]
    i=max(range(len(path)),key=distances.__getitem__)
    if distances[i]>epsilon:return simplify(path[:i+1],epsilon)[:-1]+simplify(path[i:],epsilon)
    return [a,b]
paths={};bad=[]
for a,b in data['edges']:
    first,last=snap(data['points'][a]),snap(data['points'][b]);gx,gy=last%W,last//W
    queue=[(0,first)];distance={first:0};previous={};found=False
    while queue:
        priority,v=heapq.heappop(queue)
        if v==last:found=True;break
        x,y=v%W,v//W
        for dx,dy in [(1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)]:
            nx,ny=x+dx,y+dy
            if not (0<=nx<W and 0<=ny<H):continue
            n=ny*W+nx;d=distance[v]+cost[n]*math.hypot(dx,dy)
            if d>=distance.get(n,float('inf')):continue
            distance[n]=d;previous[n]=v;heapq.heappush(queue,(d+math.hypot(nx-gx,ny-gy),n))
    if not found:raise RuntimeError((a,b))
    chain=[last]
    while chain[-1]!=first:chain.append(previous[chain[-1]])
    chain.reverse();fraction=sum(cost[n]==1 for n in chain)/len(chain)
    if fraction<.88:bad.append({'edge':[a,b],'paintedRoadFraction':round(fraction,3)})
    route=simplify([(n%W*step+2,n//W*step+2) for n in chain]);route=[(data['points'][a]['x'],data['points'][a]['y']),*route,(data['points'][b]['x'],data['points'][b]['y'])]
    paths[f'{a}:{b}']=[{'x':x,'y':y} for x,y in route]
out={'paths':paths,'audit':{'image':'highlands-B.png','gridStep':step,'edges':len(paths),'needsReview':bad}}
Path('assets/takeover/maps/highlands-roads.js').write_text('/* B painted-road navigation; generated data, not new artwork. */\n(function(r){const data='+json.dumps(out,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else r.HighlandsRoads=data;})(globalThis);',encoding='utf-8')
Path('reference/highlands-road-audit.json').write_text(json.dumps(out['audit'],indent=2),encoding='utf-8')
print('Prepared',len(paths),'curved paths;',len(bad),'edges need extra visual review')

