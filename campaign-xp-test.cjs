const assert=require('node:assert/strict'),XP=require('./campaign-xp');
const fresh=()=>({completed:[],edicts:{1:1,2:1}});
let c=fresh();assert.equal(XP.ensure(c).total,2);assert.equal(XP.status(999).rank,1);
let reward=XP.award(c,0,true);assert.equal(c.xp,1000);assert.equal(reward.after.rank,2);assert.equal(reward.points,2);assert.equal(reward.after.needed,1200);
reward=XP.award(c,0,true);assert.equal(c.xp,2000);assert.equal(reward.points,0,'Replay gives experience, not unconditional edict points');
reward=XP.award(c,0,false);assert.equal(c.xp,2200);assert.equal(reward.after.rank,3);assert.equal(reward.points,2,'Defeat gives one fifth XP and can cross a rank threshold');
for(let i=0;i<8;i++){const p=fresh();assert.equal(XP.award(p,i,true).xp,[1000,1500,1750,2000,3000,4000,5000,7500][i]);}
c=fresh();c.xp=84000;reward=XP.award(c,7,true);assert.equal(c.xp,85800);assert.equal(reward.after.rank,14);assert.equal(reward.after.total,27);assert.equal(XP.award(c,7,true).points,0);
c={completed:[0,1],edictTotal:12,edicts:{1:1,2:3,3:1,4:1}};const migrated=XP.ensure(c);assert.equal(migrated.total,12);assert.equal(migrated.xp,9000);assert.equal(migrated.total-Object.values(c.edicts).reduce((a,b)=>a+b,0),6,'Preserve allocated and banked points in old saves');
const other=fresh();assert.equal(XP.ensure(other).xp,0,'Campaign progression stays independent');
console.log('PASS: original XP rewards/thresholds, replay and defeat, rank-earned edict points, rank cap, legacy save migration, separate campaigns');
