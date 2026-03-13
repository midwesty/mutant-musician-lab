import { mutateState, getState } from './state.js';
export function applyElapsedTime(){
  const state=getState(); const now=Date.now(); const last=state.clockState.lastSavedAt||now; const elapsed=Math.max(0, now-last);
  mutateState(s=>{ s.clockState.currentTime=now; s.clockState.lastSavedAt=now; s.clockState.elapsedMs=elapsed; });
  return elapsed;
}
export function tickClock(){
  mutateState(s=>{ if(s.clockState.freezeTime) return; s.clockState.currentTime += 1000*(s.clockState.speedMultiplier||1); });
}
export const getNow=()=>getState().clockState.currentTime||Date.now();
