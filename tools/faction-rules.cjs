const fs=require('fs');let f=fs.readFileSync('flow.js','utf8');f=f.replace("document.querySelectorAll('[data-faction]')","document.querySelectorAll('.faction-cards button[data-faction]')");f=f.replace(":uiTag('attack')",":uiTag('crest')");fs.writeFileSync('flow.js',f);
let e=fs.readFileSync('engine.js','utf8');e=e.replace('cost:30,','cost:100,').replace('cost:35,','cost:120,').replace('cost:80,','cost:180,').replace('cost:110,','cost:200,').replace('tier:2','tier:1').replace('tier:3','tier:1');
e=e.replace("const swap=c=>c==='Green'?player:c===player?'Green':c;","const native=data.nativePlayer||'Green',swap=c=>c===native?player:c===player?native:c;");
e=e.replace("level:1,queue:[]","level:1,conquered:false,queue:[]");
e=e.replace("archersUnlocked:mission>0","archersUnlocked:true");
e=e.replace("gold:c===player?300:80","gold:300");
e=e.replace("gold:this.owned(owner).reduce((v,b)=>v+1.3+b.level*.4,0)","gold:1+this.owned(owner).reduce((v,b)=>v+(b.conquered?(b.type==='Castle'?2:1):0),0)");
e=e.replace("if(b.owner===this.player&&type==='archers'&&!this.archersUnlocked)return '占领第一座小镇后解锁';if(b.level<t.tier)return `需要 ${t.tier} 级城池`;",'');
e=e.replace("const u={id:this.nextId++,owner:b.owner,type,x:p.x,y:p.y,hp:t.hp,maxHp:t.hp,","const rank=Math.min(3,b.level||1),quality=1+(rank-1)*.35;const u={id:this.nextId++,owner:b.owner,type,rank,damageScale:quality,x:p.x,y:p.y,hp:t.hp*quality,maxHp:t.hp*quality,");
e=e.replace("let damage=t.damage*(.5+","let damage=t.damage*(u.damageScale||1)*(u.heroic>0?1.5:1)*(u.weakened>0?.5:1)*(.5+");
e=e.replace("升级到 2 / 3 级解锁骑兵 / 攻城战车", "升级到 2 / 3 级训练银星 / 金星精锐");e=e.replace("解锁${b.level===2?'重装骑兵':'攻城战车'}","可招募${b.level===2?'银星':'金星'}精锐部队");
e=e.replace("b.owner=owner;b.ruined=false;","b.owner=owner;b.conquered=true;b.ruined=false;");
// Replace open-ground walkability with narrow corridors joining the original road markers.
e=e.replace("  this.emit('选择城堡招募部队，点击部队后下达指令。');","  this.buildRoadGrid();this.emit('选择城堡招募部队，点击部队后下达指令。');");
e=e.replace("this.data.grid[y][x]==='1'","(this.roadGrid||this.data.grid)[y][x]==='1'");
e=e.replace(" walkable(x,y){",` buildRoadGrid(){const roads=this.data.roads;if(!roads)return;const cells=Array.from({length:60},()=>Array(80).fill('0'));for(const [i,j] of roads.edges){const a=roads.points[i],b=roads.points[j],steps=Math.ceil(dist(a,b)/3);for(let k=0;k<=steps;k++){const x=Math.floor((a.x+(b.x-a.x)*k/steps)/10),y=Math.floor((a.y+(b.y-a.y)*k/steps)/10);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(y+dy>=0&&y+dy<60&&x+dx>=0&&x+dx<80)cells[y+dy][x+dx]='1';}}}this.roadGrid=cells.map(r=>r.join(''));}
 walkable(x,y){`);
fs.writeFileSync('engine.js',e);
let g=fs.readFileSync('game.js','utf8');g=g.replace("new Battle(GAME_DATA.levels[mission],{player,difficulty,mission})","new Battle(GAME_DATA.levels.find(l=>l.level===GAME_DATA.campaigns[player][mission]),{player,difficulty,mission})");g=g.replace("`unit-${owner}-${TYPES[type].sprite}`","`unit-${owner}-${TYPES[type].sprite}`");
// Draw each country's actual campaign scene, rather than recoloring one terrain template.
let a=g.indexOf('function terrainBuild(){'),z=g.indexOf('function ellipse(',a);g=g.slice(0,a)+`function terrainBuild(){const key=battle.data.level,im=img('Level'+key+'Class');if(terrainKey===key)return;bg.clearRect(0,0,1000,660);bg.fillStyle='#9fe5f3';bg.fillRect(0,0,1000,660);if(!im.complete||!im.naturalWidth)return;bg.drawImage(im,battle.data.bounds[0]-10+100,battle.data.bounds[1]-10+10);terrainKey=key;}
`+g.slice(z);
g=g.replace("bar(u.x,u.y-43,39,u.hp/u.maxHp,colors[u.owner]);drawBadge(u);","drawBadge(u);");
a=g.indexOf('function drawBadge(u){');z=g.indexOf('\n',a);g=g.slice(0,a)+`function drawBadge(u){const p=badgePoint(u),chosen=unitIds.has(u.id),stage=Math.min(6,Math.floor((1-u.hp/u.maxHp)*7)),base=(chosen?{Green:5,Red:11,Blue:2,Purple:8}:{Green:0,Red:6,Blue:12,Purple:3})[u.owner];sprite(ctx,'SquadRoundIconClass',p.x,p.y+20,1,Math.min(99,base+stage*15));const faction={Green:'W',Red:'K',Blue:'B',Purple:'E'}[u.owner];sprite(ctx,'IconT'+(u.rank||1)+'_'+faction+'_'+TYPES[u.type].sprite+'Class',p.x,p.y+12,1);if(u.rank>1)drawUI(u.rank===3?'star-gold':'star-silver',p.x+17,p.y-14,12,12);if(u.garrisonId&&(u.state==='repair'||u.state==='capture'))drawUI('repair',p.x+18,p.y+13,15,17);}
`+g.slice(z);
g=g.replace("drawUI(art,b.x,b.y,58,58)","art==='attack'?sprite(ctx,'IconAttackClass',b.x,b.y+28,1,performance.now()/35):drawUI(art,b.x,b.y,58,58)");
fs.writeFileSync('game.js',g);
