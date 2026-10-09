/* Recover timing metadata only; this does not replace the simulation. */
'use strict';
const fs=require('fs'),frames=require('../animation-timing.js'),sheets=JSON.parse(fs.readFileSync('assets/takeover/animation/anim_manifest.json')).sheets;
for(const sheet of sheets)if(/_Die$/.test(sheet.key))frames[sheet.key]=sheet.frames;
fs.writeFileSync('animation-timing.js','/* Native source frame counts; original runtime uses 30 FPS. */\n(function(root){const frames='+JSON.stringify(frames)+';if(typeof module!=="undefined")module.exports=frames;else root.AnimationTiming=frames;})(typeof window!=="undefined"?window:globalThis);\n');
console.log('Added exact timing for 168 original death timelines.');
