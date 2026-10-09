/* Original XPConverter and CompanyProgress rules; XP is per campaign. */
(function(root){
 const thresholds=[1000,2200,3800,6000,9000,13000,18200,24800,33000,43000,55000,69200,85800];
 const rewards=[1000,1500,1750,2000,3000,4000,5000,7500],maxXP=85800;
 function status(xp=0){xp=Math.max(0,Math.min(maxXP,Math.floor(Number(xp)||0)));const rank=1+thresholds.filter(n=>xp>=n).length,base=rank===1?0:thresholds[rank-2],next=thresholds[rank-1],current=next===undefined?0:xp-base,needed=next===undefined?0:next-base;return{xp,rank,current,needed,total:Math.min(27,2+(rank-1)*2),fraction:needed?current/needed:1};}
 function ensure(c,rewardTable=rewards){
  if(c.xp===undefined){
   const earned=(c.completed||[]).reduce((n,i)=>n+(rewardTable[i]||0),0),used=Object.values(c.edicts||{}).reduce((n,v)=>n+v,0),legacy=Math.max(2,c.edictTotal||0,used),rank=Math.min(14,1+Math.ceil((legacy-2)/2));
   c.xp=Math.max(earned,rank===1?0:thresholds[rank-2]);
  }
  const s=status(c.xp);c.xp=s.xp;c.edictTotal=s.total;return s;
 }
 function award(c,mission,win,reward=rewards[mission]||0){const before=ensure(c),xp=Math.round(reward/(win?1:5));c.xp=Math.min(maxXP,c.xp+xp);const after=ensure(c);return{xp,levels:after.rank-before.rank,points:after.total-before.total,before,after};}
 const api={thresholds,rewards,maxXP,status,ensure,award};if(typeof module!=='undefined')module.exports=api;else root.CampaignXP=api;
})(typeof window!=='undefined'?window:globalThis);
