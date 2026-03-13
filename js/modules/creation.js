import { getDataStore } from './state.js';
export function getStarterKits(){ return getDataStore().creationOptions?.starterKits || []; }
export function getDefaultChoicesFromStarter(id){
  const kit=getStarterKits().find(k=>k.id===id);
  return kit ? { ...kit.options } : null;
}
export function getCreationCatalog(){
  const data=getDataStore().creationOptions;
  return { biomass:data.biomass, body:data.body, neural:data.neural, genres:data.genres, vices:data.vices, catalysts:data.catalysts, roles:data.roles };
}
