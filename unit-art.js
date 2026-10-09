/* The SWF uses faction + unitType + techLevel; proficiency is independent. */
(function(root){
const P=typeof module!=='undefined'?require('./progression'):root.Progression;
const colors={Westaria:'Green',TheKhaganate:'Red',TheCult:'Blue',TheEmpire:'Purple',Bandits:'Gray'};
const letters={Green:'W',Red:'K',Blue:'B',Purple:'E',Gray:'N'};
const names={'Guards':'卫兵','Swordsmen':'剑士','Legionaries':'军团步兵','Archers':'弓箭手','Crossbowmen':'弩手','Knights':'骑士','Champions':'冠军骑士','Trebuchet':'投石机','Monks':'修士','Zealots':'狂信者','Warriors':'战士','Immortals':'不朽战士','Hunters':'猎手','Serpent Archers':'毒蛇弓手','Nomads':'游牧骑兵','Raiders':'劫掠骑兵','Ancient Raiders':'远古劫掠者','Poison Catapult':'毒液投石机','Assassins':'刺客','Rebels':'反抗军','Myrmidons':'长矛兵','Gunsmiths':'火枪手','Gunbots':'机械枪兵','Giantbots':'巨型机械','Lancers':'枪骑兵','Dragon Lancers':'龙枪骑兵','Acolytes':'侍僧','Wizards':'法师','Undying Warriors':'不死战士','Zombie Warriors':'僵尸战士','Undying Archers':'不死弓手','Skeleton Archers':'骷髅弓手','Undying Horsemen':'不死骑兵','Dark Knights':'黑暗骑士','Undying Assassins':'不死刺客','Shades':'暗影','Ogre':'食人魔','Avatar':'神之化身','Wolves':'狼群','Brigand Warriors':'匪徒','Brigand Archers':'匪徒弓手'};
// Avatar and Ogre are separate source symbols, independent of any player's
// recruitment technology. XMLData registers them as GreenMagic3/GrayMagic.
const specialPrefixes={Avatar:'GreenMagic3',Ogre:'GrayMagic'};
function prefix(record){return specialPrefixes[record.name]||colors[record.faction]+record.unitType+(record.techLevel>1?record.techLevel:'');}
function icon(record){return `IconT${record.techLevel}_${letters[colors[record.faction]]}_${record.unitType}Class`;}
function image(record){return `unit-${colors[record.faction]}-${record.unitType}${record.techLevel>1?'-'+record.techLevel:''}`;}
function label(record){return names[record.name]||record.name;}
function recruit(color,type,bonus={}){return P.unit(color,type,1+(bonus[{Infantry:0,Cavalry:1,Archers:2,Siege:3,Magic:4}[type]]||0));}
function transition(color,row){if(row.id>=5||row.value<1)return null;const type=['Infantry','Cavalry','Archers','Siege','Magic'][row.id],to=P.unit(color,type,row.value+1),from=P.unit(color,type,row.value);return from.techLevel===to.techLevel?null:{from,to};}
// Original projectile dispatch: source §_-qG§/§_-xJ§.as, 158–194 and 505.
// Other archers use the original drawn arrow, not another nation's bullet.
function projectile(record){if(record.unitType==='Siege')return 'CatapultMissileClass';if(record.unitType==='Archers'&&record.faction==='TheCult')return ['BulletClass','GunbotBulletClass','GiantbotBulletClass'][Math.min(2,Math.max(0,record.techLevel-1))];if(record.unitType==='Magic')return {Westaria:'ZealotBulletClass',TheCult:'AcolytesBulletClass'}[record.faction]||null;return null;}
const api={colors,letters,prefix,icon,image,label,recruit,transition,specialPrefixes,projectile};if(typeof module!=='undefined')module.exports=api;else root.UnitArt=api;
})(globalThis);
