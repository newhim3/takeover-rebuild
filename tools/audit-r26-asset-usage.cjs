/* Read-only runtime asset reachability audit. This is not animation-playback coverage. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'delivery-manifest.json'),'utf8'));
const relative=p=>path.relative(root,p).replaceAll('\\','/');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.isFile()?[path.join(dir,e.name)]:[]);}
const files=walk(path.join(root,'assets')),all=new Set(files.map(relative)),rows=new Map();
const clean=p=>p.split(/[?#]/)[0].replaceAll('\\','/');
const rank={runtime:5,dynamic:4,fallback:3,source:2,index:1,unverified:0};
function mark(p,status,evidence){if(!all.has(p))p=clean(p);if(!all.has(p))return;let row=rows.get(p);if(!row){row={path:p,status,evidence:[]};rows.set(p,row);}if(rank[status]>rank[row.status])row.status=status;if(!row.evidence.includes(evidence))row.evidence.push(evidence);}
const sources=[...manifest.scripts,...manifest.styles,'index.html'];
const sourceText=Object.fromEntries(sources.map(p=>[p,fs.readFileSync(path.join(root,p),'utf8')]));
for(const [p,s]of Object.entries(sourceText)){if(p.startsWith('assets/'))continue;for(const m of s.matchAll(/assets\/[A-Za-z0-9_./-]+\.(?:svg|png|webp|jpg|jpeg|mp3|json|js|pack)/g))mark(m[0],'runtime','交付入口中的明确路径：'+p);}
const context={window:{}};
for(const p of ['game-data.js','assets/takeover/packs/manifest.js','assets/takeover/ui/atlases/screens/native-screen-assets.js','assets/takeover/ui/atlases/native-render-ui.js','assets/takeover/ui/atlases/native-feedback.js','assets/takeover/ui/ultimate/atlases/native-declarations.js','assets/takeover/ui/native-campaign-hover-assets.js','assets/takeover/ui/world-rating-readable.js'])vm.runInNewContext(sourceText[p],context,{filename:p});
const data=context.window.GAME_DATA,P=require('../progression.js'),Art=require('../unit-art.js'),UnitAnimation=require('../native-unit-animation.js'),Catalog=require('../campaign-catalog.js');
const ui='assets/takeover/ui/',anim='assets/takeover/animation/anim/',countries=['Green','Red','Blue','Purple'];
const screen=context.window.NativeUIScreenAssets||{},render=context.window.NativeRenderUI||{},packIndex=context.window.NativeAssetPackIndex||{};
const requests=new Set(),screensUsed=new Set(),spritesUsed=new Set();
function image(p,evidence){requests.add(p);if(packIndex[p]){mark(packIndex[p],'dynamic','AssetPacks 首选无损包；内容入口：'+p);mark(p,'fallback','AssetPacks.assign 下载、查表或图像解码失败后回退原文件：'+evidence);}else mark(p,'dynamic',evidence);}
function uiAsset(name,evidence='nativeUIAsset 按国家、等级或状态解析'){if(screen[name]){screensUsed.add(name);mark(ui+'atlases/screens/'+screen[name].file,'dynamic',evidence+'；静态图像缓存');mark(ui+name,'source','原 SVG 的静态 WebP 衍生缓存已在 NativeUIScreenAssets 配置；并非加载失败时自动回退');}else image(ui+name,evidence);}
function sprite(key,evidence='按动画符号解析'){if(!data.sprites[key])return;spritesUsed.add(key);image(anim+key+'.png',evidence);}
for(const p of manifest.scripts.filter(p=>p.startsWith('assets/')))mark(p,'runtime','delivery-manifest.json 明确脚本入口');
// Native static screen table is a list of candidates, not proof every entry is displayed.
for(const [name,m]of Object.entries(screen)){mark(ui+'atlases/screens/'+m.file,'unverified','静态缓存索引候选；须进一步对应页面调用');mark(ui+name,'source','pack-native-screen-assets.cjs 的原 SVG 构建输入');}
for(const [key]of Object.entries(render))mark(ui+(key.endsWith('.svg')?key:key+'.png'),'source','NativeRenderUI 已打入 native-render-ui.webp；可作构建源、不是渲染故障的自动回退');
for(const prefix of ['badge-health',...countries.map(c=>'building-health-'+c)])for(let n=1;n<=100;n++)mark(ui+prefix+'-'+n+'.svg','source','原血量帧已被 prepareHealthAtlas 读取对应 WebP 图集替代');
for(let n=1;n<=60;n++)mark(ui+'native-world-swords-'+n+'.svg','source','原交剑逐帧 SVG 已被 native-world-swords.webp 图集替代');
for(const c of countries){
 for(const name of ['native-campaign-flag-'+c+'.svg','native-edicts-'+c+'.svg','native-hud-back-'+c+'.svg'])uiAsset(name);
 for(const type of ['Castle','Town','Site'])for(const direction of ['left','right'])uiAsset('native-recruit-'+type+'-'+c+'-'+direction+'.svg','positionWorldOrders：国家、面板类型与左右方向');
 for(let n=1;n<=4;n++)uiAsset('native-level-info-'+c+(c==='Purple'?'-restored':'')+'-'+n+'.svg','showLevelInfo：原关卡弹窗国家与变体');
 image(ui+'tile-'+c+'.png','actionButton/positionWorldOrders 按玩家阵营');
 for(const kind of ['fire','heal','summon','ultimate'])image(ui+'spell-'+c+'-'+kind+'.png','updateSpellButton：当前阵营亮法术图标');
 uiAsset('results/emblem-'+c+'.svg','results-ui：四国统计行及玩家国徽');
 for(const type of ['Castle','Town','MageTower'])for(const suffix of ['',type==='MageTower'?'Razed':'Raze']){for(const action of ['Class','AnimClass'])sprite(type+c+suffix+action,'buildingArt/drawBuildingLayers：建筑、倒塌/废墟及默认动画');mark(anim+type+c+suffix+'Class.png','dynamic','updateUI/positionWorldOrders：建筑详情肖像直接读取原 PNG，不能仅因已有 pack 删除');}
 for(const type of ['Mine','Village','Obelisk'])for(const action of ['Class','AnimClass'])sprite(type+c+action,'drawSlot/drawBuildingLayers：现有经济、人口、法力建筑及默认动画');
 for(const e of P.tree(c))image(ui+'edict-'+e.n+'.png','Progression.tree/edicts-ui：真实国家条令树');
 mark(ui+'native-world-controls-'+c+'.svg','source','原国家地图底栏，正式页面使用对应 WebP');
 mark(ui+'native-world-node-'+c+'.svg','source','原地图城堡节点导出，正式页面使用对应 WebP');
 mark(ui+'native-world-node-'+c+'-ready.svg','source','原地图城堡明亮版，正式页面使用对应 WebP');
 image(ui+'atlases/native-world-controls-'+c+'.webp','showWorld：国家地图底栏');
 image(ui+'atlases/native-world-node-'+c+'.webp','worldNodeHTML：四国清晰城堡节点');
 image(ui+'atlases/building-health-'+c+'.webp','prepareHealthAtlas：建筑血量图集');
}
for(let n=1;n<=27;n++)uiAsset('native-world-'+n+'.svg','CampaignCatalog.worldFrame：三国原战役解锁状态');uiAsset('native-world-Purple.svg','黑暗战役的已注明适配背景，非缺失原版第四国战役还原');
for(const name of ['native-title-background.svg','native-profile-background.svg','native-campaign-background.svg','results/background-Purple.svg'])uiAsset(name,'stage/warmNextMenu：主流程原图');
for(let n=1;n<=100;n++)uiAsset('results/xp-'+n+'.svg','results-ui：实际经验比例的原帧');
for(let n=1;n<=3;n++){uiAsset('results/crown-'+n+'.svg','results-ui：战役评级');uiAsset('native-world-rating-'+n+'.svg','worldNodeHTML：通关评级备用首显');}
for(const kind of ['purchased','lost','magic','gold'])for(const n of [1,100])uiAsset('results/bar-'+kind+'-'+n+'.svg','results-ui：统计条首/满原帧裁切');
for(const names of ['button','menu','crest','defend','demolish','upgrade','upgrade-arrow','build-mine','build-farm','build-obelisk','build-site'])image(ui+names+'.png','uiTag/actionArt：原按钮、操作、建造图标');
for(const n of ['badge-health','native-world-swords','native-render-ui','native-feedback'])image(ui+'atlases/'+n+'.webp','正式图集渲染入口');
for(const [c,m]of Object.entries(context.window.NativeCampaignHoverAssets||{}))image(ui+m.file,'bindNativeCampaignHover：原 '+c+' 战役悬停帧');
for(const m of Object.values(context.window.NativeWorldRatingArt||{}))image(m.file,'bindReadableWorldRating：通关评级亮原图');
// Enumerate exact live unit art dispatch, including current four death directions and SpecialA.
const excludedUnitNames=new Set(['Wolves','Brigand Warriors','Brigand Archers']);
for(const r of P.UNITS){if(excludedUnitNames.has(r.name))continue;const u={record:r};for(const key of UnitAnimation.keys(u,data.sprites))sprite(key,'NativeUnitAnimation.keys/pose：四方向行走、攻击、死亡及有原注册点的 SpecialA');sprite(Art.icon(r),'UnitArt.icon：国家、兵种与科技等级的徽章图标');image(ui+Art.image(r)+'.png','UnitArt.image：招募与条令升级图标');}
// Follow symbols actually mentioned in gameplay source, rather than treating all GAME_DATA.sprites as used.
const gameplayText=manifest.scripts.filter(p=>!p.startsWith('assets/')&&p!=='game-data.js').map(p=>sourceText[p]).join('\n');
for(const key of Object.keys(data.sprites))if(gameplayText.includes("'"+key+"'")||gameplayText.includes('"'+key+'"'))sprite(key,'正式脚本按原符号调用（含法术、士气、命令、建筑特效）');
for(const [key]of Object.entries(context.window.NativeFeedbackArt||{}))if(key!=='shared'){mark(anim+key+'.png','source','正式技能指针/原弹体已打入 native-feedback.webp');}
for(const [key,m]of Object.entries(context.window.NativeDeclarationAtlas||{})){for(const file of m.pages)image(ui+'ultimate/atlases/'+file,'DeclarationArt：'+key+' 原终极法术宣告时间轴图集');for(const p of all)if(p.startsWith(ui+'ultimate/'+key+'/')||p.startsWith(ui+'ultimate/bitmaps/'))mark(p,'source','四国终极宣告原 SVG/位图构建源；正式播放 NativeDeclarationAtlas');}
// All currently selected campaign levels are reachable; maps contain their own dynamic native terrain frames.
const levels=new Set(Object.values(Catalog.orders).flat().map(String));levels.add('7');
for(const level of levels){const file='assets/takeover/maps/level-'+level+'.js';if(!all.has(file))continue;mark(file,'dynamic','CampaignCatalog/联机选择：原地图脚本');const s=fs.readFileSync(path.join(root,file),'utf8');for(const m of s.matchAll(/assets\/takeover\/[^"'\s]+\.(?:png|webp|pack)/g))image(clean(m[0]),'原地图 '+level+' 的图像依赖与四国归属地形帧');}
for(const id of [362,364,366,368])image('assets/takeover/art/images/'+id+'.png','HighlandsTerrain：B 候选大地图四国地形原纹理');
image('assets/takeover/maps/highlands-B.webp','HighlandsTerrain：已选 B 大地图底图');image('assets/takeover/maps/highlands-capture-mask.webp','HighlandsTerrain：国家归属地形遮罩');
// Audio dispatch is keyed dynamically by events/units/morale; include only names found in live scripts.
for(const p of all)if(p.startsWith('assets/takeover/audio/')&&p.endsWith('.mp3')){const key=path.basename(p,'.mp3');if(gameplayText.includes("'"+key+"'")||gameplayText.includes('"'+key+'"'))mark(p,'dynamic','NativeAudio：音乐、用户操作、战斗、死亡、宝箱或士气事件');}
// Any SVG genuinely retained in runtime may reference additional relative raster assets.
for(let changed=true;changed;){changed=false;for(const [p,row]of [...rows]){if(!p.endsWith('.svg')||!['runtime','dynamic','fallback'].includes(row.status))continue;const s=fs.readFileSync(path.join(root,p),'utf8');for(const m of s.matchAll(/(?:href|src)="([^"#][^"]*)"/g)){if(/^(?:data:|https?:)/.test(m[1]))continue;const target=relative(path.resolve(root,path.dirname(p),clean(m[1])));if(all.has(target)&&!rows.has(target)){mark(target,row.status,'已接入 SVG 的相对图像依赖：'+p);changed=true;}}}}
for(const p of all){if(rows.has(p))continue;
 if(p.startsWith('assets/takeover/art/sprites/'))mark(p,'source','原 SWF SVG 逐帧/符号源档；运行时使用整理后的动画、地形和 UI 衍生文件');
 else if(p.startsWith('assets/takeover/patched/'))mark(p,'source','历史修补或中间导出目录；正式入口未发现引用');
 else if(p.startsWith('assets/takeover/data/')||p.endsWith('manifest.json')||p.endsWith('symbols.csv'))mark(p,'index','原提取数据或构建索引；正式数值使用生成后的 game-data/progression 等');
 else if(p.startsWith(anim)&&/^Level\d+Class\.png$/.test(path.basename(p)))mark(p,'source','原地图单帧整屏导出烘焙默认归属；正式战场使用原地图脚本及国家地形帧');
 else if(p.startsWith(anim)&&/GraphMarkers|HitMask/.test(p))mark(p,'source','地图标记/碰撞提取参考，不应叠到正式战场');
 else mark(p,'unverified','未在明确路径、当前动态分派、素材依赖或备用路径确认；不能仅据此删除');
}
const outputRows=[...rows.values()].sort((a,b)=>a.path.localeCompare(b.path)).map(r=>({...r,bytes:fs.statSync(path.join(root,r.path)).size}));
const totals={},groups={};for(const row of outputRows){const group=row.path.split('/').slice(0,3).join('/');for(const [map,key]of [[totals,row.status],[groups,group]]){map[key]??={files:0,bytes:0};map[key].files++;map[key].bytes+=row.bytes;}}
const packContents=[];for(const p of all)if(p.endsWith('.pack')){const b=fs.readFileSync(path.join(root,p));if(b.toString('ascii',0,4)!=='TKP1')continue;const size=b.readUInt32LE(4),table=JSON.parse(b.toString('utf8',8,8+size));const keys=Object.keys(table);packContents.push({path:p,files:keys.length,bytes:b.length,originalBytes:keys.reduce((n,k)=>n+table[k].length,0),allOriginalsPresent:keys.every(k=>all.has(k)),reachableEntries:keys.filter(k=>requests.has(k)).length});}
const packageEntries=JSON.parse(fs.readFileSync(path.join(root,'dist/lan-package-manifest.json'),'utf8')).entries.filter(e=>e.file.startsWith('assets/')),packagePaths=new Set(packageEntries.map(e=>e.file));
const inventory={root,method:'fs.readdirSync withFileTypes; recursive directories; every regular file regardless of extension',scannedFiles:files.length,classifiedFiles:outputRows.length,manifestAssets:packageEntries.length,missing:packageEntries.filter(e=>!all.has(e.file)),extraneous:[...all].filter(p=>!packagePaths.has(p)),lengthMismatches:packageEntries.filter(e=>all.has(e.file)&&fs.statSync(path.join(root,e.file)).size!==e.bytes)};
if(inventory.classifiedFiles!==inventory.scannedFiles)throw Error('Some scanned asset paths were not classified');
const result={date:'2026-10-09',inventory,method:'delivery manifest + actual dynamic dispatch enumeration + native atlas/page/map/pack dependency traversal; static reachability only',limits:['未运行浏览器/战斗，不等于所有动画已实际播放','索引中的候选不自动计为已显示；未证实部分不能直接删除','原始导出、备用与图集在同一包并存，不能把文件数当独立内容'],totalFiles:outputRows.length,totalBytes:outputRows.reduce((n,r)=>n+r.bytes,0),statuses:totals,groups,reachableUnitOrEffectSymbols:spritesUsed.size,screenCandidateCount:Object.keys(screen).length,screenKeysResolved:screensUsed.size,campaignMapScripts:levels.size,packContents,rows:outputRows};
fs.mkdirSync(path.join(root,'.tools'),{recursive:true});fs.writeFileSync(path.join(root,'.tools/r26-asset-usage.json'),JSON.stringify(result,null,2)+'\n');
// Conservative publish list: retain every uncertain resource and every explicit
// fallback, including generic UI source fallbacks even when current tables exist.
const keep=new Set(outputRows.filter(r=>r.status!=='source').map(r=>r.path)),retainedSourceReasons=new Map();
function keepSource(file,reason){if(!all.has(file))return;keep.add(file);retainedSourceReasons.set(file,reason);}
for(const name of Object.keys(screen))keepSource(ui+name,'保留 nativeUIAsset 无缓存映射时的原 SVG 通用备用');
for(const key of Object.keys(render))keepSource(ui+(key.endsWith('.svg')?key:key+'.png'),'保留 drawUI 无图集条目时的原图通用备用');
const dependencyRetentions=[];
for(let changed=true;changed;){changed=false;for(const file of [...keep]){if(!/\.(?:svg|js|css)$/.test(file))continue;const text=fs.readFileSync(path.join(root,file),'utf8'),hrefs=[...text.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/g)].map(m=>m[1]);for(const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g))hrefs.push(m[1]);for(const m of text.matchAll(/assets\/takeover\/[^"'\s)<>]+\.(?:png|svg|webp|js|json|mp3|pack)(?:\?[^"'\s)<>]*)?/g))hrefs.push(m[0]);
 for(const href of hrefs){if(/^(?:data:|https?:|blob:|#)/.test(href))continue;const raw=href.startsWith('assets/')?href:relative(path.resolve(root,path.dirname(file),href)),candidate=all.has(raw)?raw:clean(raw);if(all.has(candidate)&&!keep.has(candidate)){keepSource(candidate,'保留文件的图像/脚本相对依赖：'+file);dependencyRetentions.push({file:candidate,requiredBy:file});changed=true;}}
}}
function backing(file){const name=path.basename(file),c=file.match(/native-world-(?:controls|node)-(Green|Red|Blue|Purple)/)?.[1];
 if(file.startsWith('assets/takeover/art/sprites/'))return{kind:'source-only-swf-export',runtimeResolvers:['animation-cache.js','assets/takeover/maps/level-7.js','ui.js'],note:'所有运行分派目录为 animation/anim、maps、art/images、ui；此原 SVG 导出目录只供提取/重建，不是运行备用'};
 if(file.startsWith('assets/takeover/patched/'))return{kind:'historical-intermediate',retainedExceptions:[...keep].filter(p=>p.startsWith('assets/takeover/patched/')),note:'保留全部当前路径及相对依赖；仅从发布列表排除其余历史输出'};
 const level=name.match(/^Level(\d+)Class\.png$/)?.[1];if(level)return{kind:'native-map-script',files:['assets/takeover/maps/level-'+level+'.js'],note:'动态四国地形在原地图脚本；该 PNG 为默认归属整屏导出'};
 if(/GraphMarkers|HitMask/.test(name))return{kind:'generated-map-data',files:['game-data.js','native-map-bounds.js','curved-roads.js'],note:'运行道路/位置/边界为生成数据，不读取原编辑标记图片'};
 if(file.startsWith(ui+'ultimate/'))return{kind:'declaration-atlas',files:Object.values(context.window.NativeDeclarationAtlas).flatMap(m=>m.pages.map(p=>ui+'ultimate/atlases/'+p)),metadata:ui+'ultimate/atlases/native-declarations.js',note:'DeclarationArt 正式播放图集；无读取原 SVG/bitmaps 的回退'};
 const health=name.match(/^(badge-health|building-health-(?:Green|Red|Blue|Purple))-\d+\.svg$/)?.[1];if(health)return{kind:'native-health-atlas',files:[ui+'atlases/'+health+'.webp'],note:'prepareHealthAtlas 无原逐帧 SVG 回退'};
 if(/^native-world-swords-\d+\.svg$/.test(name))return{kind:'native-hover-atlas',files:[ui+'atlases/native-world-swords.webp'],note:'animateLevelHover 只读取交剑 WebP 图集'};
 if(c)return{kind:'native-world-atlas',files:[ui+'atlases/native-world-'+(name.includes('controls')?'controls':'node')+'-'+c+'.webp'],note:'showWorld/worldNodeHTML 当前读取明确国家 WebP'};
 if(file.startsWith(anim)&&Object.hasOwn(context.window.NativeFeedbackArt,name.slice(0,-4)))return{kind:'native-feedback-atlas',files:[ui+'atlases/native-feedback.webp'],metadata:ui+'atlases/native-feedback.js',note:'drawNativeFeedback 只读取图集，未设置原 PNG 回退'};
 throw Error('Source candidate has no publish exclusion proof: '+file);
}
const excluded=outputRows.filter(r=>!keep.has(r.path)).map(r=>({file:r.path,bytes:r.bytes,reason:r.evidence[0],backing:backing(r.path)}));
for(const e of excluded)for(const file of e.backing.files||[])if(file.startsWith('assets/')&&!keep.has(file))throw Error('Excluded backing is not retained: '+file);
for(const row of outputRows)if(['runtime','dynamic','fallback','index','unverified'].includes(row.status)&&!keep.has(row.path))throw Error('Potential runtime asset was excluded: '+row.path);
for(const file of manifest.scripts.filter(file=>file.startsWith('assets/')))if(!keep.has(file))throw Error('Delivery build source removed: '+file);
const publish={date:'2026-10-09',build:fs.readFileSync(path.join(root,'index.html'),'utf8').match(/name="game-build" content="([^"]+)"/)?.[1],method:'Conservative source-only exclusion; uncertain files and all runtime/fallback/dependency assets retained; no filesystem deletions',keep:[...keep].sort(),excluded,retainedSourceReasons:[...retainedSourceReasons].map(([file,reason])=>({file,reason})),dependencyRetentions,counts:{totalFiles:outputRows.length,totalBytes:result.totalBytes,keepFiles:keep.size,keepBytes:outputRows.filter(r=>keep.has(r.path)).reduce((n,r)=>n+r.bytes,0),excludedFiles:excluded.length,excludedBytes:excluded.reduce((n,r)=>n+r.bytes,0),fallbackFilesRetained:outputRows.filter(r=>r.status==='fallback'&&keep.has(r.path)).length,unverifiedFilesRetained:outputRows.filter(r=>r.status==='unverified'&&keep.has(r.path)).length},checks:{noRuntimeExcluded:true,noFallbackExcluded:true,noUnverifiedExcluded:true,deliveryManifestAssetsRetained:true,backingAssetsRetained:true,retainedRelativeDependencies:true}};
fs.writeFileSync(path.join(root,'.tools/r26-publish-assets.json'),JSON.stringify(publish,null,2)+'\n');
console.log(JSON.stringify({...result,rows:undefined,packContents:{count:packContents.length,bytes:packContents.reduce((n,p)=>n+p.bytes,0),originalBytes:packContents.reduce((n,p)=>n+p.originalBytes,0),files:packContents.reduce((n,p)=>n+p.files,0)},publish:publish.counts},null,2));
