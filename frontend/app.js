let chars=[],current=null,currentChat=null,battleState=null,battleSelected={a:[],b:[]},battleMode="new";
const $=x=>document.getElementById(x);
async function api(u,o){const r=await fetch(u,o);if(!r.ok)throw Error(await r.text());return r.json()}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function stopMedia(){document.querySelectorAll("video").forEach(v=>{try{v.pause();v.currentTime=0}catch(_){}});if("speechSynthesis"in window)speechSynthesis.cancel()}
function modal(s){stopPresentationMedia();$("content").innerHTML=s;$("modal").classList.remove("hidden")}
function closeModal(){stopPresentationMedia();$("modal").classList.add("hidden");$("content").innerHTML=""}
function stopPresentationMedia(){const v=$("presentationVideo");if(v){v.pause();v.removeAttribute("src");v.load()}}
function playVideo(v,sound=false){if(!v)return;v.muted=!sound;const p=v.play();if(p)p.catch(()=>{})}
function showLanding(){stopMedia();["opening","selection","characterDetail","app","ending"].forEach(id=>$(id).classList.add("hidden"));$("landing").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"})}
function showSelection(){stopMedia();["landing","app","opening","characterDetail","ending"].forEach(id=>$(id).classList.add("hidden"));$("selection").classList.remove("hidden");renderCharacterCards();window.scrollTo({top:0,behavior:"smooth"})}
function showApp(){stopMedia();["landing","selection","opening","characterDetail","ending"].forEach(id=>$(id).classList.add("hidden"));$("app").classList.remove("hidden")}
function startOpening(){const v=$("openingVideo");$("opening").classList.remove("hidden");v.currentTime=0;playVideo(v,true)}
function finishOpening(){const v=$("openingVideo");v.pause();v.currentTime=0;$("opening").classList.add("hidden");showSelection()}
function renderLandingSpirits(){$("landingSpiritGrid").innerHTML=chars.slice(0,5).map(c=>`<article class="mini-spirit" data-id="${esc(c.id)}" tabindex="0"><img src="${c.image}" alt="${esc(c.name)}"><div><strong>${esc(c.name)}</strong><span>${esc(c.title)}</span></div></article>`).join("");document.querySelectorAll(".mini-spirit").forEach(el=>{const go=()=>openCharacterDetail(el.dataset.id);el.onclick=go;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')go()}})}
function renderCharacterCards(){
  $("characterGrid").innerHTML=chars.map(c=>`<article class="character-card" data-id="${esc(c.id)}">
    <div class="card-image-wrap" onclick="openCharacterDetail('${c.id}')">
      <img src="${c.image}" alt="${esc(c.name)}">
      <span class="play-badge">▣ Ver galería</span>
    </div>
    <div class="card-body">
      <h2>${esc(c.name)}</h2>
      <h4>${esc(c.title)}</h4>
      <p>${esc(c.description)}</p>
      <div class="stat-strip"><span>HP ${c.stats.hp}</span><span>ATK ${c.stats.attack}</span><span>DEF ${c.stats.defense}</span><span>SPD ${c.stats.speed}</span></div>
      <button class="choose-btn gallery-direct-btn" data-id="${c.id}">▣ Fotos y videos</button>
      <button class="choose-btn secondary presentation-btn" data-id="${c.id}">▶ Ver presentación</button>
      <button class="choose-btn secondary chat-direct-btn" data-id="${c.id}">♥ Iniciar chat</button>
    </div>
  </article>`).join("");
  document.querySelectorAll(".gallery-direct-btn").forEach(b=>b.onclick=()=>openCharacterDetail(b.dataset.id));
  document.querySelectorAll(".chat-direct-btn").forEach(b => b.onclick = () => startChatWith(b.dataset.id));
}

function openCharacterDetail(id){
  const c=chars.find(x=>x.id===id);
  if(!c)return;
  stopMedia();
  ["landing","selection","app","opening","ending"].forEach(x=>$(x).classList.add("hidden"));
  $("characterDetail").classList.remove("hidden");

  const photos=(c.gallery&&c.gallery.length?c.gallery:[c.image]).map((src,i)=>`
    <button class="media-photo" type="button" onclick="openMediaLightbox('${src}','${esc(c.name)} · Foto ${i+1}')">
      <img src="${src}" alt="${esc(c.name)} · Foto ${i+1}" loading="lazy">
    </button>`).join("");

  const videos=(c.videos&&c.videos.length?c.videos:[c.video]).map((src,i)=>`
    <article class="media-video-card">
      <video src="${src}" controls preload="metadata" playsinline></video>
      <div><span>VIDEO ${String(i+1).padStart(2,"0")}</span><strong>${esc(c.name)}</strong></div>
    </article>`).join("");

  $("characterDetail").innerHTML=`
    <header class="detail-header">
      <div class="brand-lockup"><div class="brand-mark">✦</div><div><strong>DATE A LIVE AI</strong><span>ARCHIVO DEL PERSONAJE</span></div></div>
      <div class="detail-header-actions">
        <button class="secondary" onclick="showSelection()">← Volver a personajes</button>
        <button class="secondary" onclick="showLanding()">⌂ Inicio</button>
      </div>
    </header>
    <main class="character-detail-main">
      <section class="character-detail-hero">
        <div class="detail-portrait"><img src="${c.image}" alt="${esc(c.name)}"></div>
        <div class="detail-copy">
          <div class="eyebrow">SPIRIT DATABASE · PERFIL COMPLETO</div>
          <h1>${esc(c.name)}</h1>
          <h2>${esc(c.title)}</h2>
          <p>${esc(c.description)}</p>
          <div class="detail-personality"><span>PERSONALIDAD</span><strong>${esc(c.personality)}</strong></div>
          <div class="detail-stats">
            <span><b>${c.stats.hp}</b> HP</span><span><b>${c.stats.attack}</b> ATK</span>
            <span><b>${c.stats.defense}</b> DEF</span><span><b>${c.stats.speed}</b> SPD</span>
          </div>
          <div class="detail-actions">
            <button class="primary-cta" onclick="startChatWith('${c.id}')">♥ Iniciar chat</button>
            <button class="secondary" onclick="openCharacterPresentation('${c.id}')">▶ Ver presentación</button>
          </div>
        </div>
      </section>

      <section class="detail-media-section">
        <div class="detail-section-heading">
          <div><div class="eyebrow">GALERÍA VISUAL</div><h2>Todas las fotos de ${esc(c.name)}</h2></div>
          <span>${(c.gallery || (c.image ? [c.image] : [])).length} archivos</span>
        </div>
        <div class="photo-gallery">${photos}</div>
      </section>

      <section class="detail-media-section">
        <div class="detail-section-heading">
          <div><div class="eyebrow">ARCHIVO MULTIMEDIA</div><h2>Todos los videos de ${esc(c.name)}</h2></div>
          <span>${(c.videos || (c.video ? [c.video] : [])).length} videos</span>
        </div>
        <div class="video-gallery">${videos}</div>
      </section>
    </main>`;
  window.scrollTo({top:0,behavior:"smooth"});
}

function openMediaLightbox(src,title){
  $("mediaLightbox").classList.remove("hidden");
  $("mediaLightboxContent").innerHTML=`<img src="${src}" alt="${esc(title)}"><div class="lightbox-caption">${esc(title)}</div>`;
}
function closeMediaLightbox(){
  $("mediaLightbox").classList.add("hidden");
  $("mediaLightboxContent").innerHTML="";
}


function openCharacterPresentation(id){const c=chars.find(x=>x.id===id);if(!c)return;modal(`<div class="presentation-modal"><div class="video-box"><video id="presentationVideo" src="${c.video}" controls autoplay playsinline preload="metadata"></video></div><div class="presentation-info"><img src="${c.image}" alt="${esc(c.name)}"><div><div class="eyebrow">PRESENTACIÓN</div><h2>${esc(c.name)}</h2><h4>${esc(c.title)}</h4><p>${esc(c.description)}</p></div></div><div class="modal-actions"><button onclick="startChatWith('${c.id}')">♥ Iniciar chat con ${esc(c.name)}</button><button class="secondary" onclick="closeModal()">Cerrar video</button></div></div>`);const v=$("presentationVideo");if(v)playVideo(v,true)}
async function startChatWith(id){try{select(id);showApp();closeModal();if(!currentChat||!(await chatBelongsToCurrent(currentChat))){const x=await api('/api/chats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({character_id:current.id,title:'Charla con '+current.name})});currentChat=x.id}await loadChats();await openChat(currentChat);$("input").focus()}catch(e){alert('No se pudo abrir la charla: '+e.message)}}
async function chatBelongsToCurrent(id){try{return(await api('/api/chats/'+id)).chat.character_id===current.id}catch(_){return false}}
async function load(){try{chars=await api('/api/characters');$("chars").innerHTML=chars.map(c=>`<div class="char" data-id="${c.id}"><img src="${c.image}" alt=""><span>${esc(c.name)}</span></div>`).join('');document.querySelectorAll('.char').forEach(x=>x.onclick=()=>{select(x.dataset.id);if(!currentChat)createChat()});renderCharacterCards();renderLandingSpirits();await loadChats()}catch(e){console.error(e);alert('No se pudo cargar la base de Espíritus.')}}
function select(id){current=chars.find(x=>x.id===id);if(!current)return;$("name").textContent=current.name;$("title").textContent=current.title;$("miniImage").src=current.image;$("miniImage").classList.remove('hidden');$("avatar").src=current.image;$("avatar").alt=current.name;$("avatar").classList.remove('hidden');$("avatarFallback").classList.add('hidden');$("emotion").textContent='Emoción: neutral';document.querySelectorAll('.char').forEach(x=>x.classList.toggle('active',x.dataset.id===id))}
async function loadChats(){const x=await api('/api/chats');$("chats").innerHTML=x.length?x.map(c=>`<div class="chat-row"><button class="chat" data-chat="${c.id}">${esc(c.title)}</button><button class="chat-delete" data-delete-chat="${c.id}" title="Eliminar chat">🗑</button></div>`).join(''):'<div class="chat">Todavía no hay charlas.</div>';document.querySelectorAll('[data-chat]').forEach(el=>el.onclick=()=>openChat(Number(el.dataset.chat)));document.querySelectorAll('[data-delete-chat]').forEach(el=>el.onclick=()=>deleteChat(Number(el.dataset.deleteChat)))}
async function deleteChat(id){if(!confirm('¿Eliminar esta charla y todos sus mensajes?'))return;try{await api('/api/chats/'+id,{method:'DELETE'});if(currentChat===id){currentChat=null;$("msgs").innerHTML='';$("name").textContent='Selecciona personaje';$("title").textContent='Elige una Espíritu para comenzar'}await loadChats()}catch(e){alert('No se pudo eliminar el chat: '+e.message)}}
async function openChat(id){const d=await api('/api/chats/'+id);currentChat=id;select(d.chat.character_id);render(d.messages)}
function renderMediaMessage(content){
  const m=String(content||'').match(/\[\[MEDIA:(photo|video)\|([^\]]+)\]\]/);
  if(!m)return esc(content);
  const text=String(content).replace(m[0],'').trim();
  const url=esc(m[2]);
  const name=esc(current?.name||'Espíritu');
  const media=m[1]==='photo'
    ? `<button class="chat-media-photo" type="button" onclick="openMediaLightbox('${url}','${name} · Foto')"><img src="${url}" alt="Foto de ${name}" loading="lazy"><span>▣ Abrir foto</span></button>`
    : `<div class="chat-media-video"><video src="${url}" controls preload="metadata" playsinline></video><span>▶ Video de ${name}</span></div>`;
  return `${esc(text)}${media}`;
}
function render(a){$("msgs").innerHTML=a.map(m=>`<div class="msg ${m.role}"><small>${m.role==='user'?'Tú':esc(current?.name||'Espíritu')} · ${esc(m.emotion||'')}</small>${m.role==='assistant'?renderMediaMessage(m.content):esc(m.content)}</div>`).join('');$("msgs").scrollTop=$("msgs").scrollHeight}
async function createChat(){if(!current)return alert('Selecciona un personaje');const x=await api('/api/chats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({character_id:current.id,title:'Charla con '+current.name})});currentChat=x.id;await loadChats();await openChat(x.id)}
async function speak(text,emotion='neutral'){if(!current||!text)return;$("avatarWrap").classList.add('talking','emotion-'+emotion);try{const r=await fetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({character_id:current.id,text})});if(r.ok){const blob=await r.blob(),url=URL.createObjectURL(blob),audio=new Audio(url);audio.onended=()=>{URL.revokeObjectURL(url);$("avatarWrap").classList.remove('talking')};await audio.play();return}}catch(_){}if('speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='es-AR';u.rate=emotion==='angry'?1.08:.98;u.pitch=emotion==='happy'?1.15:emotion==='sad'?.9:1;u.onend=()=>$("avatarWrap").classList.remove('talking');speechSynthesis.speak(u)}else $("avatarWrap").classList.remove('talking')}
async function send(){if(!currentChat)return alert('Primero selecciona una Espíritu o crea una charla.');const v=$("input").value.trim();if(!v)return;$("input").value='';$("msgs").innerHTML+=`<div class="msg user"><small>Tú</small>${esc(v)}</div>`;$("avatarWrap").classList.add('talking');try{const x=await api('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:currentChat,content:v})});$("msgs").innerHTML+=`<div class="msg assistant"><small>${esc(current.name)} · ${esc(x.emotion)}</small>${renderMediaMessage(x.content)}</div>`;$("emotion").textContent='Emoción: '+x.emotion;await speak(x.content,x.emotion)}catch(e){$("msgs").innerHTML+=`<div class="msg assistant"><small>Sistema</small>No responde el modelo local. Comprueba Ollama y OLLAMA_MODEL.</div>`;$("avatarWrap").classList.remove('talking')}$("msgs").scrollTop=$("msgs").scrollHeight;await loadChats()}
function finishDate(){if(!current)return;closeModal();const c=current;modal(`<div class="goodbye"><img src="${c.image}" alt="${esc(c.name)}"><div><div class="eyebrow">FIN DE LA CITA</div><h2>${esc(c.name)} se despide</h2><p>${esc(c.goodbye)}</p><button onclick="closeModal();startEnding()">Continuar</button></div></div>`)}
function startEnding(){stopMedia();$("app").classList.add('hidden');$("ending").classList.remove('hidden');const v=$("endingVideo");v.currentTime=0;playVideo(v,true)}
function closeExperience(){stopMedia();$("ending").classList.add('hidden');showLanding()}
function openGuide(){modal(`<div><div class="eyebrow">CÓMO FUNCIONA</div><h2>Tu experiencia en cuatro pasos</h2><p>1. Comenzá para ver el opening.</p><p>2. Saltalo cuando quieras.</p><p>3. Elegí una Espíritu, mirá su presentación y comenzá el chat.</p><p>4. Desde el panel podés continuar charlas, tener citas y abrir el nuevo sistema de batalla RPG.</p></div>`)}

function rankFor(c){const s=c.stats,total=s.hp+s.attack*4+s.defense*4+s.speed*3;return total>=260?"S":total>=220?"A":total>=185?"B":"C"}
function statLine(u){const s=u.stats,p=Math.max(0,Math.round(s.hp/s.max_hp*100));return `<div class="battle-unit"><img src="${u.image}" alt="${esc(u.name)}"><div class="battle-unit-info"><strong>${esc(u.name)}</strong><small>${esc(u.title)}</small><div class="hpbar"><i style="width:${p}%"></i></div><span>HP ${s.hp}/${s.max_hp} · ATK ${s.attack} · DEF ${s.defense+(s.defense_bonus||0)} · RANGO ${s.rank}</span></div></div>`}
function spiritCard(c,team){const selected=battleSelected[team].includes(c.id);return `<button class="battle-select-card ${selected?'selected':''}" onclick="toggleBattleSpirit('${c.id}','${team}')"><img src="${c.image}"><div><b>${esc(c.name)}</b><small>${esc(c.title)}</small><p>${esc(c.description)}</p><span>HP ${c.stats.hp} · ATK ${c.stats.attack} · DEF ${c.stats.defense} · RANGO ${rankFor(c)}</span></div></button>`}
function openBattle(){battleMode='new';battleSelected={a:[],b:[]};battleActiveFighter=null;battleActiveTarget=null;$("app").classList.add('hidden');$("battleScreen").classList.remove('hidden');renderBattleSetup()}
function closeBattleScreen(){ $("battleScreen").classList.add('hidden'); $("app").classList.remove('hidden'); }
async function openSavedBattles(){const list=await api('/api/battles/saved');modal(`<div class="battle-menu"><div class="eyebrow">PARTIDAS</div><h2>Batallas guardadas</h2>${list.length?list.map(x=>`<div class="saved-battle"><div><b>#${x.id}</b> · Turno ${x.turn}<br><small>${esc(x.team_a.join(', '))} ⚔ ${esc(x.team_b.join(', '))}</small></div><button onclick="loadSavedBattle(${x.id})">Continuar</button><button class="secondary" onclick="deleteSavedBattle(${x.id})">🗑</button></div>`).join(''):'<p>No hay batallas guardadas.</p>'}<div class="modal-actions"><button onclick="closeModal();openBattle()">⚔ Nueva batalla</button><button class="secondary" onclick="closeModal()">Cerrar</button></div></div>`)}
function renderBattleSetup(){const host=$("battleContent");host.innerHTML=`<div class="battle-setup"><div class="battle-title"><div><div class="eyebrow">ARENA DE ESPÍRITUS · RPG</div><h2>Prepará tu equipo</h2><p>Elegí hasta 4 Espíritus por lado. Podés cambiar la selección antes de comenzar.</p></div><div class="battle-title-actions"><button class="secondary" onclick="openSavedBattles()">💾 Partidas guardadas</button><button class="secondary" onclick="closeBattleScreen()">← Volver al chat</button></div></div><div class="battle-teams"><section><h3>⚔ Tu equipo <span>${battleSelected.a.length}/4</span></h3><div class="battle-roster">${chars.map(c=>spiritCard(c,'a')).join('')}</div></section><section><h3>☠ Equipo rival <span>${battleSelected.b.length}/4</span></h3><div class="battle-roster">${chars.map(c=>spiritCard(c,'b')).join('')}</div></section></div><div class="modal-actions"><button onclick="beginBattle()">Iniciar batalla</button><button class="secondary" onclick="closeBattleScreen()">Cancelar</button></div></div>`}
function toggleBattleSpirit(id,team){const arr=battleSelected[team],i=arr.indexOf(id);if(i>=0)arr.splice(i,1);else if(arr.length<4)arr.push(id);renderBattleSetup()}
async function beginBattle(){if(!battleSelected.a.length||!battleSelected.b.length)return alert('Elegí al menos un Espíritu para cada equipo.');try{battleState=await api('/api/battles',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({team_a:battleSelected.a,team_b:battleSelected.b})});renderBattleArena()}catch(e){alert('No se pudo iniciar la batalla: '+e.message)}}
function renderBattleArena(){const s=battleState;const host=$("battleContent");host.innerHTML=`<div class="battle-arena"><div class="battle-head"><div><div class="eyebrow">ARENA · TURNO ${s.turn}</div><h2>${s.finished?(s.winner==='a'?'🏆 VICTORIA':'💀 DERROTA'):'Combate activo'}</h2></div><div class="battle-actions-top"><button class="secondary" onclick="saveCurrentBattle()">💾 Guardar</button><button class="secondary" onclick="confirmNewBattle()">↻ Nueva</button><button class="secondary" onclick="openSavedBattles()">📂 Cargar</button><button class="secondary" onclick="closeBattleScreen()">← Chat</button></div></div><div class="battle-fields"><section class="battle-side player"><h3>Tu equipo</h3>${s.team_a.map(statLine).join('')}</section><div class="battle-vs">VS</div><section class="battle-side enemy"><h3>Rival</h3>${s.team_b.map(statLine).join('')}</section></div><div class="battle-log">${s.log.slice(-6).map(x=>`<div>${esc(x)}</div>`).join('')}</div>${s.finished?battleResult():battleControls()}</div>`}
function battleControls(){const active=safeActivePlayer();if(!active)return '';return `<div class="battle-controls"><div class="action-row"><button onclick="battleAction('attack')">⚔ Atacar</button><button onclick="battleAction('angel')">✨ Usar Ángel</button><button onclick="battleAction('defend')">🛡 Defender</button></div><p>Seleccioná el Espíritu activo y luego un objetivo rival.</p><div class="battle-targets">${battleState.team_a.map(u=>`<button class="fighter-pick ${u.id===active.id?'active':''}" onclick="setActiveFighter('${u.id}')">${esc(u.name)}</button>`).join('')}<span>→ Objetivo:</span>${battleState.team_b.filter(u=>u.stats.hp>0).map(u=>`<button class="fighter-pick" onclick="setTarget('${u.id}')">${esc(u.name)}</button>`).join('')}</div><small id="battleHint">${battleActiveTarget?'Objetivo: '+battleActiveTarget:'Elegí un objetivo para atacar.'}</small></div>`}
let battleActiveFighter=null,battleActiveTarget=null;function syncBattleSelections(){if(!battleState)return;if(battleState.active_fighter)battleActiveFighter=battleState.active_fighter;if(battleState.active_target)battleActiveTarget=battleState.active_target}function safeActivePlayer(){syncBattleSelections();const alive=battleState.team_a.filter(u=>u.stats.hp>0);if(!battleActiveFighter||!alive.some(u=>u.id===battleActiveFighter)){battleActiveFighter=alive[0]?.id;battleState.active_fighter=battleActiveFighter}if(!battleActiveTarget||!battleState.team_b.some(u=>u.id===battleActiveTarget&&u.stats.hp>0)){battleActiveTarget=battleState.team_b.find(u=>u.stats.hp>0)?.id||null;battleState.active_target=battleActiveTarget}return alive.find(u=>u.id===battleActiveFighter)}
function setActiveFighter(id){battleActiveFighter=id;battleState.active_fighter=id;if(!battleState.team_b.some(u=>u.id===battleActiveTarget&&u.stats.hp>0))battleActiveTarget=battleState.team_b.find(u=>u.stats.hp>0)?.id||null;battleState.active_target=battleActiveTarget;renderBattleArena()}
function setTarget(id){battleActiveTarget=id;battleState.active_target=id;renderBattleArena()}
async function battleAction(action){const actor=safeActivePlayer();if(!actor)return;if(action==='attack'&&!battleActiveTarget)return alert('Elegí primero al rival que querés atacar.');try{battleState.active_fighter=actor.id;battleState.active_target=battleActiveTarget;battleState=await api('/api/battles/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:battleState,actor_team:'a',actor_id:actor.id,action,target_id:battleActiveTarget})});battleActiveFighter=battleState.active_fighter||actor.id;battleActiveTarget=battleState.active_target||battleActiveTarget;if(!battleState.team_b.some(u=>u.id===battleActiveTarget&&u.stats.hp>0))battleActiveTarget=battleState.team_b.find(u=>u.stats.hp>0)?.id||null;battleState.active_target=battleActiveTarget;renderBattleArena()}catch(e){alert('No se pudo ejecutar la acción: '+e.message)}}
function battleResult(){const winners=battleState.winner==='a'?battleState.team_a:battleState.team_b;const losers=battleState.winner==='a'?battleState.team_b:battleState.team_a;return `<div class="battle-result"><div class="result-banner ${battleState.winner==='a'?'win':'lose'}"><div class="eyebrow">RESULTADO FINAL</div><h2>${battleState.winner==='a'?'🏆 VICTORIA':'💀 DERROTA'}</h2><p>Puntaje: ${battleState.score[battleState.winner]}</p></div><div class="result-teams"><div><h3>Ganadores</h3>${winners.map(u=>`<div class="result-spirit"><img src="${u.image}"><span>${esc(u.name)}<small>HP ${u.stats.hp} · ATK ${u.stats.attack} · DEF ${u.stats.defense}</small></span></div>`).join('')}</div><div><h3>Perdedores</h3>${losers.map(u=>`<div class="result-spirit defeated"><img src="${u.image}"><span>${esc(u.name)}<small>HP 0 · ATK ${u.stats.attack} · DEF ${u.stats.defense}</small></span></div>`).join('')}</div></div><div class="modal-actions"><button onclick="openBattle()">⚔ Nueva batalla</button><button class="secondary" onclick="saveCurrentBattle()">💾 Guardar resultado</button><button class="secondary" onclick="closeBattleScreen()">Cerrar</button></div></div>`}
async function saveCurrentBattle(){if(!battleState)return;battleState.active_fighter=battleActiveFighter;battleState.active_target=battleActiveTarget;try{await api('/api/battles/saved',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:battleState})});alert('Batalla guardada correctamente.')}catch(e){alert('No se pudo guardar: '+e.message)}}
async function loadSavedBattle(id){try{battleState=await api('/api/battles/saved/'+id);battleActiveFighter=battleState.active_fighter||null;battleActiveTarget=battleState.active_target||null;renderBattleArena()}catch(e){alert('No se pudo cargar: '+e.message)}}
async function deleteSavedBattle(id){if(!confirm('¿Eliminar esta partida guardada?'))return;await api('/api/battles/saved/'+id,{method:'DELETE'});openSavedBattles()}
function confirmNewBattle(){if(confirm('¿Comenzar una nueva batalla? El combate actual quedará sin guardar.'))openBattle()}

$("new").onclick=createChat;$("send").onclick=send;$("input").onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}};
$("date").onclick=()=>{if(!current)return alert('Selecciona una Espíritu primero.');$("input").value='Quiero tener una cita contigo. ¿Qué haríamos?';if(!currentChat)createChat().then(send);else send()};
$("presentation").onclick=()=>current&&openCharacterPresentation(current.id);$("backSelection").onclick=showSelection;$("selectionHome").onclick=showLanding;$("exitFromSelection").onclick=startEnding;$("startExperience").onclick=startOpening;$("skipOpening").onclick=finishOpening;$("finish").onclick=finishDate;$("closeExperience").onclick=closeExperience;$("openSiteGuide").onclick=openGuide;$("battle").onclick=openBattle;$("sys").onclick=async()=>{const x=await api('/api/system');modal(`<div><div class="eyebrow">SISTEMA LOCAL</div><h2>Estado del equipo</h2><p>OS: ${esc(x.os)}</p><p>CPU: ${esc(x.cpu)}</p><p>RAM: ${x.ram_gb} GB</p><p>Modelo recomendado: ${esc(x.recommended_model_size)}</p></div>`)};
document.querySelectorAll('[data-scroll]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior:'smooth'}));$("close").onclick=closeModal;$("endingVideo").addEventListener('ended',()=>{});document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('video').forEach(v=>v.pause())});window.addEventListener('beforeunload',stopMedia);load();
