/* Original morale thresholds/art: implements/ok, vE/8W and media/SoundConst.
 * The web engine resolves attacks by squad. Its +50 gain uses the same
 * event granularity as the existing morale loss, not per-member callbacks.
 * No orders, recruitment, AI decisions or damage multipliers are changed.
 */
(function(root){'use strict';
const art={heroic:{key:'MST_HeroicModeClass',label:'英勇',sound:'sndUnitHeroic',delay:1},high:{key:'MST_HighMoraleClass',label:'士气高昂',delay:1},low:{key:'MST_LowMoraleClass',label:'士气低落',delay:1},fear:{key:'MST_FearModeClass',label:'恐惧',sound:'sndUnitFeared',delay:0},normal:{key:null,label:'士气平稳'}};
const pivots={MST_HighMoraleClass:[17.25,18.25],MST_HeroicModeClass:[33.95,32.9],MST_LowMoraleClass:[17.25,18.25],MST_FearModeClass:[31.85,27.8]};
function immune(u){return !!(u.stats?.abilities?.Undead||u.stats?.abilities?.Mechanism);}
function base(u){return u.moraleBase??Math.min(800,Math.max(200,Math.round((u.stats?.morale??u.record?.morale??50)*10)));}
function status(u){if(immune(u))return 'immune';if(u.heroic>0||u.moraleMode==='heroic')return 'heroic';if(u.weakened>0||u.moraleMode==='fear')return 'fear';const value=u.moraleValue??base(u);return value<350?'low':value>650?'high':'normal';}
function onAttack(u){if(immune(u)||u.hp<=0)return 0;const previous=u.moraleValue??base(u);u.moraleValue=Math.min(1000,previous+50);return u.moraleValue-previous;}
function describe(u){const mode=status(u);if(mode==='immune')return '不受士气影响';return art[mode].label+' '+Math.round(u.moraleValue??base(u))+'/1000'+(mode==='heroic'?' · 攻击提升':mode==='fear'?' · 攻击降低':'');}
function frame(mode,age,frames){const duration=frames/30,phase=Math.max(0,age)%(duration+(art[mode]?.delay||0));return Math.min(frames-1,Math.floor(phase*30));}
const api={art,pivots,keys:Object.values(art).flatMap(v=>v.key?[v.key]:[]),status,onAttack,describe,frame};
if(typeof module!=='undefined')module.exports=api;else root.MoraleRuntime=api;
})(typeof window!=='undefined'?window:globalThis);
