from pathlib import Path
def edit(name,old,new):
    p=Path(name);s=p.read_text(encoding='utf-8-sig')
    if old not in s:raise RuntimeError(name+' missing '+old[:80])
    p.write_text(s.replace(old,new),encoding='utf-8')
edit('engine.js',".length*2;}",".length;}")
edit('engine.js',"gold:1+tower+bases.reduce((v,b)=>v+(b.conquered?(b.type==='Castle'?2:1):0),0)","gold:Math.max(1,bases.filter(b=>b.type==='Castle').length)+tower+bases.reduce((v,b)=>v+(b.conquered?(b.type==='Castle'?1:1):0),0)")
edit('engine.js','this.addXP(u,damage*.2*(1+(bonus[37]||0)/100));',"if(!isBuilding)this.creditDamage(u,target,Math.min(Math.max(0,target.hp+damage),damage));")
edit('engine.js','t.damageMin+Math.floor(Math.random()*(t.damageMax-t.damageMin+1))','t.damageMin+Math.random()*(t.damageMax-t.damageMin)')
edit('engine.js','v.hp-=raw*hits;v.lastDamageOwner=u.owner;',"const dealt=Math.min(Math.max(0,v.hp),raw*hits);v.hp-=raw*hits;this.creditDamage(u,v,dealt);v.lastDamageOwner=u.owner;")
edit('engine.js'," addXP(u,amount)"," creditDamage(attacker,target,damage){if(attacker.neutral||damage<=0)return;target.damageContributors??={};target.damageContributors[attacker.id]=(target.damageContributors[attacker.id]||0)+damage;}\n awardDefeatedXP(target){if(target.neutral)return;const contributions=Object.entries(target.damageContributors||{}),total=contributions.reduce((n,[,v])=>n+v,0);if(!total)return;for(const [id,damage] of contributions){const u=this.unit(Number(id));if(u&&u.hp>0&&u.owner!==target.owner)this.addXP(u,50*damage/total*(1+(u.bonus?.[37]||0)/100));}}\n addXP(u,amount)")
edit('engine.js','u.rewarded=true;const killer=u.lastDamageOwner;','u.rewarded=true;this.awardDefeatedXP(u);const killer=u.lastDamageOwner;')
edit('engine.js','const rank=UnitRules.rankForXP(u.xp);','u.xp=Math.min(200,u.xp);const rank=UnitRules.rankForXP(u.xp);')
edit('engine.js',"if(this.multiplayer){const colors=['Green','Red','Blue','Purple'];this.winner=colors.find(c=>this.buildings.every(n=>n.owner===c&&(!n.ruined||n.captureOwner===c)))||null;if(this.winner)this.result='finished';}","if(this.multiplayer){const colors=Object.keys(this.factions).filter(c=>c!=='Gray'),alive=c=>this.buildings.some(n=>n.owner===c&&(!n.ruined||n.captureOwner===c))||this.units.some(u=>u.owner===c&&!u.neutral&&u.hp>0),survivors=colors.filter(alive);this.eliminated=colors.filter(c=>!alive(c));this.winner=survivors.length===1?survivors[0]:colors.find(c=>this.buildings.every(n=>n.owner===c&&(!n.ruined||n.captureOwner===c)))||null;const noHumans=this.matchHumanOwners?.length&&!this.matchHumanOwners.some(alive);if(this.winner||noHumans||!survivors.length){this.result='finished';this.endReason=this.winner?'winner':noHumans?'humans-eliminated':'draw';}}")
