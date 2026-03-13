import { getDataStore } from './state.js';
export const getMutationObjects=(ids=[])=>ids.map(id=>(getDataStore().mutations?.mutations||[]).find(m=>m.id===id)).filter(Boolean);
export function computeMutationMods(ids=[]){ const mods={}; getMutationObjects(ids).forEach(m=>Object.entries(m.mods||{}).forEach(([k,v])=>mods[k]=(mods[k]||0)+v)); return mods; }
