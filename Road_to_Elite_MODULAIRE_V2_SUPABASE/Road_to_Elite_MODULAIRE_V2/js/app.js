// Stockage local sécurisé : une donnée ancienne ou corrompue ne bloque plus l'application.
function safeJSONRead(key,fallback){
  try{
    const raw=localStorage.getItem(key);
    return raw===null?fallback:JSON.parse(raw);
  }catch(error){
    console.warn('[Road to Elite] Donnée locale ignorée :',key,error);
    return fallback;
  }
}
function safeJSONWrite(key,value){
  try{localStorage.setItem(key,JSON.stringify(value));return true}
  catch(error){console.warn('[Road to Elite] Sauvegarde locale impossible :',key,error);return false}
}

let ifi=74;
const attempts={ball:0,reaction:0,free:0,law:0};
let ballOfficial=false,ballStart=0,reactionOfficial=false,reactionReady=false,reactionStart=0;
let masteredKeys=3;

function show(id,btn){
  const target=document.getElementById(id);
  if(!target){console.warn('[Road to Elite] Écran introuvable :',id);return}
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  target.classList.add('active');
  document.querySelectorAll('.nav-bottom button').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}
function continuePath(){show('interactive',document.querySelectorAll('.nav-bottom button')[3])}
function startRitual(){document.getElementById('ritualDone').classList.remove('hidden');addHistory('Rituel d’Activation','Terminé')}
function addHistory(name,result){const list=document.getElementById('historyList');if(!list)return;const row=document.createElement('div');row.className='history-item';row.innerHTML='<span>'+name+'</span><b>'+result+'</b>';list.prepend(row)}
function updateIFI(delta){ifi=Math.min(99,Math.max(0,ifi+delta));document.getElementById('ifiMain').textContent=ifi;document.getElementById('ifiEvolution').textContent=ifi}
function saveTerrain(type){const c=type==='jong'?{input:'jongInput',last:'jongLast',best:'jongBest',msg:'jongMsg',goal:20,name:'Jonglerie'}:{input:'squatInput',last:'squatLast',best:'squatBest',msg:'squatMsg',goal:30,name:'Vitesse 10 m'};saveCount(c)}
function saveCount(c){const v=Number(document.getElementById(c.input).value);if(!v){alert('Entre un résultat.');return}document.getElementById(c.last).textContent=v;const best=document.getElementById(c.best);if(v>Number(best.textContent))best.textContent=v;const msg=document.getElementById(c.msg);msg.classList.remove('hidden');const mastered=v>=c.goal;msg.textContent=mastered?'Défi maîtrisé. Ta progression du parcours avance.':'Ce défi est en progression. Continue à ton rythme.';addHistory(c.name,String(v));if(mastered){masteredKeys=Math.min(6,masteredKeys+1);checkSignature()}}
function saveCountTerrain(type,goal){saveCount({input:type+'Input',last:type+'Last',best:type+'Best',msg:type+'Msg',goal,name:type==='plank'?'VMA':type})}
function saveTimedTerrain(type,goal){const v=Number(document.getElementById(type+'Input').value);if(!v){alert('Entre un temps.');return}document.getElementById(type+'Last').textContent=v;const best=document.getElementById(type+'Best');if(v<Number(best.textContent))best.textContent=v;const msg=document.getElementById(type+'Msg');msg.classList.remove('hidden');const mastered=v<=goal;msg.textContent=mastered?'Défi maîtrisé. Ta progression du parcours avance.':'Tu te rapproches de l’objectif. Continue à ton rythme.';addHistory('Slalom',v+' s');if(mastered){masteredKeys=Math.min(6,masteredKeys+1);checkSignature()}}
function useAttempt(type){if(attempts[type]>=3){alert('Tes 3 essais officiels du jour sont terminés. Le mode entraînement libre reste disponible.');return false}attempts[type]++;const box=document.getElementById(type+'Attempts');if(box)box.children[attempts[type]-1].classList.add('used');return true}
function startBallTracker(official){if(official&&!useAttempt('ball'))return;ballOfficial=official;const area=document.getElementById('ballGame'),target=document.getElementById('ballTarget');area.querySelector('p').textContent='Clique sur le ballon dès qu’il apparaît.';target.style.display='none';setTimeout(()=>{target.style.left=Math.floor(Math.random()*75+5)+'%';target.style.top=Math.floor(Math.random()*60+20)+'%';target.style.display='grid';ballStart=performance.now()},700+Math.random()*1200)}
document.addEventListener('click',e=>{if(e.target.id==='ballTarget'){const ms=Math.round(performance.now()-ballStart);e.target.style.display='none';const score=Math.max(50,Math.min(100,Math.round(120-ms/10)));const r=document.getElementById('ballResult');r.classList.remove('hidden');r.textContent='Réaction : '+ms+' ms · Score '+score+'/100.'+(ballOfficial?' Résultat pris en compte pour ton IFI.':' Entraînement libre.');if(ballOfficial){updateIFI(score>=80?1:0);addHistory('Ball Tracker',score+'/100')}}})
function startReaction(official){if(official&&!useAttempt('reaction'))return;reactionOfficial=official;reactionReady=false;const t=document.getElementById('reactionTarget');t.textContent='Attends...';t.style.background='#ffffff0c';setTimeout(()=>{reactionReady=true;reactionStart=performance.now();t.textContent='CLIQUE !';t.style.background='#67f18f';t.style.color='#052312'},1000+Math.random()*1800)}
function hitReaction(){const t=document.getElementById('reactionTarget');if(!reactionReady){t.textContent='Trop tôt';return}const ms=Math.round(performance.now()-reactionStart);reactionReady=false;const score=Math.max(50,Math.min(100,Math.round(125-ms/8)));const r=document.getElementById('reactionResult');r.classList.remove('hidden');r.textContent='Temps : '+ms+' ms · Score '+score+'/100.'+(reactionOfficial?' Résultat pris en compte pour ton IFI.':' Entraînement libre.');t.style.background='#ffffff0c';t.style.color='white';if(reactionOfficial){updateIFI(score>=80?1:0);addHistory('Réflexes',score+'/100')}}
function answerQuiz(type,correct){if(!useAttempt(type))return;const id=type==='free'?'freeResult':'lawResult';const r=document.getElementById(id);r.classList.remove('hidden');r.textContent=correct?'Bonne lecture. Cette capacité progresse.':'Cette situation reste en progression. Observe les espaces et retente demain.';if(correct){updateIFI(1);addHistory(type==='free'?'Joueur libre':'Lois du jeu','Maîtrisé')}}
function filterInteractive(cat,btn){document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('#interactive .challenge').forEach(c=>c.style.display=(cat==='all'||c.dataset.cat===cat)?'block':'none')}
function checkSignature(){const card=document.getElementById('signatureCard'),btn=document.getElementById('signatureBtn'),txt=document.getElementById('signatureText');if(masteredKeys>=6){card.classList.remove('locked');btn.className='primary';btn.textContent='Relever le Défi Signature';txt.textContent='Tes capacités sont prêtes. Relève ce défi pour débloquer les Crampons Argent.'}else{txt.textContent='Maîtrise encore '+(6-masteredKeys)+' Défis Clés pour débloquer ce défi.'}}
function startSignature(){if(masteredKeys<6){alert('Le Défi Signature est encore à venir.');return}alert('Défi Signature lancé : 5 situations de jeu à analyser.');addHistory('Défi Signature','Disponible')}
function closeCoach(){document.getElementById('coachModal').classList.remove('open')}
document.querySelector('.icon')?.addEventListener('click',()=>document.getElementById('coachModal')?.classList.add('open'));
checkSignature();

const terrainData = {
  jong:{goal:20,type:'count',mastered:false},
  slalom:{goal:45,type:'time',mastered:false},
  squat:{goal:30,type:'count',mastered:true},
  plank:{goal:60,type:'count',mastered:true},
  control:{goal:8,type:'count',mastered:false},
  steps:{goal:3,type:'count',mastered:false}
};

function saveTerrainResult(id, goal, type){
  const input=document.getElementById(id+'Input');
  const value=Number(input.value);
  if(!value){alert('Entre ton résultat.');return}
  const last=document.getElementById(id+'Last');
  const best=document.getElementById(id+'Best');
  if(last) last.textContent=value;
  if(best){
    const current=Number(best.textContent);
    if(type==='time'){
      if(value<current) best.textContent=value;
    }else{
      if(value>current) best.textContent=value;
    }
  }
  const mastered=type==='time'?value<=goal:value>=goal;
  terrainData[id].mastered=mastered;

  const state=document.getElementById(id+'State');
  const meter=document.getElementById(id+'Meter');
  const msg=document.getElementById(id+'Msg');
  state.textContent=mastered?'Maîtrisé':'En progression';
  state.className='state-dot '+(mastered?'mastered':'progressing');

  let percent=type==='time'?Math.min(100,Math.round((goal/value)*100)):Math.min(100,Math.round((value/goal)*100));
  meter.style.width=percent+'%';

  msg.classList.add('active');
  msg.innerHTML=mastered
    ? '<strong>Défi maîtrisé.</strong><br>Ton résultat est enregistré et ta progression Terrain avance.'
    : '<strong>Défi en progression.</strong><br>Tu te rapproches de l’objectif. Continue à ton rythme.';

  addHistory(
    id==='jong'?'Jonglerie':id==='slalom'?'Slalom':id==='squat'?'Vitesse 10 m':id==='plank'?'VMA':id==='control'?'(à venir)':'(à venir)',
    type==='time'?value+' s':String(value)
  );
  updateTerrainSummary();
}

function updateTerrainSummary(){
  const keyIds=['jong','slalom','squat','plank'];
  const mastered=keyIds.filter(id=>terrainData[id].mastered).length;
  document.getElementById('terrainMastered').textContent=mastered;
  document.getElementById('terrainProgressing').textContent=4-mastered;
  document.getElementById('terrainProgressBar').style.width=(mastered/4*100)+'%';
  document.getElementById('terrainProgressText').textContent=mastered+' Défis Clés maîtrisés sur 4.';
  const txt=document.getElementById('terrainSignatureText');
  const btn=document.getElementById('terrainSignatureBtn');
  if(mastered===4){
    txt.textContent='Tes Défis Clés Terrain sont prêts. Tu peux relever le Défi Signature.';
    btn.textContent='Relever le Défi Signature';
    btn.className='primary';
  }else{
    txt.textContent='Maîtrise encore '+(4-mastered)+' Défis Clés Terrain pour débloquer ce défi.';
    btn.textContent='À venir';
    btn.className='secondary';
  }
}

function filterTerrain(type,btn){
  document.querySelectorAll('.terrain-filter button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#terrainGrid .challenge').forEach(card=>{
    const types=card.dataset.type.split(' ');
    card.style.display=(type==='all'||types.includes(type))?'block':'none';
  });
}

function launchTerrainSignature(){
  const mastered=['jong','slalom','squat','plank'].filter(id=>terrainData[id].mastered).length;
  if(mastered<4){
    alert('Le Défi Signature Terrain est encore à venir.');
    return;
  }
  alert('Défi Signature Terrain lancé : enchaîne jonglerie, slalom et contrôle orienté dans un même circuit.');
  addHistory('Défi Signature Terrain','Disponible');
}

updateTerrainSummary();

let totalOfficial=0;
let bestInteractiveScore=0;
const interactiveScores={ball:0,reaction:0,memory:0,free:0,scan:0,law:0};
let memoryOfficial=false,memoryPattern=[],memorySelected=[];
let scanOfficial=false,scanCorrectIndex=0;

function updateInteractiveDashboard(type,score,official){
  if(!official) return;
  totalOfficial++;
  interactiveScores[type]=Math.max(interactiveScores[type],score);
  bestInteractiveScore=Math.max(bestInteractiveScore,score);
  document.getElementById('officialTotal').textContent=totalOfficial;
  document.getElementById('bestInteractive').textContent=bestInteractiveScore+'/100';
  document.getElementById('ifiInteractive').textContent=ifi;
  const mastered=Object.values(interactiveScores).filter(v=>v>=70).length;
  const pct=Math.min(100,mastered/3*100);
  document.getElementById('interactiveKeyBar').style.width=pct+'%';
  document.getElementById('interactiveKeyText').textContent=mastered+' défi'+(mastered>1?'s':'')+' sur 3 au-dessus de 70.';
}

const oldUpdateIFI=updateIFI;
updateIFI=function(delta){
  oldUpdateIFI(delta);
  const e=document.getElementById('ifiInteractive');
  if(e)e.textContent=ifi;
};

const oldBallClickHandler = function(){};
document.addEventListener('click',e=>{
  if(e.target.id==='ballTarget'){
    const ms=Math.round(performance.now()-ballStart);
    e.target.style.display='none';
    const score=Math.max(50,Math.min(100,Math.round(120-ms/10)));
    const r=document.getElementById('ballResult');
    r.classList.remove('hidden');
    r.textContent='Réaction : '+ms+' ms · Score '+score+'/100.'+(ballOfficial?' Résultat pris en compte pour ton IFI.':' Entraînement libre.');
    if(ballOfficial){
      updateIFI(score>=80?1:0);
      addHistory('Ball Tracker',score+'/100');
      updateInteractiveDashboard('ball',score,true);
    }
  }
});

const oldHitReaction=hitReaction;
hitReaction=function(){
  const t=document.getElementById('reactionTarget');
  if(!reactionReady){t.textContent='Trop tôt';return}
  const ms=Math.round(performance.now()-reactionStart);
  reactionReady=false;
  const score=Math.max(50,Math.min(100,Math.round(125-ms/8)));
  const r=document.getElementById('reactionResult');
  r.classList.remove('hidden');
  r.textContent='Temps : '+ms+' ms · Score '+score+'/100.'+(reactionOfficial?' Résultat pris en compte pour ton IFI.':' Entraînement libre.');
  t.style.background='#ffffff0c';t.style.color='white';
  if(reactionOfficial){
    updateIFI(score>=80?1:0);
    addHistory('Réflexes',score+'/100');
    updateInteractiveDashboard('reaction',score,true);
  }
};

function buildMemoryGrid(){
  const grid=document.getElementById('memoryGrid');
  grid.innerHTML='';
  for(let i=0;i<8;i++){
    const c=document.createElement('button');
    c.className='memory-cell';
    c.dataset.index=i;
    c.onclick=()=>selectMemory(i,c);
    grid.appendChild(c);
  }
}
buildMemoryGrid();

function startMemory(official){
  if(official&&!useAttempt('memory'))return;
  memoryOfficial=official;
  memorySelected=[];
  memoryPattern=[];
  while(memoryPattern.length<3){
    const n=Math.floor(Math.random()*8);
    if(!memoryPattern.includes(n))memoryPattern.push(n);
  }
  document.querySelectorAll('.memory-cell').forEach(c=>c.classList.remove('active'));
  memoryPattern.forEach(i=>document.querySelectorAll('.memory-cell')[i].classList.add('active'));
  setTimeout(()=>document.querySelectorAll('.memory-cell').forEach(c=>c.classList.remove('active')),1200);
  const r=document.getElementById('memoryResult');r.classList.remove('hidden');r.textContent='Mémorise les 3 cases puis sélectionne-les.';
}

function selectMemory(i,cell){
  if(memorySelected.includes(i)||memoryPattern.length===0)return;
  memorySelected.push(i);cell.classList.add('active');
  if(memorySelected.length===3){
    const correct=memorySelected.filter(x=>memoryPattern.includes(x)).length;
    const score=Math.round(correct/3*100);
    const r=document.getElementById('memoryResult');
    r.textContent='Score mémoire : '+score+'/100.'+(memoryOfficial?' Résultat pris en compte pour ton IFI.':' Entraînement libre.');
    if(memoryOfficial){
      updateIFI(score>=80?1:0);
      addHistory('Mémoire visuelle',score+'/100');
      updateInteractiveDashboard('memory',score,true);
    }
    memoryPattern=[];
  }
}

function startScan(official){
  if(official&&!useAttempt('scan'))return;
  scanOfficial=official;
  const players=[...document.querySelectorAll('#scanField .scan-player')];
  players.forEach(p=>{p.classList.remove('free');p.onclick=null});
  scanCorrectIndex=Math.floor(Math.random()*players.length);
  players[scanCorrectIndex].classList.add('free');
  players.forEach((p,i)=>p.onclick=()=>answerScan(i));
  const r=document.getElementById('scanResult');r.classList.remove('hidden');r.textContent='Repère le joueur libre et clique dessus.';
}

function answerScan(i){
  const correct=i===scanCorrectIndex;
  const score=correct?100:55;
  const r=document.getElementById('scanResult');
  r.textContent=correct?'Bonne lecture : joueur libre identifié. Score 100/100.':'Cette lecture reste en progression. Score 55/100.';
  document.querySelectorAll('#scanField .scan-player').forEach(p=>p.onclick=null);
  if(scanOfficial){
    updateIFI(correct?1:0);
    addHistory('Scanner avant réception',score+'/100');
    updateInteractiveDashboard('scan',score,true);
  }
}

const oldAnswerQuiz=answerQuiz;
answerQuiz=function(type,correct){
  if(!useAttempt(type))return;
  const id=type==='free'?'freeResult':'lawResult';
  const r=document.getElementById(id);
  r.classList.remove('hidden');
  const score=correct?100:60;
  r.textContent=correct?'Bonne lecture. Score 100/100.':'Cette situation reste en progression. Score 60/100.';
  if(correct)updateIFI(1);
  addHistory(type==='free'?'Joueur libre':'Lois du jeu',score+'/100');
  updateInteractiveDashboard(type,score,true);
};

function showEvoPanel(id,btn){
  document.querySelectorAll('.evo-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.evo-tabs button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}
function toggleSwitch(el){el.classList.toggle('on')}
function toggleEditProfile(){
  const card=document.getElementById('editProfileCard');
  card.style.display=card.style.display==='none'?'block':'none';
}
function saveProfile(){
  const name=document.getElementById('profileNameInput').value.trim();
  if(!name){alert('Entre un nom.');return}
  document.getElementById('profileName').textContent=name;
  document.querySelector('.user-head b').textContent=name.split(' ')[0];
  document.getElementById('editProfileCard').style.display='none';
}
const oldUpdateIFI2=updateIFI;
updateIFI=function(delta){
  oldUpdateIFI2(delta);
  const p=document.getElementById('profileIFI');
  if(p)p.textContent=ifi;
};

function savePhysicalResult(type){
  if(type==='speed'){
    const value=Number(document.getElementById('speedInput').value);
    if(!value){alert('Entre ton temps sur 10 m.');return}
    document.getElementById('speedLast').textContent=value.toFixed(2);
    const best=document.getElementById('speedBest');
    if(value<Number(best.textContent)) best.textContent=value.toFixed(2);
    const msg=document.getElementById('speedMsg');
    msg.classList.add('active');
    msg.innerHTML='<strong>Résultat enregistré.</strong><br>Ton meilleur temps sur 10 m est suivi séparément des défis techniques.';
    document.getElementById('speedState').textContent='Mesuré';
    document.getElementById('speedState').className='state-dot mastered';
    addHistory('Vitesse 10 m',value.toFixed(2)+' s');
  }else{
    const value=Number(document.getElementById('vmaInput').value);
    if(!value){alert('Entre ta VMA.');return}
    document.getElementById('vmaLast').textContent=value.toFixed(1);
    const best=document.getElementById('vmaBest');
    if(value>Number(best.textContent)) best.textContent=value.toFixed(1);
    const msg=document.getElementById('vmaMsg');
    msg.classList.add('active');
    msg.innerHTML='<strong>Résultat enregistré.</strong><br>Ta VMA est suivie comme un repère physique indépendant.';
    document.getElementById('vmaState').textContent='Mesuré';
    document.getElementById('vmaState').className='state-dot mastered';
    addHistory('VMA',value.toFixed(1)+' km/h');
  }
}

const playerPath='Débutant';

function initPerformanceBook(){
  const today=new Date().toISOString().slice(0,10);
  const sd=document.getElementById('speedDate');
  const vd=document.getElementById('vmaDate');
  if(sd)sd.value=today;
  if(vd)vd.value=today;

  const unlocked=['Apprenti','Intermédiaire','Confirmé','Expert'].includes(playerPath);
  const card=document.getElementById('vmaCard');
  if(card){
    card.classList.toggle('vma-locked',!unlocked);
    document.getElementById('vmaIntro').textContent=unlocked
      ? 'Suis l’évolution de ta capacité aérobie selon la fréquence recommandée.'
      : 'La VMA devient disponible à partir du parcours Apprenti.';
  }
}

function formatDateFR(value){
  const d=new Date(value+'T00:00:00');
  return d.toLocaleDateString('fr-FR');
}

function addPhysicalMeasure(type){
  const dateInput=document.getElementById(type+'Date');
  const valueInput=document.getElementById(type+'Value');
  const value=Number(valueInput.value);
  if(!value){alert('Entre une valeur.');return}

  if(type==='vma' && playerPath==='Débutant'){
    alert('La VMA sera disponible à partir du parcours Apprenti.');
    return;
  }

  const history=document.getElementById(type+'History');
  const row=document.createElement('div');
  row.className='performance-row';
  const unit=type==='speed'?' s':' km/h';
  row.innerHTML='<span>'+formatDateFR(dateInput.value)+'</span><b>'+value.toFixed(type==='speed'?2:1)+unit+'</b><span>Nouvelle mesure</span>';
  history.prepend(row);

  const current=document.getElementById(type+'Current');
  const record=document.getElementById(type+'Record');
  current.textContent=value.toFixed(type==='speed'?2:1)+unit;

  const oldRecord=parseFloat(record.textContent);
  const isRecord=type==='speed'?(!oldRecord||value<oldRecord):(!oldRecord||value>oldRecord);
  if(isRecord){
    record.textContent=value.toFixed(type==='speed'?2:1)+unit;
    row.lastElementChild.className='record';
    row.lastElementChild.textContent='⭐ Record';
  }

  const change=document.getElementById(type+'Change');
  if(oldRecord){
    const diff=type==='speed'?(oldRecord-value):(value-oldRecord);
    change.textContent=(diff>=0?'+':'')+diff.toFixed(type==='speed'?2:1)+(type==='speed'?' s':' km/h');
  }

  valueInput.value='';
  addHistory(type==='speed'?'Vitesse 10 m':'VMA',value.toFixed(type==='speed'?2:1)+unit);
}

initPerformanceBook();

const physicalPlayerPath='Débutant';

function selectMeasureType(type){
  document.getElementById('speedChoice').classList.toggle('active',type==='speed');
  document.getElementById('vmaChoice').classList.toggle('active',type==='vma');
  document.getElementById('speedForm').style.display=type==='speed'?'block':'none';
  document.getElementById('vmaForm').style.display=type==='vma'?'block':'none';
}

function initPhysicalEntry(){
  const today=new Date().toISOString().slice(0,10);
  const s=document.getElementById('entrySpeedDate');
  const v=document.getElementById('entryVmaDate');
  if(s)s.value=today;
  if(v)v.value=today;
}

function saveProfilePhysical(type){
  if(type==='speed'){
    const value=Number(document.getElementById('entrySpeedValue').value);
    const date=document.getElementById('entrySpeedDate').value;
    if(!value){alert('Entre un temps sur 10 m.');return}

    const current=document.getElementById('profileSpeedCurrent');
    const best=document.getElementById('profileSpeedBest');
    const change=document.getElementById('profileSpeedChange');

    const oldBest=parseFloat(best.textContent);
    current.textContent=value.toFixed(2)+' s';
    if(value<oldBest){
      best.textContent=value.toFixed(2)+' s';
      change.textContent='Nouveau record';
    }else{
      change.textContent='+'+(value-oldBest).toFixed(2)+' s';
    }

    const row=document.createElement('div');
    row.className='measure-row';
    row.innerHTML='<span>'+new Date(date+'T00:00:00').toLocaleDateString('fr-FR')+'</span><b>10 m · '+value.toFixed(2)+' s</b><span>'+(value<oldBest?'Record':'Mesure')+'</span>';
    document.getElementById('profilePhysicalHistory').prepend(row);
    document.getElementById('entrySpeedValue').value='';
    alert('Mesure de vitesse enregistrée.');
    show('profile',document.querySelectorAll('.nav-bottom button')[7]);
  }else{
    if(physicalPlayerPath==='Débutant'){
      alert('La VMA sera disponible à partir du parcours Apprenti.');
      return;
    }
    const value=Number(document.getElementById('entryVmaValue').value);
    if(!value){alert('Entre une VMA.');return}
    alert('Mesure VMA enregistrée.');
    show('profile',document.querySelectorAll('.nav-bottom button')[7]);
  }
}

initPhysicalEntry();


const JUGGLE_LEVELS={"1": {"name": "Débutant Bronze", "phase": "Maîtrise statique", "items": [{"name": "Jonglerie classique — pied fort", "mode": "count", "goal": 10}, {"name": "Jonglerie classique — pied faible", "mode": "count", "goal": 5}, {"name": "Jonglerie alternée", "mode": "count", "goal": 10}, {"name": "Jonglerie de la tête", "mode": "count", "goal": 5}]}, "2": {"name": "Débutant Argent", "phase": "Maîtrise statique", "items": [{"name": "Jonglerie classique — pied fort", "mode": "count", "goal": 30}, {"name": "Jonglerie classique — pied faible", "mode": "count", "goal": 15}, {"name": "Jonglerie alternée", "mode": "count", "goal": 30}, {"name": "Jonglerie de la tête", "mode": "count", "goal": 10}, {"name": "Intérieur du pied fort", "mode": "count", "goal": 10}, {"name": "Intérieur du pied faible", "mode": "count", "goal": 5}]}, "3": {"name": "Débutant Or", "phase": "Maîtrise statique", "items": [{"name": "Jonglerie classique — pied fort", "mode": "count", "goal": 100}, {"name": "Jonglerie classique — pied faible", "mode": "count", "goal": 50}, {"name": "Jonglerie alternée", "mode": "count", "goal": 100}, {"name": "Jonglerie de la tête", "mode": "count", "goal": 30}, {"name": "Intérieur du pied fort", "mode": "count", "goal": 30}, {"name": "Intérieur du pied faible", "mode": "count", "goal": 15}, {"name": "Jonglerie cuisse — côté fort", "mode": "count", "goal": 20}]}, "4": {"name": "Apprenti Bronze", "phase": "Maîtrise en mouvement", "items": [{"name": "Jonglerie en mouvement — pied fort", "mode": "distance", "goal": 50}, {"name": "Jonglerie en mouvement — pied faible", "mode": "distance", "goal": 30}, {"name": "Jonglerie en mouvement — alternée", "mode": "distance", "goal": 30}, {"name": "Jonglerie en mouvement — intérieur pied fort", "mode": "distance", "goal": 30}, {"name": "Jonglerie en mouvement — intérieur pied faible", "mode": "distance", "goal": 10}, {"name": "Jonglerie en mouvement — cuisse pied fort", "mode": "distance", "goal": 30}, {"name": "Jonglerie statique — tête", "mode": "count", "goal": 50}, {"name": "Jonglerie statique — extérieur pied fort", "mode": "count", "goal": 20}, {"name": "Jonglerie statique — extérieur pied faible", "mode": "count", "goal": 10}]}, "5": {"name": "Apprenti Argent", "phase": "Maîtrise en mouvement", "items": [{"name": "Jonglerie en mouvement — pied fort", "mode": "distance", "goal": 100}, {"name": "Jonglerie en mouvement — pied faible", "mode": "distance", "goal": 50}, {"name": "Jonglerie en mouvement — alternée", "mode": "distance", "goal": 50}, {"name": "Jonglerie en mouvement — intérieur pied fort", "mode": "distance", "goal": 50}, {"name": "Jonglerie en mouvement — intérieur pied faible", "mode": "distance", "goal": 30}, {"name": "Jonglerie en mouvement — cuisse pied fort", "mode": "distance", "goal": 50}, {"name": "Jonglerie en mouvement — tête", "mode": "distance", "goal": 30}, {"name": "Jonglerie statique — extérieur pied fort", "mode": "count", "goal": 50}, {"name": "Jonglerie statique — extérieur pied faible", "mode": "count", "goal": 30}]}, "6": {"name": "Apprenti Or", "phase": "Maîtrise rapide", "items": [{"name": "Jonglerie en mouvement — pied fort", "mode": "timed", "distance": 50, "maxTime": 30}, {"name": "Jonglerie en mouvement — pied faible", "mode": "timed", "distance": 30, "maxTime": 30}, {"name": "Jonglerie en mouvement — alternée", "mode": "timed", "distance": 30, "maxTime": 30}, {"name": "Jonglerie en mouvement — intérieur pied fort", "mode": "timed", "distance": 30, "maxTime": 30}, {"name": "Jonglerie en mouvement — intérieur pied faible", "mode": "timed", "distance": 10, "maxTime": 15}, {"name": "Jonglerie en mouvement — cuisse pied fort", "mode": "timed", "distance": 30, "maxTime": 20}, {"name": "Jonglerie statique — tête", "mode": "count", "goal": 50}, {"name": "Jonglerie statique — extérieur pied fort", "mode": "count", "goal": 50}, {"name": "Jonglerie statique — extérieur pied faible", "mode": "count", "goal": 30}]}, "7": {"name": "Intermédiaire Bronze", "phase": "Maîtrise rapide", "items": [{"name": "Jonglerie en mouvement — pied fort", "mode": "timed", "distance": 50, "maxTime": 25}, {"name": "Jonglerie en mouvement — pied faible", "mode": "timed", "distance": 30, "maxTime": 25}, {"name": "Jonglerie en mouvement — alternée", "mode": "timed", "distance": 30, "maxTime": 25}, {"name": "Jonglerie en mouvement — intérieur pied fort", "mode": "timed", "distance": 30, "maxTime": 25}, {"name": "Jonglerie en mouvement — intérieur pied faible", "mode": "timed", "distance": 10, "maxTime": 15}, {"name": "Jonglerie en mouvement — cuisse pied fort", "mode": "timed", "distance": 30, "maxTime": 15}, {"name": "Statique alternée — pied fort / cuisse", "mode": "count", "goal": 50}, {"name": "Statique alternée — pied faible / cuisse", "mode": "count", "goal": 30}, {"name": "Statique alternée — extérieur fort / intérieur", "mode": "count", "goal": 50}, {"name": "Statique alternée — extérieur faible / intérieur", "mode": "count", "goal": 30}]}, "8": {"name": "Intermédiaire Argent", "phase": "Maîtrise rapide", "items": [{"name": "Jonglerie en mouvement — pied fort", "mode": "timed", "distance": 50, "maxTime": 20}, {"name": "Jonglerie en mouvement — pied faible", "mode": "timed", "distance": 30, "maxTime": 20}, {"name": "Jonglerie en mouvement — alternée", "mode": "timed", "distance": 30, "maxTime": 20}, {"name": "Jonglerie en mouvement — intérieur pied fort", "mode": "timed", "distance": 30, "maxTime": 20}, {"name": "Jonglerie en mouvement — intérieur pied faible", "mode": "timed", "distance": 10, "maxTime": 10}, {"name": "Jonglerie en mouvement — cuisse pied fort", "mode": "timed", "distance": 30, "maxTime": 10}, {"name": "Statique alternée — pied fort / cuisse", "mode": "count", "goal": 50}, {"name": "Statique alternée — pied faible / cuisse", "mode": "count", "goal": 30}, {"name": "Statique alternée — extérieur fort / intérieur", "mode": "count", "goal": 50}, {"name": "Statique alternée — extérieur faible / intérieur", "mode": "count", "goal": 30}]}};
const JUGGLE_POOL=[{"source": 4, "name": "Jonglerie en mouvement — pied fort", "mode": "distance", "goal": 50}, {"source": 4, "name": "Jonglerie en mouvement — pied faible", "mode": "distance", "goal": 30}, {"source": 4, "name": "Jonglerie en mouvement — alternée", "mode": "distance", "goal": 30}, {"source": 4, "name": "Jonglerie en mouvement — intérieur pied fort", "mode": "distance", "goal": 30}, {"source": 4, "name": "Jonglerie en mouvement — intérieur pied faible", "mode": "distance", "goal": 10}, {"source": 4, "name": "Jonglerie en mouvement — cuisse pied fort", "mode": "distance", "goal": 30}, {"source": 4, "name": "Jonglerie statique — tête", "mode": "count", "goal": 50}, {"source": 4, "name": "Jonglerie statique — extérieur pied fort", "mode": "count", "goal": 20}, {"source": 4, "name": "Jonglerie statique — extérieur pied faible", "mode": "count", "goal": 10}, {"source": 5, "name": "Jonglerie en mouvement — pied fort", "mode": "distance", "goal": 100}, {"source": 5, "name": "Jonglerie en mouvement — pied faible", "mode": "distance", "goal": 50}, {"source": 5, "name": "Jonglerie en mouvement — alternée", "mode": "distance", "goal": 50}, {"source": 5, "name": "Jonglerie en mouvement — intérieur pied fort", "mode": "distance", "goal": 50}, {"source": 5, "name": "Jonglerie en mouvement — intérieur pied faible", "mode": "distance", "goal": 30}, {"source": 5, "name": "Jonglerie en mouvement — cuisse pied fort", "mode": "distance", "goal": 50}, {"source": 5, "name": "Jonglerie en mouvement — tête", "mode": "distance", "goal": 30}, {"source": 5, "name": "Jonglerie statique — extérieur pied fort", "mode": "count", "goal": 50}, {"source": 5, "name": "Jonglerie statique — extérieur pied faible", "mode": "count", "goal": 30}, {"source": 6, "name": "Jonglerie en mouvement — pied fort", "mode": "timed", "distance": 50, "maxTime": 30}, {"source": 6, "name": "Jonglerie en mouvement — pied faible", "mode": "timed", "distance": 30, "maxTime": 30}, {"source": 6, "name": "Jonglerie en mouvement — alternée", "mode": "timed", "distance": 30, "maxTime": 30}, {"source": 6, "name": "Jonglerie en mouvement — intérieur pied fort", "mode": "timed", "distance": 30, "maxTime": 30}, {"source": 6, "name": "Jonglerie en mouvement — intérieur pied faible", "mode": "timed", "distance": 10, "maxTime": 15}, {"source": 6, "name": "Jonglerie en mouvement — cuisse pied fort", "mode": "timed", "distance": 30, "maxTime": 20}, {"source": 6, "name": "Jonglerie statique — tête", "mode": "count", "goal": 50}, {"source": 6, "name": "Jonglerie statique — extérieur pied fort", "mode": "count", "goal": 50}, {"source": 6, "name": "Jonglerie statique — extérieur pied faible", "mode": "count", "goal": 30}, {"source": 7, "name": "Jonglerie en mouvement — pied fort", "mode": "timed", "distance": 50, "maxTime": 25}, {"source": 7, "name": "Jonglerie en mouvement — pied faible", "mode": "timed", "distance": 30, "maxTime": 25}, {"source": 7, "name": "Jonglerie en mouvement — alternée", "mode": "timed", "distance": 30, "maxTime": 25}, {"source": 7, "name": "Jonglerie en mouvement — intérieur pied fort", "mode": "timed", "distance": 30, "maxTime": 25}, {"source": 7, "name": "Jonglerie en mouvement — intérieur pied faible", "mode": "timed", "distance": 10, "maxTime": 15}, {"source": 7, "name": "Jonglerie en mouvement — cuisse pied fort", "mode": "timed", "distance": 30, "maxTime": 15}, {"source": 7, "name": "Statique alternée — pied fort / cuisse", "mode": "count", "goal": 50}, {"source": 7, "name": "Statique alternée — pied faible / cuisse", "mode": "count", "goal": 30}, {"source": 7, "name": "Statique alternée — extérieur fort / intérieur", "mode": "count", "goal": 50}, {"source": 7, "name": "Statique alternée — extérieur faible / intérieur", "mode": "count", "goal": 30}, {"source": 8, "name": "Jonglerie en mouvement — pied fort", "mode": "timed", "distance": 50, "maxTime": 20}, {"source": 8, "name": "Jonglerie en mouvement — pied faible", "mode": "timed", "distance": 30, "maxTime": 20}, {"source": 8, "name": "Jonglerie en mouvement — alternée", "mode": "timed", "distance": 30, "maxTime": 20}, {"source": 8, "name": "Jonglerie en mouvement — intérieur pied fort", "mode": "timed", "distance": 30, "maxTime": 20}, {"source": 8, "name": "Jonglerie en mouvement — intérieur pied faible", "mode": "timed", "distance": 10, "maxTime": 10}, {"source": 8, "name": "Jonglerie en mouvement — cuisse pied fort", "mode": "timed", "distance": 30, "maxTime": 10}, {"source": 8, "name": "Statique alternée — pied fort / cuisse", "mode": "count", "goal": 50}, {"source": 8, "name": "Statique alternée — pied faible / cuisse", "mode": "count", "goal": 30}, {"source": 8, "name": "Statique alternée — extérieur fort / intérieur", "mode": "count", "goal": 50}, {"source": 8, "name": "Statique alternée — extérieur faible / intérieur", "mode": "count", "goal": 30}];
const juggleState=safeJSONRead('foot-juggle-backup',{});

function juggleSave(){safeJSONWrite('foot-juggle-backup',juggleState)}
function juggleMedal(n){return [1,4,7,10,13].includes(n)?'🥉':[2,5,8,11,14].includes(n)?'🥈':'🥇'}
function juggleInstruction(x){
 if(x.mode==='timed') return `${x.distance} m en ${x.maxTime} secondes maximum`;
 if(x.mode==='distance') return `${x.goal} m sans chute`;
 return `${x.goal} jongles consécutifs`;
}
function juggleLabel(x){return x.mode==='timed'?'Temps réalisé (secondes)':x.mode==='distance'?'Distance réalisée (mètres)':'Nombre de jongles réalisé'}
function juggleValid(x,v){return x.mode==='timed'?(v>0&&v<=x.maxTime):v>=x.goal}
function jugglePoints(x,v){
 if(!juggleValid(x,v))return 0;
 if(x.mode!=='timed')return 2;
 if(v<=x.maxTime*.70)return 6;
 if(v<=x.maxTime*.85)return 4;
 return 2;
}
function juggleStatus(points){return points===6?'Excellent':points===4?'Très bien':points===2?'Validé':''}

function renderJuggleLevel(n){
 const l=JUGGLE_LEVELS[n],s=document.createElement('section');s.className='juggle-screen';s.id='juggleLevel'+n;
 const rows=l.items.map((x,i)=>`<article class="juggle-item" data-level="${n}" data-index="${i}">
   <h3>${x.name}</h3><div class="juggle-requirement"><b>Défi exact</b><br>${juggleInstruction(x)}</div>
   <div class="juggle-entry"><input type="number" min="0" step="${x.mode==='timed'?'0.1':'1'}" placeholder="${juggleLabel(x)}"><button class="primary">Valider</button></div>
   <div class="juggle-feedback">En attente</div></article>`).join('');
 s.innerHTML=`<div class="juggle-hero"><article class="card"><div class="kicker">${l.phase}</div><h2>${juggleMedal(n)} Niveau ${n} — ${l.name}</h2><div class="juggle-progress"><span id="juggleBar${n}"></span></div><b id="jugglePct${n}">0 %</b></article>
 <article class="card"><div class="juggle-metrics"><div class="juggle-metric"><small>Validés</small><b id="juggleDone${n}">0/${l.items.length}</b></div><div class="juggle-metric"><small>IFI gagnés</small><b id="juggleIFI${n}">0</b></div><div class="juggle-metric"><small>Phase</small><b>${l.phase}</b></div></div></article></div>
 <div class="juggle-grid">${rows}</div>`;
 s.querySelectorAll('.juggle-item').forEach(row=>bindJuggleRow(row,l.items[+row.dataset.index]));
 return s;
}
function bindJuggleRow(row,item){
 const key='L'+row.dataset.level+'I'+row.dataset.index,input=row.querySelector('input'),fb=row.querySelector('.juggle-feedback');
 if(juggleState[key]!=null)input.value=juggleState[key];
 function apply(){
  const v=+input.value||0,p=jugglePoints(item,v);
  row.classList.toggle('done',p>0);
  fb.className='juggle-feedback'+(p>0?' ok':'');
  fb.innerHTML=p>0?`<span class="juggle-badge">${juggleStatus(p)}</span> · +${p} IFI`:`Objectif non atteint : ${juggleInstruction(item)}`;
  juggleState[key]=v;juggleState[key+'P']=p;juggleSave();updateJuggleLevel(+row.dataset.level);
 }
 row.querySelector('button').onclick=apply;if(input.value)apply();
}
function updateJuggleLevel(n){
 const rows=[...document.querySelectorAll('#juggleLevel'+n+' .juggle-item')],pts=rows.map(r=>juggleState['L'+n+'I'+r.dataset.index+'P']||0);
 const done=pts.filter(x=>x>0).length,total=pts.reduce((a,b)=>a+b,0),pct=Math.round(done/rows.length*100);
 document.getElementById('juggleBar'+n).style.width=pct+'%';document.getElementById('jugglePct'+n).textContent=pct+' %';
 document.getElementById('juggleDone'+n).textContent=done+'/'+rows.length;document.getElementById('juggleIFI'+n).textContent=total;
}
function juggleCard(x,id,done){
 return `<article class="juggle-item ${done?'done':''}" data-id="${id}"><span class="tag">Issu du niveau ${x.source}</span><h3>${x.name}</h3>
 <div class="juggle-requirement"><b>Défi exact à refaire</b><br>${juggleInstruction(x)}</div>
 <div class="juggle-entry"><input type="number" min="0" step="${x.mode==='timed'?'0.1':'1'}" placeholder="${juggleLabel(x)}"><button class="primary">Valider</button></div>
 <div class="juggle-feedback">${done?'<span class="juggle-badge">Validé</span>':'En attente'}</div></article>`;
}
function drawCertification(){
 const groups=[4,5,6,7,8].map(n=>JUGGLE_POOL.filter(x=>x.source===n));
 juggleState.cert=groups.map(g=>g[Math.floor(Math.random()*g.length)]);juggleState.certDone={};juggleSave();renderCertification();
}
function renderCertification(){
 const grid=document.getElementById('certGrid');if(!juggleState.cert)drawCertification();
 grid.innerHTML=juggleState.cert.map((x,i)=>juggleCard(x,'cert-'+i,!!juggleState.certDone?.[i])).join('');
 grid.querySelectorAll('.juggle-item').forEach(card=>{
  const i=+card.dataset.id.split('-')[1],x=juggleState.cert[i],input=card.querySelector('input');
  card.querySelector('button').onclick=()=>{const v=+input.value||0,fb=card.querySelector('.juggle-feedback');if(juggleValid(x,v)){juggleState.certDone=juggleState.certDone||{};juggleState.certDone[i]=true;juggleSave();renderCertification()}else fb.textContent='Objectif non atteint : '+juggleInstruction(x)};
 });
 const done=Object.values(juggleState.certDone||{}).filter(Boolean).length;
 document.getElementById('certDone').textContent=done+'/5';document.getElementById('certIFI').textContent=done*4;document.getElementById('certSuccess').classList.toggle('active',done===5);
}
function renderCertScreen(){
 const s=document.createElement('section');s.className='juggle-screen';s.id='juggleLevel9';
 s.innerHTML=`<div class="juggle-hero"><article class="card"><div class="kicker">Certification</div><h2>🏅 Niveau 9 — Épreuve de maîtrise</h2><p class="muted">Un défi complet est tiré dans chacun des niveaux 4 à 8.</p><div class="juggle-actions"><button class="primary" id="drawCert">🎲 Générer les 5 défis</button></div></article>
 <article class="card"><div class="juggle-metrics"><div class="juggle-metric"><small>Validés</small><b id="certDone">0/5</b></div><div class="juggle-metric"><small>IFI</small><b id="certIFI">0</b></div><div class="juggle-metric"><small>Statut</small><b>Certification</b></div></div></article></div>
 <div class="juggle-grid" id="certGrid"></div><div class="juggle-success" id="certSuccess"><h2>🏆 Certification Jonglerie obtenue</h2><p>La jonglerie passe en mode entretien.</p></div>`;
 s.querySelector('#drawCert').onclick=drawCertification;return s;
}
function drawMaintenance(n){
 const chosen=[];while(chosen.length<3){const x=JUGGLE_POOL[Math.floor(Math.random()*JUGGLE_POOL.length)];if(!chosen.some(y=>y.source===x.source&&y.name===x.name))chosen.push(x)}
 juggleState['maint'+n]={items:chosen,done:{}};juggleSave();renderMaintenance(n);
}
function renderMaintenance(n){
 const data=juggleState['maint'+n],grid=document.getElementById('maintGrid'+n);
 if(!data){grid.innerHTML='<p class="muted">Génère tes trois défis d’entretien.</p>';return}
 grid.innerHTML=data.items.map((x,i)=>juggleCard(x,'m-'+i,!!data.done[i])).join('');
 grid.querySelectorAll('.juggle-item').forEach(card=>{
  const i=+card.dataset.id.split('-')[1],x=data.items[i],input=card.querySelector('input');
  card.querySelector('button').onclick=()=>{const v=+input.value||0,fb=card.querySelector('.juggle-feedback');if(juggleValid(x,v)){data.done[i]=true;juggleSave();renderMaintenance(n)}else fb.textContent='Objectif non atteint : '+juggleInstruction(x)};
 });
 const done=Object.values(data.done).filter(Boolean).length;document.getElementById('maintDone'+n).textContent=done+'/3';document.getElementById('maintIFI'+n).textContent=done*2;
}
function renderMaintenanceScreen(n){
 const s=document.createElement('section');s.className='juggle-screen';s.id='juggleLevel'+n;
 s.innerHTML=`<div class="juggle-hero"><article class="card"><div class="kicker">Entretien technique</div><h2>🔄 Niveau ${n} — Entretien Jonglerie</h2><p class="muted">Trois défis complets issus des niveaux 4 à 8.</p><button class="primary" id="drawMaint${n}">🎲 Générer mes défis</button></article>
 <article class="card"><div class="juggle-metrics"><div class="juggle-metric"><small>Validés</small><b id="maintDone${n}">0/3</b></div><div class="juggle-metric"><small>IFI</small><b id="maintIFI${n}">0</b></div><div class="juggle-metric"><small>Certification</small><b>Maintenue</b></div></div></article></div><div class="juggle-grid" id="maintGrid${n}"></div>`;
 s.querySelector('#drawMaint'+n).onclick=()=>drawMaintenance(n);return s;
}
function buildJuggleModule(){
 const tabs=document.getElementById('juggleTabs'),screens=document.getElementById('juggleScreens');
 for(let n=1;n<=15;n++){const b=document.createElement('button');b.textContent=juggleMedal(n)+' '+n;b.onclick=()=>showJuggle(n,b);tabs.appendChild(b);screens.appendChild(n<=8?renderJuggleLevel(n):n===9?renderCertScreen():renderMaintenanceScreen(n))}
 showJuggle(1,tabs.firstElementChild);
}
function showJuggle(n,b){
 document.querySelectorAll('.juggle-screen').forEach(s=>s.classList.remove('active'));document.getElementById('juggleLevel'+n).classList.add('active');
 document.querySelectorAll('.juggle-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');
 if(n<=8)updateJuggleLevel(n);else if(n===9)renderCertification();else renderMaintenance(n);
}




/* ===== Accès Jonglerie limité au niveau actuel ===== */
const PLAYER_JUGGLE_LEVEL = 1; // À relier plus tard au niveau réel du joueur.

const PLAYER_JUGGLE_LEVELS = {
  1:{
    name:"Débutant Bronze", phase:"Maîtrise statique",
    items:[
      {name:"Jonglerie classique — pied fort",mode:"count",goal:10},
      {name:"Jonglerie classique — pied faible",mode:"count",goal:5},
      {name:"Jonglerie alternée",mode:"count",goal:10},
      {name:"Jonglerie de la tête",mode:"count",goal:5}
    ],
    acquired:[],
    next:[
      {name:"Débutant Argent",medal:"🥈",newSkills:["Intérieur du pied fort","Intérieur du pied faible"]},
      {name:"Débutant Or",medal:"🥇",newSkills:["Jonglerie avec la cuisse"]}
    ]
  },
  2:{
    name:"Débutant Argent", phase:"Maîtrise statique",
    items:[
      {name:"Jonglerie classique — pied fort",mode:"count",goal:30},
      {name:"Jonglerie classique — pied faible",mode:"count",goal:15},
      {name:"Jonglerie alternée",mode:"count",goal:30},
      {name:"Jonglerie de la tête",mode:"count",goal:10},
      {name:"Intérieur du pied fort",mode:"count",goal:10},
      {name:"Intérieur du pied faible",mode:"count",goal:5}
    ],
    acquired:["Jonglerie classique — pied fort","Jonglerie classique — pied faible","Jonglerie alternée","Jonglerie de la tête"],
    next:[
      {name:"Débutant Or",medal:"🥇",newSkills:["Jonglerie avec la cuisse"]},
      {name:"Apprenti Bronze",medal:"🥉",newSkills:["Jonglerie en mouvement"]}
    ]
  },
  3:{
    name:"Débutant Or", phase:"Maîtrise statique",
    items:[
      {name:"Jonglerie classique — pied fort",mode:"count",goal:100},
      {name:"Jonglerie classique — pied faible",mode:"count",goal:50},
      {name:"Jonglerie alternée",mode:"count",goal:100},
      {name:"Jonglerie de la tête",mode:"count",goal:30},
      {name:"Intérieur du pied fort",mode:"count",goal:30},
      {name:"Intérieur du pied faible",mode:"count",goal:15},
      {name:"Jonglerie cuisse — côté fort",mode:"count",goal:20}
    ],
    acquired:["Jonglerie classique","Jonglerie alternée","Jonglerie de la tête","Intérieur du pied"],
    next:[
      {name:"Apprenti Bronze",medal:"🥉",newSkills:["Jonglerie en mouvement"]},
      {name:"Apprenti Argent",medal:"🥈",newSkills:["Distances plus longues"]}
    ]
  }
};

const currentJuggleState = safeJSONRead("current-juggle-level-state",{});

function currentInstruction(item){
  if(item.mode==="timed") return item.distance+" m en "+item.maxTime+" secondes maximum";
  if(item.mode==="distance") return item.goal+" m sans chute";
  return item.goal+" jongles consécutifs";
}

function currentValid(item,value){
  if(item.mode==="timed") return value>0 && value<=item.maxTime;
  return value>=item.goal;
}

function renderCurrentJuggleLevel(){
  const level=PLAYER_JUGGLE_LEVEL;
  const data=PLAYER_JUGGLE_LEVELS[level];
  document.getElementById("currentJuggleTitle").textContent=(level%3===1?"🥉":level%3===2?"🥈":"🥇")+" "+data.name;
  document.getElementById("currentJugglePhase").textContent=data.phase;

  const acquired=document.getElementById("currentJuggleAcquired");
  if(data.acquired.length===0){
    acquired.innerHTML='<div class="acquired-message"><b>👏 Bienvenue.</b><br>Aucun défi acquis à ce premier niveau. Tu construis ici tes premières bases.</div>';
  }else{
    acquired.innerHTML='<div class="acquired-message"><b>👏 Bravo !</b><br>Ces formes ont déjà été découvertes. Les anciens seuils sont reconnus automatiquement.</div>'+
      data.acquired.map(x=>'<div class="acquired-item"><b>✓ '+x+'</b></div>').join("");
  }

  const challenges=document.getElementById("currentJuggleChallenges");
  challenges.innerHTML=data.items.map((item,index)=>`
    <article class="juggle-item" data-index="${index}">
      <h3>${item.name}</h3>
      <div class="juggle-requirement"><b>Défi exact</b><br>${currentInstruction(item)}</div>
      <div class="juggle-entry">
        <input type="number" min="0" step="${item.mode==="timed"?"0.1":"1"}" placeholder="${item.mode==="timed"?"Temps réalisé":"Résultat réalisé"}">
        <button class="primary" type="button">Valider</button>
      </div>
      <div class="juggle-feedback">En attente</div>
    </article>
  `).join("");

  challenges.querySelectorAll(".juggle-item").forEach(card=>{
    const index=Number(card.dataset.index);
    const item=data.items[index];
    const input=card.querySelector("input");
    const key="level"+level+"item"+index;
    if(currentJuggleState[key]!==undefined) input.value=currentJuggleState[key];

    const apply=()=>{
      const value=Number(input.value||0);
      const ok=currentValid(item,value);
      card.classList.toggle("done",ok);
      const feedback=card.querySelector(".juggle-feedback");
      feedback.className="juggle-feedback"+(ok?" ok":"");
      feedback.innerHTML=ok?'<span class="juggle-badge">Validé</span> · +2 IFI':'Objectif non atteint : '+currentInstruction(item);
      currentJuggleState[key]=value;
      safeJSONWrite("current-juggle-level-state",currentJuggleState);
      updateCurrentJuggleProgress();
    };

    card.querySelector("button").addEventListener("click",apply);
    if(input.value) apply();
  });

  document.getElementById("currentJuggleNext").innerHTML=data.next.map(x=>`
    <article class="locked-level-card">
      <h3>🔒 ${x.medal} ${x.name}</h3>
      <b>Nouvelles compétences</b>
      <ul>${x.newSkills.map(s=>"<li>"+s+"</li>").join("")}</ul>
      <p class="muted">Débloqué après validation du niveau actuel.</p>
    </article>
  `).join("");

  updateCurrentJuggleProgress();
}

function updateCurrentJuggleProgress(){
  const cards=[...document.querySelectorAll("#currentJuggleChallenges .juggle-item")];
  const done=cards.filter(c=>c.classList.contains("done")).length;
  const pct=Math.round(done/cards.length*100);
  document.getElementById("currentJuggleBar").style.width=pct+"%";
  document.getElementById("currentJugglePercent").textContent=pct+" %";
}

renderCurrentJuggleLevel();


function resizeEmbeddedFrame(frame){
  try{
    const doc = frame.contentDocument || frame.contentWindow.document;
    if(!doc) return;
    doc.documentElement.style.overflow = 'hidden';
    doc.body.style.overflow = 'hidden';
    const update = () => {
      const h = Math.max(
        doc.body ? doc.body.scrollHeight : 0,
        doc.documentElement ? doc.documentElement.scrollHeight : 0,
        900
      );
      frame.style.height = (h + 24) + 'px';
    };
    update();
    setTimeout(update, 150);
    setTimeout(update, 500);
    if(window.ResizeObserver && doc.body){
      const observer = new ResizeObserver(update);
      observer.observe(doc.body);
    }
    if(window.MutationObserver && doc.body){
      const mutationObserver = new MutationObserver(update);
      mutationObserver.observe(doc.body,{subtree:true,childList:true,attributes:true});
    }
  }catch(e){
    frame.style.height = '1400px';
  }
}
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('iframe.embedded-module').forEach(frame=>{
    if(frame.contentDocument && frame.contentDocument.readyState === 'complete'){
      resizeEmbeddedFrame(frame);
    }
  });
});

/* ===== Moteur Suivi d'objet ===== */
const TRACKER_LEVELS=[
 {name:'Débutant · Bronze',targets:2,durations:[10,10,14,14],speed:[1,1.1,1.1,1.1],lure:false,turn:false,space:false,stops:false,order:[false,false,false,false]},
 {name:'Débutant · Argent',targets:3,durations:[12,12,12,14],speed:[1,1.1,1.1,1.1],lure:false,turn:false,space:false,stops:false,order:[false,false,true,false]},
 {name:'Débutant · Or',targets:3,durations:[14,14,16,16],speed:[1,1.1,1.1,1.1],lure:true,turn:false,space:false,stops:false,order:[false,false,true,false]},
 {name:'Apprenti · Bronze',targets:3,durations:[16,16,16,16],speed:[1,1.1,1.1,1.1],lure:true,turn:true,space:false,stops:false,order:[false,true,false,false]},
 {name:'Apprenti · Argent',targets:3,durations:[20,20,20,20],speed:[1,1.1,1.1,1.1],lure:true,turn:true,space:false,stops:false,order:[false,true,false,false]},
 {name:'Apprenti · Or',targets:3,durations:[20,20,20,20],speed:[1,1.2,1.2,1.2],lure:true,turn:true,space:true,stops:false,order:[false,true,false,false]},
 {name:'Intermédiaire · Bronze',targets:3,durations:[20,20,20,20],speed:[1,1.2,1.2,1.2],lure:true,turn:true,space:true,stops:true,order:[false,true,false,false]},
 {name:'Intermédiaire · Argent',targets:3,durations:[20,20,20,20],speed:[1,1.3,1.3,1.3],lure:true,turn:true,space:true,stops:true,order:[false,true,false,false]},
 {name:'Intermédiaire · Or',targets:3,durations:[24,24,24,24],speed:[1,1.3,1.3,1.3],lure:true,turn:true,space:true,stops:true,order:[false,true,false,false]},
 {name:'Avancé · Bronze',targets:4,durations:[20,20,20,20],speed:[1,1.1,1.1,1.1],lure:true,turn:true,space:false,stops:false,order:[false,false,false,false]},
 {name:'Avancé · Argent',targets:4,durations:[20,20,20,20],speed:[1,1.2,1.2,1.2],lure:true,turn:true,space:true,stops:false,order:[false,false,false,false]},
 {name:'Avancé · Or',targets:4,durations:[20,20,20,20],speed:[1,1.2,1.2,1.2],lure:true,turn:true,space:true,stops:true,order:[false,false,false,false]},
 {name:'Expert · Bronze',targets:4,durations:[24,24,20,20],speed:[1,1.3,1.3,1.3],lure:true,turn:true,space:true,stops:true,order:[false,false,false,false]},
 {name:'Expert · Argent',targets:5,durations:[16,16,16,16],speed:[1,1.1,1.1,1.1],lure:true,turn:true,space:false,stops:false,order:[false,false,false,false]},
 {name:'Expert · Or',targets:5,durations:[20,20,20,20],speed:[1,1.1,1.1,1.1],lure:true,turn:true,space:false,stops:false,order:[false,true,false,false]}
];
const trackerState=safeJSONRead('fi-suivi-objet-v1',{unlocked:1,done:{}});
let trackerTestMode=false, trackerSelectedLevel=0, trackerSelectedSequence=0, trackerRun=null;
function trackerSave(){safeJSONWrite('fi-suivi-objet-v1',trackerState)}
function trackerKey(l,s){return `${l+1}-${s+1}`}
function trackerMedal(i){return i%3===0?'🥉':i%3===1?'🥈':'🥇'}
function trackerRender(){
 const grid=document.getElementById('trackerLevels'), select=document.getElementById('trackerTestLevel'); if(!grid||!select)return;
 if(!select.options.length)TRACKER_LEVELS.forEach((l,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${i+1}. ${l.name}`;select.appendChild(o)});
 select.value=trackerSelectedLevel; grid.innerHTML='';
 TRACKER_LEVELS.forEach((l,i)=>{const available=trackerTestMode||i<trackerState.unlocked;const done=[0,1,2,3].filter(q=>trackerState.done[trackerKey(i,q)]).length;const el=document.createElement('article');el.className='cog-level '+(!available?'locked ':'')+(i===trackerState.unlocked-1?'current':'');
 el.innerHTML=`<div class="kicker">${trackerMedal(i)} Sous-niveau ${i+1}</div><h3>${l.name}</h3><p class="muted">${l.targets} cibles · 8 ballons · ${l.durations[0]} à ${Math.max(...l.durations)} s</p><div class="progress"><span style="width:${done*25}%"></span></div><div class="cog-seqs">${[0,1,2,3].map(q=>`<button type="button" class="cog-seq ${q===3?'test ':''}${trackerState.done[trackerKey(i,q)]?'done':''}" data-l="${i}" data-s="${q}" ${available?'':'disabled'}>${q===3?'Test':'S'+(q+1)}</button>`).join('')}</div>`;grid.appendChild(el)});
 grid.querySelectorAll('.cog-seq').forEach(b=>b.addEventListener('click',()=>trackerLaunch(+b.dataset.l,+b.dataset.s)));
 const current=TRACKER_LEVELS[Math.min(trackerState.unlocked-1,14)];document.getElementById('trackerCurrentLabel').textContent=current.name;const total=Object.keys(trackerState.done).length;document.getElementById('trackerProgressBar').style.width=Math.round(total/60*100)+'%';document.getElementById('trackerProgressText').textContent=`${total} séquence(s) validée(s) sur 60.`;document.getElementById('trackerProfileBadge').textContent=trackerTestMode?'Profil test interne':'Profil joueur';
}
function trackerShowMessage(title,text,buttons){const m=document.getElementById('trackerMessage');m.classList.remove('hidden');document.getElementById('trackerMessageTitle').textContent=title;document.getElementById('trackerMessageText').textContent=text;const a=document.getElementById('trackerMessageActions');a.innerHTML='';buttons.forEach(x=>{const b=document.createElement('button');b.className=x.primary?'primary':'secondary';b.type='button';b.textContent=x.label;b.addEventListener('click',x.fn);a.appendChild(b)})}
function trackerLaunch(l,sq){trackerSelectedLevel=l;trackerSelectedSequence=sq;const cfg=TRACKER_LEVELS[l];const overlay=document.getElementById('trackerOverlay');overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';document.getElementById('trackerHudLevel').textContent=cfg.name;document.getElementById('trackerHudSequence').textContent=sq===3?'Séquence 4 · Test':'Séquence '+(sq+1);document.getElementById('trackerHudTargets').textContent=cfg.targets+' cible(s) à retrouver';document.getElementById('trackerTimer').textContent=cfg.durations[sq];document.getElementById('trackerFooter').textContent='Observe les ballons-cibles.';trackerClearStage();trackerShowMessage('Suivi d’objet',`${cfg.targets} cible(s), 8 ballons, ${cfg.durations[sq]} secondes.${sq===3?' Test de passage : cibles aux extrémités.':''}`,[{label:'Commencer',primary:true,fn:()=>trackerStart(l,sq)}])}
function trackerClearStage(){const stage=document.getElementById('trackerStage');stage.querySelectorAll('.track-ball').forEach(x=>x.remove());if(trackerRun){cancelAnimationFrame(trackerRun.raf);clearInterval(trackerRun.clock);(trackerRun.timeouts||[]).forEach(clearTimeout);trackerRun=null}}
function trackerStart(l,sq){document.getElementById('trackerMessage').classList.add('hidden');const cfg=TRACKER_LEVELS[l],stage=document.getElementById('trackerStage'),rect=stage.getBoundingClientRect(),size=innerWidth<620?46:54,pad=18;const ids=[0,1,2,3,4,5,6,7].sort(()=>Math.random()-.5),targets=ids.slice(0,cfg.targets),lure=cfg.lure?ids.find(x=>!targets.includes(x)):null;const balls=[];
 const extreme=[[pad,pad],[rect.width-size-pad,pad],[pad,rect.height-size-pad],[rect.width-size-pad,rect.height-size-pad],[rect.width/2-size/2,pad],[rect.width/2-size/2,rect.height-size-pad]];
 for(let i=0;i<8;i++){const el=document.createElement('div');el.className='track-ball';el.dataset.id=i;let x,y;if(sq===3&&targets.includes(i)){const p=extreme[targets.indexOf(i)%extreme.length];x=p[0];y=p[1]}else{x=pad+Math.random()*Math.max(1,rect.width-size-pad*2);y=90+Math.random()*Math.max(1,rect.height-size-180)};const angle=Math.random()*Math.PI*2,base=(55+Math.random()*30)*cfg.speed[sq];balls.push({id:i,el,x,y,vx:Math.cos(angle)*base,vy:Math.sin(angle)*base,stoppedUntil:0,nextTurn:performance.now()+700+Math.random()*1500,nextStop:performance.now()+1800+Math.random()*3000});el.style.transform=`translate(${x}px,${y}px)`;stage.appendChild(el)}
 trackerRun={l,sq,cfg,balls,targets,lure,order:targets.slice().sort(()=>Math.random()-.5),selected:[],phase:'preview',last:performance.now(),timeouts:[]};
 const lightOrder=cfg.order[sq];if(lightOrder){trackerRun.order.forEach((id,index)=>{trackerRun.timeouts.push(setTimeout(()=>balls[id].el.classList.add('target-lit'),index*700));trackerRun.timeouts.push(setTimeout(()=>balls[id].el.classList.remove('target-lit'),index*700+520))});trackerRun.timeouts.push(setTimeout(()=>trackerMovementStart(cfg.durations[sq]),trackerRun.order.length*700+500))}else{targets.forEach(id=>balls[id].el.classList.add('target-lit'));trackerRun.timeouts.push(setTimeout(()=>{targets.forEach(id=>balls[id].el.classList.remove('target-lit'));trackerMovementStart(cfg.durations[sq])},1700))}
}
function trackerMovementStart(duration){if(!trackerRun)return;trackerRun.phase='move';document.getElementById('trackerFooter').textContent='Garde les cibles en mémoire.';let left=duration;document.getElementById('trackerTimer').textContent=left;trackerRun.clock=setInterval(()=>{left--;document.getElementById('trackerTimer').textContent=Math.max(0,left);if(left<=0){clearInterval(trackerRun.clock);trackerSelection()}},1000);trackerRun.raf=requestAnimationFrame(trackerTick);if(trackerRun.lure!==null)trackerLureBlink()}
function trackerLureBlink(){if(!trackerRun||trackerRun.phase!=='move')return;const b=trackerRun.balls[trackerRun.lure];b.el.classList.add('lure-lit');const visible=300+Math.random()*700;trackerRun.timeouts.push(setTimeout(()=>{if(!trackerRun)return;b.el.style.opacity='0';b.el.classList.remove('lure-lit');const hidden=150+Math.random()*850;trackerRun.timeouts.push(setTimeout(()=>{if(!trackerRun)return;b.x=Math.max(10,Math.min(innerWidth-70,b.x+(Math.random()-.5)*80));b.y=Math.max(90,Math.min(innerHeight-80,b.y+(Math.random()-.5)*80));b.el.style.opacity='1';trackerLureBlink()},hidden))},visible))}
function trackerTick(now){if(!trackerRun||trackerRun.phase!=='move')return;const dt=Math.min(.035,(now-trackerRun.last)/1000);trackerRun.last=now;const W=innerWidth,H=innerHeight,size=innerWidth<620?46:54;
 trackerRun.balls.forEach(b=>{if(trackerRun.cfg.turn&&now>b.nextTurn){const a=Math.random()*Math.PI*2,s=Math.hypot(b.vx,b.vy);b.vx=Math.cos(a)*s;b.vy=Math.sin(a)*s;b.nextTurn=now+600+Math.random()*1800}if(trackerRun.cfg.stops&&now>b.nextStop){b.stoppedUntil=now+1000+Math.random()*2000;b.nextStop=now+3000+Math.random()*4500}if(now>=b.stoppedUntil){b.x+=b.vx*dt;b.y+=b.vy*dt}if(b.x<0){b.x=0;b.vx=Math.abs(b.vx)}if(b.x>W-size){b.x=W-size;b.vx=-Math.abs(b.vx)}if(b.y<78){b.y=78;b.vy=Math.abs(b.vy)}if(b.y>H-size){b.y=H-size;b.vy=-Math.abs(b.vy)}b.el.style.transform=`translate(${b.x}px,${b.y}px)`});
 if(trackerRun.sq!==3){for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){const a=trackerRun.balls[i],b=trackerRun.balls[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<size*.82&&d>0){const tvx=a.vx,tvy=a.vy;a.vx=b.vx;a.vy=b.vy;b.vx=tvx;b.vy=tvy}}}
 trackerRun.raf=requestAnimationFrame(trackerTick)}
function trackerSelection(){if(!trackerRun)return;cancelAnimationFrame(trackerRun.raf);trackerRun.phase='select';document.getElementById('trackerFooter').textContent=trackerRun.cfg.order[trackerRun.sq]?'Sélectionne les cibles dans le bon ordre.':'Sélectionne les ballons-cibles.';trackerRun.balls.forEach(b=>b.el.addEventListener('click',trackerPick))}
function trackerPick(e){if(!trackerRun||trackerRun.phase!=='select')return;const id=+e.currentTarget.dataset.id;if(trackerRun.selected.includes(id))return;trackerRun.selected.push(id);e.currentTarget.classList.add('selected');if(trackerRun.selected.length===trackerRun.cfg.targets){const expected=trackerRun.cfg.order[trackerRun.sq]?trackerRun.order:trackerRun.targets;const ok=trackerRun.cfg.order[trackerRun.sq]?expected.every((x,i)=>x===trackerRun.selected[i]):trackerRun.selected.every(x=>expected.includes(x));trackerFinish(ok)}}
function trackerFinish(ok){trackerRun.phase='done';if(!ok)trackerRun.selected.forEach(id=>trackerRun.balls[id].el.classList.add('wrong'));if(ok&&!trackerTestMode){trackerState.done[trackerKey(trackerRun.l,trackerRun.sq)]=true;if(trackerRun.sq===3&&trackerRun.l+1===trackerState.unlocked&&trackerState.unlocked<15)trackerState.unlocked++;trackerSave()}trackerShowMessage(ok?'Séquence réussie':'Séquence à refaire',ok?'Les bonnes cibles ont été retrouvées.':'La sélection ne correspond pas aux cibles attendues.',[{label:'Rejouer',primary:!ok,fn:()=>trackerStart(trackerRun.l,trackerRun.sq)},{label:'Retour aux niveaux',primary:ok,fn:trackerClose}]);trackerRender()}
function trackerClose(){trackerClearStage();document.getElementById('trackerOverlay').classList.remove('open');document.getElementById('trackerOverlay').setAttribute('aria-hidden','true');document.body.style.overflow='';}
document.getElementById('trackerCloseBtn')?.addEventListener('click',trackerClose);
document.getElementById('trackerTestLevel')?.addEventListener('change',e=>trackerSelectedLevel=+e.target.value);
document.getElementById('trackerTestModeBtn')?.addEventListener('click',e=>{trackerTestMode=!trackerTestMode;e.target.textContent=trackerTestMode?'Désactiver le profil test':'Activer le profil test';trackerRender()});
document.getElementById('trackerResetBtn')?.addEventListener('click',()=>{trackerState.unlocked=1;trackerState.done={};trackerSave();trackerRender()});
document.getElementById('trackerPassBtn')?.addEventListener('click',()=>{for(let q=0;q<4;q++)trackerState.done[trackerKey(trackerSelectedLevel,q)]=true;trackerState.unlocked=Math.max(trackerState.unlocked,Math.min(15,trackerSelectedLevel+2));trackerSave();trackerRender()});
document.getElementById('trackerFailBtn')?.addEventListener('click',()=>{for(let q=0;q<4;q++)delete trackerState.done[trackerKey(trackerSelectedLevel,q)];trackerSave();trackerRender()});
trackerRender();
