// app-v71.js – Steam-like pass (v71)
const JSON_URL = "autores/ghustilool.json?v=71";
const TAG_COLOR = {"Offline":"offline","LAN":"lan","Online":"online","+18":"+18","Programas":"programas","Tutorial":"tutorial"};

const state = { all:[], filtered:[], filterTag:null, selectedId:null, dots:[], slide:0, page:1, pageSize:15 };

const safe = (v,d="") => (v==null?d:v);
const arr = (v) => Array.isArray(v)?v:[];
const byDateDesc = (a,b)=> new Date(b.fecha||b.updated||0)-new Date(a.fecha||a.updated||0);

document.addEventListener("DOMContentLoaded", init);

async function init(){
  try{
    const res = await fetch(JSON_URL);
    const data = await res.json();
    state.all = Array.isArray(data)? data : (data.publicaciones||[]);
    state.all.sort(byDateDesc);
    state.filtered = state.all.slice();
    renderCarousel();
    renderList();
    bindUI();
  }catch(e){ console.error("JSON load error", e); }
}


/* PATCH: Carousel fix (arrows + 2 dots pages) v2025-10-19
 - Scroll the viewport, not the track (bug made images static)
 - Use 2-page pagination with 3 cards per page (2 dots only)
*/



/* ===== Carousel ===== */
let autoTimer;
function renderCarousel(){
  const track = document.getElementById("car-track");
  const dots = document.getElementById("car-dots");
  track.innerHTML = ""; dots.innerHTML = ""; state.dots = [];
  state.perPage = 3; const MAX_PAGES = 5;
  const top = state.all.slice(0, state.perPage * MAX_PAGES); // hasta 15 (5 puntos)

  // Build cards
  top.forEach((it)=>{
    const card = document.createElement("article");
    card.className = "car-card";

    const img = document.createElement("img");
    img.src = safe(it.imagen, "https://picsum.photos/800/400?blur=2");
    img.alt = safe(it.nombre,"Publicación");

    const overlay = document.createElement("div");
    overlay.className = "car-overlay";
    const title = document.createElement("div");
    title.className = "car-title";
    title.textContent = safe(it.nombre,"");
    const ver = document.createElement("div");
    ver.className = "car-version";
    ver.textContent = safe(it.version, "");

    overlay.appendChild(title);
    overlay.appendChild(ver);
    card.appendChild(img);
    card.appendChild(overlay);

    // Open the usual mini-modal
    card.tabIndex = 0;
    card.setAttribute("role","button");
    card.addEventListener("click", ()=> openMiniModal(it));
    card.addEventListener("keydown", (e)=>{ if(e.key === "Enter"){ openMiniModal(it); } });

    track.appendChild(card);
  });

  // === 2-dot pagination (3 items por página) ===
  state.slide = 0;
  const totalPages = Math.max(1, Math.min(MAX_PAGES, Math.ceil(top.length / state.perPage)));

  for (let i=0; i<totalPages; i++){
    const dot = document.createElement("span");
    dot.className = "car-dot" + (i===0 ? " active" : "");
    dot.addEventListener("click", ()=> { state.autoDir = (i > state.slide) ? 1 : -1; scrollToSlide(i); });
    dots.appendChild(dot);
    state.dots.push(dot);
  }

  document.querySelector(".car-prev").onclick = ()=> { state.autoDir = -1; scrollStep(-1); };
  document.querySelector(".car-next").onclick = ()=> { state.autoDir =  1; scrollStep( 1); };

  const car = document.querySelector(".carousel");

  // Ping-pong automático (derecha→izquierda→derecha)
  state.autoDir = 1;
  const startAuto = ()=> {
    clearInterval(autoTimer);
    autoTimer = setInterval(()=> {
      if (state.slide === 0) state.autoDir = 1;
      if (state.slide === totalPages-1) state.autoDir = -1;
      scrollStep(state.autoDir);
    }, 5000);
  };
  const stopAuto  = ()=> { clearInterval(autoTimer); };
  car.addEventListener("mouseenter", stopAuto);
  car.addEventListener("mouseleave", startAuto);
  startAuto();

  // Ajuste de ancho para NO mostrar imagen recortada
  function sizeCarouselCards(){
    const viewport = document.querySelector(".car-viewport");
    const cards = document.querySelectorAll(".car-card");
    if (!viewport || !cards.length) return;
    const gap = 12; // mantener en sync con CSS
    const per = state.perPage || 3;
    const w = Math.floor((viewport.clientWidth - gap*(per-1)) / per);
    cards.forEach(c => { c.style.flex = `0 0 ${w}px`; c.style.maxWidth = `${w}px`; });
  }
  sizeCarouselCards();
  window.addEventListener("resize", sizeCarouselCards);
}

function scrollStep(dir){
  const maxIndex = Math.max(0, state.dots.length - 1);
  state.slide = Math.max(0, Math.min(maxIndex, state.slide + dir));
  scrollToSlide(state.slide);
}

function scrollToSlide(pageIdx){
  state.slide = pageIdx;
  const viewport = document.querySelector(".car-viewport");
  const track = document.getElementById("car-track");
  const per = state.perPage || 3;
  const target = track.children[pageIdx * per];
  if (target && viewport){
    const pad = parseFloat(getComputedStyle(viewport).paddingLeft) || 0;
    const first = track.children[0] ? track.children[0].offsetLeft : 0;
    let left = target.offsetLeft - first - pad;
    const maxLeft = track.scrollWidth - viewport.clientWidth;
    left = Math.max(0, Math.min(left, maxLeft));
    viewport.scrollTo({ left: Math.round(left), behavior: "smooth" });
  }
  state.dots.forEach((d,idx)=> d.classList.toggle("active", idx===pageIdx));
}

/* ===== List + mini modal ===== */

// Consistencia de etiquetas (emoji + clase + label)
const TAG_EMOJI = {"Offline":"🎮","LAN":"🔌","Online":"🌐","+18":"🔞","Programas":"🧰","Tutorial":"📼"};
const TAG_LABEL = {"Offline":"OFFLINE","LAN":"LAN","Online":"ONLINE","+18":"+18","Programas":"PROGRAMAS","Tutorial":"TUTORIAL"};

function renderList(){
  const ul = document.getElementById("pub-list");
  ul.innerHTML = "";
  const __base = Array.isArray(state.filtered)? state.filtered : [];
const __per = state.pageSize || 15;
const __maxPage = Math.max(1, Math.ceil(__base.length/__per));
state.page = Math.min(Math.max(1, state.page||1), __maxPage);
const __start = (state.page-1)*__per;
const __end = __start + __per;
const __sorted = [...__base].sort((a,b)=> (safe(a.nombre,"")||"").localeCompare(safe(b.nombre,"")||"", 'es', {sensitivity:'base'}));
const items = __sorted.slice(__start, __end);
  items.forEach(item=>{
    const li = document.createElement("li");
    li.className = "pub-item";
    li.dataset.id = safe(item.id, safe(item.nombre,"").toLowerCase().replace(/\s+/g,"-"));

    const img = document.createElement("img"); img.className="pub-cover";
    img.src = safe(item.imagen,"https://picsum.photos/160/100?blur=2"); img.alt = safe(item.nombre,"Publicación");

    const body = document.createElement("div");
    const title = document.createElement("div"); title.className="pub-title"; title.textContent = safe(item.nombre, item.id||"Sin nombre");
    body.appendChild(title); const sub = document.createElement("div"); sub.className="pub-sub";const tagsArr = arr(item.tags);sub.innerHTML = tagsArr.map(tg=>{  const cls = (TAG_COLOR[tg]||tg.toLowerCase());  const fixed = (cls==="+18"||cls==="+"+"18") ? "18" : cls;  const emj = TAG_EMOJI[tg]||""; const lbl = TAG_LABEL[tg]||tg;  return `<span class="tag-pill tag-${fixed}">${emj} ${lbl}</span>`;}).join(" ");body.appendChild(sub);

    const right = document.createElement("div"); right.className="right-chip";
    const chip = document.createElement("span"); chip.className="version-chip"; chip.textContent = safe(item.version,"v1.0");
    right.appendChild(chip);

    li.appendChild(img); li.appendChild(body); li.appendChild(right);

    li.addEventListener("click", ()=> { openMiniModal(item); selectRow(li); try{ if(item.id){ location.hash = "#" + encodeURIComponent(item.id); } }catch(_){} });
    li.addEventListener("keydown", (e)=>{ if (e.key === "Enter") { openMiniModal(item); selectRow(li); } });
    ul.appendChild(li);
  });

  renderPagination(__base.length, state.page, __per);
}

function selectRow(li){
  document.querySelectorAll(".pub-item").forEach(n=> n.classList.remove("selected"));
  li.classList.add("selected");
}
function openMiniModal(item){ const wrap = document.querySelector(".list-wrap"); wrap?.classList.add("mini-open");
  const aside = document.getElementById("mini-modal"); aside.setAttribute("aria-hidden","false"); aside.innerHTML="";
  const head = document.createElement("div"); head.className="mini-head";
  const img = document.createElement("img"); img.src = safe(item.imagen,"https://picsum.photos/200/200?blur=2"); img.alt = safe(item.nombre,"Publicación");
  const hwrap = document.createElement("div");
  const title = document.createElement("div"); title.className="mini-title"; title.textContent = safe(item.nombre, item.id||"Sin nombre");
  const sub = document.createElement("div"); sub.className="mini-sub";const tagsArr2 = arr(item.tags);sub.innerHTML = tagsArr2.map(tg=>{  const cls = (TAG_COLOR[tg]||tg.toLowerCase());  const fixed = (cls==="+18"||cls==="+"+"18") ? "18" : cls;  const emj = TAG_EMOJI[tg]||""; const lbl = TAG_LABEL[tg]||tg;  return `<span class="tag-pill tag-${fixed}">${emj} ${lbl}</span>`;}).join(" ");hwrap.appendChild(sub); head.appendChild(img); head.appendChild(hwrap);

  const btns = document.createElement("div"); btns.className="btns";
  const dl = button("📥 DESCARGAR","btn btn--dl", ()=>{ const link = safe(item.descargar, item.link || "#"); const name = safe(item.nombre, item.id || "Publicación"); try{ window.open(`ads/index.html?target=${encodeURIComponent(link)}&title=${encodeURIComponent(name)}`,"_blank","noopener"); } catch{ window.open(`ads/index.html?target=${encodeURIComponent(link)}&title=${encodeURIComponent(name)}`,"_blank"); } });
  const pwd = button("🔑 CONTRASEÑA","btn btn--pwd", ()=>{
    const p = safe(item.contraseña, item.password || ""); if(!p){ alert("Sin contraseña"); return; }
    navigator.clipboard.writeText(p).then(()=> { pwd.textContent="✅ COPIADA"; setTimeout(()=> pwd.textContent="🔑 CONTRASEÑA", 1200); });
  });
  const buy = button("🛒 COMPRAR","btn btn--buy", ()=>{
    const s = safe(item.comprar, item.store || "#"); if (s && s!=="#") window.open(s,"_blank","noopener");
  });
  btns.appendChild(dl); btns.appendChild(pwd); btns.appendChild(buy);
  aside.appendChild(head); aside.appendChild(btns); 
}
function button(text, cls, on){ const b=document.createElement("button"); b.className=cls; b.textContent=text; b.addEventListener("click",on); return b; }

/* ===== Filters/Search ===== */
function bindUI(){
  const search = document.getElementById("search");
  const sbtn = document.getElementById("searchBtn");
  sbtn.addEventListener("click", applyFilters);
  search.addEventListener("input", applyFilters);
  document.querySelectorAll(".tag-btn").forEach(b=>{
    b.addEventListener("click", ()=>{
      const t = b.dataset.filter;
      state.filterTag = (state.filterTag === t) ? null : t;
      document.querySelectorAll(".tag-btn").forEach(x=> x.classList.remove("active"));
      if (state.filterTag) b.classList.add("active");
      applyFilters();
    });
  });
}
function applyFilters(){
  // A→Z global sort by nombre (injected by ChatGPT)
  if (Array.isArray(state.filtered)) {
    state.filtered.sort((a, b) => ((a?.nombre||'').localeCompare(b?.nombre||'', 'es', {sensitivity:'base'})));
  }

  const q = (document.getElementById("search").value||"").toLowerCase().trim();
  state.filtered = state.all.filter(it=>{
    const inText = (safe(it.nombre,"")+" "+arr(it.tags).join(" ")+" "+safe(it.version,"")).toLowerCase().includes(q);
    const matchTag = state.filterTag ? arr(it.tags).includes(state.filterTag) : true;
    return inText && matchTag;
  });
  state.page = 1;
  try{ const ul=document.getElementById('pub-list'); ul && (ul.classList.add('list-anim'), setTimeout(()=>ul.classList.remove('list-anim'), 320)); }catch(e){}
  renderList();
}


// === Deep-link mini-modal: #ID opens the item ===
function openFromHash(){
  try{
    const raw = (location.hash||"").replace(/^#/, "");
    if(!raw) return;
    const wanted = decodeURIComponent(raw).trim().toLowerCase();
    if(!wanted) return;
    // find item by id or name
    const it = (state.all||[]).find(x =>
      (safe(x.id,"").toLowerCase() === wanted) ||
      (safe(x.nombre,"").toLowerCase() === wanted)
    );
    if(it){ // open modal
      openMiniModal(it);
      // clear hash to keep URL clean
      try{ history.replaceState(null,"", location.pathname + location.search); }catch(_){ }
      // select & scroll list row if present
      const key = safe(it.id, safe(it.nombre,"")).toLowerCase().replace(/\s+/g,"-");
      const row = document.querySelector(`.pub-item[data-id="${key}"]`);
      if(row){ selectRow(row); row.scrollIntoView({block:"center"}); }
    }
  }catch(e){ /* no-op */ }
}
// Handle hash on load (after data) and on change
window.addEventListener("hashchange", ()=>{
  if(!state || !state.all || !state.all.length){ setTimeout(openFromHash, 100); }
  else { openFromHash(); }
});
// Run once after initial render
setTimeout(openFromHash, 200);

function openAdLink(url,name){ try{ const t = encodeURIComponent(url||''); const n = encodeURIComponent(name||''); window.open(`ads/index.html?target=${t}&title=${n}`, '_blank'); }catch(e){console.warn(e);} }


// === DMCA modal wiring ===
(function(){
  const link = document.getElementById('dmca-link');
  const modal = document.getElementById('dmca-modal');
  if(!link || !modal) return;
  const body = document.getElementById('dmca-body');
  const closes = modal.querySelectorAll('.modal-close');
  function open(){ modal.classList.add('show'); document.body.style.overflow='hidden'; if(body && !body.dataset.loaded){ fetch('dmca.html',{cache:'no-store'}).then(r=>r.text()).then(t=>{ body.innerHTML = t; body.dataset.loaded = '1'; }); } }
  function close(){ modal.classList.remove('show'); document.body.style.overflow=''; }
  link.addEventListener('click', (e)=>{ e.preventDefault(); open(); });
  closes.forEach(btn=>btn.addEventListener('click', close));
  modal.addEventListener('click', (e)=>{ if(e.target===modal) close(); });
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
})();


function renderPagination(total, page, per){
  const nav = document.getElementById('pager');
  if(!nav) return;
  const maxPage = Math.max(1, Math.ceil((total||0)/(per||15)));
  const win = 7, half = Math.floor(win/2);
  const mk = (txt, cls='pager-num', attrs={}) => {
    const b=document.createElement('button'); b.className=cls; b.textContent=txt;
    for(const[k,v] of Object.entries(attrs)) b.setAttribute(k,v);
    return b;
  };
  const dots = ()=>{const s=document.createElement('span'); s.className='pager-dots'; s.textContent='…'; return s;};
  nav.innerHTML='';

  const prev=mk('◀️','pager-num pager-prev',{'aria-label':'Anterior'});
  prev.disabled=page<=1; prev.onclick=()=>{state.page=Math.max(1,page-1); renderList();};
  nav.appendChild(prev);

  if(maxPage<=win){
    for(let p=1;p<=maxPage;p++){const n=mk(String(p),'pager-num'+(p===page?' is-active':''),{'data-page':p}); n.onclick=()=>{state.page=p; renderList();}; nav.appendChild(n);}
  }else{
    let start=Math.max(1,page-half), end=Math.min(maxPage,start+win-1);
    if(end-start+1<win){start=Math.max(1,end-win+1);}
    if(start>1){const first=mk('1','pager-num'+(page===1?' is-active':''),{'data-page':1}); first.onclick=()=>{state.page=1; renderList();}; nav.appendChild(first); if(start>2) nav.appendChild(dots());}
    for(let p=start;p<=end;p++){const n=mk(String(p),'pager-num'+(p===page?' is-active':''),{'data-page':p}); n.onclick=()=>{state.page=p; renderList();}; nav.appendChild(n);}
    if(end<maxPage){if(end<maxPage-1) nav.appendChild(dots()); const last=mk(String(maxPage),'pager-num'+(page===maxPage?' is-active':''),{'data-page':maxPage}); last.onclick=()=>{state.page=maxPage; renderList();}; nav.appendChild(last);}
  }

  const next=mk('▶️','pager-num pager-next',{'aria-label':'Siguiente'});
  next.disabled=page>=maxPage; next.onclick=()=>{state.page=Math.min(maxPage,page+1); renderList();};
  nav.appendChild(next);
}
