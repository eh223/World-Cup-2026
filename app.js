// Paste your Google Apps Script Web App URL here when you are ready to collect entries.
const SCRIPT_URL = 'https://https://script.google.com/macros/s/AKfycbz0V7sjAxkbTMPVJb6MTJGsKuOS8PsSeI4iG7HM4TBzdSg_h96TH1ehzhaI2sjXtqc/exec'; // e.g. https://script.google.com/macros/s/xxxxx/exec
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

const THIRD_PLACE_WINNER_SLOTS = ['A','B','D','E','G','I','K','L'];
const ROUND32_MATCHES = [
  {id:73, a:'2A', b:'2B'},
  {id:74, a:'1E', b:'3E'},
  {id:75, a:'1F', b:'2C'},
  {id:76, a:'1C', b:'2F'},
  {id:77, a:'1I', b:'3I'},
  {id:78, a:'2E', b:'2I'},
  {id:79, a:'1A', b:'3A'},
  {id:80, a:'1L', b:'3L'},
  {id:81, a:'1D', b:'3D'},
  {id:82, a:'1G', b:'3G'},
  {id:83, a:'2K', b:'2L'},
  {id:84, a:'1H', b:'2J'},
  {id:85, a:'1B', b:'3B'},
  {id:86, a:'1J', b:'2H'},
  {id:87, a:'1K', b:'3K'},
  {id:88, a:'2D', b:'2G'}
];
const BRACKET_ROUNDS = [
  {title:'Round of 16', matches:[{id:89, from:[74,77]}, {id:90, from:[73,75]}, {id:91, from:[76,78]}, {id:92, from:[79,80]}, {id:93, from:[83,84]}, {id:94, from:[81,82]}, {id:95, from:[86,88]}, {id:96, from:[85,87]}]},
  {title:'Quarter-finals', matches:[{id:97, from:[89,90]}, {id:98, from:[93,94]}, {id:99, from:[91,92]}, {id:100, from:[95,96]}]},
  {title:'Semi-finals', matches:[{id:101, from:[97,98]}, {id:102, from:[99,100]}]},
  {title:'Final', matches:[{id:104, from:[101,102]}]}
];
let annexCMapPromise = null;
let annexCMapCache = null;
let bracketSelections = {}; // Stores knockout winners while the bracket is re-rendered.

function slug(text){ return String(text).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,''); }
function rankingFieldName(group, team){ return `group_${group}_${slug(team)}`; }
function combinationsOf(arr, k){
  if(k === 0) return [[]];
  if(arr.length < k) return [];
  const [first, ...rest] = arr;
  return combinationsOf(rest, k-1).map(c => [first, ...c]).concat(combinationsOf(rest, k));
}
function annexOptionKeyFromGroups(groups){ return [...groups].sort().join(''); }
function optionNumberForThirdGroups(groups){
  const combos = combinationsOf('ABCDEFGHIJKL'.split(''), 8).map(c => c.join('')).reverse();
  return combos.indexOf(annexOptionKeyFromGroups(groups)) + 1;
}
async function loadAnnexCMap(){
  if(annexCMapCache) return annexCMapCache;
  if(annexCMapPromise) return annexCMapPromise;
  annexCMapPromise = fetch('https://en.wikipedia.org/w/api.php?action=parse&page=2026_FIFA_World_Cup_knockout_stage&prop=text&format=json&origin=*')
    .then(r => r.json())
    .then(data => {
      const html = data && data.parse && data.parse.text && data.parse.text['*'];
      if(!html) throw new Error('No Wikipedia table HTML returned');
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const tables = [...doc.querySelectorAll('table')];
      const table = tables.find(t => /Third-placed teams/i.test(t.textContent) && /1A/.test(t.textContent) && /1L/.test(t.textContent));
      if(!table) throw new Error('Could not find Annex C table');
      const map = {};
      [...table.querySelectorAll('tr')].forEach(row => {
        const tokens = row.textContent.replace(/\[[^\]]*\]/g,' ').match(/\b(?:\d+|[A-L]|3[A-L])\b/g) || [];
        const noIndex = tokens.findIndex(t => /^\d+$/.test(t));
        if(noIndex < 0) return;
        const singles = tokens.slice(noIndex+1).filter(t => /^[A-L]$/.test(t));
        const thirds = tokens.slice(noIndex+1).filter(t => /^3[A-L]$/.test(t));
        if(singles.length >= 8 && thirds.length >= 8) {
          const key = singles.slice(0,8).sort().join('');
          map[key] = thirds.slice(0,8).map(t => t[1]);
        }
      });
      if(Object.keys(map).length < 400) throw new Error('Annex C table parse incomplete');
      annexCMapCache = map;
      return map;
    });
  return annexCMapPromise;
}

function renderPositionSelectors(){
  return Object.entries(GROUPS).map(([group, teams]) => `
    <div class="group-block rank-group" data-group="${group}">
      <h4>Group ${group}</h4>
      <p class="muted">Put <strong>1</strong> beside your group winner, <strong>2</strong> beside your runner-up, and <strong>3</strong> if you think a third-placed team qualifies.</p>
      <p class="counter" id="group_${group}_rank_counter">0 qualifiers selected</p>
      <div class="rank-list">
        ${teams.map(team => `
          <label class="rank-row">
            <span>${safe(team)}</span>
            <select name="${rankingFieldName(group, team)}" data-rank-team="${safe(team)}" data-rank-group="${group}">
              <option value="">Out</option>
              <option value="1">1st</option>
              <option value="2">2nd</option>
              <option value="3">3rd</option>
            </select>
          </label>`).join('')}
      </div>
    </div>`).join('');
}
function getRankings(){
  const rankings = {};
  Object.entries(GROUPS).forEach(([group, teams]) => {
    rankings[group] = {};
    teams.forEach(team => {
      const field = form.elements[rankingFieldName(group, team)];
      if(field && field.value) rankings[group][field.value] = team;
    });
  });
  return rankings;
}
function selectedThirdGroups(){
  return Object.entries(GROUPS).filter(([group, teams]) =>
    teams.some(team => {
      const field = form.elements[rankingFieldName(group, team)];
      return field && field.value === '3';
    })
  ).map(([group]) => group);
}
function selectedQualifiers(){
  const qualifiers = [];
  Object.entries(GROUPS).forEach(([group, teams]) => {
    teams.forEach(team => {
      const field = form.elements[rankingFieldName(group, team)];
      if(field && field.value) qualifiers.push({group, team, rank: field.value});
    });
  });
  return qualifiers;
}
function updateRankCounters(){
  Object.entries(GROUPS).forEach(([group, teams]) => {
    const picked = teams.filter(team => {
      const field = form.elements[rankingFieldName(group, team)];
      return field && field.value;
    });
    const counter = el(`group_${group}_rank_counter`);
    if(counter) counter.textContent = `${picked.length} qualifier${picked.length === 1 ? '' : 's'} selected`;
  });
  const total = el('round32_counter');
  if(total) total.textContent = `${selectedQualifiers().length} / 32 qualifiers selected`;
}
function validatePositionSelections(showAlerts = true){
  const qualifiers = selectedQualifiers();
  for (const [group, teams] of Object.entries(GROUPS)) {
    const counts = {1:0, 2:0, 3:0};
    teams.forEach(team => {
      const field = form.elements[rankingFieldName(group, team)];
      if(field && field.value) counts[field.value]++;
    });
    if(counts[1] !== 1 || counts[2] !== 1 || counts[3] > 1) {
      if(showAlerts) alert(`Group ${group}: choose exactly one 1st-place team, exactly one 2nd-place team, and no more than one 3rd-place qualifier.`);
      return false;
    }
    const groupTotal = counts[1] + counts[2] + counts[3];
    if(groupTotal < 2 || groupTotal > 3) {
      if(showAlerts) alert(`Group ${group}: choose either 2 or 3 qualifying teams.`);
      return false;
    }
  }
  if(qualifiers.length !== 32) {
    if(showAlerts) alert('Please select exactly 32 qualifiers in total. That means eight groups need a 3rd-placed qualifier.');
    return false;
  }
  if(selectedThirdGroups().length !== 8) {
    if(showAlerts) alert('Please choose exactly eight 3rd-placed qualifiers.');
    return false;
  }
  return true;
}
function teamForSlot(slot, rankings, thirdMap){
  const rank = slot[0];
  const group = slot[1];
  if(rank === '1' || rank === '2') return rankings[group] && rankings[group][rank];
  if(rank === '3') {
    const actualGroup = thirdMap[group];
    return actualGroup && rankings[actualGroup] && rankings[actualGroup]['3'];
  }
  return '';
}
function matchRadioHtml(matchId, a, b, roundName){
  if(!a || !b) return `<div class="match"><strong>Match ${matchId}</strong><p class="muted">Complete the earlier picks to generate this tie.</p></div>`;
  const picked = bracketSelections[matchId] || '';
  const aChecked = picked === a ? 'checked' : '';
  const bChecked = picked === b ? 'checked' : '';
  return `<div class="match bracket-match"><strong>Match ${matchId}: ${safe(a)} v ${safe(b)}</strong><div class="options"><label class="pill"><input required type="radio" name="bracket_${matchId}" value="${safe(a)}" ${aChecked}>${safe(a)}</label><label class="pill"><input type="radio" name="bracket_${matchId}" value="${safe(b)}" ${bChecked}>${safe(b)}</label></div></div>`;
}
function winnerOf(matchId){
  if(bracketSelections[matchId]) return bracketSelections[matchId];
  const field = form.querySelector(`input[name="bracket_${matchId}"]:checked`);
  return field ? field.value : '';
}
async function renderBracket(){
  const wrap = el('bracketWrap');
  if(!wrap) return;
  updateRankCounters();
  if(!validatePositionSelections(false)) {
    wrap.innerHTML = '<div class="mini-card"><p class="muted">Complete the 1/2/3 group selections above to generate the official knockout draw.</p></div>';
    return;
  }
  const rankings = getRankings();
  const thirdGroups = selectedThirdGroups();
  try {
    wrap.innerHTML = '<div class="mini-card"><p class="muted">Loading the official third-place matchup table...</p></div>';
    const annex = await loadAnnexCMap();
    const key = annexOptionKeyFromGroups(thirdGroups);
    const mapping = annex[key];
    if(!mapping) throw new Error(`No Annex C mapping found for ${key}`);
    const thirdMap = {};
    THIRD_PLACE_WINNER_SLOTS.forEach((winnerGroup, i) => thirdMap[winnerGroup] = mapping[i]);
    const optionNo = optionNumberForThirdGroups(thirdGroups);
    let html = `<div class="mini-card"><h3>Generated knockout draw</h3><p class="muted">Using Annex C option ${optionNo} for third-placed groups: ${safe(key.split('').join(', '))}.</p></div>`;
    html += `<div class="mini-card"><h3>Round of 32</h3>${ROUND32_MATCHES.map(m => matchRadioHtml(m.id, teamForSlot(m.a, rankings, thirdMap), teamForSlot(m.b, rankings, thirdMap), 'Round of 32')).join('')}</div>`;
    BRACKET_ROUNDS.forEach(round => {
      html += `<div class="mini-card"><h3>${round.title}</h3>${round.matches.map(m => matchRadioHtml(m.id, winnerOf(m.from[0]), winnerOf(m.from[1]), round.title)).join('')}</div>`;
    });
    wrap.innerHTML = html;
  } catch(err) {
    console.error(err);
    wrap.innerHTML = `<div class="mini-card"><p class="status">Could not load the official third-place mapping table. Please check your internet connection and try again.</p><p class="muted">${safe(err.message || err)}</p></div>`;
  }
}
function renderKnockout(){
  el('knockoutPicks').innerHTML = `
    <div class="mini-card knockout-stage" data-stage="round32">
      <h3>Round of 32 qualifiers and group positions</h3>
      <p class="muted">Go group by group and put <strong>1</strong>, <strong>2</strong> and, where relevant, <strong>3</strong> beside the teams you think qualify. Exactly eight groups should have a 3rd-placed qualifier.</p>
      <p class="counter" id="round32_counter">0 / 32 qualifiers selected</p>
      ${renderPositionSelectors()}
    </div>
    <div id="bracketWrap"></div>`;
  updateKnockoutFlow();
}
function updateKnockoutFlow(){
  updateRankCounters();
  renderBracket();
}
function updateKnockoutCounters(){ updateRankCounters(); }

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
    if(!validatePositionSelections(true)) return false;
    for (const match of ROUND32_MATCHES) {
      if(!winnerOf(match.id)) { alert('Please pick a winner for every Round of 32 tie.'); return false; }
    }
    for (const round of BRACKET_ROUNDS) {
      for (const match of round.matches) {
        if(!winnerOf(match.id)) { alert(`Please pick a winner for every ${round.title} tie.`); return false; }
      }
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
  if(e.target.closest('#knockoutPicks')) {
    if(e.target.matches('input[type="radio"][name^="bracket_"]')) {
      const matchId = e.target.name.replace('bracket_', '');
      bracketSelections[matchId] = e.target.value;
      updateKnockoutFlow();
    } else if(e.target.matches('select[data-rank-team]')) {
      // If the group order changes, old knockout winners may no longer be valid.
      bracketSelections = {};
      updateKnockoutFlow();
    }
  }
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
