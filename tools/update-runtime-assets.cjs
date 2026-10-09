/* Export the conservative audit decision as a small, versioned release input. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function exportConfig(auditFile=path.join(root,'.tools/r26-publish-assets.json')){
 const audit=JSON.parse(fs.readFileSync(auditFile,'utf8').replace(/^\uFEFF/,''));
 if(!Array.isArray(audit.keep)||!audit.keep.length||new Set(audit.keep).size!==audit.keep.length)throw Error('Audit has no valid unique keep list');
 for(const flag of ['noRuntimeExcluded','noFallbackExcluded','noUnverifiedExcluded','deliveryManifestAssetsRetained','backingAssetsRetained','retainedRelativeDependencies'])if(audit.checks?.[flag]!==true)throw Error('Audit check missing: '+flag);
 for(const file of audit.keep){const absolute=path.resolve(root,file);if(!file.startsWith('assets/')||!absolute.startsWith(path.join(root,'assets')+path.sep)||!fs.statSync(absolute).isFile())throw Error('Missing or unsafe asset: '+file);}
 const value={schemaVersion:1,method:audit.method,sourceAuditDate:audit.date,counts:audit.counts,keep:[...audit.keep].sort()};
 fs.mkdirSync(path.join(root,'config'),{recursive:true});
 const output=path.join(root,'config/runtime-assets.json');fs.writeFileSync(output,JSON.stringify(value,null,2)+'\n');
 return {config:'config/runtime-assets.json',keepFiles:value.keep.length,excludedFiles:value.counts.excludedFiles};
}
if(require.main===module){try{console.log(JSON.stringify(exportConfig(process.argv[2]&&path.resolve(process.argv[2]))));}catch(error){console.error(error.message);process.exitCode=1;}}
module.exports={exportConfig};
