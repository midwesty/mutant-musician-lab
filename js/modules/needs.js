import { clamp } from './utils.js';
import { computeTraitMods } from './traits.js';
import { computeMutationMods } from './mutations.js';
const perHour={ embryo:{food:2.5,water:2.2,rest:1.2,mood:1.3,inspiration:.7,vice:.6,cleanliness:2.2,health:.1}, infant:{food:2.6,water:2.3,rest:1.8,mood:1.6,inspiration:.8,vice:.8,cleanliness:2,health:.2}, child:{food:2.1,water:1.9,rest:1.5,mood:1.4,inspiration:1,vice:1.2,cleanliness:1.9,health:.25}, teen:{food:1.8,water:1.7,rest:1.7,mood:1.8,inspiration:1.3,vice:1.6,cleanliness:1.7,health:.3}, adult:{food:1.6,water:1.6,rest:1.8,mood:1.5,inspiration:1.4,vice:1.8,cleanliness:1.5,health:.35} };
function countCritical(needs){ return ['food','water','rest','mood','cleanliness','vice'].filter(k=>(needs[k]||0)<12).length; }
export function applyNeedDecay(m, elapsedMs, upgrades={}){
  if(m.isFrozen||m.isDead) return;
  const hours=elapsedMs/36e5, rates=perHour[m.stage]||perHour.embryo, t=computeTraitMods(m.traitIds), mu=computeMutationMods(m.mutationIds), automation=upgrades.lab_assistant_drone?.active?0.75:upgrades.lab_assistant_drone?0.75:1, tube=upgrades.better_tube_filter&&m.stage==='embryo'?0.65:1;
  Object.entries(rates).forEach(([k,rate])=>{
    let decay=rate*hours*automation*tube;
    if(k==='cleanliness'&&t.cleanlinessTolerance) decay*=.7;
    if(k==='mood'&&t.moodDecay) decay*=1+t.moodDecay/100;
    if(k==='food'&&mu.foodDecayReduction) decay*=1-mu.foodDecayReduction/100;
    if(k==='rest'&&mu.restPenalty) decay*=1+mu.restPenalty/100;
    if(k==='health'){ decay += countCritical(m.needs)*.55*hours; if(mu.healthPenalty) decay += (mu.healthPenalty/100)*3*hours; }
    m.needs[k]=clamp(m.needs[k]-decay);
  });
  if(countCritical(m.needs)>=3) m.isCritical=true; else if(m.needs.health>30) m.isCritical=false;
  if(m.isCritical&&m.needs.health<=0){ m.isDead=true; m.deathAt=Date.now(); }
}
export function applyDirectEffects(m, effects={}){
  Object.entries(effects).forEach(([k,v])=>{
    if(k in m.needs) m.needs[k]=clamp(m.needs[k]+v);
    else if(k in m.baseStats) m.baseStats[k]=clamp(m.baseStats[k]+v,1,99);
    else if(k==='xp') m.careerStats.gigXP += v;
    else if(k==='fanbase') m.careerStats.fanbase=Math.max(0,m.careerStats.fanbase+v);
    else if(k==='fame') m.careerStats.fame=Math.max(0,m.careerStats.fame+v);
    else if(k==='stress') m.careerStats.stress=clamp(m.careerStats.stress+v,0,100);
  });
}
