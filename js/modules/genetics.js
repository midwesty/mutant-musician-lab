import { getDataStore } from './state.js';
import { randInt, sample, pick, clamp } from './utils.js';
const byId=(arr,id)=>(arr||[]).find(x=>x.id===id);
export function computeVectorsFromChoices(choices){
  const o=getDataStore().creationOptions; const parts=[byId(o.biomass,choices.biomass),byId(o.body,choices.body),byId(o.neural,choices.neural),byId(o.catalysts,choices.catalyst)].filter(Boolean);
  const vectors={humanoid:0,bestial:0,aquatic:0,insectoid:0,fungal:0,skeletal:0,synthetic:0,elegant:0,trashy:0,cute:0,nightmare:0};
  parts.forEach(p=>Object.entries(p.vectors||{}).forEach(([k,v])=>vectors[k]=(vectors[k]||0)+v));
  const genre=byId(o.genres,choices.genre); if(genre?.id==='electronic') vectors.synthetic+=6; if(genre?.id==='metal') vectors.nightmare+=4; if(genre?.id==='punk') vectors.trashy+=5; if(['folk','country'].includes(genre?.id)) {vectors.humanoid+=3; vectors.cute+=2;}
  const vice=byId(o.vices,choices.vice); if(vice?.severity==='grimy') vectors.trashy+=4; if(vice?.severity==='funny') vectors.cute+=2;
  return vectors;
}
export function computeBaseStats(choices, bonusItems=[]){
  const o=getDataStore().creationOptions;
  const chosen=[byId(o.biomass,choices.biomass),byId(o.body,choices.body),byId(o.neural,choices.neural),byId(o.genres,choices.genre),byId(o.vices,choices.vice),byId(o.catalysts,choices.catalyst),byId(o.roles,choices.role)].filter(Boolean);
  const stats={talent:40+randInt(-4,4),technique:40+randInt(-4,4),originality:40+randInt(-4,4),discipline:40+randInt(-4,4),ego:40+randInt(-4,4),charisma:40+randInt(-4,4),weirdness:40+randInt(-4,4),resilience:40+randInt(-4,4)};
  chosen.forEach(e=>Object.entries(e.effects||{}).forEach(([k,v])=>stats[k]=(stats[k]||0)+v));
  bonusItems.forEach(item=>Object.entries(item.effects||{}).forEach(([k,v])=>{ if(k in stats) stats[k]+=v; }));
  Object.keys(stats).forEach(k=>stats[k]=clamp(stats[k],1,99)); return stats;
}
export function rollStartingMutations(vectors={}, choiceIds=[]){
  const all=getDataStore().mutations?.mutations||[];
  const pool=all.filter(m=>Object.entries(m.vectors||{}).reduce((s,[k,v])=>s+((vectors[k]||0)*v),0)>20 || Math.random()<.1);
  const sel=sample(pool, pool.length ? (Math.random()<.35?2:1) : 0);
  if(choiceIds.includes('fungal_choir_spore') && !sel.some(m=>m.id==='fungal_mane')){ const f=all.find(m=>m.id==='fungal_mane'); if(f) sel.push(f); }
  return sel.slice(0,2);
}
export function rollStartingTraits(genreId, roleId, viceId){
  const all=getDataStore().traits?.traits||[]; const picks=[]; const add=id=>{ const t=all.find(x=>x.id===id); if(t&&!picks.some(p=>p.id===id)) picks.push(t); };
  if(genreId==='folk') add('sulking_poet'); if(genreId==='punk') add('diy_spirit'); if(genreId==='electronic') add('feedback_monk'); if(roleId==='producer') add('cable_hoarder'); if(roleId==='drummer') add('metronome_brain'); if(viceId==='validation') add('parasocial_angel'); if(viceId==='attention') add('crowd_charmer');
  while(picks.length<2){ const r=pick(all); if(r&&!picks.some(p=>p.id===r.id)) picks.push(r); } return picks.slice(0,2);
}
export function computeRoleAptitudes(baseRole, genreId, vectors={}, mutations=[]){
  const roles=getDataStore().roles||[]; const genre=(getDataStore().genres||[]).find(g=>g.id===genreId); const apt={}; roles.forEach(r=>apt[r.id]=randInt(25,45)); apt[baseRole]=(apt[baseRole]||0)+28;
  Object.entries(genre?.roleBias||{}).forEach(([r,v])=>apt[r]=(apt[r]||0)+v); if(vectors.synthetic>12){apt.producer+=6;apt.keys+=4;} if(vectors.trashy>10){apt.guitarist+=4;apt.bassist+=3;} if(vectors.elegant>10){apt.vocalist+=4;apt.strings+=4;}
  mutations.forEach(m=>{ if(m.mods?.roleFlex) Object.keys(apt).forEach(k=>apt[k]+=Math.floor(m.mods.roleFlex/4));});
  Object.keys(apt).forEach(k=>apt[k]=clamp(apt[k],5,100)); return apt;
}
export function deriveVisualProfile(vectors={}, roleId='vocalist'){
  const sorted=Object.entries(vectors).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
  return { bodyClass:sorted.find(k=>['aquatic','bestial','fungal','skeletal','synthetic','elegant'].includes(k))||'bestial', eyeClass:sorted.includes('nightmare')?'nightmare':'cute', hairClass:sorted.includes('elegant')?'elegant':sorted.includes('trashy')?'trashy':'cute', extraClass:sorted.includes('fungal')?'fungal':sorted.includes('synthetic')?'synthetic':sorted.includes('nightmare')?'nightmare':'', instrumentClass:roleId };
}
export function spliceDNA(a,b){
  const stats={}; Object.keys(a.baseStats||{}).forEach(k=>stats[k]=clamp(Math.round(((a.baseStats?.[k]||40)+(b.baseStats?.[k]||40))/2)+randInt(-5,5),1,99));
  const vectors={}; [a.vectors||{}, b.vectors||{}].forEach(v=>Object.entries(v).forEach(([k,val])=>vectors[k]=(vectors[k]||0)+Math.round(val/2)));
  const role=[a.preferredRole,b.preferredRole].filter(Boolean)[randInt(0,1)]||'vocalist'; const genre=[a.genreId,b.genreId].filter(Boolean)[randInt(0,1)]||'punk';
  const combined=[...new Set([...(a.mutationIds||[]),...(b.mutationIds||[])])];
  return { stats, vectors, role, genre, mutationIds:sample(combined,2) };
}
