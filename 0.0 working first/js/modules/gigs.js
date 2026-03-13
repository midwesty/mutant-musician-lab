import { getDataStore } from './state.js';
import { uid, randInt } from './utils.js';
import { computeTraitMods } from './traits.js';
import { computeMutationMods } from './mutations.js';
export function refreshGigBoard(state, now){
  const all=getDataStore().gigs?.gigs||[];
  state.gigBoard = state.gigBoard.filter(g=>g.expiresAt>now);
  while(state.gigBoard.length<6 && all.length){
    const candidate=all[randInt(0,all.length-1)];
    if(!state.gigBoard.some(g=>g.id===candidate.id)) state.gigBoard.push({...candidate, boardId:uid('boardGig'), spawnedAt:now, expiresAt:now+randInt(6,16)*36e5});
  }
}
export const canTakeGig=m=>m.stage==='adult'&&!m.isDead&&!m.isFrozen&&!m.currentGigId;
export function assignGig(state,m,gigBoardId,now){
  const gig=state.gigBoard.find(g=>g.boardId===gigBoardId); if(!gig) return {ok:false,message:'Gig not found.'}; if(!canTakeGig(m)) return {ok:false,message:'This musician cannot take that gig.'};
  const active={ id:uid('activeGig'), boardId:gigBoardId, gigId:gig.id, musicianId:m.id, startedAt:now, endsAt:now+gig.durationMin*60000 }; state.activeGigs.push(active); m.currentGigId=active.id; return {ok:true,message:`${m.name} is on ${gig.name}.`};
}
export function resolveFinishedGigs(state, now){
  const finished=state.activeGigs.filter(g=>g.endsAt<=now), results=[], gigs=getDataStore().gigs?.gigs||[];
  finished.forEach(active=>{
    const m=state.musicians.find(x=>x.id===active.musicianId), gig=gigs.find(x=>x.id===active.gigId); if(!m||!gig) return;
    const out=resolveGigOutcome(m,gig); m.currentGigId=null; m.careerStats.fame+=out.fame; m.careerStats.fanbase+=out.fanbase; m.careerStats.gigXP+=out.xp; m.careerStats.stress=Math.min(100,m.careerStats.stress+out.stress); m.needs.rest=Math.max(0,m.needs.rest-out.restLoss); m.needs.food=Math.max(0,m.needs.food-out.foodLoss); m.needs.water=Math.max(0,m.needs.water-out.waterLoss); m.needs.health=Math.max(0,m.needs.health-out.healthLoss); state.playerProfile.cash += out.cash;
    results.push({ id:uid('gigResult'), musicianId:m.id, title:`${m.name} finished ${gig.name}`, text:`${out.summary} Earned $${out.cash}. Fame +${out.fame}.`, createdAt:now });
  });
  state.activeGigs=state.activeGigs.filter(g=>g.endsAt>now); return results;
}
function resolveGigOutcome(m,gig){
  const genreMatch=(gig.genres||[]).includes(m.genreId)?12:0, roleFit=gig.roles.includes('any')||gig.roles.includes(m.currentRole)?12:0, apt=m.roleAptitudes?.[m.currentRole]||35, t=computeTraitMods(m.traitIds), mu=computeMutationMods(m.mutationIds);
  const score=m.baseStats.talent*.25+m.baseStats.charisma*.22+m.baseStats.technique*.2+m.baseStats.originality*.15+m.baseStats.resilience*.08+apt*.1+genreMatch+roleFit+(t.gigBonus||0)+(mu.gigBonus||0)-(t.gigPenalty||0);
  const quality=score+randInt(-18,18), cash=randInt(gig.payMin,gig.payMax)+Math.round((t.cashBonus||0)/2), fame=Math.max(1,Math.round(gig.fame+quality/35)), fanbase=Math.max(1,Math.round(gig.fame+quality/28)), xp=Math.max(3,Math.round(gig.tier*6+quality/30)), stress=Math.max(2,gig.stress-Math.round((t.gigStressReduction||0)/3)), restLoss=randInt(5,12), foodLoss=randInt(4,10), waterLoss=randInt(5,11), healthLoss=Math.max(0,randInt(0,gig.risk)-Math.round((mu.resilience||0)/8));
  let summary='The set was competent and sticky with potential.'; if(quality>110) summary='The crowd went feral in a profitable way.'; else if(quality>90) summary='A very strong performance with suspicious chemistry.'; else if(quality<60) summary='The venue survived. Barely.'; else if(quality<40) summary='A rough set, but at least somebody paid.';
  return {cash,fame,fanbase,xp,stress,restLoss,foodLoss,waterLoss,healthLoss,summary};
}
