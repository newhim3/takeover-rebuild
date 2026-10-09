'use strict';
function edictDescription(row){if(player==='Purple'&&row.id===50)return '终极法术转化场上可转化敌军的一半（向下取整）';if(row.hint&&player==='Purple')return row.hint;const v=row.value,labels={7:`骑兵冲锋伤害 ${2+v/100} 倍`,5:'掌握治愈旗帜',6:`旗帜持续时间 +${v}%`,8:`开局金币 +${v}`,9:'掌握圣光裁决',10:`圣光伤害 +${v}%`,11:`城池生命 +${v}%`,12:`大招蓄能时间 ${v}%`,13:`远程及攻城伤害 +${v}%`,14:'掌握英雄旗帜',15:`基础士气 +${v}%`,16:`步兵生命 +${v}%`,17:'掌握嗜血旗帜',18:`对建筑伤害 +${v}%`,19:`全军行军速度 +${v}%`,20:'掌握石虫召唤',21:`额外石虫 +${v}`,22:`攻占据点获得 ${v} 金`,23:`步兵编制 +${v}`,24:`弓手附带 ${v}/秒毒伤`,25:'掌握不朽军团',26:`部队阵亡返还 ${v}% 大招蓄能`,27:`攻城车速度 +${v}%`,28:`亡灵军费 ${v}%`,29:'掌握冰霜冲击',30:`冻结持续时间 +${v} 秒`,31:`经济建筑价格 ${v}%`,32:`机械弓手暴击率 +${v}%`,33:`步兵攻击有 ${v}% 概率冻结敌人`,34:'掌握寒冰附魔',35:`魔法费用 ${v}%`,36:'掌握解放旗帜',37:`部队精锐经验 +${v}%`,38:`每座魔法塔金币/魔力 +${v}/秒`,39:`骑兵生命 +${v}%`,40:`巨型机械每秒恢复 ${v}% 生命`};if(row.id<5){if(!v)return '掌握本国基础兵种';const type=['Infantry','Cavalry','Archers','Siege','Magic'][row.id],u=Progression.unit(player,type,v+1);return `兵种进阶：${u?UnitArt.label(u):({Infantry:'步兵',Cavalry:'骑兵',Archers:'弓手',Siege:'攻城部队',Magic:'法师'})[type]}`;}return labels[row.id]||row.hint;}
function edictTransition(e){return e.levels.flatMap(r=>[r,...Object.entries(r.upgrades||{}).map(([id,value])=>({id:Number(id),value}))]).map(r=>UnitArt.transition(player,r)).filter(Boolean).map(({from,to})=>`<span class="edict-transition" title="${UnitArt.label(from)} → ${UnitArt.label(to)}"><span class="edict-unit-circle" style="background-image:url('${UI_BASE}badge-color-${player}.svg')">${uiTag(UnitArt.image(from),UnitArt.label(from))}</span><span class="edict-unit-arrow">→</span><span class="edict-unit-circle" style="background-image:url('${UI_BASE}badge-color-${player}.svg')">${uiTag(UnitArt.image(to),UnitArt.label(to))}</span></span>`).join('');}
function showEdicts(fromBattle=false,options=null){
 const before=paused;paused=true;
 // Original ThroneRoomScreen placements, ordered by mcIcon0…8.
 const places=[[428.05,76.85],[48.95,77.05],[427.3,181.6],[48.25,181.85],[427.3,285.85],[48.25,286.05],[427.25,388.95],[48.25,390.3],[50.15,493.9]],rowScale=.9231;
 const render=()=>{
  const p=options?{xp:0,edicts:options.edicts,completed:[]}:progress(),tree=Progression.tree(player),used=Object.values(p.edicts).reduce((a,b)=>a+b,0),state=CampaignXP.ensure(p),free=(options?options.limit:state.total)-used;
  const rows=tree.map((e,i)=>{
   const level=p.edicts[e.n]||0,locked=used<e.gate,side=i<8&&i%2===0?'right':'left',[x,y]=places[i];
   const description=e.levels.map(edictDescription).join('；'),title=`${e.title}：${description}${locked?'；需要已颁布 '+e.gate+' 点':''}`;
   return `<button class="edict-row" data-edict="${e.n}" data-side="${side}" data-locked="${locked}" style="left:${(x-40*rowScale)/8}%;top:${(y+10*rowScale)/6}%;--row-art:url('assets/takeover/ui/native-edict-row-${side}.svg')" ${level>=3||free<=0||locked||options?.readOnly?'disabled':''} title="${title}" aria-label="${e.title}，已升级 ${level}/3，花费 1 条令点"><img class="edict-icon" src="assets/takeover/ui/edict-${e.n}.png" alt=""><span class="edict-caption" data-has-route="${!!edictTransition(e)}">${e.title}</span>${edictTransition(e)}${[0,1,2].map(j=>`<span class="edict-tier" data-tier="${j}" data-owned="${j<level}">${j+1}</span>`).join('')}${[1,2].map(j=>`<span class="edict-benefit" data-level="${j}" data-owned="${j<level}">${edictDescription(e.levels[j])}</span>`).join('')}</button>`;
  }).join('');
  stage('edict-screen',`<div class="native-edicts" data-country="${player}" style="--edict-background:url('${nativeUIAsset('native-edicts-'+player+'.svg')}')"><h1>${player==='Purple'?'帝国条令':'王国条令'}</h1><div class="edict-counts">${used} 已颁布<br>${free} 可用</div><button id="edictsReset" title="返还已分配的条令点，保留经验和等级">重置</button>${rows}<button id="edictsBack">${options?'保存并返回':fromBattle?'返回战场':'返回地图'}</button><div class="edict-rank">${options?options.limit:state.rank}<small>${options?'条令限额':'等级'}</small></div><div class="edict-xp-fill" style="--xp:${options?used/options.limit:state.fraction}" role="progressbar" aria-label="升级经验进度" aria-valuenow="${state.current}" aria-valuemax="${state.needed||1}"></div><div class="edict-xp">${options?used+' / '+options.limit+' 条令点':state.needed?`${state.current} / ${state.needed} 经验`:'已达最高等级'}</div><div class="edict-free">${free}<small>条令点</small></div></div>`);
  document.querySelectorAll('.edict-row[data-edict]').forEach(button=>button.onclick=()=>{
   const e=tree.find(e=>e.n===Number(button.dataset.edict));if(free<=0||used<e.gate||(p.edicts[e.n]||0)>=3)return;
   p.edicts[e.n]=(p.edicts[e.n]||0)+1;if(!options)persist();render();
  });
  $('edictsReset').disabled=!!options?.readOnly;$('edictsReset').onclick=()=>{if(options)options.edicts={};else{p.edicts=Progression.initial(player);persist();}render();};
  $('edictsBack').onclick=()=>{if(options){options.onSave({...options.edicts});return;}if(fromBattle){paused=before;hideModal();}else showWorld();};
 };
 render();
}

