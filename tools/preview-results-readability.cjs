/* Static native result fixtures only: no game script, save writes or battle simulation. */
'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'reference/result-readability-r14');
global.Conquest=require(path.join(root,'engine.js'));
const Native=require(path.join(root,'results-ui.js')),XP=require(path.join(root,'campaign-xp.js')),Difficulty=require(path.join(root,'difficulty.js'));
function fixture(stars){
 const battle={player:'Green',factions:{Green:{},Red:{},Blue:{},Purple:{}},buildings:[{owner:'Green',ruined:false}]};
 const values={Green:{purchased:18,lost:5,seized:7,knLost:1,spells:12,gold:3428,mana:764},Red:{purchased:14,lost:14,seized:3,knLost:5,spells:8,gold:2149,mana:645},Blue:{purchased:16,lost:16,seized:4,knLost:5,spells:10,gold:2917,mana:723},Purple:{purchased:11,lost:11,seized:2,knLost:4,spells:7,gold:1870,mana:566}};
 for(const country of Object.keys(values))Object.assign(Native.record(battle,country),values[country]);
 const progress={completed:[],stars:{},xp:1800,edicts:{0:1,1:1,2:1,3:1},edictTotal:4},reward=XP.award(progress,0,true);
 return Native.render({battle,win:true,stars,reward,progress,difficulty:Difficulty.get('normal'),clock:'04:32'});
}
function html(stars,before){
 const styles=['style.css','original-ui.css','recruitment.css','native-hud.css','native-edicts.css','native-world.css'];
 return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${styles.map(css=>`<link rel="stylesheet" href="/${css}">`).join('')}<style>${fs.readFileSync(path.join(root,before?'.tools/r14-before/native-results.css':'native-results.css'),'utf8')}</style></head><body><main><section id="battlefield" class="battlefield"><div id="overlay" class="overlay result-screen native-result-screen"><div class="modal">${fixture(stars)}</div></div></section></main><script>for(const c of document.querySelectorAll('.native-result-cell')){c.querySelector('span').textContent=c.dataset.value;c.querySelector('i').style.clipPath='inset(0 '+(100-Number(c.dataset.ratio)*100)+'% 0 0)';}</script></body></html>`;
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/fixture'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}).end(html(Number(url.searchParams.get('stars'))||3,url.searchParams.get('before')==='1'));return;}
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep)||!(url.pathname.startsWith('/assets/')||/^\/[\w-]+\.css$/.test(url.pathname))){res.writeHead(404).end();return;}
  const types={'.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(data);});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let context;
 try{
  context=await chromium.launchPersistentContext(path.join(root,'.tools/r14-result-browser-profile'),{executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,viewport:{width:1200,height:900},serviceWorkers:'block',args:['--disable-gpu']});
  const page=context.pages()[0]||await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));const records=[];
  for(const before of [true,false])for(const stars of [3,1]){
   await page.goto(`http://127.0.0.1:${server.address().port}/fixture?stars=${stars}&before=${before?1:0}`,{waitUntil:'load'});
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
   const data=await page.evaluate(()=>{
    const selectors=['.native-result-rating strong','.native-result-playtime','.native-result-task','.native-result-progression','.native-result-xp-track span','.native-result-cell span','.native-result-bottom','.native-result-row','.native-result-cell'];
    return Object.fromEntries(selectors.map(selector=>{const element=document.querySelector(selector);if(!element)return[selector,null];const style=getComputedStyle(element),r=element.getBoundingClientRect();return[selector,{text:element.textContent,color:style.color,fontWeight:style.fontWeight,textShadow:style.textShadow,fontSize:style.fontSize,box:{x:r.x,y:r.y,width:r.width,height:r.height}}];}));
   });
   const name=(before?'before':'after')+'-'+stars+'star';await page.screenshot({path:path.join(out,name+'.png')});
   records.push({name,data});
  }
  assert.equal(errors.length,0,errors.join('\n'));
  for(let i=0;i<2;i++)for(const selector of Object.keys(records[i].data)){
   if(!records[i].data[selector])continue;
   const oldBox=records[i].data[selector].box,newBox=records[i+2].data[selector].box;
   if(selector==='.native-result-cell span'){
    // Bold digits are wider, but remain centred inside their unchanged native bar.
    assert(Math.abs(oldBox.x+oldBox.width/2-newBox.x-newBox.width/2)<.05);
    assert.equal(oldBox.y,newBox.y);assert.equal(oldBox.height,newBox.height);
   }else assert.deepEqual(oldBox,newBox,'approved layout must remain unchanged: '+selector);
  }
  fs.writeFileSync(path.join(out,'check.json'),JSON.stringify({scope:'Static native Green victory fixtures at one and three stars; no simulation, no save access.',errors,records},null,2));
  console.log('Static one/three-star result screenshots saved; all source images loaded; no JavaScript errors; original layout and native bars unchanged, bold digits remain centred.');
 }finally{await context?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
