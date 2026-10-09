const fs=require('fs');let e=fs.readFileSync('engine.js','utf8');
e=e.replace(/train:(1\.5|2|8|10),/g,'train:0,').replace('aiClock:7','aiClock:20');
e=e.replace("this.spawn(home,'infantry');","this.queue(home,'infantry');");
e=e.replace("const route=this.findPath(from,to);","const route=this.roadPath(from,to);");
const before=' findPath(from,to){';e=e.replace(before,` roadPath(from,to){
 const roads=this.data.roads;if(!roads?.points.length||dist(from,to)<55)return this.findPath(from,to);
 const points=roads.points,closest=p=>points.reduce((best,v,i)=>dist(p,v)<dist(p,points[best])?i:best,0),start=closest(from),end=closest(to),cost=points.map(()=>Infinity),prev=points.map(()=>-1),open=new Set(points.map((_,i)=>i));cost[start]=0;
 while(open.size){let v=-1;for(const i of open)if(v<0||cost[i]<cost[v])v=i;if(v===end||!Number.isFinite(cost[v]))break;open.delete(v);for(const [a,b] of roads.edges){const n=a===v?b:b===v?a:-1;if(n<0||!open.has(n))continue;const next=cost[v]+dist(points[v],points[n]);if(next<cost[n]){cost[n]=next;prev[n]=v;}}}
 if(!Number.isFinite(cost[end]))return this.findPath(from,to);const indices=[];for(let i=end;i!==-1;i=prev[i])indices.unshift(i);let result=[],at=from;for(const waypoint of [...indices.map(i=>points[i]),to]){result.push(...this.findPath(at,waypoint));at=waypoint;}return result;
 }
 canEnter(b,owner){return b.ruined?!b.captureOwner||b.captureOwner===owner:b.owner===owner;}
 claim(b,owner){if(!b.ruined||b.captureOwner)return;b.owner=owner;b.captureOwner=owner;b.hp=Math.max(1,b.maxHp*.1);b.captureProgress=b.hp/b.maxHp*4;this.emit(COLOR_NAMES[owner]+'开始修复据点');}
`+before);
e=e.replace("if(this.pop(b.owner)>=this.cap(b.owner))return '人口已满：建造农庄或占领城池';if(b.queue.length>=2)return '训练队列已满';",'');
e=e.replace("f.gold-=t.cost;b.queue.push({type,left:t.train,total:t.train});return null;","f.gold-=t.cost;this.spawn(b,type);this.emit(`${COLOR_NAMES[b.owner]}招募${t.name}`);return null;");
e=e.replace("enter=!!(isBuilding&&(target.owner===u.owner||target.ruined))","enter=!!(isBuilding&&this.canEnter(target,u.owner))");
e=e.replace("defend(b,attacker){if(b.ruined||!attacker","defend(b,attacker){if((b.ruined&&!b.captureOwner)||!attacker");
let a=e.indexOf(' ai(){'),z=e.indexOf(' update(dt)',a);e=e.slice(0,a)+` ai(){for(const owner of Object.keys(this.factions)){
 if(owner===this.player)continue;const f=this.factions[owner],bases=this.owned(owner);if(!bases.length)continue;
 if(this.time>=(f.nextRecruit??20)){const base=bases.slice().sort((a,b)=>this.units.filter(u=>u.garrisonId===a.id).length-this.units.filter(u=>u.garrisonId===b.id).length)[0];this.queue(base,this.time>100&&Math.random()<.3?'archers':'infantry');f.nextRecruit=this.time+20;}
 if(this.time<(f.nextAttack??45))continue;const foes=this.buildings.filter(b=>b.ruined?!b.captureOwner||b.captureOwner!==owner:b.owner!==owner),army=this.units.filter(u=>u.owner===owner&&!u.order&&!u.defendHome&&(!u.garrisonId||!this.building(u.garrisonId).ruined));
 if(army.length>=2){for(const u of army.slice(0,2)){const t=foes.slice().sort((a,b)=>dist(u,a)-dist(u,b))[0];if(t)this.issue(u,t,t.id);}f.nextAttack=this.time+35;}
 }}
`+e.slice(z);
e=e.replace("let r=this.rates(owner),factor=owner===this.player?1:({easy:.55,normal:.85,hard:1.2}[this.difficulty]);f.gold+=r.gold*dt*factor;","let r=this.rates(owner);f.gold+=r.gold*dt;");
a=e.indexOf('  for(const b of this.buildings){if(b.ruined)continue;',e.indexOf(' update(dt)'));z=e.indexOf('const threat=',a);
e=e.slice(0,a)+"  for(const b of this.buildings){if(b.ruined&&!b.captureOwner)continue;b.fireCd-=dt;"+e.slice(z);
e=e.replace('if(threat&&b.fireCd<=0){','if(threat&&!b.ruined&&b.fireCd<=0){');
e=e.replace('!home||home.ruined||home.owner!==u.owner','!home||(home.ruined&&!home.captureOwner)||home.owner!==u.owner');
e=e.replace("if(!home){u.garrisonId=null;}","if(!home||!this.canEnter(home,u.owner)){u.garrisonId=null;}");
e=e.replace("if(assigned&&!assigned.ruined&&(assigned.hp<=0", "if(assigned&&(!assigned.ruined||assigned.captureOwner)&&(assigned.hp<=0");
a=e.indexOf("if(assigned&&'queue' in assigned&&u.order.enter)");z=e.indexOf("let target=enemy||assigned;",a);
e=e.slice(0,a)+`if(assigned&&'queue' in assigned&&u.order.enter){
 if(!this.canEnter(assigned,u.owner)){u.order.enter=false;u.order.capture=false;}
 else if(!enemy){const guard=this.units.find(v=>v.hp>0&&v.owner!==u.owner&&((v.garrisonId===assigned.id)||(!v.garrisonId&&dist(v,assigned)<70)));if(guard){this.defend(assigned,u);if(!guard.garrisonId){u.path=this.path(u,guard);this.move(u,dt);}continue;}
 if(dist(u,assigned)>20){if(!u.path.length)u.path=this.path(u,assigned);this.move(u,dt);}else{this.claim(assigned,u.owner);u.garrisonId=assigned.id;u.defendHome=null;u.x=assigned.x;u.y=assigned.y;u.state=assigned.ruined?'capture':'repair';u.order=null;u.path=[];}continue;}}
 if(assigned?.ruined&&!assigned.captureOwner&&!enemy){u.order=null;u.path=[];continue;}
 `+e.slice(z);
e=e.replace("if(!target&&!u.order)target=this.buildings.find(b=>!b.ruined&&b.owner!==u.owner", "if(!target&&!u.order)target=this.buildings.find(b=>(!b.ruined||b.captureOwner)&&b.owner!==u.owner");
a=e.indexOf('  for(const b of this.buildings.filter(b=>b.ruined))');z=e.indexOf('  this.lost+=',a);
e=e.slice(0,a)+`  for(const b of this.buildings.filter(b=>b.ruined&&b.captureOwner)){
 const occupants=this.units.filter(u=>u.hp>0&&u.garrisonId===b.id&&u.owner===b.captureOwner);if(occupants.length){b.hp=Math.min(b.maxHp,b.hp+b.maxHp/4*dt);b.captureProgress=b.hp/b.maxHp*4;if(b.hp>=b.maxHp)this.capture(b,b.captureOwner);}else b.captureProgress=b.hp/b.maxHp*4;
 }
`+e.slice(z);
e=e.replace("this.aiClock=this.mission===0?12:({easy:10,normal:7,hard:4}[this.difficulty])","this.aiClock=1");
e=e.replace("destroy(b){if(b.ruined)return;","destroy(b){if(b.ruined&&!b.captureOwner)return;");
e=e.replace('b.hp=b.maxHp*.55;','b.hp=b.maxHp;');
fs.writeFileSync('engine.js',e);
