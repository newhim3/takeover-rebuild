const fs=require('fs');const rows=require('../assets/takeover/data/spells.json').spells;fs.writeFileSync('spell-data.js','(function(r){const data='+JSON.stringify(rows)+';if(typeof module!=="undefined")module.exports=data;else r.OriginalSpells=data;})(typeof window!=="undefined"?window:globalThis);');let s=fs.readFileSync('index.html','utf8').replace('<script src="engine.js">','<script src="spell-data.js"></script><script src="engine.js">');fs.writeFileSync('index.html',s);
s=fs.readFileSync('engine.js','utf8');s=s.replace('const BUILD=',"const OriginalSpells=typeof module!=='undefined'?require('./spell-data.js'):root.OriginalSpells;\nconst BUILD=");
let start=s.indexOf(' cast(type,p)'),end=s.indexOf(' castUltimate(p)',start);
s=s.slice(0,start)+` cast(type,p){const f=this.factions[this.player],spec=this.spellSpec(type);if(this.result||!spec)return '法术不可用';if(spec.locked)return '请先在条令中解锁此魔法';if(type==='ultimate')return this.castUltimate(p);if(this.spellCd[type]>0)return '法术冷却中';if(f.mana<spec.cost)return '魔力不足';if(p.x<0||p.x>800||p.y<0||p.y>600)return '请在战场内施法';
 const index={fire:0,heal:1,summon:2}[type],row=OriginalSpells[{Green:0,Red:4,Blue:8,Purple:12}[this.player]+index];
 if([5,13].includes(row.id)&&this.pop()>=this.cap())return '补给上限不足';
 f.mana-=spec.cost;this.spellCd[type]=0;const duration=row.time*(row.type===1?1+(this.bonuses[6]||0)/100:1);this.magicEffect(spec.fx,p,duration||2);
 if(row.type===1||row.id===4){this.zones??=[];this.zones.push({x:p.x,y:p.y,owner:this.player,row,left:duration});}
 for(const u of this.units){if(u.garrisonId||dist(u,p)>row.radius)continue;const ally=u.owner===this.player;
 if(row.id===0&&!ally)u.hp-=row.power*u.stats.members*(1+(this.bonuses[10]||0)/100);
 if(row.id===8&&!ally&&!u.protected)u.frozen=row.time+(this.bonuses[30]||0);
 if(row.id===9&&ally){u.enchanted=row.time;u.enchantReduction=row.power/100;}
 if(row.id===12&&!ally&&!u.protected){u.heroic=0;u.weakened=10;}
 }
 if([5,13].includes(row.id)){const type=row.id===13&&Math.random()<.5?'archers':'infantry',u=this.spawn({owner:this.player,x:p.x,y:p.y-45,level:1},type);if(row.id===5){u.record=Progress.unit('Red','Infantry',2);u.tech=2;u.unitName=u.record.name;u.stats=UnitRules.stats(u.record,type,1,this.bonuses);u.hp=u.maxHp=u.stats.hp;}}
 this.emit(spec.name);return null;}
`+s.slice(end);
s=s.replace('for(const u of this.units){if(u.hp<=0)continue;',`for(const z of this.zones||[]){const step=Math.min(dt,z.left);for(const u of this.units){if(u.hp<=0||u.garrisonId||dist(u,z)>z.row.radius)continue;const ally=u.owner===z.owner;if(z.row.id===4&&!ally)u.hp-=z.row.power*u.stats.members*step;if(!ally)continue;if([1,14].includes(z.row.id))u.hp=Math.min(u.maxHp,u.hp+z.row.power*u.stats.members*step);if(z.row.id===2)u.heroic=.5;if(z.row.id===6)u.bloodlust=.5;if(z.row.id===10){u.protected=.5;u.frozen=u.poison=u.weakened=0;}}z.left-=dt;}this.zones=(this.zones||[]).filter(z=>z.left>0);
  for(const u of this.units){if(u.hp<=0)continue;`);
s=s.replace("['heroic','weakened','frozen']","['heroic','weakened','frozen','enchanted','protected','bloodlust']");s=s.replace('t.damageMin+Math.floor(Math.random()*(t.damageMax-t.damageMin+1))',"(u.enchanted>0?t.damageMax:t.damageMin+Math.floor(Math.random()*(t.damageMax-t.damageMin+1)))+(u.bloodlust>0?4:0)");s=s.replace('target.hp-=damage;','if(target.enchanted>0)damage*=1-target.enchantReduction;target.hp-=damage;');s=s.replace("if(!target.stats?.abilities.PoisonImmunity", "if(!target.protected&&!target.stats?.abilities.PoisonImmunity").replace("if(u.type==='infantry'&&Math.random()", "if(!target.protected&&u.type==='infantry'&&Math.random()");fs.writeFileSync('engine.js',s);
