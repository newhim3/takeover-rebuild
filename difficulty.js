/* Difficulty changes planning and paid development, not the original unit records. */
(function(root){
'use strict';
const modes={
 easy:{label:'休闲',techLead:-1,rankCap:1,initialCastle:1,pacing:[5,6,14,20],opening:10,decision:2,recruitEvery:4,recruitBurst:1,attackRatio:1.45,reinforcementRadius:120,minWave:1,upgradeAt:Infinity,three:300,two:520,summary:'敌军保守发展，技术落后一级，基础熟练度'},
 normal:{label:'普通',techLead:0,rankCap:3,initialCastle:1,pacing:[3,4,8,14],opening:10,decision:1,recruitEvery:2,recruitBurst:1,attackRatio:1.08,reinforcementRadius:220,minWave:2,upgradeAt:45,three:330,two:570,summary:'敌我遵守同等技术与经济规则，敌军集结、反击并付费升级'},
 hard:{label:'困难',techLead:0,rankCap:3,initialCastle:1,pacing:[2.5,3.5,7,12],opening:10,decision:1,recruitEvery:1.5,recruitBurst:2,attackRatio:1,reinforcementRadius:250,minWave:2,upgradeAt:35,three:420,two:720,summary:'敌军研究上位兵种，评估援军并乘虚夺城'},
 expert:{label:'精锐',techLead:0,rankCap:3,initialCastle:1,pacing:[2,3,6,10],opening:10,decision:.75,recruitEvery:1,recruitBurst:3,attackRatio:.98,reinforcementRadius:280,minWave:2,upgradeAt:30,three:510,two:840,summary:'敌军连续补兵，协同攻防，并升级城堡训练精锐'},
 nightmare:{label:'噩梦',techLead:0,rankCap:3,initialCastle:1,pacing:[2,3,5,9],opening:10,decision:.5,recruitEvery:.75,recruitBurst:8,attackRatio:.96,reinforcementRadius:320,minWave:3,upgradeAt:25,three:600,two:990,summary:'优先积兵争夺宝箱，持续补兵，成队出击并施法支援'}
};
// Decisions differ by tier; resource income and unit training still use the game rules.
const behavior={
 easy:{huntOgres:false,treasureBias:25,chestRatio:1.55,openingArmy:1,upgradeChance:0,lootUpgradeChance:0,counterWeight:.3,typeWeights:[7,4,1,.5,1]},
 normal:{huntOgres:true,treasureBias:55,chestRatio:1.35,openingArmy:1,upgradeChance:.4,lootUpgradeChance:.4,counterWeight:.7,typeWeights:[5,4,2,1,2]},
 hard:{huntOgres:true,treasureBias:135,chestRatio:1.28,openingArmy:2,upgradeChance:.6,lootUpgradeChance:.65,counterWeight:1,typeWeights:[5,4,3,2,3]},
 expert:{huntOgres:true,treasureBias:240,chestRatio:1.2,openingArmy:2,upgradeChance:.8,lootUpgradeChance:.85,counterWeight:1.25,typeWeights:[4,4,4,3,4]},
 nightmare:{huntOgres:true,treasureBias:350,chestRatio:1.15,openingArmy:3,armyFirst:true,upgradeChance:.55,lootUpgradeChance:.6,counterWeight:1.5,typeWeights:[6,5,3,2,4]}
};
for(const name of Object.keys(modes))Object.assign(modes[name],behavior[name]);
modes.normal.summary='正常收入与训练速度，建设经济建筑、集结进攻，按实际金币付费升级';
modes.hard.summary='同等起步，加强兵种搭配、乘虚夺城与反击';
modes.expert.summary='主动争夺宝箱，分队牵制、增益支援，偏向付费升堡';
modes.nightmare.summary='同等起步，快速补兵，分队突袭、协同推进并择机施法';
const tactics={easy:{tacticalLevel:0,spellEvery:5},normal:{tacticalLevel:1,spellEvery:2.5},hard:{tacticalLevel:2,spellEvery:1.5},expert:{tacticalLevel:3,spellEvery:1},nightmare:{tacticalLevel:4,spellEvery:.6}};
const openingResources={easy:[0,0],normal:[0,0],hard:[15,5],expert:[30,10],nightmare:[45,15]};
for(const name of Object.keys(modes))Object.assign(modes[name],tactics[name],{initialAIGold:openingResources[name][0],initialAIMana:openingResources[name][1]});
modes.hard.summary='略多开局资源，加强搭配、资源据点判断和援军预判';
modes.expert.summary='略多开局资源，争夺宝箱、协同突袭并评估敌军增援';
modes.nightmare.summary='略多开局资源，快速付费补兵、协同进攻与施法，提前评估援军';
function get(name){return modes[name]||modes.normal;}
function stars(seconds,name){const mode=get(name);return seconds<=mode.three?3:seconds<=mode.two?2:1;}
function enemyBonus(name,playerBonus,original={}){const mode=get(name),out={...original};for(let type=0;type<5;type++){const following=Math.max(0,(playerBonus[type]||0)+mode.techLead);out[type]=mode.techLead>0?Math.max(following,original[type]||0):following;}return out;}
const api={modes,get,stars,enemyBonus,order:Object.keys(modes)};if(typeof module!=='undefined')module.exports=api;else root.Difficulty=api;
})(typeof window!=='undefined'?window:globalThis);
