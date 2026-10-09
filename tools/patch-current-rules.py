from pathlib import Path
p=Path('engine.js');s=p.read_text(encoding='utf-8-sig')
def replace(a,b):
 global s
 if a not in s:raise RuntimeError('Missing edit: '+a[:100])
 s=s.replace(a,b)
replace("const raw=data.nodes.filter(n=>n.markerClass==='NodeBuildHereClass'&&n.locationNum===b.location).slice(0,3);if(raw.length<2)for(const offset of [[-68,30],[66,26]]){let p=this.nearest({x:b.x+offset[0],y:b.y+offset[1]});if(!raw.some(n=>dist(n,p)<30))raw.push(p);if(raw.length>=2)break;}","const raw=data.nodes.filter(n=>n.markerClass==='NodeBuildHereClass'&&n.locationNum===b.location);")
replace("this.buildRoadGrid();this.emit(","this.buildRoadGrid();this.chests=data.nodes.filter(n=>n.markerClass==='NodeChestClass').map(n=>({id:this.nextId++,x:n.x,y:n.y,collected:false}));for(const n of data.nodes.filter(n=>n.markerClass==='NodeDefenderOgreClass'))this.spawnOgre(n);this.emit(")
replace("nearest(p){let x=", "nearest(p){if(this.data.roads?.edges.length)return this.projectRoad(p);let x=")
start=s.index(' path(from,to)');end=s.index(' canEnter(',start)
s=s[:start]+''' projectRoad(p){const roads=this.data.roads;let best=null;for(const [a,b] of roads.edges){const first=roads.points[a],last=roads.points[b],dx=last.x-first.x,dy=last.y-first.y,len=dx*dx+dy*dy,k=len?Math.max(0,Math.min(1,((p.x-first.x)*dx+(p.y-first.y)*dy)/len)):0,point={x:first.x+k*dx,y:first.y+k*dy,a,b,k};if(!best||dist(p,point)<dist(p,best))best=point;}return best||{x:p.x,y:p.y};}
 path(from,to){if(this.data.roads?.edges.length)return this.roadPath(from,to);return this.findPath(from,to);}
 roadPath(from,to){
 const roads=this.data.roads;if(!roads?.edges.length)return this.findPath(from,to);const start=this.projectRoad(from),end=this.projectRoad(to),points=roads.points,cost=points.map(()=>Infinity),prev=points.map(()=>-1),open=new Set();
 const links=this.roadLinks||(this.roadLinks=points.map((_,i)=>roads.edges.flatMap(([a,b])=>a===i?[b]:b===i?[a]:[])));
 for(const i of [start.a,start.b]){cost[i]=dist(start,points[i]);open.add(i);}
 const closed=new Set();while(open.size){let v=-1;for(const i of open)if(v<0||cost[i]<cost[v])v=i;open.delete(v);closed.add(v);for(const n of links[v]){const next=cost[v]+dist(points[v],points[n]);if(next<cost[n]){cost[n]=next;prev[n]=v;if(!closed.has(n))open.add(n);}}}
 const endIndex=cost[end.a]+dist(points[end.a],end)<cost[end.b]+dist(points[end.b],end)?end.a:end.b;if(!Number.isFinite(cost[endIndex]))return [];
 let route=[];for(let i=endIndex;i!==-1;i=prev[i])route.unshift({x:points[i].x,y:points[i].y});route=[{x:start.x,y:start.y},...route,{x:end.x,y:end.y}];
 if(start.a===end.a&&start.b===end.b&&dist(start,end)<=cost[endIndex]+dist(points[endIndex],end))route=[{x:start.x,y:start.y},{x:end.x,y:end.y}];
 return route.filter((p,i)=>i===0?dist(from,p)>.01:dist(route[i-1],p)>.01);
 }
 chest(id){return this.chests.find(c=>c.id===id&&!c.collected);}
 spawnOgre(p){const record=Progress.UNITS.find(r=>r.name==='Ogre'),stats=UnitRules.stats(record,'magic');const u={id:this.nextId++,owner:'Gray',neutral:true,type:'magic',rank:1,tech:1,record,stats,unitName:record.name,bonus:{},xp:0,x:p.x,y:p.y,home:{x:p.x,y:p.y},hp:stats.hp,maxHp:stats.hp,order:null,path:[],attackCd:0,repath:0,facing:'Down',state:'idle',anim:0,garrisonId:null};this.units.push(u);return u;}
 addXP(u,amount){if(u.neutral)return;u.xp+=amount;const rank=UnitRules.rankForXP(u.xp);if(rank<=u.rank)return;const ratio=u.hp/u.maxHp;u.rank=rank;u.stats=UnitRules.stats(u.record,u.type,rank,u.bonus||{});u.maxHp=u.stats.hp;u.hp=ratio*u.maxHp;u.levelGlow=1.5;}
''' +s[end:]
replace("record,stats,xp:0,chargeReady:true", "record,stats,bonus,xp:UnitRules.experience(rank),chargeReady:true")
replace("this.unit(targetId)||this.building(targetId)","this.unit(targetId)||this.building(targetId)||this.chest(targetId)")
replace("u.order={x:p.x,y:p.y,target:target&&(target.owner!==u.owner||isBuilding)?targetId:null,enter,capture:!!target?.ruined};u.path=this.path(u,p);u.repath=0;", "u.order={x:p.x,y:p.y,target:target&&(target.owner!==u.owner||isBuilding)?targetId:null,enter,collect:!!target&&'collected' in target,capture:!!target?.ruined};u.path=this.path(u,p);u.repath=0;u.combatTarget=null;u.chargeReady=true;")
replace("command(ids,p,targetId=null){for(const id of ids){const u=this.unit(id);if(u&&u.owner===this.player){u.defendHome=null;this.issue(u,p,targetId);}}}","command(ids,p,targetId=null){let offset=0;for(const id of ids){const u=this.unit(id);if(u&&u.owner===this.player){u.defendHome=null;this.issue(u,p,targetId);if(!targetId&&offset&&u.path.length){let remaining=offset;while(remaining>0&&u.path.length>1){const last=u.path.at(-1),before=u.path.at(-2),length=dist(last,before);if(length<=remaining){remaining-=length;u.path.pop();}else{last.x=last.x+(before.x-last.x)*remaining/length;last.y=last.y+(before.y-last.y)*remaining/length;remaining=0;}}u.order.x=u.path.at(-1).x;u.order.y=u.path.at(-1).y;}offset+=16;}}}")
replace("if([1,14].includes(z.row.id))u.hp=", "if([1,14].includes(z.row.id)&&!u.stats.abilities.Mechanism)u.hp=")
replace("u.hp=Math.min(u.maxHp,u.hp+8*dt);", "u.hp=Math.min(u.maxHp,u.hp+8*dt);if(home.level>u.rank)this.addXP(u,Math.min(1.25*dt*(1+(u.bonus?.[37]||0)/100),Math.max(0,UnitRules.experience(home.level)-u.xp)));")
replace("const t=u.stats||TYPES[u.type];u.anim+=dt;", "const t=u.stats||TYPES[u.type];if(u.neutral&&!u.order&&dist(u,u.home)>2){u.order={...u.home,target:null};u.path=this.path(u,u.home);}u.anim+=dt;")
replace("dist(u,previous)<170?previous:null", "dist(u,previous)<Math.max(115,t.contactRange+35)&&(!u.neutral||dist(previous,u.home)<130)?previous:null")
replace("dist(u,v)<Math.max(95,t.contactRange+10)","dist(u,v)<Math.max(75,t.contactRange+10)&&(!u.neutral||dist(v,u.home)<100)")
replace("(this.unit(u.order.target)||this.building(u.order.target))", "(this.unit(u.order.target)||this.building(u.order.target)||this.chest(u.order.target))")
replace("if(assigned&&(!assigned.ruined||assigned.captureOwner)","if(assigned&&!u.order.collect&&(!assigned.ruined||assigned.captureOwner)")
replace("let target=enemy||assigned;if(!target&&!u.order)target=", "if(u.order?.collect&&!assigned){u.order=null;u.path=[];}if(u.order?.collect&&!enemy){this.move(u,dt);continue;}let target=enemy||assigned;if(!target&&!u.order&&!u.neutral)target=")
a="if(isBuilding)damage*=1+(bonus[18]||0)/100;if(isBuilding)damage*=1+(t.abilities.SiegeWeapon||0)/100;if(t.range>0&&dist(u,target)<27)damage*=1-t.meleePenalty/100;if(!isBuilding&&target.stats?.abilities.ShieldWall)damage*=1-target.stats.abilities.ShieldWall/100;"
replace(a,"damage*=UnitRules.damageMultiplier(u,target,dist(u,target),isBuilding);")
replace("target.hp-=damage;if(!isBuilding){", "u.lastAttack=this.time;if(!isBuilding&&t.abilities.SplashDamage){const count=Math.max(1,Math.ceil(target.stats.members*target.hp/target.maxHp));damage*=UnitRules.formation(count).slice(0,count).filter(([x,y])=>Math.hypot(x,y)<=t.abilities.SplashDamage).length;for(const v of this.units)if(v!==target&&v.owner!==u.owner&&v.hp>0&&!v.garrisonId&&dist(v,target)<t.abilities.SplashDamage)v.hp-=damage;}target.hp-=damage;if(!isBuilding){")
replace("!target.stats?.abilities.Undead&&(t.abilities.Poisonous", "!target.stats?.abilities.Undead&&!target.stats?.abilities.Mechanism&&(t.abilities.Poisonous")
replace("if(!target.protected&&u.type==='infantry'", "if(!target.protected&&(t.abilities.FreezeArrow||t.abilities.FreezeBlast)){target.chilled=3+(bonus[30]||0);target.chillScale=1-(t.abilities.FreezeArrow||t.abilities.FreezeBlast)/100;}if(!target.protected&&u.type==='infantry'")
a="u.xp+=damage*.2*(1+(bonus[37]||0)/100);const nextRank=u.xp>350?3:u.xp>150?2:1;if(nextRank>u.rank){const ratio=u.hp/u.maxHp;u.rank=nextRank;u.stats=UnitRules.stats(u.record,u.type,nextRank,bonus);u.maxHp=u.stats.hp;u.hp=u.maxHp*ratio;}"
replace(a,"this.addXP(u,damage*.2*(1+(bonus[37]||0)/100));")
replace("u.attackCd=t.attackInterval;", "u.attackCd=t.attackInterval/(u.chilled>0?u.chillScale:1);")
replace("['heroic','weakened','frozen','enchanted','protected','bloodlust']", "['heroic','weakened','frozen','enchanted','protected','bloodlust','chilled','levelGlow']")
replace("this.units.some(u=>u.owner!==this.player)", "this.units.some(u=>u.owner!==this.player&&!u.neutral)")
replace("const deaths=this.units.filter", "for(const chest of this.chests){if(chest.collected)continue;const collector=this.units.find(u=>!u.neutral&&!u.garrisonId&&u.hp>0&&dist(u,chest)<28);if(collector){chest.collected=true;chest.collectedBy=collector.owner;this.factions[collector.owner].gold+=500;this.effects.push({type:'treasure',x:chest.x,y:chest.y,t:1.4,max:1.4});if(collector.order?.target===chest.id){collector.order=null;collector.path=[];}this.emit(COLOR_NAMES[collector.owner]+'取得宝箱：500 金币');}}const deaths=this.units.filter")
replace("let budget=(u.stats||TYPES[u.type]).speed*dt;", "let budget=(u.stats||TYPES[u.type]).speed*(u.chilled>0?u.chillScale:1)*dt;")
replace("u.facing=Math.abs(dx)", "u.heading=Math.atan2(dy,dx);u.facing=Math.abs(dx)")
replace("u.state='move';budget-=step;", "u.state='move';u.walkDistance=(u.walkDistance||0)+step;budget-=step;")
replace("u.owner=this.player;u.order=null;", "const ratio=u.hp/u.maxHp;u.owner=this.player;u.record=Progress.unit(this.player,TYPES[u.type].sprite,u.tech);u.tech=u.record.techLevel;u.unitName=u.record.name;u.bonus=this.bonuses;u.stats=UnitRules.stats(u.record,u.type,u.rank,u.bonus);u.maxHp=u.stats.hp;u.hp=ratio*u.maxHp;u.order=null;")
p.write_text(s,encoding='utf8')
print('Patched original routes, native neutral content, veteran progression and combat properties.')
