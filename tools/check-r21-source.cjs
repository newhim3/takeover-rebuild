'use strict';
// Source protection and resource availability only, no game loop.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name)),hash=name=>crypto.createHash('sha256').update(read(name)).digest('hex');
const before=JSON.parse(read('.tools/r20-source-check.json')),manifest=JSON.parse(read('delivery-manifest.json'));
for(const [name,expected]of Object.entries({...before.protected,...before.aiUnchanged}))assert.equal(hash(name),expected,name+' retains approved decisions and rules');
for(const name of ['game-data.js','mission-info.js','world-layout.js','ui.js'])assert(read(name).equals(read('.tools/r21-before/'+name)),name+' retains original source data');
for(const name of ['native-results.css','original-ui.css','native-hud.css','multiplayer.css','animation-cache.js','native-unit-animation.js'])assert.equal(hash(name),before.unchangedPresentationHashes[name],name+' unchanged');
for(const name of ['multiplayer-client.js','multiplayer-server.cjs','native-feedback.js','paused-order-feedback.js','terrain-cache.js'])assert.equal(hash(name),before.sourceHashes[name],name+' retains r20 fixes');
const normalized=value=>value.toString().replace(/\r\n/g,'\n');
assert(normalized(read('engine.js'))===normalized(read('.tools/r21-before/engine.js')).replace('NativeAI[native]?.[mission]','NativeAI[native]?.[data.campaignPresetIndex??mission]'),'only the existing native preset lookup follows the reordered source map');
function section(source,name,next){source=normalized(source);const a=source.indexOf('function '+name+'('),z=source.indexOf('\n'+next.trim(),a);assert(a>=0&&z>a);return source.slice(a,z).trim();}
const flow=read('flow.js').toString(),prior=read('.tools/r21-before/flow.js').toString();
assert.equal(section(flow,'bindNativeCampaignHover','let nativeSwordLoad'),section(prior,'bindNativeCampaignHover','let nativeSwordLoad'),'approved faction hover preserved');
assert.equal(section(flow,'animateLevelHover','\r\nconst campaignPages').trim(),section(prior,'animateLevelHover','\r\nfunction showWorld').trim(),'original sword animation preserved');
for(const name of manifest.scripts)new vm.Script(read(name).toString(),{filename:name});
assert(manifest.scripts.indexOf('campaign-catalog.js')>manifest.scripts.indexOf('mission-info.js'));
assert(manifest.scripts.indexOf('campaign-catalog.js')<manifest.scripts.indexOf('engine.js'));
assert(manifest.scripts.indexOf('assets/takeover/ui/world-rating-readable.js')<manifest.scripts.indexOf('flow.js'));
const art=JSON.parse(read('reference/r21-world-rating-check.json'));
for(const row of art.checks){assert.equal(hash(row.source),row.sourceHash);assert.equal(row.alphaDifferences,0);assert(row.exactOutsideOrnament&&row.losslessEncoding);}
for(const entry of Object.values(art.metadata))assert.equal(hash(entry.file).slice(0,16),entry.hash);
const c={window:{}};vm.runInNewContext(read('game-data.js').toString(),c);const C=require('../campaign-catalog');C.apply(c.window.GAME_DATA,require('../mission-info'));
const record={version:'r21',date:'2026-10-09',authorization:'皇冠中央原图案提亮；每国使用全套不重复原地图，不同国家不同顺序，保留原最终关在最后。',build:read('index.html').toString().match(/name="game-build" content="([^"]+)"/)?.[1],scripts:manifest.scripts.length,styles:manifest.styles.length,orders:C.orders,mapFamilies:C.families,sourceHashes:Object.fromEntries(['campaign-catalog.js','flow.js','campaign-xp.js','game.js','engine.js','native-world.css','delivery-manifest.json','assets/takeover/ui/world-rating-readable.js'].map(name=>[name,hash(name)])),protected:before.protected,aiUnchanged:before.aiUnchanged,previousSourceRecordHash:hash('.tools/r20-source-check.json'),previousAiRecordHash:hash('.tools/r18-ai-baseline.json'),spriteArt:art.metadata,checks:{campaignAndCompatibility:13,ratingDecodeAndReuse:6,originalXPRegression:'passed'},scope:'Original inventory, source and bounded initial/menu fixtures. No battle time advanced, browser play or FPS claim. Engine only binds original preset by source map; no AI decisions, economy, troop statistics or spell effects changed.'};
fs.writeFileSync(path.join(root,'.tools/r21-source-check.json'),JSON.stringify(record,null,2)+'\n');console.log({build:record.build,scripts:record.scripts,styles:record.styles,campaigns:Object.fromEntries(Object.entries(C.orders).map(([country,levels])=>[country,levels.length])),protected:'r20 fixes and approved strategy/stat hashes match'});
