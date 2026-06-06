// Paste your Google Apps Script Web App URL here when you are ready to collect entries.
const SCRIPT_URL = ''; // e.g. https://script.google.com/macros/s/xxxxx/exec
let currentStep = 0;
const steps = [...document.querySelectorAll('.step')];
const form = document.getElementById('predictionForm');

const el = id => document.getElementById(id);
const safe = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function radioName(prefix, id){ return `${prefix}_${id}`; }
function render() {
  renderMatches(); renderGroupScores(); renderKnockout(); renderTeamCheckboxes('topScoringTeams','most_goals_for'); renderTeamCheckboxes('topConcedingTeams','most_goals_against'); renderPlayers(); renderBonus(); showStep(0);
}
function renderMatches(){
  el('matchPredictions').innerHTML = Object.entries(GROUPS).map(([group]) => `<h3>Group ${group}</h3>` + MATCHES.filter(m=>m.group===group).map(m => `<div class="match"><strong>${safe(m.home)} v ${safe(m.away)}</strong><div class="options"><label class="pill"><input required type="radio" name="${radioName('match',m.id)}" value="${safe(m.home)}">${safe(m.home)}</label><label class="pill"><input type="radio" name="${radioName('match',m.id)}" value="Draw">Draw</label><label class="pill"><input type="radio" name="${radioName('match',m.id)}" value="${safe(m.away)}">${safe(m.away)}</label></div></div>`).join('')).join('');
}
function renderGroupScores(){
  el('groupScores').innerHTML = Object.entries(GROUPS).map(([g,teams]) => `<div class="mini-card"><h3>Group ${g}</h3><p>${teams.map(safe).join(' · ')}</p><div class="grid two"><label>Total goals in group <input required type="number" min="0" name="group_${g}_goals"></label><label>Total draws in group <input required type="number" min="0" max="6" name="group_${g}_draws"></label></div></div>`).join('');
}
function knockoutStageHtml(key, title, count, teams, helper){
  return `<div class="mini-card knockout-stage" data-stage="${key}"><h3>${title}</h3><p class="muted">${helper}</p><p class="counter" id="${key}_counter">0 / ${count} selected</p><div class="checkbox-grid">${teams.map(t=>`<label class="pill"><input type="checkbox" name="${key}" value="${safe(t)}">${safe(t)}</label>`).join('')}</div></div>`;
}
function getChecked(name){ return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(x=>x.value); }
function renderKnockout(){
  el('knockoutPicks').innerHTML = `
    ${knockoutStageHtml('round32','Round of 32',32,ALL_TEAMS,'Tick the 32 teams you think will reach the first knockout round.')}
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
  // Preserve any still-valid selections when a previous stage is edited.
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
function renderTeamCheckboxes(target,name){
  el(target).innerHTML = ALL_TEAMS.map(t=>`<label class="pill"><input type="checkbox" name="${name}" value="${safe(t)}">${safe(t)}</label>`).join('');
}
function renderPlayers(){
  el('playerPicks').innerHTML = Array.from({length:8},(_,i)=>`<label>Player ${i+1}<select required name="player_${i+1}"><option value="">Choose player</option>${PLAYER_CHOICES.map(p=>`<option>${safe(p)}</option>`).join('')}</select></label>`).join('');
}
function renderBonus(){
  el('bonusQuestions').innerHTML = BONUS_QUESTIONS.map((q,i)=>`<label>${safe(q)}<textarea required name="bonus_${i+1}"></textarea></label>`).join('');
}
function showStep(n){
  currentStep = Math.max(0, Math.min(n, steps.length-1));
  steps.forEach((s,i)=>s.classList.toggle('active', i===currentStep));
  el('prevBtn').style.visibility = currentStep ? 'visible' : 'hidden';
  el('nextBtn').style.display = currentStep === steps.length-1 ? 'none' : 'inline-block';
  el('progressText').textContent = `Step ${currentStep+1} of ${steps.length}`;
  if(currentStep === steps.length-1) updateReview();
  scrollTo({top:0, behavior:'smooth'});
}
function validateCurrent(){
  const required = [...steps[currentStep].querySelectorAll('[required]')];
  for (const field of required) { if(!field.checkValidity()) { field.reportValidity(); return false; } }
  if(currentStep === 3) {
    const requiredStages = [['round32',32],['last16',16],['quarters',8],['semis',4],['finalists',2],['winner',1]];
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
  return true;
}
function collectData(){
  const fd = new FormData(form); const out = {submittedAt:new Date().toISOString()};
  for (const [k,v] of fd.entries()) { out[k] = out[k] ? [].concat(out[k], v) : v; }
  return out;
}
function updateReview(){ el('reviewBox').textContent = JSON.stringify(collectData(), null, 2); }
el('prevBtn').onclick = () => showStep(currentStep-1);
el('nextBtn').onclick = () => { if(validateCurrent()) showStep(currentStep+1); };
form.addEventListener('change', e => {
  if(e.target.closest('#knockoutPicks')) updateKnockoutFlow();
});
form.addEventListener('submit', async e => {
  e.preventDefault();
  const status = el('status'); status.textContent = '';
  const payload = collectData();
  if(!SCRIPT_URL){
    status.textContent = 'Test mode: no Google Apps Script URL set yet. Your entry JSON is shown above.';
    return;
  }
  try{
    const res = await fetch(SCRIPT_URL, {method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain'}, body:JSON.stringify(payload)});
    status.textContent = 'Submitted. Thanks and good luck!';
    form.reset(); showStep(0);
  } catch(err){ status.textContent = 'Sorry, something went wrong. Please try again or contact the organiser.'; }
});
render();
