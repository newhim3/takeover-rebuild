/* Offline registration/timeline samples only. No battle or AI simulation. */
'use strict';
const fs=require('fs'),C=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'),sharp=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),N=require('../native-feedback.js'),M=require('../morale-runtime.js');
const folder='reference/native-details-r15';fs.mkdirSync(folder,{recursive:true});
const meta=Object.fromEntries(JSON.parse(fs.readFileSync('assets/takeover/animation/anim_manifest.json')).sheets.map(s=>[s.key,s])),pivots={...require('../unit-pivots.js'),...require('../spell-pivots.js'),...N.pivots,...M.pivots},images=new Map();
const font='C:/Windows/Fonts/msyh.ttc';if(fs.existsSync(font))C.GlobalFonts.registerFromPath(font,'AuditChinese');
function page(w,h){const canvas=C.createCanvas(w,h),ctx=canvas.getContext('2d');ctx.fillStyle='#45513c';ctx.fillRect(0,0,w,h);ctx.font='15px AuditChinese';return{canvas,ctx};}
function label(c,s,x,y){c.fillStyle='#fff';c.fillText(s,x,y);}
async function image(file){if(!images.has(file))images.set(file,await C.loadImage(file.endsWith('.svg')?await sharp(Buffer.from(fs.readFileSync(file,'utf8').replace(/<\?xml[^>]*\?>/,''))).resize(40,40).png().toBuffer():file));return images.get(file);}
async function sprite(c,key,x,y,frame){const m=meta[key],p=pivots[key]||[m.fw/2,m.fh],im=await image('assets/takeover/animation/'+m.sheet);frame=Math.max(0,Math.min(m.frames-1,Math.floor(frame)));c.drawImage(im,frame%m.cols*m.fw,Math.floor(frame/m.cols)*m.fh,m.fw,m.fh,x-p[0],y-p[1],m.fw,m.fh);}
async function ui(c,key,x,y){const im=await image('assets/takeover/ui/'+key+'.svg');c.drawImage(im,x-20,y-20,40,40);}
(async()=>{
 const p=page(1000,480),modes=Object.keys(N.actions),colors=['Green','Red','Blue','Purple','Green'],names=['行军','近战反击','远程反击','城内驻防','城内修理'];
 label(p.ctx,'原动作提示注册点核对 · 原尺寸 · 静态取帧，不代表实玩结果',15,25);
 for(let row=0;row<3;row++)for(let col=0;col<5;col++){
  const x=100+col*200,y=115+row*140,age=[0,.35,1.2][row],mode=modes[col],key=N.actions[mode].key,color=colors[col];
  label(p.ctx,names[col]+' · '+age.toFixed(2)+'秒',x-65,y-58);
  await ui(p.ctx,'badge-color-'+color,x,y);await ui(p.ctx,'badge-health-1',x,y);await ui(p.ctx,'badge-rank-1',x,y);
  await sprite(p.ctx,'IconT1_'+({Green:'W',Red:'K',Blue:'B',Purple:'E'}[color])+'_InfantryClass',x,y+12,0);
  await sprite(p.ctx,key,x,y,N.actionFrame(mode,age,meta[key].frames));
  if(row===1)await sprite(p.ctx,'MST_HighMoraleClass',x,y,M.frame('high',age,meta.MST_HighMoraleClass.frames));
  if(row===2)await sprite(p.ctx,'MST_FearModeClass',x,y,M.frame('fear',age,meta.MST_FearModeClass.frames));
  await sprite(p.ctx,color+'InfantryDown_Go',x,y+60,0);
 }
 fs.writeFileSync(folder+'/actions.png',p.canvas.toBuffer('image/png'));
 const e=page(1080,360);label(e.ctx,'原攻城溅射爆炸 · 完整18帧的六个采样 · 地面弹坑7秒',15,25);
 for(let i=0;i<6;i++){const x=90+i*180,y=230,f=Math.round(i*17/5);await sprite(e.ctx,'CraterFromExplosionClass',x,y,0);await sprite(e.ctx,'ExplosionClass',x,y,f);label(e.ctx,'帧 '+f+' · '+(f/30).toFixed(2)+'秒',x-65,y+83);}
 fs.writeFileSync(folder+'/siege-impact.png',e.canvas.toBuffer('image/png'));
 const a=page(1000,350);label(a.ctx,'原代码箭身颜色、抛物线和实际方向 · 六个飞行采样',15,25);
 for(const [row,[x,tx]]of [[100,900],[900,100]].entries()){const event={x,y:150+row*145,tx,ty:150+row*145,max:.28};for(let i=0;i<6;i++)N.drawArrow(a.ctx,event,.08+i*.16);label(a.ctx,row?'向左射击':'向右射击',15,70+row*145);}
 fs.writeFileSync(folder+'/arrows.png',a.canvas.toBuffer('image/png'));
 fs.writeFileSync(folder+'/check.json',JSON.stringify({scope:'Offline native sizes, pivot composition and timeline samples only; no gameplay or AI verification',actions:modes,actionPivots:N.pivots,explosionFrames:meta.ExplosionClass.frames,arrowDirectionSamples:2},null,2));console.log({pages:3,folder,scope:'offline native art only'});
})().catch(e=>{console.error(e);process.exitCode=1;});
