/* Each delta references a full checkpoint, so dropping an intermediate packet is safe. */
(function(root){'use strict';
const clone=value=>JSON.parse(JSON.stringify(value)),same=(a,b)=>a===b||JSON.stringify(a)===JSON.stringify(b),collections=['units','buildings','slots','chests'];
class Encoder{
 encode(state,full=false){
  if(full||!this.base){this.base=clone(state);return{...state,protocol:1,full:true};}
  const base=this.base,fields={},entities={};
  for(const [key,value]of Object.entries(state))if(!collections.includes(key)&&!['definitions','sequence','sentAt'].includes(key)&&!same(value,base[key]))fields[key]=value;
  for(const name of collections){const previous=new Map((base[name]||[]).map(v=>[v.id,v])),live=new Set(),upsert=[];
   for(const value of state[name]||[]){live.add(value.id);const old=previous.get(value.id);if(!old){upsert.push(value);continue;}const patch={id:value.id},unset=[];for(const [key,v]of Object.entries(value))if(key!=='id'&&!same(v,old[key]))patch[key]=v;for(const key of Object.keys(old))if(!(key in value))unset.push(key);if(unset.length)patch.unset=unset;if(Object.keys(patch).length>1)upsert.push(patch);}
   const remove=[...previous.keys()].filter(id=>!live.has(id));if(upsert.length||remove.length)entities[name]={upsert,remove};
  }
  const prior=new Map((base.definitions||[]).map(v=>[v.key||v.id,v])),definitions=(state.definitions||[]).filter(v=>!same(v,prior.get(v.key||v.id)));
  return{protocol:1,full:false,baseSequence:base.sequence,sequence:state.sequence,sentAt:state.sentAt,fields,entities,definitions};
 }
}
class Decoder{
 constructor(){this.reset();}
 reset(){this.bases=new Map();}
 decode(packet){
  if(packet.protocol!==1)return packet;
  if(packet.full){const state={...packet};delete state.protocol;delete state.full;this.bases.set(state.sequence,clone(state));while(this.bases.size>3)this.bases.delete(this.bases.keys().next().value);return state;}
  const base=this.bases.get(packet.baseSequence);if(!base)return null;
  const state={...base,...packet.fields,sequence:packet.sequence,sentAt:packet.sentAt};
  for(const name of collections){const values=new Map((base[name]||[]).map(v=>[v.id,v])),delta=packet.entities?.[name];if(delta){for(const id of delta.remove||[])values.delete(id);for(const patch of delta.upsert||[]){const value={...values.get(patch.id),...patch};for(const key of patch.unset||[])delete value[key];delete value.unset;values.set(value.id,value);}}state[name]=[...values.values()];}
  const definitions=new Map((base.definitions||[]).map(v=>[v.key||v.id,v]));for(const value of packet.definitions||[])definitions.set(value.key||value.id,value);const used=new Set(state.units.map(v=>v.definitionKey||v.id));state.definitions=[...definitions.values()].filter(v=>used.has(v.key||v.id));
  return state;
 }
}
const api={Encoder,Decoder};if(typeof module!=='undefined')module.exports=api;else root.SnapshotCodec=api;
})(typeof window!=='undefined'?window:globalThis);
