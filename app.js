// Paste your Google Apps Script Web App URL here when you are ready to collect entries.
const SCRIPT_URL = 'https://script.google.com/macros/s/insert/exec'; // e.g. https://script.google.com/macros/s/xxxxx/exec
let currentStep = 0;
const steps = [...document.querySelectorAll('.step')];
const form = document.getElementById('predictionForm');
console.log('World Cup predictor app loaded - no email version v3');

const el = id => document.getElementById(id);
const safe = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function showMessage(msg){ const status = el('status'); if(status) status.textContent = msg; else alert(msg); }
function clearMessage(){ const status = el('status'); if(status) status.textContent = ''; }
function getRandomSweepstakeTeam(){ return ALL_TEAMS[Math.floor(Math.random() * ALL_TEAMS.length)]; }
function showSweepstakeResult(team){
  const box = el('sweepstakeResult');
  if(!box) return;
  const flag = (typeof TEAM_FLAGS !== 'undefined' && TEAM_FLAGS[team]) ? TEAM_FLAGS[team] : '🏳️';
  box.hidden = false;
  box.innerHTML = `<div class="flag">${flag}</div><div><span>Your random sweepstake team is</span><strong>${safe(team)}</strong><small>If they win the World Cup, you get a bonus 25 points.</small></div>`;
}

function radioName(prefix, id){ return `${prefix}_${id}`; }
function getGroupMatches(group){ return MATCHES.filter(m => m.group === group); }
function getChecked(name){ return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(x=>x.value); }

function render() {
  renderMatches();
  renderScorePredictions();
  renderKnockout();
  renderGroupedTeamCheckboxes('topScoringTeams','most_goals_for');
  renderGroupedTeamCheckboxes('topConcedingTeams','most_goals_against');
  renderPlayers();
  renderBonus();
  showStep(0);
}

function renderMatches(){
  el('matchPredictions').innerHTML = Object.entries(GROUPS).map(([group]) =>
    `<h3>Group ${group}</h3>` + getGroupMatches(group).map(m => `
      <div class="match">
        <strong>${safe(m.home)} v ${safe(m.away)}</strong>
        <div class="options">
          <label class="pill"><input required checked type="radio" name="${radioName('match',m.id)}" value="${safe(m.home)}">${safe(m.home)}</label>
          <label class="pill"><input type="radio" name="${radioName('match',m.id)}" value="${safe(m.away)}">${safe(m.away)}</label>
          <label class="pill"><input type="radio" name="${radioName('match',m.id)}" value="Draw">Draw</label>
        </div>
      </div>`).join('')
  ).join('');
}

function renderScorePredictions(){
  el('groupScores').innerHTML = Object.entries(GROUPS).map(([group]) => `
    <div class="mini-card score-group" data-group="${group}">
      <h3>Group ${group}</h3>
      <p class="muted">Enter one exact score prediction in this group.</p>
      ${getGroupMatches(group).map(m => `
        <div class="score-row">
          <span>${safe(m.home)}</span>
          <input type="number" min="0" inputmode="numeric" name="score_${m.id}_${safe(m.home)}" aria-label="${safe(m.home)} goals">
          <span class="score-sep">–</span>
          <input type="number" min="0" inputmode="numeric" name="score_${m.id}_${safe(m.away)}" aria-label="${safe(m.away)} goals">
          <span>${safe(m.away)}</span>
        </div>`).join('')}
    </div>`).join('');
}

function groupedCheckboxHtml(name, teamsByGroup, checkedSet = new Set()){
  return Object.entries(teamsByGroup).map(([group, teams]) => `
    <div class="group-block" data-group="${group}">
      <h4>Group ${group}</h4>
      <div class="checkbox-grid">
        ${teams.map(t => `<label class="pill"><input type="checkbox" name="${name}" value="${safe(t)}" ${checkedSet.has(t) ? 'checked' : ''}>${safe(t)}</label>`).join('')}
      </div>
    </div>`).join('');
}

function knockoutStageHtml(key, title, count, teams, helper, grouped=false){
  const body = grouped ? groupedCheckboxHtml(key, GROUPS) : `<div class="checkbox-grid">${teams.map(t=>`<label class="pill"><input type="checkbox" name="${key}" value="${safe(t)}">${safe(t)}</label>`).join('')}</div>`;
  return `<div class="mini-card knockout-stage" data-stage="${key}"><h3>${title}</h3><p class="muted">${helper}</p><p class="counter" id="${key}_counter">0 / ${count} selected</p>${body}</div>`;
}

const ROUND32_MATCHES = [
  {id:73, a:{type:'rank', group:'A', rank:'runner'}, b:{type:'rank', group:'B', rank:'runner'}},
  {id:74, a:{type:'rank', group:'E', rank:'winner'}, b:{type:'third', groups:['A','B','C','D','F']}},
  {id:75, a:{type:'rank', group:'F', rank:'winner'}, b:{type:'rank', group:'C', rank:'runner'}},
  {id:76, a:{type:'rank', group:'C', rank:'winner'}, b:{type:'rank', group:'F', rank:'runner'}},
  {id:77, a:{type:'rank', group:'I', rank:'winner'}, b:{type:'third', groups:['C','D','F','G','H']}},
  {id:78, a:{type:'rank', group:'E', rank:'runner'}, b:{type:'rank', group:'I', rank:'runner'}},
  {id:79, a:{type:'rank', group:'A', rank:'winner'}, b:{type:'third', groups:['C','E','F','H','I']}},
  {id:80, a:{type:'rank', group:'L', rank:'winner'}, b:{type:'third', groups:['E','H','I','J','K']}},
  {id:81, a:{type:'rank', group:'D', rank:'winner'}, b:{type:'third', groups:['B','E','F','I','J']}},
  {id:82, a:{type:'rank', group:'G', rank:'winner'}, b:{type:'third', groups:['A','E','H','I','J']}},
  {id:83, a:{type:'rank', group:'K', rank:'runner'}, b:{type:'rank', group:'L', rank:'runner'}},
  {id:84, a:{type:'rank', group:'H', rank:'winner'}, b:{type:'rank', group:'J', rank:'runner'}},
  {id:85, a:{type:'rank', group:'B', rank:'winner'}, b:{type:'third', groups:['E','F','G','I','J']}},
  {id:86, a:{type:'rank', group:'J', rank:'winner'}, b:{type:'rank', group:'H', rank:'runner'}},
  {id:87, a:{type:'rank', group:'K', rank:'winner'}, b:{type:'third', groups:['D','E','I','J','L']}},
  {id:88, a:{type:'rank', group:'D', rank:'runner'}, b:{type:'rank', group:'G', rank:'runner'}}
];
const ROUND16_PAIRS = [[73,75],[74,77],[76,78],[79,80],[83,84],[81,82],[86,88],[85,87]];

function renderKnockout(){
  el('knockoutPicks').innerHTML = `
    ${knockoutStageHtml('round32','Round of 32 qualifiers',32,ALL_TEAMS,'Choose 2 or 3 teams from each group, and exactly 32 teams overall.', true)}
    <div id="groupRankingsWrap"></div>
    <div id="bracketWrap"></div>`;
  updateKnockoutFlow();
}

function selectedByGroup(){
  const picked = new Set(getChecked('round32'));
  const out = {};
  Object.entries(GROUPS).forEach(([group, teams]) => out[group] = teams.filter(t => picked.has(t)));
  return out;
}

function uniqueSelectValue(name, fallback){
  const field = form.elements[name];
  return field && field.value ? field.value : fallback;
}

function getGroupPlacings(){
  const byGroup = selectedByGroup();
  const placings = {};
  Object.entries(byGroup).forEach(([group, teams]) => {
    const winner = uniqueSelectValue(`rank_${group}_winner`, teams[0] || '');
    const runner = uniqueSelectValue(`rank_${group}_runner`, teams.find(t => t !== winner) || teams[1] || '');
    const third = teams.length === 3 ? uniqueSelectValue(`rank_${group}_third`, teams.find(t => t !== winner && t !== runner) || teams[2] || '') : '';
    placings[group] = {winner, runner, third};
  });
  return placings;
}

function renderGroupRankings(){
  const byGroup = selectedByGroup();
  const wrap = el('groupRankingsWrap');
  const enough = getChecked('round32').length === 32 && Object.values(byGroup).every(teams => teams.length >= 2 && teams.length <= 3);
  if(!enough){ wrap.innerHTML = ''; return; }
  const previous = {};
  Object.keys(GROUPS).forEach(group => {
    previous[group] = {
      winner: form.elements[`rank_${group}_winner`]?.value || '',
      runner: form.elements[`rank_${group}_runner`]?.value || '',
      third: form.elements[`rank_${group}_third`]?.value || ''
    };
  });
  wrap.innerHTML = `<div class="mini-card"><h3>Group finishing positions</h3><p class="muted">For each group, put your qualifiers into the positions used by the official knockout bracket. These choices create the draw below.</p>${Object.entries(byGroup).map(([group, teams]) => {
    const options = teams.map(t => `<option value="${safe(t)}">${safe(t)}</option>`).join('');
    return `<div class="ranking-row" data-group="${group}"><strong>Group ${group}</strong>
      <label>Winner<select name="rank_${group}_winner">${options}</select></label>
      <label>Runner-up<select name="rank_${group}_runner">${options}</select></label>
      ${teams.length === 3 ? `<label>Third place<select name="rank_${group}_third">${options}</select></label>` : `<span class="muted">No third-place qualifier picked</span>`}
    </div>`;
  }).join('')}</div>`;
  Object.entries(byGroup).forEach(([group, teams]) => {
    const w = form.elements[`rank_${group}_winner`];
    const r = form.elements[`rank_${group}_runner`];
    const t = form.elements[`rank_${group}_third`];
    if(w) w.value = teams.includes(previous[group]?.winner) ? previous[group].winner : (teams[0] || '');
    if(r) r.value = teams.includes(previous[group]?.runner) ? previous[group].runner : (teams.find(team => team !== w?.value) || teams[1] || teams[0] || '');
    if(t) t.value = teams.includes(previous[group]?.third) ? previous[group].third : (teams.find(team => team !== w?.value && team !== r?.value) || teams[2] || teams[1] || teams[0] || '');
  });
}

function assignThirdPlaceGroups(thirdGroups){
  const thirdSlots = ROUND32_MATCHES.filter(m => m.a.type === 'third' || m.b.type === 'third').map(m => ({matchId:m.id, side:m.a.type === 'third' ? 'a' : 'b', groups:(m.a.type === 'third' ? m.a.groups : m.b.groups)}));
  const result = {};
  const used = new Set();
  const slots = [...thirdSlots].sort((x,y)=>x.groups.length-y.groups.length);
  function backtrack(i){
    if(i === slots.length) return true;
    const slot = slots[i];
    for(const g of thirdGroups){
      if(!used.has(g) && slot.groups.includes(g)){
        used.add(g); result[`${slot.matchId}_${slot.side}`] = g;
        if(backtrack(i+1)) return true;
        used.delete(g); delete result[`${slot.matchId}_${slot.side}`];
      }
    }
    return false;
  }
  backtrack(0);
  return result;
}

function slotTeam(slot, placings, thirdAssignments, matchId, side){
  if(slot.type === 'rank') return placings[slot.group]?.[slot.rank] || `${slot.rank} Group ${slot.group}`;
  const assignedGroup = thirdAssignments[`${matchId}_${side}`];
  return assignedGroup ? (placings[assignedGroup]?.third || `3rd Group ${assignedGroup}`) : `3rd Group ${slot.groups.join('/')}`;
}

function getRound32Draw(){
  const placings = getGroupPlacings();
  const thirdGroups = Object.entries(placings).filter(([,v]) => v.third).map(([g]) => g);
  const thirdAssignments = assignThirdPlaceGroups(thirdGroups);
  return ROUND32_MATCHES.map(m => ({ id:m.id, teamA:slotTeam(m.a, placings, thirdAssignments, m.id, 'a'), teamB:slotTeam(m.b, placings, thirdAssignments, m.id, 'b') }));
}

function matchRadio(name, teamA, teamB){
  const current = form.elements[name]?.value || '';
  return `<div class="bracket-match"><strong>${safe(teamA)} <span>v</span> ${safe(teamB)}</strong><div class="options">
    <label class="pill"><input type="radio" name="${name}" value="${safe(teamA)}" ${current === teamA ? 'checked' : ''}>${safe(teamA)}</label>
    <label class="pill"><input type="radio" name="${name}" value="${safe(teamB)}" ${current === teamB ? 'checked' : ''}>${safe(teamB)}</label>
  </div></div>`;
}

function getWinnersFor(prefix, ids){
  return ids.map(id => form.elements[`${prefix}_${id}`]?.value).filter(Boolean);
}

function renderBracket(){
  const wrap = el('bracketWrap');
  const byGroup = selectedByGroup();
  const enough = getChecked('round32').length === 32 && Object.values(byGroup).every(teams => teams.length >= 2 && teams.length <= 3);
  if(!enough){ wrap.innerHTML = ''; return; }
  const r32 = getRound32Draw();
  const r32Winners = getWinnersFor('ko32', r32.map(m=>m.id));
  const r16Matches = ROUND16_PAIRS.map((pair, idx) => ({id:89+idx, teamA:form.elements[`ko32_${pair[0]}`]?.value || `Winner Match ${pair[0]}`, teamB:form.elements[`ko32_${pair[1]}`]?.value || `Winner Match ${pair[1]}`}));
  const r16Winners = getWinnersFor('ko16', r16Matches.map(m=>m.id));
  const qfMatches = [[89,90],[93,94],[91,92],[95,96]].map((pair, idx) => ({id:97+idx, teamA:form.elements[`ko16_${pair[0]}`]?.value || `Winner Match ${pair[0]}`, teamB:form.elements[`ko16_${pair[1]}`]?.value || `Winner Match ${pair[1]}`}));
  const qfWinners = getWinnersFor('koqf', qfMatches.map(m=>m.id));
  const sfMatches = [[97,98],[99,100]].map((pair, idx) => ({id:101+idx, teamA:form.elements[`koqf_${pair[0]}`]?.value || `Winner Match ${pair[0]}`, teamB:form.elements[`koqf_${pair[1]}`]?.value || `Winner Match ${pair[1]}`}));
  const sfWinners = getWinnersFor('kosf', sfMatches.map(m=>m.id));
  const finalMatch = {id:104, teamA:form.elements['kosf_101']?.value || 'Winner Match 101', teamB:form.elements['kosf_102']?.value || 'Winner Match 102'};
  wrap.innerHTML = `<div class="mini-card bracket-card"><h3>Knockout draw</h3><p class="muted">Pick one winner from each tie. Later rounds unlock from the winners you choose.</p>
    <h4>Round of 32</h4><div class="bracket-grid">${r32.map(m => matchRadio(`ko32_${m.id}`, m.teamA, m.teamB)).join('')}</div>
    ${r32Winners.length === 16 ? `<h4>Last 16</h4><div class="bracket-grid">${r16Matches.map(m => matchRadio(`ko16_${m.id}`, m.teamA, m.teamB)).join('')}</div>` : ''}
    ${r16Winners.length === 8 ? `<h4>Quarter-finals</h4><div class="bracket-grid">${qfMatches.map(m => matchRadio(`koqf_${m.id}`, m.teamA, m.teamB)).join('')}</div>` : ''}
    ${qfWinners.length === 4 ? `<h4>Semi-finals</h4><div class="bracket-grid">${sfMatches.map(m => matchRadio(`kosf_${m.id}`, m.teamA, m.teamB)).join('')}</div>` : ''}
    ${sfWinners.length === 2 ? `<h4>Final</h4><div class="bracket-grid final-grid">${matchRadio('kowinner', finalMatch.teamA, finalMatch.teamB)}</div>` : ''}
  </div>`;
}

function updateKnockoutFlow(){
  updateKnockoutCounters();
  renderGroupRankings();
  renderBracket();
  updateKnockoutCounters();
}

function updateKnockoutCounters(){
  [['round32',32]].forEach(([name,count])=>{
    const counter = el(`${name}_counter`);
    if(counter) counter.textContent = `${getChecked(name).length} / ${count} selected`;
  });
}

function getKnockoutProgression(){
  const r32 = getRound32Draw();
  return {
    last16: getWinnersFor('ko32', r32.map(m=>m.id)),
    quarters: getWinnersFor('ko16', [89,90,91,92,93,94,95,96]),
    semis: getWinnersFor('koqf', [97,98,99,100]),
    finalists: getWinnersFor('kosf', [101,102]),
    winner: form.elements['kowinner']?.value ? [form.elements['kowinner'].value] : []
  };
}

function renderGroupedTeamCheckboxes(target,name){
  el(target).innerHTML = groupedCheckboxHtml(name, GROUPS);
}

function renderPlayers(){
  const labels = { elite: 'Elite tier', tier1: 'Tier 1', tier2: 'Tier 2', tier3: 'Tier 3' };
  el('playerPicks').innerHTML = Object.entries(PLAYER_TIERS).map(([tier, players]) => `
    <div class="mini-card player-tier" data-tier="${tier}">
      <h3>${labels[tier] || tier}</h3>
      <p class="counter" id="${tier}_counter">0 / 2 selected</p>
      <div class="checkbox-grid">
        ${players.map(p => `<label class="pill"><input type="checkbox" name="players_${tier}" value="${safe(p)}">${safe(p)}</label>`).join('')}
      </div>
    </div>`).join('');
}

function updatePlayerCounters(){
  Object.keys(PLAYER_TIERS).forEach(tier => {
    const counter = el(`${tier}_counter`);
    if(counter) counter.textContent = `${getChecked(`players_${tier}`).length} / 2 selected`;
  });
}

function bonusOptions(q){
  if(q.optionsFrom === 'teams') return ALL_TEAMS;
  if(q.optionsFrom === 'elite') return PLAYER_TIERS.elite;
  return q.options || [];
}

function renderBonus(){
  el('bonusQuestions').innerHTML = BONUS_QUESTIONS.map((q,i)=>{
    const name = `bonus_${q.id || (i+1)}`;
    if(q.type === 'select') {
      const options = bonusOptions(q);
      return `<label>${safe(q.label)}<select required name="${safe(name)}"><option value="">Choose...</option>${options.map(o=>`<option value="${safe(o)}">${safe(o)}</option>`).join('')}</select></label>`;
    }
    if(q.type === 'number') {
      return `<label>${safe(q.label)}<input required type="number" name="${safe(name)}" min="${safe(q.min ?? '')}" step="${safe(q.step ?? '1')}" placeholder="${safe(q.placeholder || '')}"></label>`;
    }
    return `<label>${safe(q.label)}<input required type="text" name="${safe(name)}" placeholder="${safe(q.placeholder || '')}"></label>`;
  }).join('');
}

function showStep(n){
  clearMessage();
  currentStep = Math.max(0, Math.min(n, steps.length-1));
  steps.forEach((s,i)=>s.classList.toggle('active', i===currentStep));
  el('prevBtn').style.visibility = currentStep ? 'visible' : 'hidden';
  el('nextBtn').style.display = currentStep === steps.length-1 ? 'none' : 'inline-block';
  el('progressText').textContent = `Step ${currentStep+1} of ${steps.length}`;
  try { window.scrollTo({top:0, behavior:'smooth'}); } catch(e) { window.scrollTo(0,0); }
}

function validateScores(){
  for (const [group] of Object.entries(GROUPS)) {
    let complete = 0;
    for (const m of getGroupMatches(group)) {
      const home = form.elements[`score_${m.id}_${m.home}`].value;
      const away = form.elements[`score_${m.id}_${m.away}`].value;
      const oneFilled = home !== '' || away !== '';
      const bothFilled = home !== '' && away !== '';
      if (oneFilled && !bothFilled) { alert(`Please complete both scores for ${m.home} v ${m.away}, or leave both blank.`); return false; }
      if (bothFilled) complete++;
    }
    if (complete !== 1) { alert(`Please enter exactly one score prediction for Group ${group}.`); return false; }
  }
  return true;
}

function validateRound32ByGroup(){
  for (const [group, teams] of Object.entries(GROUPS)) {
    const selected = teams.filter(t => [...form.querySelectorAll('input[name="round32"]')].some(cb => cb.value === t && cb.checked)).length;
    if (selected < 2 || selected > 3) { alert(`Please choose either 2 or 3 teams from Group ${group} for the Round of 32.`); return false; }
  }
  if (getChecked('round32').length !== 32) { alert('Please choose exactly 32 teams for the Round of 32.'); return false; }
  return true;
}

function validateCurrent(){
  // Step 0: only require a name. This deliberately does not check for email.
  if(currentStep === 0) {
    const nameField = form.elements['name'];
    if(!nameField || !nameField.value.trim()) {
      showMessage('Please enter your name.');
      nameField?.focus();
      return false;
    }
    return true;
  }

  const required = [...steps[currentStep].querySelectorAll('[required]')];
  for (const field of required) {
    if(!field.value || !field.checkValidity()) { field.reportValidity(); return false; }
  }
  if(currentStep === 2 && !validateScores()) return false;
  if(currentStep === 3) {
    if(!validateRound32ByGroup()) return false;
    for (const [group, teams] of Object.entries(selectedByGroup())) {
      const vals = ['winner','runner'].concat(teams.length === 3 ? ['third'] : []).map(rank => form.elements[`rank_${group}_${rank}`]?.value).filter(Boolean);
      if(new Set(vals).size !== vals.length) { alert(`Please choose different finishing positions for Group ${group}.`); return false; }
    }
    const needed = [['ko32_',16,'Round of 32'],['ko16_',8,'Last 16'],['koqf_',4,'Quarter-finals'],['kosf_',2,'Semi-finals']];
    for (const [prefix,count,label] of needed) {
      const checked = [...form.querySelectorAll(`input[type="radio"]`)].filter(r => r.name.startsWith(prefix) && r.checked).length;
      if(checked !== count) { alert(`Please pick a winner in every ${label} tie.`); return false; }
    }
    if(!form.elements['kowinner']?.value) { alert('Please pick the World Cup winner.'); return false; }
  }
  if(currentStep === 4) {
    for (const name of ['most_goals_for','most_goals_against']) {
      const checked = form.querySelectorAll(`input[name="${name}"]:checked`).length;
      if(checked !== 5) { alert('Please choose exactly 5 teams in each goals category.'); return false; }
    }
  }
  if(currentStep === 5) {
    for (const tier of Object.keys(PLAYER_TIERS)) {
      if(getChecked(`players_${tier}`).length !== 2) { alert('Please choose exactly 2 players from each tier.'); return false; }
    }
  }
  return true;
}

function collectData(){
  const fd = new FormData(form); const out = {submittedAt:new Date().toISOString()};
  for (const [k,v] of fd.entries()) { out[k] = out[k] ? [].concat(out[k], v) : v; }
  if(typeof getKnockoutProgression === 'function') {
    const progression = getKnockoutProgression();
    out.last16 = progression.last16;
    out.quarters = progression.quarters;
    out.semis = progression.semis;
    out.finalists = progression.finalists;
    out.winner = progression.winner;
  }
  return out;
}

const prevButton = el('prevBtn');
const nextButton = el('nextBtn');
if (prevButton) prevButton.addEventListener('click', () => showStep(currentStep-1));
if (nextButton) nextButton.addEventListener('click', () => {
  console.log('Next clicked on step', currentStep);
  try {
    if(validateCurrent()) showStep(currentStep+1);
  } catch (err) {
    console.error(err);
    showMessage('There is a page error. Please tell Ed: ' + (err && err.message ? err.message : err));
  }
});
form.addEventListener('change', e => {
  if(e.target.closest('#knockoutPicks')) updateKnockoutFlow();
  if(e.target.closest('#playerPicks')) updatePlayerCounters();
});
form.addEventListener('submit', async e => {
  e.preventDefault();
  if(!validateCurrent()) return;
  const status = el('status'); status.textContent = '';
  const sweepstakeTeam = getRandomSweepstakeTeam();
  const payload = collectData();
  payload.sweepstakeTeam = sweepstakeTeam;
  if(!SCRIPT_URL){
    showSweepstakeResult(sweepstakeTeam);
    status.textContent = 'Test mode: no Google Apps Script URL set yet. Your entry has not been saved, but the random sweepstake draw is working.';
    console.log('Prediction entry:', payload);
    return;
  }
  try{
    await fetch(SCRIPT_URL, {method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain'}, body:JSON.stringify(payload)});
    showSweepstakeResult(sweepstakeTeam);
    status.textContent = 'Submitted. Thanks and good luck!';
    form.querySelector('.submitBtn').disabled = true;
  } catch(err){ status.textContent = 'Sorry, something went wrong. Please try again or contact the organiser.'; }
});
render();
