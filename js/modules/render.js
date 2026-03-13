import { NEED_KEYS, STAGE_CONFIG } from './constants.js';
import { formatMoney, formatClock, formatDateTime, getAgeHours } from './utils.js';
import { getMutationObjects } from './mutations.js';
import { getTraitObjects } from './traits.js';

const $=sel=>document.querySelector(sel);

export function renderApp(state, data){
  const selected=getSelectedMusician(state);
  $('#cashValue').textContent=formatMoney(state.playerProfile.cash);
  $('#clockValue').textContent=formatClock(state.clockState.currentTime);
  $('#alertCount').textContent=String(state.notifications.length);
  renderSelectedHeader(selected, data);
  renderMeters(selected);
  renderStatusCards(selected, state, data);
  renderScene(selected, data);
}

export function getSelectedMusician(state){
  return state.musicians.find(m=>m.id===state.playerProfile.selectedMusicianId) || state.musicians[0] || null;
}

function renderSelectedHeader(m, data){
  const nameEl=$('#selectedName'), metaEl=$('#selectedMeta');
  if(!m){ nameEl.textContent='No Active Musician'; metaEl.textContent='Open the lab to create one.'; return; }
  const stageLabel=STAGE_CONFIG.find(s=>s.id===m.stage)?.label || m.stage;
  const gig = m.currentGigId ? ' · On Gig' : '';
  nameEl.textContent=m.name;
  metaEl.textContent=`${stageLabel} · ${data.roles.find(r=>r.id===m.currentRole)?.name || m.currentRole} · ${data.genres.find(g=>g.id===m.genreId)?.name || m.genreId}${gig}`;
}
function renderMeters(m){
  const root=$('#needMeters');
  if(!m){ root.innerHTML='<div class="meter-card">No musician selected.</div>'; return; }
  root.innerHTML=NEED_KEYS.map(key=>{
    const v=Math.round(m.needs[key]||0); const klass=v<30?'meter-low':v<65?'meter-mid':'meter-good';
    return `<div class="meter-card ${klass}"><div class="meter-head"><span>${labelForNeed(key)}</span><strong>${v}%</strong></div><div class="meter-bar"><div class="meter-fill" style="width:${v}%"></div></div></div>`;
  }).join('');
}
function renderStatusCards(m, state, data){
  const root=$('#statusCards');
  if(!m){ root.innerHTML='<div class="status-card">No musician selected.</div>'; return; }
  const ageHours=getAgeHours(m.createdAt, state.clockState.currentTime);
  const muts=getMutationObjects(m.mutationIds).map(x=>x.name);
  const traits=getTraitObjects(m.traitIds).map(x=>x.name);
  const gig = state.activeGigs.find(g=>g.id===m.currentGigId);
  root.innerHTML=`
    <div class="status-card">
      <div class="between"><strong>Career</strong><span class="small">Gen ${m.generation}</span></div>
      <div class="small">Age: ${ageHours.toFixed(1)}h</div>
      <div class="small">Fame ${m.careerStats.fame} · Fans ${m.careerStats.fanbase} · XP ${m.careerStats.gigXP}</div>
      <div class="small">Stress ${m.careerStats.stress} · Chemistry ${m.careerStats.chemistry}</div>
      ${gig ? `<div class="small">Gig ends ${formatDateTime(gig.endsAt)}</div>` : ''}
    </div>
    <div class="status-card">
      <div><strong>Traits</strong></div>
      <div>${traits.map(t=>`<span class="badge tag-info">${t}</span>`).join('') || '<span class="small">None</span>'}</div>
    </div>
    <div class="status-card">
      <div><strong>Mutations</strong></div>
      <div>${muts.map(t=>`<span class="badge tag-good">${t}</span>`).join('') || '<span class="small">None</span>'}</div>
    </div>
    <div class="status-card">
      <div><strong>Role Fit</strong></div>
      <div class="small">Preferred: ${data.roles.find(r=>r.id===m.preferredRole)?.name || m.preferredRole}</div>
      <div class="small">Current: ${data.roles.find(r=>r.id===m.currentRole)?.name || m.currentRole}</div>
      <div class="small">Aptitude: ${Math.round(m.roleAptitudes?.[m.currentRole]||0)}%</div>
    </div>
  `;
}
function renderScene(m, data){
  const scene=$('#musicianScene'); const sprite=$('#musicianSprite'); const overlay=$('#statusOverlay'); const ticker=$('#eventTicker');
  scene.className=`musician-scene stage-${m?.stage || 'embryo'}`;
  sprite.className='musician-sprite';
  if(!m){ overlay.classList.add('hidden'); ticker.textContent='No incidents yet.'; return; }
  const v=m.visuals||{};
  sprite.classList.add(`body-${v.bodyClass||'bestial'}`, `eye-${v.eyeClass||'cute'}`, `hair-${v.hairClass||'cute'}`, `inst-${v.instrumentClass||'vocalist'}`);
  if(v.extraClass) sprite.classList.add(`extra-${v.extraClass}`);
  overlay.classList.remove('hidden');
  if(m.isDead){ overlay.textContent='DEAD'; overlay.className='status-overlay'; }
  else if(m.isFrozen){ overlay.textContent='FROZEN'; overlay.className='status-overlay'; }
  else if(m.isCritical){ overlay.textContent='CRITICAL'; overlay.className='status-overlay'; }
  else if(m.currentGigId){ overlay.textContent='ON GIG'; overlay.className='status-overlay'; }
  else { overlay.textContent=(STAGE_CONFIG.find(s=>s.id===m.stage)?.label || m.stage).toUpperCase(); overlay.className='status-overlay'; }
  const genre=data.genres.find(g=>g.id===m.genreId)?.subtitle || m.genreId;
  ticker.textContent=`${genre} · Vice: ${data.vices.find(v=>v.id===m.viceId)?.name || m.viceId} · Role: ${data.roles.find(r=>r.id===m.currentRole)?.name || m.currentRole}`;
}
function labelForNeed(key){
  return ({food:'Food',water:'Water',rest:'Rest',mood:'Mood',inspiration:'Inspiration',vice:'Vice',cleanliness:'Cleanliness',health:'Health'})[key] || key;
}
