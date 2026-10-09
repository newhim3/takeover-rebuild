/* Record this presentation-only delivery; no battle or browser simulation. */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),vm=require('vm'),root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name)),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const previous=JSON.parse(read('.tools/r18-source-check.json')),ai=JSON.parse(read('.tools/r18-ai-baseline.json'));
for(const [name,value]of Object.entries({...previous.protected,...ai.files}))assert.equal(hash(read(name)),value,'Protected prior rules: '+name);
assert.equal(hash(read('native-results.css')),hash(read('.tools/r19-before/native-results.css')),'Keep the approved results style');
const registry={window:{}};vm.runInNewContext(read('assets/takeover/ui/native-campaign-hover-assets.js').toString(),registry);
const hover={};for(const [country,entry]of Object.entries(registry.window.NativeCampaignHoverAssets)){const bytes=read('assets/takeover/ui/'+entry.file);assert.equal(hash(bytes).slice(0,16),entry.hash);assert.equal(entry.frames,10);assert.equal(entry.width,450);assert.equal(entry.height,735);hover[country]={...entry,bytes:bytes.length};}
assert(!registry.window.NativeCampaignHoverAssets.Purple,'Never substitute a different country animation for Empire');
const modified=['game.js','engine.js','multiplayer-server.cjs','native-feedback.js','native-unit-animation.js','flow.js','original-ui.css','native-world.css','multiplayer.css','delivery-manifest.json','assets/takeover/ui/native-campaign-hover-assets.js'],manifest=JSON.parse(read('delivery-manifest.json')),build=read('index.html').toString().match(/name="game-build" content="([a-f0-9]+)"/)[1];
const record={version:'r19',authorization:'动画和 UI 逐步参照原版；没有加就不要减',build,sourceHashes:Object.fromEntries(modified.map(name=>[name,hash(read(name))])),protected:previous.protected,aiUnchanged:ai.files,previousAiRecordHash:hash(read('.tools/r18-ai-baseline.json')),scripts:manifest.scripts.length,styles:manifest.styles.length,shortChecks:{nativeAnimation:12,nativeFeedback:15,realAttackAndCodec:8,menuAndOrderPresentation:13},hover,scope:'Presentation, static art and bounded source checks only; no browser play or long campaign.'};
fs.writeFileSync(path.join(root,'.tools/r19-source-check.json'),JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify({build,scripts:record.scripts,styles:record.styles,shortChecks:48,protectedRules:'unchanged',hoverBytes:Object.values(hover).reduce((sum,item)=>sum+item.bytes,0)}));
