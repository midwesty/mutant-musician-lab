import { STAGE_CONFIG } from './constants.js';
import { getAgeHours, clamp } from './utils.js';
export function getStageFromAge(createdAt, now){ const age=getAgeHours(createdAt, now); let current=STAGE_CONFIG[0].id; STAGE_CONFIG.forEach(s=>{ if(age>=s.hours) current=s.id; }); return current; }
export function applyStageProgression(m, now, notifications=[]){
  if(m.isDead) return;
  const next=getStageFromAge(m.createdAt, now);
  if(next!==m.stage){ m.stage=next; m.needs.mood=clamp(m.needs.mood+5); m.careerStats.gigXP+=3; notifications.push({id:`${m.id}_${Date.now()}_stage`, type:'stage', text:`${m.name} advanced to ${next.toUpperCase()}.`}); }
}
