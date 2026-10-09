/* Presentation only. Spell mechanics and AI remain in their existing runtimes. */
(function(root){'use strict';
const names={0:'LordsJudgement',1:'Heal',2:'Heroism',4:'StoneWorm',5:'Disentomb',6:'Bloodlust',8:'IceBlast',9:'MistyClones',10:'Liberation'};
function cursor(spec,enabled=true){if(!spec||spec.row.type===2)return null;const name=names[spec.row.id];return{key:name?'Cursor'+(enabled?'On_':'Off_')+name+'Class':'shared',scale:name==='Disentomb'?1:Math.max(0,spec.row.radius)/75,shared:!name,enabled};}
function deathKey(effect,sprites){const wanted=effect.visualKey||`${effect.color}${effect.sprite}${effect.facing||'Down'}_Die`;return sprites[wanted]?wanted:`${effect.color}${effect.sprite}Down_Die`;}
// eB death state lasts 3 seconds from fall start; FSquad moves a finished
// fall to LAYER_CORPSE. Hold the original final frame without a new effect.
function deathVisual(e,sprites){const key=deathKey(e,sprites),frames=Math.max(1,sprites[key]?.frames||1),age=Math.max(0,e.max-Math.max(0,e.t-(e.renderTime||0))),fall=e.fallDuration??frames/30;return{key,frame:Math.min(frames-1,age*30),layer:age>=fall?'corpse':'above',alpha:1};}
function effectInLayer(e,layer,sprites){if(e.type==='sound')return false;if(e.type==='death')return deathVisual(e,sprites).layer===layer;if(layer==='corpse')return false;if(layer==='ground')return!!e.ground;if(layer==='declaration')return e.type==='declaration';return!e.ground&&e.type!=='declaration';}
// Original action overlays share the squad badge's Flash origin (vE/8W).
const actions={moving:{key:'ASTMovingClass',delay:0},melee:{key:'ASTMeleeFightingClass',delay:0},ranged:{key:'ASTRangedFightingClass',delay:1.5},defending:{key:'ASTDefendingClass',delay:0},repairing:{key:'ASTRepairingClass',delay:0}};
const pivots={ASTMovingClass:[14.1,-4.3],ASTMeleeFightingClass:[27.1,6.6],ASTRangedFightingClass:[30.75,6.95],ASTDefendingClass:[16.85,-1.4],ASTRepairingClass:[19.5,8.55],ExplosionClass:[69.95,143.5],BuildingRizeEffectClass:[60.75,45.25]};
// FFDec sprite origins plus the existing uniformly padded PNG canvases.
// Evidence: reference/native-orders-r19, first frame of each original sprite.
Object.assign(pivots,{PathPointGreenClass:[6.5,3.5],PathPointRedClass:[6.5,3.5],PathPointBlueClass:[6.4,3.5],PathPointPurpleClass:[6.4,3.5],IconGoPathClass:[62.45,28],IconGoInClass:[62.45,53.75],IconAttackClass:[58,58.25],IconGoPathOffClass:[56,20]});
function action(u){if(u.frozen>0||u.hp<=0)return null;if(u.garrisonId)return u.state==='repair'||u.state==='capture'?'repairing':'defending';if(u.state==='attack')return u.stats.range>0?'ranged':'melee';return u.state==='move'?'moving':null;}
function actionFrame(mode,age,frames){const duration=frames/30,phase=Math.max(0,age)%(duration+(actions[mode]?.delay||0));return Math.min(frames-1,Math.floor(phase*30));}
// RasterAnimation keeps frame 0 on its first delay, then the final frame
// during subsequent delays. The delay applies on every loop, not just once.
function buildingFrame(age,frames,delay){age=Math.max(0,age);const duration=Math.max(1,frames-2)/30,cycle=duration+delay,phase=age%cycle;if(age===0)return 0;if(phase<delay)return age<cycle?0:frames-1;return Math.min(frames-1,1+Math.floor((phase-delay)*30));}
// xJ.BJ draws the current arrow black and its preceding segment green.
// Native trajectory height 80 is halved by the world's Y projection.
function arrowPoint(e,p){p=Math.max(0,Math.min(1,p));const arc=!e.projectileKey||e.projectileKey==='CatapultMissileClass'?40*(1-(1-2*p)**2):0;return{x:e.x+(e.tx-e.x)*p,y:e.y+(e.ty-e.y)*p-arc};}
function drawArrow(c,e,p){const step=.033/Math.max(.033,e.max),a=arrowPoint(e,p),next=arrowPoint(e,p+step),prior=arrowPoint(e,p-step);c.lineWidth=1;c.strokeStyle='rgba(0,255,0,0.62745)';c.beginPath();c.moveTo(Math.round(prior.x),Math.round(prior.y));c.lineTo(Math.round(a.x),Math.round(a.y));c.stroke();c.strokeStyle='rgba(0,0,0,0.690196)';c.beginPath();c.moveTo(Math.round(a.x),Math.round(a.y));c.lineTo(Math.round(next.x),Math.round(next.y));c.stroke();}
// Level.H8 and battle.Wy.getColor: this curve previews a dragged command,
// rather than being an animated marching route. Only an invalid path is red.
const orderColors={Green:'#408000',Red:'#ff3300',Blue:'#006ad5',Purple:'#9900ff'};
function orderControl(from,to){return{x:(from.x+to.x)/2,y:(from.y+to.y)/2-Math.hypot(to.x-from.x,to.y-from.y)*.7};}
function drawOrderCurve(c,from,to,owner,reachable=true){const mid=orderControl(from,to);c.save();c.globalAlpha=.8;c.setLineDash([]);for(const [width,color]of [[6,'#000000'],[5,reachable?(orderColors[owner]||'#000000'):'#ff0000']]){c.lineWidth=width;c.strokeStyle=color;c.beginPath();c.moveTo(from.x,from.y);c.quadraticCurveTo(mid.x,mid.y,to.x,to.y);c.stroke();}c.restore();}
// Level.Uy: the original box selection is a green, unfilled 2px rectangle.
function drawSelectionBox(c,from,to){c.save();c.setLineDash([]);c.lineWidth=2;c.strokeStyle='#00ff00';c.strokeRect(from.x,from.y,to.x-from.x,to.y-from.y);c.restore();}
// LevelVisual.oL samples the original land path every 50 units. The current
// world coordinates already project land Y by 1/2, so measure dy * 2 here.
// The final endpoint follows the original last-segment remainder rule.
function pathPoints(points,spacing=50){if(!points?.length||!(spacing>0&&Number.isFinite(spacing)))return[];const result=[{x:points[0].x,y:points[0].y}];let at=result[0],carry=0,remainder=0;for(let i=1;i<points.length;i++){const to=points[i];let d=Math.hypot(to.x-at.x,(to.y-at.y)*2);while(d>=spacing-carry&&d>0){const f=(spacing-carry)/d;at={x:at.x+(to.x-at.x)*f,y:at.y+(to.y-at.y)*f};result.push(at);d=Math.hypot(to.x-at.x,(to.y-at.y)*2);carry=0;}at={x:to.x,y:to.y};carry+=d;remainder=d;}if(remainder>spacing/2)result.push(at);return result;}
root.NativeFeedback={cursor,deathKey,deathVisual,effectInLayer,actions,pivots,action,actionFrame,buildingFrame,arrowPoint,drawArrow,orderColors,orderControl,drawOrderCurve,drawSelectionBox,pathPoints};
if(typeof module!=='undefined')module.exports=root.NativeFeedback;
})(typeof window!=='undefined'?window:globalThis);
