export const clamp=(v,min=0,max=100)=>Math.min(max,Math.max(min,v));
export const randInt=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
export const pick=(arr=[])=>arr[Math.floor(Math.random()*arr.length)];
export function sample(arr=[],count=1){ const c=[...arr], out=[]; while(c.length&&out.length<count){ out.push(c.splice(Math.floor(Math.random()*c.length),1)[0]); } return out; }
export const uid=(p='id')=>`${p}_${Math.random().toString(36).slice(2,10)}_${Date.now().toString(36)}`;
export const deepClone=v=>JSON.parse(JSON.stringify(v));
export const formatMoney=v=>`$${Number(v||0).toFixed(0)}`;
export const formatClock=ts=>new Date(ts).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
export function formatDateTime(ts){ return new Date(ts).toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'}); }
export function formatDurationMinutes(mins){ mins=Math.max(0,Math.round(mins)); const h=Math.floor(mins/60), m=mins%60; return h&&m?`${h}h ${m}m`:h?`${h}h`:`${m}m`; }
export const safeJSONParse=(text,fallback=null)=>{ try{return JSON.parse(text);}catch{return fallback;} };
export const titleCase=(s='')=>s.replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
export const getAgeHours=(createdAt, now)=>Math.max(0,(now-createdAt)/36e5);
