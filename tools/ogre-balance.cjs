const {Battle}=require('../engine'),P=require('../progression'),R=require('../unit-rules');
const map={grid:Array(60).fill('1'.repeat(80)),roads:{points:[{x:100,y:300},{x:700,y:300}],edges:[[0,1]]},nodes:[{markerClass:'NodeCastleGreenClass',x:100,y:300,locationNum:0},{markerClass:'NodeCastleRedClass',x:700,y:300,locationNum:1}]};
function duel(name,{hp=400,min=8,max=12,interval=3,fixedFormation=false,seed=1,teams=1}={}){
 const b=new Battle(structuredClone(map));b.ai=()=>{};b.addXP=()=>{};const o=b.spawnOgre({x:400,y:300}),record=P.UNITS.find(r=>r.name===name);o.hp=o.maxHp=o.stats.hp=hp;o.stats.damageMin=min;o.stats.damageMax=max;o.stats.attackInterval=interval;
 const troops=[];for(let i=0;i<teams;i++){const u=b.spawn(b.owned()[0],'infantry');u.record=record;u.tech=record.techLevel;u.stats=R.stats(record,'infantry');u.maxHp=u.hp=u.stats.hp;b.deploy(u);u.x=373-i*48;u.y=300;b.issue(u,o,o.id);troops.push(u);}
 const random=Math.random,formation=R.formation;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};if(fixedFormation)R.formation=()=>formation(9);
 try{for(let t=0;t<180/.04&&o.hp>0&&troops.some(u=>u.hp>0);t++)b.update(.04);return{winner:o.hp>0?'ogre':'troop',ogreHP:Math.max(0,o.hp),troopHP:troops.reduce((v,u)=>v+Math.max(0,u.hp),0),fraction:troops.reduce((v,u)=>v+Math.max(0,u.hp),0)/troops.reduce((v,u)=>v+u.maxHp,0),time:b.time};}finally{Math.random=random;R.formation=formation;}
}
if(require.main===module)for(const name of ['Guards','Warriors','Rebels','Undying Warriors','Swordsmen','Legionaries'])for(const setup of [{},{hp:480,min:10,max:14},{hp:480,min:10,max:14,fixedFormation:true},{hp:450,min:10,max:14,interval:2.6,fixedFormation:true}]){const trials=Array.from({length:20},(_,i)=>duel(name,{...setup,seed:i+1}));console.log(name,JSON.stringify(setup),'wins',trials.filter(r=>r.winner==='troop').length,'survivor',Number((trials.reduce((v,r)=>v+r.fraction,0)/trials.length).toFixed(2)));}
module.exports={duel};
