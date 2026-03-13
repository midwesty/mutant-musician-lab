import { randInt } from './utils.js';
export function runPractice(a,b=null){
  const bonus=b?6:3, chem=b?randInt(1,5):0;
  a.careerStats.gigXP += randInt(4,8)+bonus; a.needs.inspiration=Math.min(100,a.needs.inspiration+randInt(8,15)); a.needs.rest=Math.max(0,a.needs.rest-randInt(5,9)); a.careerStats.stress=Math.min(100,a.careerStats.stress+randInt(1,4));
  if(b){ b.careerStats.gigXP += randInt(4,8)+bonus; b.needs.inspiration=Math.min(100,b.needs.inspiration+randInt(8,15)); b.needs.rest=Math.max(0,b.needs.rest-randInt(5,9)); b.careerStats.chemistry += chem; a.careerStats.chemistry += chem; }
  return { summary:b?`${a.name} and ${b.name} rehearse in a sweaty burst of accidental growth.`:`${a.name} practices alone until the room smells like effort.` };
}
