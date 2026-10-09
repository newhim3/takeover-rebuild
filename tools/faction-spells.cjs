const fs=require('fs');let e=fs.readFileSync('engine.js','utf8');const at=e.indexOf('class Battle{');e=e.slice(0,at)+`const SPELLS={
 Green:[{name:'圣光裁决',cost:150,fx:'SpellThunderClass',mode:'damage'},{name:'治愈旗帜',cost:50,fx:'BannerAuraHealClass',mode:'heal'},{name:'英雄旗帜',cost:70,fx:'BannerAuraHeroismClass',mode:'buff'}],
 Red:[{name:'石虫召唤',cost:100,fx:'StoneWormsEffectClass',mode:'damage'},{name:'不朽军团',cost:250,fx:'RaiseDeadSpellEffectClass',mode:'summon'},{name:'嗜血旗帜',cost:50,fx:'BannerEffectBloodlustClass',mode:'buff'}],
 Blue:[{name:'冰霜冲击',cost:100,fx:'IceBlastExplosionClass',mode:'freeze'},{name:'寒冰附魔',cost:150,fx:'IceBlastEffectClass',mode:'buff'},{name:'解放旗帜',cost:50,fx:'BannerLiberationEffectClass',mode:'heal'}],
 Purple:[{name:'恐惧术',cost:100,fx:'TerrorSpellEffectClass',mode:'terror'},{name:'亡者复生',cost:250,fx:'RaiseDeadSpellEffectClass',mode:'summon'},{name:'亵渎旗帜',cost:75,fx:'BannerAuraDesecrationClass',mode:'heal'}]
};
const ULTIMATES={Green:{name:'神之降临',fx:'SignOfAdventEffectClass'},Red:{name:'天灾陨星',fx:'FireBallExplosionClass'},Blue:{name:'大转化术',fx:'GrandTransformationEffectClass'},Purple:{name:'墓穴召唤',fx:'RaiseDeadSpellEffectClass'}};
`+e.slice(at);
e=e.replace('spellCd:{heal:0,fire:0,summon:0}', 'ultimateCharge:0,ultimateDuration:120,spellCd:{heal:0,fire:0,summon:0}');
let a=e.indexOf(' cast(type,p){'),z=e.indexOf(' ai(){',a);e=e.slice(0,a)+` spellSpec(type){return type==='ultimate'?{...ULTIMATES[this.player],cost:0}:SPELLS[this.player][{fire:0,heal:1,summon:2}[type]];}
 magicEffect(fx,p,duration=1.8){this.effects.push({type:'magic',fx,x:p.x,y:p.y,t:duration,max:duration});}
 cast(type,p){const f=this.factions[this.player],spec=this.spellSpec(type);if(this.result||!spec)return '法术不可用';if(type==='ultimate')return this.castUltimate(p);if(this.spellCd[type]>0)return '法术冷却中';if(f.mana<spec.cost)return '魔力不足';if(p.x<0||p.x>800||p.y<0||p.y>600)return '请在战场内施法';f.mana-=spec.cost;this.spellCd[type]=spec.mode==='summon'?30:18;this.magicEffect(spec.fx,p,spec.mode==='damage'?2:3);
 for(const u of this.units){if(u.garrisonId||dist(u,p)>105)continue;const ally=u.owner===this.player;if(spec.mode==='damage'&&!ally)u.hp-=160;if(spec.mode==='heal'&&ally){u.hp=Math.min(u.maxHp,u.hp+170);u.frozen=0;u.weakened=0;}if(spec.mode==='buff'&&ally)u.heroic=12;if(spec.mode==='freeze'&&!ally)u.frozen=6;if(spec.mode==='terror'&&!ally)u.weakened=10;}
 if(spec.mode==='summon'){const u=this.spawn({owner:this.player,x:p.x,y:p.y-45,level:2},'infantry');u.damageScale*=1.5;}
 this.emit(spec.name);return null;}
 castUltimate(p){if(!this.owned().some(b=>b.type==='MageTower'))return '占领并修复魔法塔后开始蓄能';if(this.ultimateCharge<this.ultimateDuration)return '大招正在蓄能';this.ultimateCharge=0;const enemies=this.units.filter(u=>u.owner!==this.player&&u.hp>0);const spec=ULTIMATES[this.player];this.magicEffect(spec.fx,p,3);
 if(this.player==='Green'){const u=this.spawn({owner:this.player,x:p.x,y:p.y-45,level:3},'infantry');u.hp=u.maxHp=1500;u.damageScale=5;u.avatar=40;u.rank=3;}
 if(this.player==='Red'){for(const u of this.units){u.hp-=u.owner===this.player?60:420;this.magicEffect('FireBallExplosionClass',u,2);}for(const b of this.buildings)if(!b.ruined||b.captureOwner){b.hp-=b.owner===this.player?60:380;this.magicEffect('ExplosionClass',b,2);if(b.hp<=0)this.destroy(b);}}
 if(this.player==='Blue'){for(const u of enemies.sort(()=>Math.random()-.5).slice(0,Math.ceil(enemies.length/2))){this.magicEffect(spec.fx,u,3);u.hp=0;this.factions[this.player].gold+=20;this.factions[this.player].mana=Math.min(500,this.factions[this.player].mana+20);}}
 if(this.player==='Purple'){for(const u of enemies.slice(0,3)){if(u.garrisonId)this.deploy(u);u.owner=this.player;u.order=null;u.path=[];u.defendHome=null;this.magicEffect(spec.fx,u,3);}}
 this.emit(spec.name+'已释放');return null;}
`+e.slice(z);
e=e.replace("this.time+=dt;for(const k", "this.time+=dt;if(this.owned().some(b=>b.type==='MageTower'))this.ultimateCharge=Math.min(this.ultimateDuration,this.ultimateCharge+dt);else this.ultimateCharge=0;for(const k");e=e.replace('Math.min(200,f.mana','Math.min(500,f.mana');
e=e.replace('for(const u of this.units){if(u.hp<=0)continue;if(u.defendHome',"for(const u of this.units){if(u.hp<=0)continue;for(const key of ['heroic','weakened','frozen'])u[key]=Math.max(0,(u[key]||0)-dt);if(u.avatar){u.avatar-=dt;if(u.avatar<=0){u.hp=0;continue;}}if(u.frozen>0){u.state='idle';continue;}if(u.defendHome");
e=e.replace('const api={Battle,TYPES,BUILD,COLOR_NAMES,dist}','const api={Battle,TYPES,BUILD,COLOR_NAMES,dist,SPELLS,ULTIMATES}');fs.writeFileSync('engine.js',e);
