const fs=require('fs');let g=fs.readFileSync('game.js','utf8');g=g.replace("const images=new Map()","const inWorldOrders=document.querySelector('.orders');inWorldOrders.classList.add('in-world-orders');$('battlefield').append(inWorldOrders);const inWorldSpells=document.querySelector('.spells');inWorldSpells.classList.add('in-world-spells');$('battlefield').append(inWorldSpells);\nconst images=new Map()");g=g.replace("function updateUI(){const f=","function updateUI(){positionWorldOrders();const f=");g+=`\nfunction positionWorldOrders(){
 const target=selected?.type==='building'?battle.building(selected.id):selected?.type==='slot'?battle.slots.find(s=>s.id===selected.id):null;
 const owner=selected?.type==='slot'&&target?battle.building(target.parent).owner:target?.owner;
 const shown=!!target&&owner===player&&!target.ruined&&active();inWorldOrders.classList.toggle('hidden',!shown);if(!shown)return;
 const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/1000,r.height/660),ox=(r.width-1000*scale)/2,oy=(r.height-660*scale)/2;
 const x=ox+(target.x+100)*scale,y=oy+(target.y+10)*scale;
 inWorldOrders.style.left=Math.max(8,Math.min(r.width-272,x-130))+'px';inWorldOrders.style.top=Math.max(70,Math.min(r.height-155,y+25))+'px';
}
window.addEventListener('resize',()=>{if(battle)positionWorldOrders();});
`;
fs.writeFileSync('game.js',g);
