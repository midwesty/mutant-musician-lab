import { getDataStore } from './state.js';
import { pick, uid } from './utils.js';
import { applyDirectEffects } from './needs.js';
export function maybeTriggerRandomEvent(m, state, now){
  if(m.isDead||m.isFrozen) return null;
  const hours=Math.max(0,(now-(m.lastEventAt||m.createdAt))/36e5); if(hours<1.5) return null;
  let chance=Math.min(.7, hours*.14); if(m.stage==='teen') chance+=.08; if(m.stage==='adult') chance+=.06; if(Math.random()>chance) return null;
  const pool=(getDataStore().events?.events||[]).filter(e=>e.stage.includes(m.stage)); const event=pick(pool); if(!event) return null;
  m.lastEventAt=now; applyDirectEffects(m, event.effects||{}); if(event.effects?.cash) state.playerProfile.cash += event.effects.cash;
  return { id:uid('evt'), musicianId:m.id, type:event.type, title:event.name, text:event.text.replace('{name}',m.name), createdAt:now };
}
