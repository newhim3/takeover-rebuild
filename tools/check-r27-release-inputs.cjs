/* Targeted release-input checks; no gameplay, server or archive launch. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),configPath=path.join(root,'config/runtime-assets.json'),config=JSON.parse(fs.readFileSync(configPath,'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'dist/lan-package-manifest.json'),'utf8'));
const source=fs.readFileSync(path.join(root,'tools/build-lan-package.cjs'),'utf8'),checks=[];
function reject(name,modify,pattern){
 const local=JSON.parse(JSON.stringify(config));modify(local);
 const fakeFs=Object.create(fs);fakeFs.readFileSync=(file,...args)=>path.resolve(file)===configPath?JSON.stringify(local):fs.readFileSync(file,...args);
 assert.throws(()=>vm.runInNewContext(source,{require:key=>key==='node:fs'?fakeFs:require(key),__dirname:path.join(root,'tools'),process:{argv:['node','script','--runtime-only']},console,Buffer}),pattern);
 checks.push(name);
}
assert.equal(config.keep.length,5112);assert.equal(new Set(config.keep).size,5112);
assert.deepEqual(manifest.entries.filter(e=>e.file.startsWith('assets/')).map(e=>e.file),config.keep);
const auditPath=path.join(root,'.tools/r26-publish-assets.json');
if(fs.existsSync(auditPath))assert.deepEqual(config.keep,JSON.parse(fs.readFileSync(auditPath,'utf8').replace(/^\uFEFF/,'')).keep);
checks.push('All 5,112 conservative asset decisions preserved');
const priorPath=path.join(root,'.tools/r27-repro-before/lan-package-manifest.json');
if(fs.existsSync(priorPath)){const prior=JSON.parse(fs.readFileSync(priorPath,'utf8'));assert.deepEqual(manifest.entries.map(e=>e.file),prior.entries.map(e=>e.file));assert.equal(manifest.build,prior.build);checks.push('Package paths and gameplay build unchanged');}
assert.ok(manifest.entries.every(e=>/^[a-f0-9]{64}$/.test(e.sha256)));
assert.equal(manifest.selection.configHash,crypto.createHash('sha256').update(fs.readFileSync(configPath)).digest('hex'));checks.push('Manifest has per-file hashes and versioned config identity');
reject('Truncated asset config rejected',c=>c.keep.pop(),/counts do not match/);
reject('Escaping asset path rejected',c=>c.keep[0]='assets/../../outside.png',/Invalid asset/);
reject('Missing selected asset rejected',c=>c.keep[0]='assets/missing-selected-r27.png',/ENOENT/);
const fakeFs=Object.create(fs);fakeFs.readFileSync=(file,...args)=>path.resolve(file)===path.join(root,'.tools/native/node.exe')?Buffer.from('version https://git-lfs.github.com/spec/v1\noid sha256:abc\nsize 92825416\n'):fs.readFileSync(file,...args);
assert.throws(()=>vm.runInNewContext(source,{require:key=>key==='node:fs'?fakeFs:require(key),__dirname:path.join(root,'tools'),process:{argv:['node','script','--runtime-only']},console,Buffer}),/Git LFS object not downloaded/);checks.push('Unhydrated Git LFS pointer rejected');
const result={version:'r27',passed:true,checks,build:manifest.build,assetFiles:config.keep.length,packageFiles:manifest.entries.length};
fs.mkdirSync(path.join(root,'.tools'),{recursive:true});fs.writeFileSync(path.join(root,'.tools/r27-release-inputs-check.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
