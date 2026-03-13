import { SAVE_KEY, DEFAULT_STATE } from './constants.js';
import { deepClone } from './utils.js';
function mergeDefaults(base,incoming){
  if(Array.isArray(base)) return Array.isArray(incoming)?incoming:base;
  if(typeof base!=='object'||base===null) return incoming===undefined?base:incoming;
  const out={...base};
  Object.keys(incoming||{}).forEach(k=> out[k]=k in base ? mergeDefaults(base[k], incoming[k]) : incoming[k]);
  return out;
}
export function loadSave(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return deepClone(DEFAULT_STATE);
    return mergeDefaults(deepClone(DEFAULT_STATE), JSON.parse(raw));
  }catch(e){ console.error(e); return deepClone(DEFAULT_STATE); }
}
export const saveState=state=>localStorage.setItem(SAVE_KEY, JSON.stringify(state));
export const clearSave=()=>localStorage.removeItem(SAVE_KEY);
