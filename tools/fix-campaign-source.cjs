const fs=require('fs'),vm=require('vm'),context={window:{}};vm.runInNewContext(fs.readFileSync('game-data.js','utf8'),context);const data=context.window.GAME_DATA;
// The adapted Empire world map follows the Khaganate campaign coordinates.
data.campaigns.Purple=[...data.campaigns.Red];
for(const level of data.levels)if(level.level>=1&&level.level<=8)level.nativePlayer='Green';
fs.writeFileSync('game-data.js','window.GAME_DATA='+JSON.stringify(data)+';');
