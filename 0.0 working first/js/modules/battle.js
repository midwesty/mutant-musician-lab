import { computeTraitMods } from './traits.js';
import { computeMutationMods } from './mutations.js';
import { randInt, uid, safeJSONParse } from './utils.js';
function signatureMove(role){ return ({vocalist:'Shattering Chorus',guitarist:'Feedback Swipe',bassist:'Low-End Collapse',drummer:'Tom Barrage',keys:'Arpeggio Melt',strings:'Bow of Sorrow',noise_artist:'Static Flood',producer:'Compression Curse'})[role]||'Unlicensed Groove'; }
export function buildBattleExport(m){ return { exportType:'mutant-musician-battle-v1', name:m.name, stage:m.stage, preferredRole:m.preferredRole, currentRole:m.currentRole, genreId:m.genreId, viceId:m.viceId, stats:m.baseStats, careerStats:m.careerStats, traitIds:m.traitIds, mutationIds:m.mutationIds, visuals:m.visuals, signatureMove:signatureMove(m.currentRole) }; }
export function parseBattleImport(text){ const parsed=safeJSONParse(text); return (!parsed||parsed.exportType!=='mutant-musician-battle-v1') ? {ok:false,message:'Invalid battle JSON.'} : {ok:true,data:parsed}; }
function powerFromStats(stats, traitIds, mutationIds, fame){ const t=computeTraitMods(traitIds), m=computeMutationMods(mutationIds); return (stats.talent||40)+(stats.charisma||40)+(stats.technique||40)+(stats.originality||40)+(stats.weirdness||40)+(t.battleBonus||0)+(m.battleBonus||0)+Math.round((fame||0)/2); }
export function runBattle(local, imported){
  const a={ name:local.name, power:powerFromStats(local.baseStats, local.traitIds, local.mutationIds, local.careerStats?.fame) }, b={ name:imported.name||'Imported Opponent', power:powerFromStats(imported.stats||{}, imported.traitIds||[], imported.mutationIds||[], imported.careerStats?.fame) };
  let aHP=100,bHP=100; const rounds=[]; for(let i=1;i<=5;i++){ const ah=Math.max(3,Math.round(a.power/16)+randInt(-6,10)), bh=Math.max(3,Math.round(b.power/16)+randInt(-6,10)); bHP-=ah; aHP-=bh; rounds.push(`Round ${i}: ${a.name} lands ${ah}. ${b.name} returns ${bh}.`); if(aHP<=0||bHP<=0) break; }
  const winner=aHP===bHP?(a.power>=b.power?a.name:b.name):(aHP>bHP?a.name:b.name); return { id:uid('battle'), title:`${a.name} vs ${b.name}`, winner, rounds, summary:`${winner} wins the music battle by a narrow spray of sweat and ego.`, localRemaining:Math.max(0,aHP), remoteRemaining:Math.max(0,bHP) };
}
