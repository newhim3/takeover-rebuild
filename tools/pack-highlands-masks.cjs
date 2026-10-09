/* Precompute capture masks, not artwork: keep B's actual roads and clearings. */
'use strict';
const fs=require('fs'),sharp=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),Arena=require('../multiplayer-map');
(async()=>{
 const map=Arena.create(null,[],{map:'highlands'}),sites=map.nodes.filter(n=>/Node(Castle|Town|MageTower)/.test(n.markerClass)),{data,info}=await sharp('assets/takeover/maps/highlands-B.png').ensureAlpha().raw().toBuffer({resolveWithObject:true}),w=info.width,h=info.height;
 const paths=Object.values(map.roads.paths).map(points=>'<path d="M'+points.map(p=>Array.isArray(p)?p.join(' '):p.x+' '+p.y).join(' L')+'"/>').join('');
 const clearings=sites.map(p=>`<ellipse cx="${p.x}" cy="${p.y}" rx="36" ry="27"/>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="white"/><g fill="none" stroke="black" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">${paths}</g><g fill="black">${clearings}</g></svg>`;
 const protection=await sharp(Buffer.from(svg)).removeAlpha().raw().toBuffer(),labels=new Uint8Array(w*h),ground=new Uint8Array(w*h),bounds=sites.map(()=>({x:w,y:h,right:0,bottom:0}));
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*w+x,r=data[i*4],g=data[i*4+1],b=data[i*4+2],max=Math.max(r,g,b),min=Math.min(r,g,b),road=r>185&&g>145&&b>65&&b<180&&r-g<65,green=g>r*1.03&&g>b*1.2,snow=min>190&&b>=r,ochre=r>150&&g>85&&r>g*1.25&&g>b*1.3,shale=r>75&&r<180&&Math.abs(r-g)<30&&Math.abs(g-b)<32;
  ground[i]=!road&&(green||snow||ochre||shale)&&max-min<150?protection[i*3]:0;
  const wx=x+22*Math.sin(y*.019)+11*Math.sin((x+y)*.033),wy=y+18*Math.sin(x*.017)-12*Math.cos((x-y)*.027);let best=Infinity,id=0;
  for(let n=0;n<sites.length;n++){const d=(wx-sites[n].x)**2+(wy-sites[n].y)**2;if(d<best){best=d;id=n;}}
  labels[i]=id;const bound=bounds[id];bound.x=Math.min(bound.x,x);bound.y=Math.min(bound.y,y);bound.right=Math.max(bound.right,x);bound.bottom=Math.max(bound.bottom,y);
 }
 const packed=[],regions=[];let ax=0,ay=0,rowHeight=0;const atlasWidth=2048;
 for(let id=0;id<sites.length;id++){
  const bound=bounds[id],x=Math.max(0,bound.x-24),y=Math.max(0,bound.y-24),rw=Math.min(w,bound.right+25)-x,rh=Math.min(h,bound.bottom+25)-y,raw=Buffer.alloc(rw*rh*4);
  for(let py=0;py<rh;py++)for(let px=0;px<rw;px++){const i=py*rw+px;raw[i*4]=raw[i*4+1]=raw[i*4+2]=255;raw[i*4+3]=labels[(y+py)*w+x+px]===id?255:0;}
  const blurred=await sharp(raw,{raw:{width:rw,height:rh,channels:4}}).blur(7).raw().toBuffer();
  for(let py=0;py<rh;py++)for(let px=0;px<rw;px++){const i=py*rw+px;blurred[i*4+3]=Math.round(blurred[i*4+3]*ground[(y+py)*w+x+px]/255);}
  if(ax+rw>atlasWidth){ax=0;ay+=rowHeight;rowHeight=0;}packed.push({input:await sharp(blurred,{raw:{width:rw,height:rh,channels:4}}).png().toBuffer(),left:ax,top:ay});regions.push({location:sites[id].locationNum,x,y,w:rw,h:rh,sx:ax,sy:ay,source:sites[id].y<h*.42?(sites[id].x<w*.53?3:2):(sites[id].x<w*.47?1:0)});ax+=rw;rowHeight=Math.max(rowHeight,rh);
 }
 await sharp({create:{width:atlasWidth,height:ay+rowHeight,channels:4,background:'#0000'}}).composite(packed).webp({lossless:true}).toFile('assets/takeover/maps/highlands-capture-mask.webp');
 await sharp('assets/takeover/maps/highlands-B.png').webp({lossless:true}).toFile('assets/takeover/maps/highlands-B.webp');
 fs.writeFileSync('assets/takeover/maps/highlands-regions.js','window.HighlandsRegions='+JSON.stringify({w,h,regions})+';\n');
 console.log('Prepared '+regions.length+' organic capture masks; native roads and building clearings protected.');
})().catch(e=>{console.error(e);process.exitCode=1;});
