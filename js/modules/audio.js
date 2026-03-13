import { getState, getDataStore } from './state.js';
const cache=new Map();
function beep(freq=220,dur=.04){
  const AudioCtx=window.AudioContext||window.webkitAudioContext; if(!AudioCtx) return;
  const ctx=beep.ctx||(beep.ctx=new AudioCtx()); const osc=ctx.createOscillator(); const gain=ctx.createGain();
  osc.frequency.value=freq; osc.type='square'; gain.gain.value=.02; osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+dur);
}
export function playSound(key){
  if(!getState().settings.audioEnabled) return;
  const src=getDataStore().audioMap?.[key];
  try{
    if(!src) throw new Error('no src');
    if(!cache.has(src)){ const a=new Audio(src); a.preload='auto'; cache.set(src,a); }
    const clone=cache.get(src).cloneNode(); clone.volume=.35; clone.play().catch(()=>fallback(key));
  }catch{ fallback(key); }
}
function fallback(key){ const map={uiClick:320,success:460,error:180,alert:620,battle:260,mutation:520,revive:500}; beep(map[key]||280); }
