import { formatDateTime, formatMoney, titleCase } from './utils.js';
import { getSelectedMusician } from './render.js';

let callbacks = {};
const $=sel=>document.querySelector(sel);

export function registerUIHandlers(cbs){ callbacks=cbs; }

export function bindGlobalUI(){
  document.addEventListener('click', (e)=>{
    const actionBtn=e.target.closest('[data-action]');
    if(actionBtn){ callbacks.handleAction?.(actionBtn.dataset.action, actionBtn); }
    if(e.target.closest('[data-close-modal]')) closeModal();
    const modalAction=e.target.closest('[data-modal-action]');
    if(modalAction){ callbacks.handleModalAction?.(modalAction.dataset.modalAction, modalAction); }
  });
}

export function showToast(text, type='good'){
  const root=$('#toastRoot'); const div=document.createElement('div'); div.className=`toast ${type}`; div.textContent=text; root.appendChild(div);
  setTimeout(()=>div.remove(), 3200);
}

export function closeModal(){ $('#modalRoot').innerHTML=''; }

export function openModal(title, bodyHTML, footerHTML=''){
  const tpl=$('#modalTemplate');
  const node=tpl.content.firstElementChild.cloneNode(true);
  node.querySelector('.modal-title').textContent=title;
  node.querySelector('.modal-body').innerHTML=bodyHTML;
  node.querySelector('.modal-footer').innerHTML=footerHTML;
  const root=$('#modalRoot'); root.innerHTML=''; root.appendChild(node);
}

export function openStarterModal(kits){
  openModal('Choose Your Starter Kit', `
    <div class="notice">Pick a kit, then the game immediately gives you the option to hatch more embryos. You can manage several at once.</div>
    <div class="modal-grid">
      ${kits.map(kit=>`
        <div class="choice-tile">
          <h3>${kit.name}</h3>
          <p>${kit.description}</p>
          <div class="small">Genre seed: ${titleCase(kit.options.genre)} · Role seed: ${titleCase(kit.options.role)}</div>
          <button data-modal-action="pickStarter" data-kit-id="${kit.id}">Use This Kit</button>
        </div>`).join('')}
    </div>`, `<button data-close-modal>Later</button>`);
}

export function openCreationModal(catalog, inventory, archive){
  const select = (name, list) => `
    <label>${titleCase(name)}
      <select name="${name}">
        ${list.map(item=>`<option value="${item.id}">${item.name}${item.subtitle ? ` — ${item.subtitle}`:''}</option>`).join('')}
      </select>
    </label>`;
  const bonusOptions = inventory.filter(i=>['creation_bonus'].includes((callbacks.getItemType?.(i.id))||'')).map(i=>`<option value="${i.id}">${callbacks.getItemName?.(i.id)} (x${i.qty})</option>`).join('');
  openModal('Creation Lab', `
    <div class="notice">Build a new embryo. Every choice influences role fit, traits, mutations, and creature-vs-humanoid flavor.</div>
    <form id="creationForm" class="modal-grid">
      ${select('biomass', catalog.biomass)}
      ${select('body', catalog.body)}
      ${select('neural', catalog.neural)}
      ${select('genre', catalog.genres)}
      ${select('vice', catalog.vices)}
      ${select('catalyst', catalog.catalysts)}
      ${select('role', catalog.roles)}
      <label>Optional Bonus DNA Item
        <select name="bonusItem"><option value="">None</option>${bonusOptions}</select>
      </label>
      ${archive.length >= 2 ? `<label>Optional Archive Splice Parent A<select name="spliceA"><option value="">None</option>${archive.map(d=>`<option value="${d.dnaId}">${d.name} · ${titleCase(d.preferredRole||'')}</option>`).join('')}</select></label>
      <label>Optional Archive Splice Parent B<select name="spliceB"><option value="">None</option>${archive.map(d=>`<option value="${d.dnaId}">${d.name} · ${titleCase(d.preferredRole||'')}</option>`).join('')}</select></label>` : ''}
    </form>`,
    `<button data-close-modal>Cancel</button><button data-modal-action="createEmbryo">Create Embryo</button>`);
}

export function openRosterModal(state, data){
  const selected=getSelectedMusician(state);
  openModal('Roster', `
    <div class="notice">You can keep multiple active musicians. Frozen ones do not decay. Adults can gig. Anyone can die if ignored.</div>
    <div class="list-stack">
      ${state.musicians.map(m=>`
        <div class="roster-card">
          <div class="between"><strong>${m.name}</strong><span class="small">${titleCase(m.stage)} · ${data.roles.find(r=>r.id===m.currentRole)?.name || m.currentRole}</span></div>
          <div class="small">${data.genres.find(g=>g.id===m.genreId)?.name || m.genreId} · Food ${Math.round(m.needs.food)} · Health ${Math.round(m.needs.health)}</div>
          <div class="row">
            ${m.isDead ? '<span class="badge tag-danger">Dead</span>' : ''}
            ${m.isFrozen ? '<span class="badge">Frozen</span>' : ''}
            ${selected?.id===m.id ? '<span class="badge tag-info">Selected</span>' : ''}
            ${m.currentGigId ? '<span class="badge tag-good">On Gig</span>' : ''}
          </div>
          <div class="row">
            <button data-modal-action="selectMusician" data-musician-id="${m.id}">Select</button>
            <button data-modal-action="toggleFreezeRoster" data-musician-id="${m.id}">${m.isFrozen?'Thaw':'Freeze'}</button>
            ${!m.isDead ? `<button data-modal-action="snapshotDNA" data-musician-id="${m.id}">Snapshot DNA</button>` : ''}
            ${m.stage==='adult' ? `<button data-modal-action="setRole" data-musician-id="${m.id}">Change Role</button>` : ''}
          </div>
        </div>`).join('') || '<div class="roster-card">No musicians yet.</div>'}
    </div>`, `<button data-close-modal>Close</button>`);
}

export function openInfoModal(m, data){
  if(!m){ openModal('Info', '<div class="notice">No musician selected.</div>', '<button data-close-modal>Close</button>'); return; }
  openModal(`${m.name} — Full Info`, `
    <div class="grid-two">
      <div class="event-card">
        <strong>Identity</strong>
        <div class="small">Stage: ${titleCase(m.stage)}</div>
        <div class="small">Genre: ${data.genres.find(g=>g.id===m.genreId)?.name || m.genreId}</div>
        <div class="small">Vice: ${data.vices.find(v=>v.id===m.viceId)?.name || m.viceId}</div>
        <div class="small">Preferred role: ${data.roles.find(r=>r.id===m.preferredRole)?.name || m.preferredRole}</div>
        <div class="small">Generation: ${m.generation}</div>
      </div>
      <div class="event-card">
        <strong>Base Stats</strong>
        ${Object.entries(m.baseStats).map(([k,v])=>`<div class="small">${titleCase(k)}: ${Math.round(v)}</div>`).join('')}
      </div>
      <div class="event-card">
        <strong>Traits</strong>
        ${m.traitIds.map(id=>`<span class="badge tag-info">${data.traits.traits.find(t=>t.id===id)?.name || id}</span>`).join('') || '<div class="small">None</div>'}
      </div>
      <div class="event-card">
        <strong>Mutations</strong>
        ${m.mutationIds.map(id=>`<span class="badge tag-good">${data.mutations.mutations.find(t=>t.id===id)?.name || id}</span>`).join('') || '<div class="small">None</div>'}
      </div>
    </div>`, `<button data-close-modal>Close</button>`);
}

export function openInventoryModal(state, data, selected){
  openModal('Inventory', `
    <div class="list-stack">
      ${state.inventory.map(entry=>{
        const item=data.items.items.find(i=>i.id===entry.id);
        return `<div class="shop-item">
          <div class="between"><strong>${item?.name || entry.id}</strong><span>x${entry.qty}</span></div>
          <div class="small">${item?.description || ''}</div>
          <div class="row">${selected ? `<button data-modal-action="useItem" data-item-id="${entry.id}">Use on ${selected.name}</button>`:''}</div>
        </div>`;
      }).join('') || '<div class="shop-item">Inventory empty.</div>'}
    </div>`, `<button data-close-modal>Close</button>`);
}

export function openShopModal(state, data){
  openModal('Shop', `
    <div class="notice">Money comes from gigs. Some items are consumables, some are upgrades, and some are DNA weirdness for future embryos.</div>
    <div class="list-stack">
      ${data.items.items.map(item=>`
        <div class="shop-item">
          <div class="between"><strong>${item.name}</strong><span>${formatMoney(item.cost)}</span></div>
          <div class="small">${item.description}</div>
          <div class="small">Type: ${titleCase(item.type)}</div>
          <button data-modal-action="buyItem" data-item-id="${item.id}">Buy</button>
        </div>`).join('')}
    </div>`, `<button data-close-modal>Close</button>`);
}

export function openGigsModal(state, data){
  openModal('Gig Board', `
    <div class="notice">Adults can only do one active gig at a time. Gigs resolve on real-world timers.</div>
    <div class="list-stack">
      ${state.gigBoard.map(g=>`
        <div class="gig-card">
          <div class="between"><strong>${g.name}</strong><span>${formatMoney(g.payMin)}–${formatMoney(g.payMax)}</span></div>
          <div class="small">Duration ${g.durationMin}m · Fame ${g.fame} · Stress ${g.stress} · Expires ${formatDateTime(g.expiresAt)}</div>
          <div class="small">Genres: ${(g.genres||[]).join(', ')}</div>
          <button data-modal-action="assignGigPrompt" data-gig-board-id="${g.boardId}">Assign Musician</button>
        </div>`).join('') || '<div class="gig-card">No gigs right now.</div>'}
    </div>`, `<button data-close-modal>Close</button>`);
}

export function openAssignGigModal(state, data, gigBoardId){
  const adults=state.musicians.filter(m=>!m.isDead && !m.isFrozen && m.stage==='adult' && !m.currentGigId);
  const gig=state.gigBoard.find(g=>g.boardId===gigBoardId);
  openModal(`Assign Gig — ${gig?.name || ''}`, `
    <div class="list-stack">
      ${adults.map(m=>`
        <div class="roster-card">
          <div class="between"><strong>${m.name}</strong><span>${data.roles.find(r=>r.id===m.currentRole)?.name || m.currentRole}</span></div>
          <div class="small">Aptitude ${Math.round(m.roleAptitudes?.[m.currentRole]||0)}% · Fame ${m.careerStats.fame}</div>
          <button data-modal-action="assignGig" data-gig-board-id="${gigBoardId}" data-musician-id="${m.id}">Send</button>
        </div>`).join('') || '<div class="roster-card">No available adults.</div>'}
    </div>`, `<button data-close-modal>Close</button>`);
}

export function openDNAModal(state, data){
  openModal('DNA Archive', `
    <div class="notice">Every created musician leaves behind a DNA record. Rebirth clones use base DNA. Snapshot DNA stores a more exact current state.</div>
    <div class="list-stack">
      ${state.dnaArchive.map(d=>`
        <div class="archive-card">
          <div class="between"><strong>${d.name}</strong><span class="small">Gen ${d.generation || 1}</span></div>
          <div class="small">${data.genres.find(g=>g.id===d.genreId)?.name || d.genreId} · ${data.roles.find(r=>r.id===d.preferredRole)?.name || d.preferredRole}</div>
          <div class="small">${d.snapshotDNA ? 'Snapshot Saved' : 'Base DNA Only'}</div>
          <div class="row">
            <button data-modal-action="rebirthFromDNA" data-dna-id="${d.dnaId}">Rebirth</button>
          </div>
        </div>`).join('') || '<div class="archive-card">No DNA records yet.</div>'}
    </div>`, `<button data-close-modal>Close</button>`);
}

export function openBattleModal(state, data, selected){
  openModal('Battle / Practice', `
    <div class="grid-two">
      <div class="battle-card">
        <strong>Export Selected Battle JSON</strong>
        <div class="small">Send this JSON to a friend so their browser can import it.</div>
        <textarea id="battleExportBox" readonly>${selected ? callbacks.getBattleExport?.(selected) || '' : ''}</textarea>
        <button data-modal-action="copyBattleExport">Copy Export</button>
      </div>
      <div class="battle-card">
        <strong>Import Opponent JSON</strong>
        <textarea id="battleImportBox" placeholder="Paste battle JSON here"></textarea>
        <div class="row">
          <button data-modal-action="runBattleImport">Run Battle</button>
          <button data-modal-action="practicePrompt">Practice With One Of Mine</button>
        </div>
      </div>
    </div>`, `<button data-close-modal>Close</button>`);
}

export function openPracticeModal(state, selected){
  const others=state.musicians.filter(m=>m.id!==selected?.id && !m.isDead && !m.isFrozen);
  openModal('Practice Partner', `
    <div class="list-stack">
      ${others.map(m=>`
        <div class="roster-card">
          <div class="between"><strong>${m.name}</strong><span class="small">${titleCase(m.stage)}</span></div>
          <button data-modal-action="runPracticePair" data-musician-id="${m.id}">Practice Together</button>
        </div>`).join('') || '<div class="roster-card">No partner available.</div>'}
    </div>`, `<button data-close-modal>Close</button>`);
}

export function openCheatsModal(){
  const cheats=[['money','Add $500'],['maxNeeds','Max Needs'],['heal','Heal Selected'],['ageUp','Age Up 1 Day'],['adult','Force Adult'],['mutation','Force Mutation'],['spawn','Spawn Random'],['revive','Revive Selected'],['freezeTime','Freeze Time'],['fastTime','Toggle 10x Time']];
  openModal('Cheat Terminal', `
    <div class="notice">These are intentionally exposed for testing and sandbox play.</div>
    <div class="grid-three">
      ${cheats.map(([id,label])=>`<button data-modal-action="runCheat" data-cheat-code="${id}">${label}</button>`).join('')}
    </div>`, `<button data-close-modal>Close</button>`);
}

export function openSettingsModal(state){
  openModal('Settings', `
    <div class="row">
      <label class="row"><input id="audioToggle" type="checkbox" ${state.settings.audioEnabled?'checked':''}> Audio enabled</label>
    </div>
    <div class="small">Tick rate while open: ${state.settings.fastTickSeconds}s autosave cadence.</div>
    <div class="row">
      <button data-modal-action="saveSettings">Save Settings</button>
      <button data-modal-action="hardSave">Save Now</button>
      <button data-modal-action="wipeSave">Wipe Save</button>
    </div>`, `<button data-close-modal>Close</button>`);
}

export function promptRoleChange(musician, roles){
  openModal(`Change Role — ${musician.name}`, `
    <div class="list-stack">
      ${roles.map(r=>`
        <div class="roster-card">
          <div class="between"><strong>${r.name}</strong><span>Aptitude ${Math.round(musician.roleAptitudes?.[r.id]||0)}%</span></div>
          <button data-modal-action="applyRoleChange" data-musician-id="${musician.id}" data-role-id="${r.id}">Assign</button>
        </div>`).join('')}
    </div>`, `<button data-close-modal>Close</button>`);
}
