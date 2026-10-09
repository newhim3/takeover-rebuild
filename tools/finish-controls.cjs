const fs=require('fs');
let e=fs.readFileSync('engine.js','utf8');
e=e.replace('ai(){if(this.mission===0)return;','ai(){');
e=e.replace('this.aiClock={easy:10,normal:7,hard:4}[this.difficulty]','this.aiClock=this.mission===0?12:({easy:10,normal:7,hard:4}[this.difficulty])');
e=e.replace('if(!u.path.length||u.repath<=0){u.path=this.path(u,assigned);u.repath=1;}','if(!u.path.length){u.path=this.path(u,assigned);u.repath=1;}');
e=e.replace('if(u.repath<=0||!u.path.length){u.path=this.path(u,target);u.repath=1;}','if(!u.path.length||(!isBuilding&&u.repath<=0)){u.path=this.path(u,target);u.repath=1;}');
e=e.replace('path(from,to){','path(from,to){this.pathCache??=new Map();const key=[Math.floor(from.x/10),Math.floor(from.y/10),Math.floor(to.x/10),Math.floor(to.y/10)].join();if(this.pathCache.has(key))return this.pathCache.get(key).slice();const route=this.findPath(from,to);if(this.pathCache.size>256)this.pathCache.clear();this.pathCache.set(key,route);return route.slice();}\n findPath(from,to){');
fs.writeFileSync('engine.js',e);
let g=fs.readFileSync('game.js','utf8');
g=g.replace("im.onload=()=>{terrainKey='';};","im.onload=()=>{if(/^Level/.test(key))terrainKey='';};");
g=g.replace(/function preload\(\)\{.*?\}\r?\n/,`function preload(){for(const color of Object.keys(battle.factions))for(const direction of ['Left','Right','Up','Down']){const key=color+'Infantry'+direction+'_Go';if(GAME_DATA.sprites[key])img(key);}for(const b of battle.buildings)img(b.type+b.owner+'Class');for(const key of ['move','attack','enter','build-site'])uiBitmap(key);}\n`);
let start=g.indexOf("ctx.strokeStyle=b.owner===player?",g.indexOf('function drawSlot'));let end=g.indexOf('\n',start);
g=g.slice(0,start)+"drawUI('build-site',s.x,s.y-14,32,38);}"+g.slice(end);
g=g.replace("drawEffects();if(drag?.mode==='box')","drawEffects();drawOrders();if(drag?.mode==='box')");
g=g.replace("battle.effects.push({type:'capture',x:point.x,y:point.y,t:.7,max:.7});","commandMarker={x:point.x,y:point.y,art:commandArt(h),until:performance.now()+1300};");
g=g.replace("$('quickSpeed').textContent='▶ '+speed+'×'","$('quickSpeed').textContent=speed+'×'");
g+=`\nlet commandMarker=null;
function commandArt(h){if(h?.type==='building'){const b=battle.building(h.id);return b.ruined||b.owner===player?'enter':'attack';}return h?.owner&&h.owner!==player?'attack':'move';}
function drawOrders(){
 if(commandMarker&&performance.now()<commandMarker.until)drawUI(commandMarker.art,commandMarker.x,commandMarker.y,56,56);
 for(const id of unitIds){const u=battle.unit(id);if(u?.order)drawUI(u.order.enter?'enter':u.order.target?'attack':'move',u.order.x,u.order.y,38,38);}
 if(drag?.mode!=='unit'||dist(drag.start,mouse)<4)return;
 const h=hit(mouse),art=commandArt(h),a=drag.start,b=mouse,dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
 ctx.save();ctx.strokeStyle=art==='attack'?'#dc644b':'#9ced45';ctx.lineWidth=4;ctx.setLineDash([8,6]);ctx.lineDashOffset=-performance.now()/65;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
 for(let d=35;d<length-30;d+=48){ctx.save();ctx.translate(a.x+dx*d/length,a.y+dy*d/length);ctx.rotate(angle);drawUI('move',0,0,27,27);ctx.restore();}ctx.restore();drawUI(art,b.x,b.y,58,58);
}
`;
fs.writeFileSync('game.js',g);
let html=fs.readFileSync('index.html','utf8').replace('href="style.css">','href="style.css"><link rel="stylesheet" href="original-ui.css">');fs.writeFileSync('index.html',html);
