import { getDataStore } from './state.js';
import { applyDirectEffects } from './needs.js';
export const findInventoryItem=(state,id)=>state.inventory.find(i=>i.id===id);
export function addItem(state,id,qty=1){ const e=findInventoryItem(state,id); if(e) e.qty+=qty; else state.inventory.push({id,qty}); }
export function removeItem(state,id,qty=1){ const e=findInventoryItem(state,id); if(!e||e.qty<qty) return false; e.qty-=qty; if(e.qty<=0) state.inventory=state.inventory.filter(x=>x.id!==id); return true; }
export const getItemDef=id=>(getDataStore().items?.items||[]).find(i=>i.id===id);
export function buyItem(state,id){ const item=getItemDef(id); if(!item) return {ok:false,message:'Item not found.'}; if(state.playerProfile.cash<item.cost) return {ok:false,message:'Not enough cash.'}; state.playerProfile.cash -= item.cost; if(item.type==='upgrade'){ state.labUpgrades[item.id]=true; if(item.id==='dna_snapshot_vial') state.labUpgrades.snapshotUnlocked=true; return {ok:true,message:`${item.name} installed.`}; } addItem(state,id,1); return {ok:true,message:`Bought ${item.name}.`}; }
export function useItem(state,musician,id){
  const item=getItemDef(id); if(!item) return {ok:false,message:'Item missing.'}; if(!removeItem(state,id,1)) return {ok:false,message:'You do not have that item.'};
  if(item.type==='revive'){ if(!musician.isDead&&!musician.isCritical){ addItem(state,id,1); return {ok:false,message:'Revival Kit only works on dead or critical mutants.'}; } musician.isDead=false; musician.isCritical=false; musician.deathAt=null; musician.needs.health=Math.max(musician.needs.health,40); musician.needs.mood=Math.max(musician.needs.mood,30); return {ok:true,message:`${musician.name} jolts back to life.`}; }
  applyDirectEffects(musician, item.effects||{}); return {ok:true,message:`${musician.name} used ${item.name}.`};
}
