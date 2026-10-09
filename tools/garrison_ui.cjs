const fs=require('fs');let html=fs.readFileSync('index.html','utf8');html=html.replace('<script src="flow.js">','<script src="ui.js"></script><script src="flow.js">');html=html.replace('<b>♜</b>','<img class="brand-art" src="assets/takeover/ui/crest.png" alt="">');html=html.replace('>?</button>',' aria-label="玩法说明">帮助</button>');html=html.replace('>Ⅱ</button>','>暂停</button>').replace('>⛶</button>','>全屏</button>').replace('>▶ 1×</button>','>1×</button>').replace('>☰ 菜单</button>','>菜单</button>').replace('⚑ 全选部队','全选城外部队');html=html.replace('<b>✦</b>','<img class="original-icon" src="assets/takeover/ui/spell-heal.png" alt="">').replace('<b>☄</b>','<img class="original-icon" src="assets/takeover/ui/spell-fire.png" alt="">').replace('<b>⚑</b>','<img class="original-icon" src="assets/takeover/ui/spell-summon.png" alt="">');html=html.replace('点击部队 → 点击地面移动 / 敌军攻击 · 拖框多选 · 右键下令','拖动城堡上方兵种圆圈出征 · 拖到己方城堡入驻修复 · 拖到废墟占领');fs.writeFileSync('index.html',html);
let s=fs.readFileSync('game.js','utf8');s=s.replace("function modal(html){$('overlay').innerHTML=`<div class=\"modal\">${html}</div>`;", "function modal(html){$('overlay').innerHTML=`<div class=\"modal\">${html}</div>`;applyOriginalButtons($('overlay'));");
s=s.replace("battle.units.filter(u=>u.owner===player).map", "battle.units.filter(u=>u.owner===player&&!u.garrisonId).map");
s=s.replace("toast('已停止行军，将在原地迎战敌军');", "toast('城外部队已停止行军；城内驻军继续修复');");
s=s.replace("b.innerHTML=`<b>${icon}</b><span>${title}</span><small>${detail}</small>`;", "b.dataset.originalArt=actionArt(title);b.className='original-action';b.style.setProperty('--tile-art',`url('${UI_BASE}tile-${player}.png')`);b.innerHTML=`${uiTag(actionArt(title))}<span>${title}</span><small>${detail}</small>`;");
s=s.replace("portrait='♜'", "portrait=uiTag('enter')");s=s.replace("portrait=s.type?({mine:'◆',farm:'♧',obelisk:'✦'}[s.type]):'＋';", "portrait=uiTag(s.type?'build-'+s.type:'build-site');");
s=s.replace("portrait={infantry:'⚔',archers:'➶',cavalry:'♞',siege:'♜'}[u.type];", "portrait=uiTag(unitIcon(u.type,u.owner));");
s=s.replace("u.state==='attack'?'正在交战':u.order?'正在行军':'待命'", "u.garrisonId?(u.state==='repair'?'城内驻军 · 正在修复城堡':u.state==='capture'?'城内驻军 · 正在占领':'城内驻军 · 拖动圆圈出征'):u.state==='attack'?'正在交战':u.order?'正在行军':'待命'");
s=s.replace("${b.type==='Castle'?5:2}`", "${b.type==='Castle'?5:2} · 驻军 ${battle.units.filter(u=>u.garrisonId===b.id).length}`");
s=s.replace("if(b&&!b.ruined&&b.owner===player){", "if(b&&!b.ruined&&b.owner===player){");
s=s.replace("'已加入训练队列'", "'训练完成后驻扎城内，从城上方兵种圆圈出征'");
s=s.replace("battle.command([...unitIds],{x:home.x,y:home.y+45});toast('部队返回己方城池');", "battle.command([...unitIds],home,home.id);toast('部队入城驻扎并修复建筑');");
s=s.replace("const items=[...battle.slots", "const items=[...battle.slots");s=s.replace("...battle.units.map(o=>({o,type:'unit'}))", "...battle.units.filter(u=>!u.garrisonId).map(o=>({o,type:'unit'}))");
s=s.replace("drawEffects();if(drag", "for(const u of battle.units.filter(u=>u.garrisonId))drawBadge(u);drawEffects();if(drag");
s=s.replace("ctx.fillStyle='#213a2b';ctx.beginPath();ctx.arc(u.x-26,u.y-40,10,0,7);ctx.fill();ctx.strokeStyle=colors[u.owner];ctx.stroke();ctx.fillStyle='#fff6cd';ctx.font='bold 11px Georgia';ctx.textAlign='center';ctx.fillText(members,u.x-26,u.y-36);", "drawBadge(u);");
s=s.replace("const badge=battle.units.find(u=>Math.hypot(u.x-26-p.x,u.y-40-p.y)<15);if(badge)return{type:'unit',id:badge.id,owner:badge.owner};", "const badge=battle.units.find(u=>dist(badgePoint(u),p)<19);if(badge){if(badge.owner!==player&&badge.garrisonId)return{type:'building',id:badge.garrisonId,owner:badge.owner};return{type:'unit',id:badge.id,owner:badge.owner};}");
s=s.replace("[...battle.units].sort((a,b)=>dist(a,p)", "battle.units.filter(u=>!u.garrisonId).sort((a,b)=>dist(a,p)");
s=s.replace("function order(p,h){if(!unitIds.size)return;", "function order(p,h,fromBadge=false){if(!unitIds.size)return;const ids=[...unitIds].filter(id=>fromBadge||!battle.unit(id)?.garrisonId);if(!ids.length){toast('请按住城堡上方的兵种圆圈，拖到目的地出征');return;}");
s=s.replace("battle.command([...unitIds],point,target?.id);", "battle.command(ids,point,target?.id);");
s=s.replace("target&&target.owner!==player?'进攻目标！':'部队开始行军'", "target&&target.owner!==player?'进攻目标！':target&&'queue' in target?'进入己方城堡驻扎修复':'部队开始行军'");
s=s.replace("drag={mode:'unit',start:mouse};", "drag={mode:'unit',start:mouse,fromGarrison:!!battle.unit(h.id)?.garrisonId};");
s=s.replace("if(drag.mode==='unit'&&moved)order(p,hit(p));", "if(drag.mode==='unit'&&moved)order(p,hit(p),true);");
s=s.replace("u.owner===player&&u.x>=Math.min", "u.owner===player&&!u.garrisonId&&u.x>=Math.min");
s=s.replace("$('pause').textContent='Ⅱ'", "$('pause').textContent='暂停'");s=s.replace("paused?'▶':'Ⅱ'", "paused?'继续':'暂停'");s=s.replace("'▶ '+speed+'×'", "speed+'×'").replace("'▶ 1×'", "'1×'");
s=s.replace("训练完成后，部队出现在城旁。", "训练完成后，部队驻扎在城内。拖动城堡上方带兵种图标的圆圈，才会出城执行命令。");
s=s.replace("也可拖动部队到目标。", "也可拖动部队圆圈到目标。拖到己方城堡可入城，驻军会修复城堡；拖到废墟则进入并完成占领。");
s=s.replace("'城堡负责招募，部队负责征战。'", "'训练完成驻扎城内，拖动兵种圆圈出征。'");
s=s.replace("'② 拖动士兵或头顶圆圈，进攻左侧敌方小镇'", "'② 拖动城堡上方的步兵圆圈，出城进攻左侧小镇'");
s=s.replace("'③ 小镇已占领！点击小镇，招募弓箭手'", "'③ 驻军正在修复小镇；点击小镇训练弓箭手'");
s=s.replace("'④ 集结军队攻打右上方主城，补充兵力，再占领废墟'", "'④ 拖动各城上方的兵种圆圈，出城攻打右上方主堡'");
s=s.replace("reset();showTitle();", "applyOriginalButtons();reset();showTitle();");
s+=`\nfunction uiBitmap(name){const key='ui:'+name;if(!images.has(key)){const im=new Image();im.src=UI_BASE+name+'.png';images.set(key,im);}return images.get(key);}
function drawUI(name,x,y,w,h){const im=uiBitmap(name);if(im.complete&&im.naturalWidth){const scale=Math.min(w/im.naturalWidth,h/im.naturalHeight);ctx.drawImage(im,x-im.naturalWidth*scale/2,y-im.naturalHeight*scale/2,im.naturalWidth*scale,im.naturalHeight*scale);}}
function badgePoint(u){if(!u.garrisonId)return{x:u.x-26,y:u.y-40};const b=battle.building(u.garrisonId),g=battle.units.filter(v=>v.garrisonId===b.id),index=g.findIndex(v=>v.id===u.id),columns=Math.min(5,g.length);return{x:b.x+(index%5-(columns-1)/2)*38,y:b.y-(b.ruined?48:b.type==='Castle'?105:78)-24-Math.floor(index/5)*40};}
function drawBadge(u){const p=badgePoint(u),chosen=unitIds.has(u.id);drawUI('circle-'+(chosen?'selected-':'')+u.owner,p.x,p.y,40,40);drawUI(unitIcon(u.type,u.owner),p.x,p.y,25,27);if(u.garrisonId&&(u.state==='repair'||u.state==='capture'))drawUI('repair',p.x+18,p.y+13,15,17);}
`;
fs.writeFileSync('game.js',s);
let flow=fs.readFileSync('flow.js','utf8');flow=flow.replaceAll('<div class="modal-crest">♜</div>','<div class="modal-crest"><img src="assets/takeover/ui/crest.png" alt=""></div>');flow=flow.replace("<b>${unlocked?m.roman:'🔒'}</b>","<b><img class=\"node-art\" src=\"assets/takeover/ui/level.png\" alt=\"\"><span>${m.roman}</span></b>");flow=flow.replace("'★'.repeat(p.stars[i]||1)","uiTag('star-gold').repeat(p.stars[i]||1)");flow=flow.replace("'★'.repeat(stars)+'☆'.repeat(3-stars):'⚔'", "uiTag('star-gold').repeat(stars)+uiTag('star-silver').repeat(3-stars):uiTag('attack')");flow=flow.replace('点击部队后下达指令。','拖动城堡上方兵种圆圈出征。');flow=flow.replace('训练两队步兵，进攻左侧小镇','训练两队步兵，拖动城上方圆圈出征，进攻左侧小镇');fs.writeFileSync('flow.js',flow);
