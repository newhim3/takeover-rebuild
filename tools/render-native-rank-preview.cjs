/* Static original-art preview using the same rank coordinates and text as CSS/flow. */
const fs=require('fs'),path=require('path');
const sharp=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.join(__dirname,'..'),css=fs.readFileSync(path.join(root,'native-world.css'),'utf8');
function rules(selector){return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(m=>m[1].trim().endsWith(selector)).map(m=>m[2]).join(';');}
function prop(s,p){return Number([...s.matchAll(new RegExp('(?:^|;)\\s*'+p+':([\\d.]+)%','g'))].at(-1)[1]);}
(async()=>{
 const tiles=[];
 for(const [i,c]of ['Green','Red','Blue','Purple'].entries()){
  const s=rules('body .native-world[data-country] .world-rank')+';'+rules('body .native-world[data-country='+c+'] .world-rank');
  const x=800*(prop(s,'left')+prop(s,'width')/2)/100,y=600*(prop(s,'top')+prop(s,'height')/2)/100;
  const text=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="white" stroke="#171017" stroke-width="2" paint-order="stroke fill" font-family="Georgia" font-weight="bold" font-size="31">1</text></svg>`);
  const full=await sharp(path.join(root,'assets/takeover/ui/atlases/native-world-controls-'+c+'.webp')).resize(800,600).composite([{input:text}]).png().toBuffer();
  const input=await sharp(full).extract({left:390,top:480,width:410,height:120}).png().toBuffer();
  tiles.push({input,left:0,top:i*120});
  console.log(c+': '+x.toFixed(1)+', '+y.toFixed(1));
 }
 await sharp({create:{width:410,height:480,channels:4,background:'#3c3c3c'}}).composite(tiles).png().toFile(path.join(root,'reference/native-rank-centres-check.png'));
})().catch(e=>{console.error(e);process.exitCode=1;});
