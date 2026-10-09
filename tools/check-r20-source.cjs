/* Bounded source protection and delivery-order audit. Does not play the game. */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name)),hash=name=>crypto.createHash('sha256').update(read(name)).digest('hex');
const previous=JSON.parse(read('.tools/r19-source-check.json')),manifest=JSON.parse(read('delivery-manifest.json'));
const protectedFiles={...previous.protected,...previous.aiUnchanged};
for(const [name,expected]of Object.entries(protectedFiles))assert.equal(hash(name),expected,name+' must retain the approved rules');
assert.equal(hash('.tools/r18-ai-baseline.json'),previous.previousAiRecordHash,'r18 audit record is retained');
const unchanged=['flow.js','ui.js','animation-cache.js','native-unit-animation.js','native-world.css'];
for(const name of unchanged)assert(read(name).equals(read('.tools/r20-before/'+name)),name+' is unchanged');
for(const name of ['native-results.css','original-ui.css','native-hud.css','multiplayer.css']){if(previous.sourceHashes[name])assert.equal(hash(name),previous.sourceHashes[name],name+' retains the approved r19 layout');else assert(read(name).equals(read('.tools/r19-before/'+name)),name+' retains the approved layout');}
const beforeEngine=read('.tools/r20-before/engine.js').toString();
const expectedEngine=beforeEngine
 .replace("duration=(AnimationTiming[visualKey]||30)/30;this.effects.push({type:'death'","fallDuration=(AnimationTiming[visualKey]||30)/30,duration=Math.max(3,fallDuration);this.effects.push({type:'death'")
 .replace('color:u.owner,visualKey,t:duration','color:u.owner,visualKey,fallDuration,t:duration');
assert.equal(read('engine.js').toString(),expectedEngine,'only the proven death display duration changes in Battle');
for(const name of manifest.scripts)new vm.Script(read(name).toString(),{filename:name});
new vm.Script(read('multiplayer-server.cjs').toString(),{filename:'multiplayer-server.cjs'});
assert(manifest.scripts.indexOf('paused-order-feedback.js')>manifest.scripts.indexOf('native-feedback.js'));
assert(manifest.scripts.indexOf('paused-order-feedback.js')<manifest.scripts.indexOf('game.js'));
assert(manifest.scripts.indexOf('paused-order-feedback.js')<manifest.scripts.indexOf('multiplayer-client.js'));
assert.equal(manifest.scripts.length,54);assert.equal(manifest.styles.length,8);
const report={version:'r20',authorization:'继续优化；没有加就不要减。仅补原版展示、操作反馈和渲染缓存，不重设计认可页面或调整战斗规则。',build:read('index.html').toString().match(/name="game-build" content="([^"]+)"/)?.[1],sourceHashes:Object.fromEntries(['game.js','engine.js','native-feedback.js','paused-order-feedback.js','terrain-cache.js','multiplayer-client.js','multiplayer-server.cjs','delivery-manifest.json'].map(name=>[name,hash(name)])),protected:previous.protected,aiUnchanged:previous.aiUnchanged,previousAiRecordHash:hash('.tools/r18-ai-baseline.json'),previousSourceRecordHash:hash('.tools/r19-source-check.json'),unchangedPresentationHashes:Object.fromEntries([...unchanged,'native-results.css','original-ui.css','native-hud.css','multiplayer.css'].map(name=>[name,hash(name)])),scripts:manifest.scripts.length,styles:manifest.styles.length,engineScope:'Only existing death effect lifetime and display field; live removal, reward, result, AI scheduling and actual command rules match the before source.',shortChecks:{localPausedFeedback:5,networkPausedFeedbackAndReceipts:14,nativeDeathTimeline:8,renderWorkAndIdenticalSpriteCalls:4,terrainBoundsAndScenery:14,priorAttackAndCodecSeam:8,priorMenuAndOrderSeam:13,priorNetworkRegression:13},scope:'Bounded fixtures and source/dependency checks only; no browser gameplay, full campaign or measured FPS claim.'};
fs.writeFileSync(path.join(root,'.tools/r20-source-check.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({build:report.build,scripts:report.scripts,styles:report.styles,protectedRules:'all hashes match r19/r18',presentation:'approved styles and pages unchanged',engineScope:report.engineScope}));
