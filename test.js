const fs=require('fs'), vm=require('vm');
class El { constructor(id){this.id=id;this.innerHTML='';this.textContent='';this.hidden=false;this.dataset={};this.classList={add(){},remove(){},toggle(){}};} addEventListener(){} querySelectorAll(){return [];} querySelector(){return null;} reset(){} scrollIntoView(){} }
const ids=['predictionForm','matchPredictions','groupScores','knockoutPicks','topScoringTeams','topConcedingTeams','playerPicks','bonusQuestions','prevBtn','nextBtn','progressText','status','sweepstakeResult'];
const els=Object.fromEntries(ids.map(id=>[id,new El(id)]));
const ctx={console, fetch:async()=>({ok:true,json:async()=>({ok:true})}), window:{scrollTo(){}}, document:{getElementById:id=>els[id]||(els[id]=new El(id)),querySelectorAll:sel=> sel==='.step' ? Array.from({length:7},(_,i)=>{let e=new El('step'+i);e.dataset={step:String(i)};return e;}) : []}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('./data.js','utf8'), ctx);
vm.runInContext(fs.readFileSync('./app.js','utf8'), ctx);
console.log('match html len', els.matchPredictions.innerHTML.length);
console.log(els.matchPredictions.innerHTML.slice(0,100));
