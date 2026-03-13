import { createMusicianFromChoices } from './musicianFactory.js';
import { pick } from './utils.js';
import { getDataStore } from './state.js';
export function runCheat(state, code, selected){
  const data=getDataStore();
  switch(code){
    case 'money': state.playerProfile.cash+=500; return 'Added $500.';
    case 'maxNeeds': if(!selected) return 'No musician selected.'; Object.keys(selected.needs).forEach(k=>selected.needs[k]=100); selected.isCritical=false; return `${selected.name} is in suspiciously perfect condition.`;
    case 'heal': if(!selected) return 'No musician selected.'; selected.needs.health=100; selected.isCritical=false; selected.isDead=false; return `${selected.name} has been aggressively healed.`;
    case 'ageUp': if(!selected) return 'No musician selected.'; selected.createdAt -= 24*36e5; return `${selected.name} has been illegally aged.`;
    case 'adult': if(!selected) return 'No musician selected.'; selected.createdAt = Date.now()-73*36e5; return `${selected.name} is now an adult.`;
    case 'mutation': if(!selected) return 'No musician selected.'; const mut=pick(data.mutations?.mutations||[]); if(mut && !selected.mutationIds.includes(mut.id)) selected.mutationIds.push(mut.id); return mut?`${selected.name} gains mutation: ${mut.name}.`:'No mutation available.';
    case 'spawn': const o=data.creationOptions; const choices={ biomass:pick(o.biomass).id, body:pick(o.body).id, neural:pick(o.neural).id, genre:pick(o.genres).id, vice:pick(o.vices).id, catalyst:pick(o.catalysts).id, role:pick(o.roles).id }; const newbie=createMusicianFromChoices(choices,'cheat_spawn'); state.musicians.push(newbie); state.playerProfile.selectedMusicianId=newbie.id; return `Spawned ${newbie.name}.`;
    case 'revive': if(!selected) return 'No musician selected.'; selected.isDead=false; selected.isCritical=false; selected.deathAt=null; selected.needs.health=80; return `${selected.name} has been revived.`;
    case 'freezeTime': state.clockState.freezeTime=!state.clockState.freezeTime; return `Freeze time: ${state.clockState.freezeTime?'ON':'OFF'}.`;
    case 'fastTime': state.clockState.speedMultiplier=state.clockState.speedMultiplier===1?10:1; return `Time multiplier: ${state.clockState.speedMultiplier}x.`;
    default: return 'Unknown cheat.';
  }
}
