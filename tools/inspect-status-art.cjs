/* Offline native status color/transition samples, not a campaign test. */
'use strict';
const fs=require('fs'),C=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'),S=require('../native-status-art.js'),N=require('../native-feedback.js');
const folder='reference/status-details-r16';fs.mkdirSync(folder,{recursive:true});const meta=Object.fromEntries(JSON.parse(fs.readFileSync('assets/takeover/animation/anim_manifest.json')).sheets.map(s=>[s.key,s])),pivots={...require('../unit-pivots.js'),...N.pivots},images=new Map(),cache=new S.FrameCache(()=>C.createCanvas(1,1),meta,{schedule:()=>{}});
const font='C:/Windows/Fonts/msyh.ttc';if(fs.existsSync(font))C.GlobalFonts.registerFromPath(font,'AuditChinese');
function page(w,h){const canvas=C.createCanvas(w,h),ctx=canvas.getContext('2d');ctx.fillStyle='#45513c';ctx.fillRect(0,0,w,h);ctx.font='15px AuditChinese';return{canvas,ctx};}
function text(c,s,x,y){c.fillStyle='#fff';c.fillText(s,x,y);}
async function draw(c,key,x,y,frame=0,tone=null){const m=meta[key],p=pivots[key]||[m.fw/2,m.fh];frame=Math.floor(frame)%m.frames;let im=images.get(key);if(!im){im=await C.loadImage('assets/takeover/animation/'+m.sheet);images.set(key,im);}let tinted;if(tone){tinted=cache.get(key,frame,im,tone);if(!tinted){cache.flush();tinted=cache.get(key,frame,im,tone);}}c.drawImage(tinted||im,tinted?0:frame%m.cols*m.fw,tinted?0:Math.floor(frame/m.cols)*m.fh,m.fw,m.fh,x-p[0],y-p[1],m.fw,m.fh);}
(async()=>{
 const p=page(900,680),keys=['GreenInfantryDown_Go','RedCavalryRight_Go','BlueArchers2Down_Go','PurpleInfantry2Down_Attack','GrayMagicLeft_Go'];text(p.ctx,'原色变换：中毒绿+150，冰冻/冰缓蓝+150 · 原帧原尺寸',15,25);
 for(const [row,key]of keys.entries()){const y=110+row*120;text(p.ctx,key,15,y-45);for(const [col,[tone,label]]of [[null,'原图'],['poison','中毒'],['frozen','冰冻 / 冰缓']].entries()){const x=190+col*270;await draw(p.ctx,key,x,y,0,tone);text(p.ctx,label,x-55,y+32);}}
 fs.writeFileSync(folder+'/member-colors.png',p.canvas.toBuffer('image/png'));
 const r=page(1080,240);text(r.ctx,'原拆除 / 废墟恢复过渡 · 注册点60.75,45.25 · 原34/30秒单次',15,25);for(let i=0;i<6;i++){const frame=1+Math.round(i*33/5),x=90+i*180;await draw(r.ctx,'BuildingRizeEffectClass',x,100,frame);text(r.ctx,'帧 '+frame,x-30,215);}fs.writeFileSync(folder+'/building-transition.png',r.canvas.toBuffer('image/png'));
 fs.writeFileSync(folder+'/check.json',JSON.stringify({scope:'Offline original color transforms and registered frames only',cache:cache.stats(),transition:{frames:[1,35],duration:34/30,pivot:N.pivots.BuildingRizeEffectClass}},null,2));console.log({pages:2,folder,cache:cache.stats()});
})().catch(e=>{console.error(e);process.exitCode=1;});
