"""Apply the audited input, shortest-path and animation-origin corrections."""
from pathlib import Path
p=Path('engine.js');s=p.read_text(encoding='utf-8-sig')
a=s.index(' roadPath(');b=s.index('\n chest(',a)
section=s[a:b].replace('dist(', 'worldDist(')
s=s[:a]+section+s[b:]
s=s.replace('u.path=this.path(u,p);u.repath=0;', 'u.path=this.path(u,p);u.pathTarget=target?.id||null;u.repath=0;')
s=s.replace('if(!u.path.length||(!isBuilding&&u.repath<=0)){u.path=this.path(u,target);u.repath=1;}', 'if(!u.path.length||u.pathTarget!==target.id||(!isBuilding&&u.repath<=0)){u.path=this.path(u,target);u.pathTarget=target.id;u.repath=1;}')
a=s.index(' move(u,dt){');b=s.index('\n destroy(',a)
s=s[:a]+''' routeLength(from,path){let length=0,previous=from;for(const p of path){length+=worldDist(previous,p);previous=p;}return length;}
 steer(u,angle,dt){const previous=u.visualHeading??angle,turn=Math.atan2(Math.sin(angle-previous),Math.cos(angle-previous));u.heading=angle;u.visualHeading=previous+turn*(1-Math.exp(-dt*8));const x=Math.cos(u.visualHeading),y=Math.sin(u.visualHeading),horizontal=u.facing==='Left'||u.facing==='Right';if(horizontal?Math.abs(y)>Math.abs(x)*1.25:Math.abs(x)>Math.abs(y)*1.25)u.facing=horizontal?(y>0?'Down':'Up'):(x>0?'Right':'Left');else if(horizontal&&Math.abs(x)>.4)u.facing=x>0?'Right':'Left';else if(!horizontal&&Math.abs(y)>.4)u.facing=y>0?'Down':'Up';}
 lookAhead(u,distance=32){let start=u,remaining=distance;for(const p of u.path){const d=worldDist(start,p);if(d>=remaining)return {x:start.x+(p.x-start.x)*remaining/d,y:start.y+(p.y-start.y)*remaining/d};remaining-=d;start=p;}return start;}
 canEngage(u,v){const d=worldDist(u,v),range=u.stats.contactRange;if(d<=range+8)return true;if(d>Math.max(115,range+35))return false;if(u.neutral&&worldDist(v,u.home)>130)return false;if(u.order&&!u.defendHome&&u.order.target!==v.id&&u.path.length){const next=this.lookAhead(u),dx=next.x-u.x,dy=(next.y-u.y)*2;if(dx*(v.x-u.x)+dy*(v.y-u.y)*2<0)return false;}u.engagementCache??={};let memo=u.engagementCache[v.id];if(!memo||memo.until<this.time){const path=this.path(u,v);memo=u.engagementCache[v.id]={until:this.time+.5,reachable:path.length>0&&this.routeLength(u,path)<=Math.max(135,range+45)};}return memo.reachable;}
 move(u,dt){
  if(!u.path.length)return;u.state='move';let budget=(u.stats||TYPES[u.type]).speed*(u.chilled>0?u.chillScale:1)*dt;
  while(u.path.length&&worldDist(u,u.path[0])<.01)u.path.shift();if(!u.path.length)return;
  const next=u.path[0],dx=next.x-u.x,dy=(next.y-u.y)*2,length=Math.hypot(dx,dy),gap=u.type==='cavalry'?64:48;
  for(const ally of this.units){if(ally===u||ally.owner!==u.owner||ally.garrisonId||ally.hp<=0||ally.state!=='move')continue;const ax=ally.x-u.x,ay=(ally.y-u.y)*2,along=(ax*dx+ay*dy)/length,side=Math.abs(ax*dy-ay*dx)/length,aligned=ally.heading==null||Math.cos(ally.heading-Math.atan2(dy,dx))>.5;if(aligned&&side<16&&(along>0||Math.hypot(ax,ay)<.1&&ally.id<u.id)&&along<gap)budget=Math.min(budget,Math.max(0,along-gap));}
  const looking=this.lookAhead(u);this.steer(u,Math.atan2((looking.y-u.y)*2,looking.x-u.x),dt);
  while(budget>0&&u.path.length){const p=u.path[0],d=worldDist(u,p);if(d<.01){u.path.shift();continue;}const step=Math.min(d,budget);u.x+=(p.x-u.x)/d*step;u.y+=(p.y-u.y)/d*step;u.walkDistance=(u.walkDistance||0)+step;budget-=step;if(step>=d)u.path.shift();}
 }
''' + s[b:]
s=s.replace('dist(u,previous)<Math.max(115,t.contactRange+35)', 'this.canEngage(u,previous)')
s=s.replace('dist(u,v)<Math.max(75,t.contactRange+10)', 'worldDist(u,v)<Math.max(75,t.contactRange+10)&&this.canEngage(u,v)')
s=s.replace('sort((a,b)=>dist(u,a)-dist(u,b))[0];u.combatTarget', 'sort((a,b)=>worldDist(u,a)-worldDist(u,b))[0];u.combatTarget')
s=s.replace('u.heading=Math.atan2(dy,dx);u.visualHeading=(u.visualHeading??u.heading)+Math.atan2(Math.sin(u.heading-(u.visualHeading??u.heading)),Math.cos(u.heading-(u.visualHeading??u.heading)))*(1-Math.exp(-dt*12));u.facing=Math.abs(dx)>Math.abs(dy)?(dx>=0?\'Right\':\'Left\'):(dy>=0?\'Down\':\'Up\');', 'this.steer(u,Math.atan2(dy,dx),dt);')
p.write_text(s,encoding='utf-8')
p=Path('game.js');s=p.read_text(encoding='utf-8-sig')
s=s.replace('x-meta.fw*scale/2,y-meta.fh*scale,meta.fw*scale,meta.fh*scale', 'x-(UnitPivots[key]?.[0]??meta.fw/2)*scale,y-(UnitPivots[key]?.[1]??meta.fh)*scale,meta.fw*scale,meta.fh*scale')
s=s.replace('(u.walkDistance||0)/t.speed*(u.record.baseSpeedAnimWalk||11)', 'UnitRules.walkFrame(u.walkDistance||0,u.record)')
s=s.replace("ellipse(x,y+1,6,3,'#15281344');sprite(ctx,key,x,y+2,u.avatar?1.5:1,frame);", "sprite(ctx,key,x,y+2,u.avatar?1.5:1,frame+(action==='Go'?i*(meta?.frames||20)/Math.max(3,members):0));")
s=s.replace('}drawBadge(u);}', '}}',1)
s=s.replace('for(const u of battle.units.filter(u=>u.garrisonId))drawBadge(u);', 'for(const u of battle.units)drawBadge(u);')
s=s.replace('const target=h&&(h.type', 'let target=h&&(h.type',1)
s=s.replace("const point=target||p;if(!target", "if(fromBadge&&target?.garrisonId)target=battle.building(target.garrisonId);let point=target||p;if(!target",1)
s=s.replace("battle.command(ids,point,target?.id);commandMarker", "if(!target&&battle.data.roads?.edges.length)point=battle.projectRoad(point);battle.command(ids,point,target?.id);commandMarker",1)
s=s.replace('moved=dist(p,drag.start)>9', 'moved=dist(p,drag.start)*viewport().scale*mapCamera().scale>5')
p.write_text(s,encoding='utf-8')
p=Path('index.html');s=p.read_text(encoding='utf-8-sig').replace('<script src="game.js">', '<script src="unit-pivots.js"></script><script src="game.js">');p.write_text(s,encoding='utf-8')
print('Applied physical shortest paths, stable facing, target-change repathing, formation spacing, source animation timing and all native unit origins.')
