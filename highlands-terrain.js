/* B retains its painted roads/clearings. Captures use whole native ground art. */
(function(root){'use strict';
let ready=null;const files=['assets/takeover/maps/highlands-B.webp?v=20261006-r4','assets/takeover/maps/highlands-capture-mask.webp?v=20261006-r4',...['362','364','366','368'].map(id=>'assets/takeover/art/images/'+id+'.png')];
function tile(material){const c=document.createElement('canvas');c.width=360;c.height=300;const ctx=c.getContext('2d');for(let row=-1;row<3;row++)for(let col=-1;col<3;col++){const x=col*180+(row%2)*90,y=row*150;ctx.drawImage(material,x-40,y-30,320,280);}return c;}
function load(){if(ready)return ready;ready=Promise.all(files.map(src=>new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>resolve(im);im.onerror=()=>reject(Error('地形素材未加载：'+src));im.src=src;}))).then(([base,mask,...materials])=>{
 const {w,h,regions}=root.HighlandsRegions,world=document.createElement('canvas'),scratch=document.createElement('canvas');world.width=w;world.height=h;const ctx=world.getContext('2d'),brushes=materials.map(tile);let key='';
 function build(owners){const next=regions.map(r=>owners[r.location]??'-').join();if(key===next)return;ctx.clearRect(0,0,w,h);ctx.drawImage(base,0,0);for(const r of regions){const country=owners[r.location];if(country==null||country===r.source)continue;scratch.width=r.w;scratch.height=r.h;const c=scratch.getContext('2d');c.fillStyle=c.createPattern(brushes[country],'repeat');c.save();c.translate(-r.x,-r.y);c.fillRect(r.x,r.y,r.w,r.h);c.restore();c.globalCompositeOperation='destination-in';c.drawImage(mask,r.sx,r.sy,r.w,r.h,0,0,r.w,r.h);c.globalCompositeOperation='source-over';ctx.drawImage(scratch,r.x,r.y);}key=next;}
 root.NativeMaps??={};root.NativeMaps.highlands={draw(target,owners){build(owners);target.getContext('2d').drawImage(world,0,0);}};root.dispatchEvent(new Event('native-map-ready'));return true;
 }).catch(error=>{console.warn(error);ready=null;return false;});return ready;}
root.HighlandsTerrain={load};
})(window);
