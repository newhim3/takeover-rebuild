const fs=require('fs');let s=fs.readFileSync('engine.js','utf8');
s=s.replace("anim:0};this.units.push(u);return u;", "anim:0,garrisonId:b.id||null};if(u.garrisonId){u.x=b.x;u.y=b.y;u.state='garrison';}this.units.push(u);return u;");
let start=s.indexOf(' command(ids,'),end=s.indexOf(' cast(type,',start);
s=s.slice(0,start)+` deploy(u){if(!u.garrisonId)return;const home=this.building(u.garrisonId);u.garrisonId=null;const p=this.nearest({x:home.x+(u.id%3-1)*22,y:home.y+38});u.x=p.x;u.y=p.y;u.state='move';}
 issue(u,p,targetId=null){const target=this.unit(targetId)||this.building(targetId),isBuilding=target&&'queue' in target,enter=!!(isBuilding&&(target.owner===u.owner||target.ruined));if(u.garrisonId&&enter&&u.garrisonId===targetId){u.order=null;return;}this.deploy(u);u.order={x:p.x,y:p.y,target:target&&(target.owner!==u.owner||isBuilding)?targetId:null,enter,capture:!!target?.ruined};u.path=this.path(u,p);u.repath=0;}
 command(ids,p,targetId=null){for(const id of ids){const u=this.unit(id);if(u&&u.owner===this.player)this.issue(u,p,targetId);}}
`+s.slice(end);
s=s.replace("u.order={x:t.x,y:t.y,target:t.id,capture:!!t.ruined};u.path=this.path(u,t);", "this.issue(u,t,t.id);");
s=s.replace("this.units.filter(u=>u.owner===owner&&!u.order)","this.units.filter(u=>u.owner===owner&&!u.order)");
s=s.replace("for(const u of this.units){if(u.hp<=0)continue;const t=TYPES[u.type];", "for(const u of this.units){if(u.hp<=0)continue;if(u.garrisonId){const home=this.building(u.garrisonId);if(!home){u.garrisonId=null;}else{u.x=home.x;u.y=home.y;u.anim+=dt;u.state=home.ruined?'capture':home.hp<home.maxHp?'repair':'garrison';if(!home.ruined&&home.owner===u.owner){home.hp=Math.min(home.maxHp,home.hp+10*dt);u.hp=Math.min(u.maxHp,u.hp+3*dt);}continue;}}const t=TYPES[u.type];");
s=s.replace("u=>u.owner!==b.owner&&u.hp>0&&dist", "u=>!u.garrisonId&&u.owner!==b.owner&&u.hp>0&&dist");
s=s.replace("v=>v.owner!==u.owner&&v.hp>0&&dist", "v=>!v.garrisonId&&v.owner!==u.owner&&v.hp>0&&dist");
s=s.replace("if(assigned&&!assigned.ruined&&(assigned.hp<=0||assigned.owner===u.owner))", "if(assigned&&!assigned.ruined&&(assigned.hp<=0||(assigned.owner===u.owner&&!u.order.enter)))");
let old="if(assigned?.ruined&&!enemy){if(u.order.capture){if(dist(u,assigned)>20){if(!u.path.length||u.repath<=0){u.path=this.path(u,assigned);u.repath=1;}this.move(u,dt);}else{u.state='capture';u.path=[];}}else{u.order=null;u.path=[];}continue;}";
let replacement="if(assigned&&'queue' in assigned&&u.order.enter){if(!assigned.ruined&&assigned.owner!==u.owner){u.order.enter=false;u.order.capture=false;}else{if(dist(u,assigned)>20){if(!u.path.length||u.repath<=0){u.path=this.path(u,assigned);u.repath=1;}this.move(u,dt);}else{u.garrisonId=assigned.id;u.x=assigned.x;u.y=assigned.y;u.state=assigned.ruined?'capture':'repair';u.order=null;u.path=[];}continue;}}if(assigned?.ruined){u.order=null;u.path=[];continue;}";
if(!s.includes(old))throw Error('capture block not found');s=s.replace(old,replacement);
s=s.replace("u=>u.hp>0&&u.order?.target===b.id&&u.order.capture&&dist(u,b)<=22", "u=>u.hp>0&&u.garrisonId===b.id");
s=s.replace("u=>u.hp>0&&dist(u,b)<50", "u=>u.hp>0&&!u.garrisonId&&dist(u,b)<50");
s=s.replace("if(!threat&&this.mission>0)b.hp=Math.min(b.maxHp,b.hp+1.5*dt);", "");
s=s.replace("for(const u of this.units)if(u.order?.target===b.id){u.order=null;u.path=[];u.state='idle';}", "for(const u of this.units){if(u.garrisonId===b.id)this.deploy(u);if(u.order?.target===b.id){u.order=null;u.path=[];u.state='idle';}}");
fs.writeFileSync('engine.js',s);
