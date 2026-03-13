import { getDataStore } from './state.js';
export const getTraitObjects=(ids=[])=>ids.map(id=>(getDataStore().traits?.traits||[]).find(t=>t.id===id)).filter(Boolean);
export function computeTraitMods(ids=[]){ const mods={}; getTraitObjects(ids).forEach(t=>Object.entries(t.mods||{}).forEach(([k,v])=>mods[k]=(mods[k]||0)+v)); return mods; }
