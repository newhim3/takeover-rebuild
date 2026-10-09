/* Isolated visual fixture: original game renderer, no persisted progress. */
'use strict';
profiles=[freshProfile()];profileIndex=0;
const fixtureBar=document.createElement('div');fixtureBar.style.cssText='position:fixed;top:8px;left:8px;z-index:999;display:flex;gap:6px;flex-wrap:wrap';document.body.append(fixtureBar);
function fixture(color='Purple'){
 player=color;mission=0;progress().edicts=Object.fromEntries(Progression.tree(color).map(e=>[e.n,3]));reset();hideModal();started=true;paused=false;selected=null;unitIds.clear();battle.units=[];battle.ai=()=>{};
 const home=battle.owned()[0];home.type='MageTower';home.visualType='MageTower';battle.slots.filter(s=>s.parent===home.id).forEach(s=>s.type='farm');battle.factions[color].mana=75;battle.ultimateCharge=battle.ultimateDuration*.45;
 ['infantry','archers','magic'].forEach((type,i)=>{const u=battle.spawn(home,type);battle.deploy(u);const p=battle.nearest({x:home.x-80+i*65,y:home.y+55});u.x=p.x;u.y=p.y;u.state='idle';});
 // Freeze the fixture clock; all rendering and input use the real game code.
 battle.update=()=>{};terrainKey='';preload();uiSignature='';updateUI();draw();
}
function fixtureAction(label,action){const b=document.createElement('button');b.textContent=label;b.onclick=action;fixtureBar.append(b);}
fixtureAction('选中与冷却',()=>fixture());
for(const [color,label] of [['Green','绿国宣告'],['Red','红国宣告'],['Blue','蓝国宣告'],['Purple','黑暗宣告']])fixtureAction(label,()=>{fixture(color);battle.ultimateCharge=battle.ultimateDuration;battle.castUltimate({x:400,y:300});const e=battle.effects.find(e=>e.type==='declaration');e.t=e.max-.65;updateUI();draw();});
fixtureAction('沙虫素材',()=>{fixture('Red');battle.factions.Red.mana=500;battle.cast('fire',battle.buildings.find(n=>n.owner!=='Red'));const e=battle.effects.find(e=>e.fx==='StoneWormsEffectClass');e.t=e.max-.35;updateUI();draw();});
fixture();
