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
function teamSelect(name){ return `<select required name="${name}"><option value="">Choose team</option>${ALL_TEAMS.map(t=>`<option>${safe(t)}</option>`).join('')}</select>`; }
function renderKnockout(){
  const stages = [['round32',32,'Round of 32'],['last16',16,'Last 16'],['quarters',8,'Quarter finalists'],['semis',4,'Semi finalists'],['finalists',2,'Finalists'],['winner',1,'Winner']];
  el('knockoutPicks').innerHTML = stages.map(([key,count,title]) => `<div class="mini-card"><h3>${title}</h3><div class="grid two">${Array.from({length:count},(_,i)=>`<label>${title} ${i+1}${teamSelect(`${key}_${i+1}`)}</label>`).join('')}</div></div>`).join('');
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
