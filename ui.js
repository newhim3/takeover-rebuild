/* UI images are crops of the supplied sprite sheets, never generated artwork. */
const UI_BASE='assets/takeover/ui/';
// Keep recently visited native menu images decoded across scene changes.
// The budget prevents accumulating every campaign frame in memory.
const nativeMenuImages=new Map();let nativeMenuBytes=0;
function nativeUIAsset(name,priority='auto'){
 const asset=window.NativeUIScreenAssets?.[name];if(!asset)return UI_BASE+name;
 const url=UI_BASE+'atlases/screens/'+asset.file+'?v=20261006-r6',cached=nativeMenuImages.get(url);
 if(cached){if(priority!=='low')cached.image.fetchPriority=priority;nativeMenuImages.delete(url);nativeMenuImages.set(url,cached);return url;}
 const image=new Image(),entry={image,bytes:asset.width*asset.height*4};image.decoding='async';image.fetchPriority=priority;
 nativeMenuImages.set(url,entry);nativeMenuBytes+=entry.bytes;
 image.onload=()=>{if(image.decode)image.decode().catch(()=>{});};
 image.onerror=()=>{if(nativeMenuImages.get(url)===entry){nativeMenuImages.delete(url);nativeMenuBytes-=entry.bytes;}};
 image.src=url;
 while(nativeMenuImages.size>1&&(nativeMenuBytes>64*1024*1024||nativeMenuImages.size>96)){const first=nativeMenuImages.keys().next().value;nativeMenuBytes-=nativeMenuImages.get(first).bytes;nativeMenuImages.delete(first);}
 return url;
}
window.NativeMenuCache={stats:()=>({images:nativeMenuImages.size,estimatedDecodedMiB:Number((nativeMenuBytes/1024/1024).toFixed(1)),ready:[...nativeMenuImages.values()].filter(v=>v.image.complete&&v.image.naturalWidth).length})};
let nextMenuWarm=0;
function warmNextMenu(style,currentArt){
 const token=++nextMenuWarm;
 const names=style.includes('title-screen')?['results/background-Purple.svg','native-profile-background.svg']:style.includes('profile-screen')?['native-campaign-background.svg',...['Blue','Green','Red','Purple'].map(c=>'native-campaign-flag-'+c+'.svg')]:style.includes('native-campaign-screen')?[firstWorldArt(profile().lastFaction||'Green')]:[];
 if(!names.length)return;
 const image=currentArt?nativeMenuImages.get(nativeUIAsset(currentArt))?.image:null;
 const schedule=()=>setTimeout(()=>{if(token===nextMenuWarm)for(const name of names)nativeUIAsset(name,'low');},350);
 if(image&&!image.complete)image.addEventListener('load',schedule,{once:true});else schedule();
}
function firstWorldArt(country){return(country==='Purple'?'native-world-Purple':'native-world-'+({Green:1,Red:10,Blue:19}[country]||1))+'.svg';}
window.addEventListener('load',()=>{if('serviceWorker'in navigator&&window.isSecureContext)navigator.serviceWorker.register('delivery-worker.js').catch(error=>console.warn('资源缓存未启用',error));});
function uiTag(name,alt=''){return `<img class="original-icon" src="${UI_BASE+name}.png" alt="${alt}">`;}
function unitIcon(type,owner=player,record=null){return UnitArt.image(record||UnitArt.recruit(owner,TYPES[type].sprite,owner===player?battle.bonuses:{}));}
function actionArt(title){const unit=Object.entries(TYPES).find(([,t])=>t.name===title);if(unit)return unitIcon(unit[0]);const build=Object.entries(BUILD).find(([,t])=>t.name===title);if(build)return 'build-'+build[0];return {'拆除建筑':'demolish','升级':'upgrade','全军集结':unitIcon('infantry'),'原地驻守':'defend','返回城堡':'enter','选择主城':'enter','选择军队':unitIcon('infantry')}[title]||'menu';}
function applyOriginalButtons(root=document){root.querySelectorAll('button').forEach(b=>b.dataset.originalArt=b.dataset.originalArt||'button');}
