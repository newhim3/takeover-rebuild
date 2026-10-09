/* Stream the verified portable ZIP behind a tiny native launcher, with a bounded footer. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
async function build(){
 const archive=path.join(root,'dist/城邦征战-局域网便携版.zip'),stub=path.join(root,'.tools/native/single-file-stub.exe'),target=path.join(root,'dist/城邦征战.exe'),temporary=target+'.building';
 const release=JSON.parse(fs.readFileSync(path.join(root,'dist/release-package.json'),'utf8').replace(/^\uFEFF/,'')),manifestBytes=fs.readFileSync(path.join(root,'dist/lan-package-manifest.json')),manifest=JSON.parse(manifestBytes);
 const build=fs.readFileSync(path.join(root,'index.html'),'utf8').match(/name="game-build" content="([a-f0-9]{16})"/)[1];
 if(release.build!==build||manifest.build!==build||release.manifestHash!==crypto.createHash('sha256').update(manifestBytes).digest('hex'))throw Error('Portable ZIP does not match the current delivery manifest; rebuild the release package');
 const payload=fs.statSync(archive),launcher=fs.readFileSync(stub),hasher=crypto.createHash('sha256');
 if(payload.size!==release.bytes||launcher.toString('ascii',0,2)!=='MZ')throw Error('Invalid ZIP size or native launcher');
 const output=await fs.promises.open(temporary,'w');let position=0;
 async function write(buffer){for(let i=0;i<buffer.length;){const r=await output.write(buffer,i,buffer.length-i,position);if(!r.bytesWritten)throw Error('Output stopped writing');position+=r.bytesWritten;i+=r.bytesWritten;}}
 try{
  await write(launcher);
  for await(const chunk of fs.createReadStream(archive)){hasher.update(chunk);await write(chunk);}
  if(position!==launcher.length+payload.size)throw Error('Portable archive changed while packaging');
  const hash=hasher.digest();if(hash.toString('hex')!==release.archiveHash)throw Error('Portable ZIP checksum differs from its package report');
  const footer=Buffer.alloc(64);footer.write('TAKEOVER_EXE_V1!',0,'ascii');footer.writeBigInt64LE(BigInt(launcher.length),16);footer.writeBigInt64LE(BigInt(payload.size),24);hash.copy(footer,32);await write(footer);await output.sync();
  await output.close();await fs.promises.rename(temporary,target);
  const result={version:'r27',build,path:target,bytes:position,payloadHash:hash.toString('hex'),payloadBytes:payload.size,stubBytes:launcher.length};
  fs.writeFileSync(path.join(root,'dist/single-exe-package.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));return result;
 }catch(error){await output.close().catch(()=>{});await fs.promises.unlink(temporary).catch(()=>{});throw error;}
}
build().catch(error=>{console.error(error);process.exitCode=1;});
