/* Campaign expansion on original maps. No new geometry or AI decisions. */
(function(root){'use strict';
const legacy={Green:[1,2,3,4,5,6,7,8],Red:[11,12,13,14,15,16,17,18],Blue:[21,22,23,24,25,26,27,28],Purple:[11,12,13,14,15,16,17,18]};
// Same land geometry with different original owners is one campaign map.
const families=[[1],[2],[3],[4,23],[5],[6,12],[7,17,24],[11],[13],[14,27],[15,26],[16,25],[21],[22],[99],[8,18,28]];
const orders={
 Green:[1,11,2,21,3,22,4,5,13,14,6,15,16,7,99,8],
 Red:[11,1,21,2,12,22,3,13,4,14,5,15,16,17,99,18],
 Blue:[21,1,11,2,22,3,12,23,5,13,24,25,26,27,99,28],
 Purple:[11,21,1,2,12,22,13,3,14,4,5,15,16,17,99,18]
};
const legacyRewards=[1000,1500,1750,2000,3000,4000,5000,7500],pageSize=8,version=1;
// A campaign balance adaptation, not another original map or a new AI policy.
// Only Blue's non-final map 27 has the severe single-town development bottleneck.
const oppositionSplit={country:'Blue',level:27,source:'Purple',rival:'Red',locations:[0,1],note:'本关势力调整：赤焰部落占据西侧城堡与西北城镇，与黑暗神国相互争夺领地。观察双方交战，寻找扩张的机会。'};
const expandedInfo={
 1:['西岸据点','从西岸的少量据点起步。先守住后方资源，再沿原道路逐步夺取城镇。'],
 2:['边境攻防','敌军控制边境据点。利用有限的道路组织攻防，避免后方城镇失守。'],
 3:['大陆桥头堡','据点之间的战线变长了。稳住前进基地，再集中兵力打开通往内陆的道路。'],
 4:['前线争夺','多方军队争夺同一片土地。观察交战方向，选择合适的时机夺取前线据点。'],
 5:['城防突破','敌方据点分布在多条进攻线上。保护己方补给，逐个突破防线。'],
 6:['沿岸征战','沿原道路控制据点与资源，防止敌军从侧翼夺走刚占领的土地。'],
 7:['中央村庄','中央村庄连接各方据点。争夺交通要地，同时守住后方的城堡与法师塔。'],
 11:['南境立足','从南方城镇建立前进基地。先积累经济和兵力，再争夺敌方城镇与城堡。'],
 13:['东境据点','多方军队已经占据东境。判断兵力与资源的价值，逐步扩大可防守的领土。'],
 14:['交错战线','原地图的多条战线交错相连。留意敌军调动，用支援和迂回保持战场主动权。'],
 15:['北境资源','食人魔与宝箱分布在资源区附近。控制资源据点，为后续攻势建立补给。'],
 16:['纵深攻防','城镇、城堡与魔法塔构成长战线。选择主攻方向，兼顾守军与后方经济。'],
 21:['北方门户','从北方据点出发，争夺周围的城镇。准备好后再进攻敌方主城。'],
 22:['北境拓展','更多据点与道路连接起北境。利用部队协同逐步推进，保护法师塔和资源。'],
 99:['四国会战','四国各据一方，原地图上的食人魔、宝箱和建筑位成为会战资源。守住后方，击败各方军队并统一全部据点。']
};
let catalog={};
function family(level){const group=families.find(ids=>ids.includes(level));return group?'land-'+group[0]:null;}
function roman(n){const values=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let out='';for(const [v,text]of values)while(n>=v){out+=text;n-=v;}return out;}
function apply(data,descriptions={}){
 const original=Object.fromEntries(Object.entries(descriptions).map(([country,rows])=>[country,rows.map(row=>({...row}))]));
 for(const map of data.levels){const native=map.nativePlayer||'Green';map.campaignPresetIndex=(legacy[native]||[]).indexOf(map.level);}
 catalog=Object.fromEntries(Object.entries(orders).map(([country,levels])=>[country,levels.map((level,index)=>{
  const map=data.levels.find(m=>m.level===level);if(!map)throw Error('缺少原地图 '+level);
  const ownIndex=legacy[country].indexOf(level),key=family(level),expanded=country==='Purple'||ownIndex<0;
  const info=!expanded?original[country]?.[ownIndex]:null,adapted=expandedInfo[Number(key.slice(5))]||['帝都决战','夺取帝都及周围据点，让本国的旗帜在这片土地上升起。'];
  const caption=info?.caption||(country==='Purple'?'亡灵征途 · ':'')+adapted[0];
  let intro=info?.intro||adapted[1];if(country===oppositionSplit.country&&level===oppositionSplit.level)intro+='\n'+oppositionSplit.note;
  return{index,level,key,roman:roman(index+1),caption,intro,expanded,nativePlayer:map.nativePlayer||'Green',sourceMission:map.campaignPresetIndex,reward:level===99?6000:legacyRewards[map.campaignPresetIndex]||2000};
 })]));
 data.campaigns=Object.fromEntries(Object.entries(orders).map(([c,levels])=>[c,[...levels]]));
 return catalog;
}
function missions(country){return catalog[country]||orders[country].map((level,index)=>({index,level,key:family(level),roman:roman(index+1)}));}
function mission(country,index){return missions(country)[index];}
function battleMap(data,country,index){
 const entry=mission(country,index),rule=oppositionSplit;
 if(country!==rule.country||entry?.level!==rule.level||data.level!==rule.level||index===missions(country).length-1)return data;
 const nodes=data.nodes.map(node=>rule.locations.includes(node.locationNum)&&/^Node(Castle|Town)PurpleClass$/.test(node.markerClass)?{...node,markerClass:node.markerClass.replace(rule.source,rule.rival)}:node);
 // Split the original enemy opening stock before both sides pay recruitment costs.
 return{...data,nodes,campaignOpeningPool:{source:rule.source,members:[rule.source,rule.rival]}};
}
function rewardTable(country){return missions(country).map(m=>m.reward);}
function migrateProgress(progress,country){
 const current=missions(country);
 if(progress.campaignCatalogVersion!==version){
  const keys=(progress.completed||[]).map(i=>family(legacy[country][i])).filter(Boolean),stars={};
  for(const [i,n]of Object.entries(progress.stars||{})){const key=family(legacy[country][Number(i)]);if(key)stars[key]=Math.max(stars[key]||0,Number(n)||0);}
  progress.completedMapKeys=[...new Set(keys)];progress.mapStars=stars;
 }else{
  progress.completedMapKeys??=(progress.completed||[]).map(i=>current[i]?.key).filter(Boolean);
  progress.mapStars??=Object.fromEntries(Object.entries(progress.stars||{}).filter(([i])=>current[Number(i)]).map(([i,n])=>[current[Number(i)].key,n]));
 }
 const complete=new Set(progress.completedMapKeys),stars=progress.mapStars;
 progress.completed=current.filter(m=>complete.has(m.key)).map(m=>m.index);
 progress.stars=Object.fromEntries(current.filter(m=>stars[m.key]).map(m=>[m.index,stars[m.key]]));
 progress.campaignCatalogVersion=version;return progress;
}
function complete(progress,country,index,stars){migrateProgress(progress,country);const m=mission(country,index);if(!m)return;if(!progress.completedMapKeys.includes(m.key))progress.completedMapKeys.push(m.key);progress.mapStars[m.key]=Math.max(progress.mapStars[m.key]||0,stars);migrateProgress(progress,country);}
function unlocked(progress,index){return index===0||progress.completed.includes(index)||progress.completed.includes(index-1);}
function worldFrame(progress,country){const done=new Set(progress.completedMapKeys),original=legacy[country].map(family);let open=original.findIndex(key=>!done.has(key));open=open<0?9:open+1;return({Green:0,Red:9,Blue:18,Purple:9})[country]+open;}
function pageEntries(country,page){return missions(country).slice(page*pageSize,(page+1)*pageSize).map((m,anchorIndex)=>({...m,anchorIndex}));}
const api={version,legacy,legacyRewards,families,orders,pageSize,length:16,family,roman,apply,missions,mission,battleMap,rewardTable,migrateProgress,complete,unlocked,worldFrame,pageEntries};
if(typeof module!=='undefined')module.exports=api;else{root.CampaignCatalog=api;apply(root.GAME_DATA,root.NativeLevelInfo);}
})(typeof window!=='undefined'?window:globalThis);
