from pathlib import Path
def load(name):return Path(name).read_text(encoding='utf-8-sig')
def save(name,s):Path(name).write_text(s,encoding='utf8')
s=load('flow.js');a=s.index('function showCampaign()');b=s.index('function animateLevelHover',a)
s=s[:a]+'''function showCampaign(){paused=true;stage('campaign-screen native-campaign-screen',`<div class="native-campaign four-campaigns"><h1>选择战役</h1><div class="native-factions">${['Blue','Green','Red','Purple'].map(c=>`<button data-faction="${c}" aria-label="${COLOR_NAMES[c]}战役"><img class="campaign-flag" src="${UI_BASE}native-campaign-flag-${c}.svg" alt=""><span>${COLOR_NAMES[c]}</span><small>${profile().campaigns[c]?.completed?.length||0} / ${missions.length}</small></button>`).join('')}</div><button id="profilesBack">更换存档</button>${started&&!battle.result?'<button id="resumeBattle">继续战斗</button>':''}</div>`);document.querySelectorAll('.native-campaign button[data-faction]').forEach(b=>b.onclick=()=>{player=b.dataset.faction;mission=0;started=false;reset();paused=true;profile().lastFaction=player;persist();showWorld();});$('profilesBack').onclick=showProfiles;if($('resumeBattle'))$('resumeBattle').onclick=()=>{player=battle.player;mission=battle.mission;paused=false;hideModal();};}
''' +s[b:]
s=s.replace("mission=Number(b.dataset.level);showPreparation();","mission=Number(b.dataset.level);showLevelInfo();")
a=s.index('function showPreparation()');b=s.index('function finish()',a)
s=s[:a]+'''function showLevelInfo(){
 const map=document.querySelector('.native-world');if(!map)return;map.querySelector('.level-info-layer')?.remove();const [x,ny]=WorldLayout[player][mission],y=ny-15,frame=x<200?1:x<360?2:x<550?3:4,layout=LevelPopupLayout[frame-1],button=layout.button,layer=document.createElement('div');layer.className='level-info-layer';const reward=CampaignXP.rewards[mission];
 layer.innerHTML=`<button class="level-dismiss" aria-label="关闭关卡信息"></button><img class="level-info-art" src="${UI_BASE}native-level-info-${frame}.svg" alt="" style="left:${(x-405)/8}%;top:${(y-125)/6}%"><span class="level-info-title" style="left:${(x+32.85)/8}%;top:${(y-68.05)/6}%">第 ${mission+1} 关</span><span class="level-info-xp" style="left:${(x+138.1)/8}%;top:${(y-29.25)/6}%">${reward}</span><button id="toBattle" style="left:${(x+button[0]-60.24)/8}%;top:${(y+button[1]-18.6)/6}%" aria-label="开始战斗">开始战斗</button>`;
 map.append(layer);layer.querySelector('.level-dismiss').onclick=()=>layer.remove();$('toBattle').onclick=()=>{started=true;reset();selected=null;hideModal();};
}
function showPreparation(){showWorld();showLevelInfo();}
''' +s[b:];save('flow.js',s)
s=load('ui.js');s=s.replace("function unitIcon(type,owner=player){return 'unit-'+owner+'-'+TYPES[type].sprite;}","function unitIcon(type,owner=player,record=null){return UnitArt.image(record||UnitArt.recruit(owner,TYPES[type].sprite,owner===player?battle.bonuses:{}));}")
save('ui.js',s)
s=load('game.js');s=s.replace("Blue:'#68d4ef'","Blue:'#68d4ef',Gray:'#e8b677'")
a=s.index('function actionButton(');b=s.index('function updateUI()',a)
s=s[:a]+'''function actionButton(icon,title,detail,disabled,onClick,type=null){const b=document.createElement('button'),record=type&&UnitArt.recruit(player,TYPES[type].sprite,battle.bonuses),art=record?UnitArt.image(record):actionArt(title);if(record)title=UnitArt.label(record);b.dataset.originalArt=art;b.className='original-action';b.style.setProperty('--slot',$('actions').children.length);b.style.setProperty('--tile-art',`url('${UI_BASE}tile-${player}.png')`);b.title=title+(record?' ('+record.name+')':'')+' · '+detail;b.setAttribute('aria-label',title+' '+detail);const rank=selected?.type==='building'?battle.building(selected.id)?.level||1:1;b.innerHTML=`${uiTag(art)}${record&&rank>1?uiTag(rank===3?'star-gold':'star-silver'):''}<span>${title}</span><small>${detail.split(' ')[0]}</small>`;b.disabled=disabled;b.onclick=onClick;$('actions').append(b);}
''' +s[b:]
s=s.replace("result(error,'已招募');});", "result(error,'已招募');},key);")
s=s.replace("TYPES[u.type].name;kind=", "UnitArt.label(u.record);kind=")
s=s.replace("unitIcon(u.type,u.owner)","unitIcon(u.type,u.owner,u.record)")
s=s.replace("drawUI('build-site',s.x,s.y-14,32,38)","sprite(ctx,'BuildHereTopClass',s.x,s.y+4,1)")
a=s.index('function drawUnit(');b=s.index('function drawEffects()',a)
s=s[:a]+'''function drawUnit(u){if(u.avatar)sprite(ctx,'AvatarBackLightEffectClass',u.x,u.y+25,.7);const t=u.stats,chosen=unitIds.has(u.id),members=Math.max(1,Math.ceil(t.members*u.hp/u.maxHp)),formation=UnitRules.formation(members),heading=u.heading??Math.PI/2;if(chosen)ellipse(u.x,u.y+3,26,14,colors[u.owner],true);const action=u.state==='attack'?'Attack':'Go',key=UnitArt.prefix(u.record)+u.facing+'_'+action,meta=GAME_DATA.sprites[key];const frame=action==='Attack'?Math.min((meta?.frames||1)-1,(battle.time-(u.lastAttack||battle.time))/t.attackInterval*(meta?.frames||1)) : u.state==='move'?(u.walkDistance||0)/t.speed*(u.record.baseSpeedAnimWalk||11):0;for(let i=0;i<members;i++){const [dx,dy]=formation[i]||[0,0],x=u.x+dx*Math.cos(heading)-dy*Math.sin(heading),y=u.y+(dx*Math.sin(heading)+dy*Math.cos(heading))*.5;ellipse(x,y+1,6,3,'#15281344');sprite(ctx,key,x,y+2,u.avatar?1.5:1,frame);}drawBadge(u);}
''' +s[b:]
s=s.replace("else if(e.type==='damage')", "else if(e.type==='treasure'){sprite(ctx,'goldMessageClass',e.x,e.y+8,1,p*39);ctx.font='bold 15px Georgia';ctx.textAlign='center';ctx.fillStyle='#ffe36b';ctx.fillText('+500',e.x,e.y-30-p*25);}else if(e.type==='damage')")
s=s.replace("im.src=UI_BASE+name+'.png'", "im.src=UI_BASE+name+(name.includes('.')?'':'.png')")
a=s.index('function drawBadge(');b=s.index('let commandMarker',a)
s=s[:a]+'''function drawBadge(u){const p=badgePoint(u),health=Math.min(100,Math.max(1,101-Math.floor(100*u.hp/u.maxHp)));drawUI('badge-color-'+u.owner+'.svg',p.x,p.y,40,40);drawUI('badge-health-'+health+'.svg',p.x,p.y,40,40);drawUI('badge-rank-'+u.rank+'.svg',p.x,p.y,40,40);sprite(ctx,UnitArt.icon(u.record),p.x,p.y+12,1);if(u.rank>1)drawUI(u.rank===3?'star-gold':'star-silver',p.x+17,p.y-14,12,12);if(u.levelGlow>0)sprite(ctx,u.rank===3?'GoldStarIconClass':'SilverStarIconClass',p.x,p.y+5,1,u.anim*20);if(u.garrisonId&&(u.state==='repair'||u.state==='capture'))drawUI('repair',p.x+18,p.y+13,15,17);}

''' +s[b:]
s=s.replace("const slot=battle.slots.find", "const chest=battle.chests.find(c=>!c.collected&&Math.hypot(c.x-p.x,c.y-10-p.y)<24);if(chest)return{type:'chest',id:chest.id};const slot=battle.slots.find")
s=s.replace("h.type==='unit'?battle.unit(h.id):null", "h.type==='unit'?battle.unit(h.id):h.type==='chest'?battle.chest(h.id):null")
s=s.replace("if(!battle.walkable(Math.floor(point.x/10),Math.floor(point.y/10))&&!target)","if(!target&&(battle.data.roads?.edges.length?dist(point,battle.projectRoad(point))>24:!battle.walkable(Math.floor(point.x/10),Math.floor(point.y/10))))")
# First click selects, dragging the selected circle preserves the entire group.
s=s.replace("canvas.addEventListener('pointercancel',()=>drag=null);", "canvas.addEventListener('pointercancel',()=>drag=null);canvas.addEventListener('lostpointercapture',()=>drag=null);")
s=s.replace("if(h?.type==='building'&&battle.building(h.id).ruined", "if(h?.type==='chest'&&unitIds.size){order(mouse,h);drag=null;return;}if(h?.type==='building'&&battle.building(h.id).ruined")
# Add treasure into the same depth-sorted scene as the buildings and deployed squads.
s=s.replace("...battle.units.filter(u=>!u.garrisonId).map(u=>({y:u.y,draw:()=>drawUnit(u)}))", "...battle.chests.filter(c=>!c.collected).map(c=>({y:c.y,draw:()=>sprite(ctx,'ChestClass',c.x,c.y,1,battle.time*20)})),...battle.units.filter(u=>!u.garrisonId).map(u=>({y:u.y,draw:()=>drawUnit(u)}))")
save('game.js',s)
s=load('edicts-ui.js')
s=s.replace("function showEdicts(fromBattle=false)",'''function edictTransition(e){return e.levels.map(r=>UnitArt.transition(player,r)).filter(Boolean).map(({from,to})=>`<span class="edict-transition" title="${UnitArt.label(from)} → ${UnitArt.label(to)}"><span class="edict-unit-circle" style="background-image:url('${UI_BASE}badge-color-${player}.svg')">${uiTag(UnitArt.image(from),UnitArt.label(from))}</span><span class="edict-unit-arrow">→</span><span class="edict-unit-circle" style="background-image:url('${UI_BASE}badge-color-${player}.svg')">${uiTag(UnitArt.image(to),UnitArt.label(to))}</span></span>`).join('');}
function showEdicts(fromBattle=false)''')
s=s.replace('<span class="edict-caption">${e.title}</span>', '<span class="edict-caption" data-has-route="${!!edictTransition(e)}">${e.title}</span>${edictTransition(e)}')
save('edicts-ui.js',s)
# Empire units have their own exact routes; the source SWF only has three
# playable edict trees. Adapt the existing extension without inventing T3 art.
s=load('progression.js')
s=s.replace("if(color==='Purple')return [10,11,14,15,16,17,18].map(n=>EDICTS.find(e=>e.n===n));", "if(color==='Purple')return EDICTS.slice(9,18).map(e=>{if(e.n===13)return {...e,title:'暗影教团',levels:e.levels.map((r,i)=>i===0?{...r,id:4,value:1,hint:'Upgrades Undying Assassins to Shades'}:r)};if(e.n===18)return {...e,title:'黑暗骑士团',levels:e.levels.map((r,i)=>i===0?{...r,value:1,hint:'Upgrades Undying Horsemen to Dark Knights'}:r)};if(e.n===12)return {...e,title:'恐惧教团',levels:e.levels.map((r,i)=>i===0?{...r,hint:'Unlocks Terror'}:r)};return e;});")
save('progression.js',s)
print('Patched map attack popup, four banner entrances, record-based unit art, edict routes and native proficiency badges.')
