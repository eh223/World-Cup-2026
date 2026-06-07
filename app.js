// Paste your Google Apps Script Web App URL here when you are ready to collect entries.
const SCRIPT_URL = ''; // e.g. https://script.google.com/macros/s/xxxxx/exec
let currentStep = 0;
const steps = [...document.querySelectorAll('.step')];
const form = document.getElementById('predictionForm');
console.log('World Cup predictor app loaded - no email version v3');

const el = id => document.getElementById(id);
const safe = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function showMessage(msg){ const status = el('status'); if(status) status.textContent = msg; else alert(msg); }
function clearMessage(){ const status = el('status'); if(status) status.textContent = ''; }

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

function renderKnockout(){
  el('knockoutPicks').innerHTML = `
    ${knockoutStageHtml('round32','Round of 32',32,ALL_TEAMS,'Choose 2 or 3 teams from each group, and exactly 32 teams overall.', true)}
    <div id="last16Wrap"></div>
    <div id="quartersWrap"></div>
    <div id="semisWrap"></div>
    <div id="finalistsWrap"></div>
    <div id="winnerWrap"></div>`;
  updateKnockoutFlow();
}

function renderNextKnockoutStage(sourceName, targetWrapId, targetName, title, count, helper){
  const teams = getChecked(sourceName);
  const wrap = el(targetWrapId);
  const existing = new Set(getChecked(targetName));
  wrap.innerHTML = teams.length ? knockoutStageHtml(targetName,title,count,teams,helper) : '';
  [...form.querySelectorAll(`input[name="${targetName}"]`)].forEach(cb => { cb.checked = existing.has(cb.value); });
}

function updateKnockoutFlow(){
  updateKnockoutCounters();
  renderNextKnockoutStage('round32','last16Wrap','last16','Last 16',16,'From your Round of 32 picks, tick the 16 teams you think will progress.');
  renderNextKnockoutStage('last16','quartersWrap','quarters','Quarter-finalists',8,'From your Last 16 picks, tick the 8 teams you think will progress.');
  renderNextKnockoutStage('quarters','semisWrap','semis','Semi-finalists',4,'From your quarter-finalists, tick the 4 teams you think will progress.');
  renderNextKnockoutStage('semis','finalistsWrap','finalists','Finalists',2,'From your semi-finalists, tick the 2 teams you think will reach the final.');
  renderNextKnockoutStage('finalists','winnerWrap','winner','Winner',1,'From your finalists, tick the team you think will win the World Cup.');
  updateKnockoutCounters();
}

function updateKnockoutCounters(){
  [['round32',32],['last16',16],['quarters',8],['semis',4],['finalists',2],['winner',1]].forEach(([name,count])=>{
    const counter = el(`${name}_counter`);
    if(counter) counter.textContent = `${getChecked(name).length} / ${count} selected`;
  });
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
    const requiredStages = [['last16',16],['quarters',8],['semis',4],['finalists',2],['winner',1]];
    for (const [name,count] of requiredStages) {
      const checked = form.querySelectorAll(`input[name="${name}"]:checked`).length;
      if(checked !== count) { alert(`Please choose exactly ${count} teams for ${name}.`); return false; }
    }
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
  const payload = collectData();
  if(!SCRIPT_URL){
    status.textContent = 'Test mode: no Google Apps Script URL set yet. The form is working, but entries are not being saved yet.';
    console.log('Prediction entry:', payload);
    return;
  }
  try{
    await fetch(SCRIPT_URL, {method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain'}, body:JSON.stringify(payload)});
    status.textContent = 'Submitted. Thanks and good luck!';
    form.reset(); render(); showStep(0);
  } catch(err){ status.textContent = 'Sorry, something went wrong. Please try again or contact the organiser.'; }
});
render();
