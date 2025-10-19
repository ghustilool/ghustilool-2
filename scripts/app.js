// app-v71.js – Steam-like pass (v71)
const JSON_URL = "autores/ghustilool.json?v=71";
const TAG_COLOR = {"Offline":"offline","LAN":"lan","Online":"online","+18":"+18","Programas":"programas","Tutorial":"tutorial"};

const state = { all:[], filtered:[], filterTag:null, selectedId:null, dots:[], slide:0 };

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
  const top = state.all.slice(0, 6); // SOLO 6

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
  state.perPage = 3;
  const totalPages = Math.min(2, Math.max(1, Math.ceil(top.length / state.perPage)));

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
    viewport.scrollTo({ left: target.offsetLeft - 6, behavior: "smooth" });
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
  const items = [...state.filtered].sort((a,b)=> (safe(a.nombre,"")||"").localeCompare(safe(b.nombre,"")||"", 'es', {sensitivity:'base'}));
  items.forEach(item=>{
    const li = document.createElement("li");
    li.className = "pub-item";
    li.dataset.id = safe(item.id, safe(item.nombre,"").toLowerCase().replace(/\s+/g,"-"));

    const img = document.createElement("img"); img.className="pub-cover";
    img.src = safe(item.imagen,"https://picsum.photos/160/100?blur=2"); img.alt = safe(item.nombre,"Publicación");

    const body = document.createElement("div");
    const title = document.createElement("div"); title.className="pub-title"; title.textContent = safe(item.nombre, item.id||"Sin nombre");
    const sub = document.createElement("div"); sub.className="pub-sub";
    const tg = arr(item.tags)[0] || "Offline"; const cls = TAG_COLOR[tg]||"offline"; sub.innerHTML = `<span class="tag-pill tag-${cls==="+"+"18" ? "18" : cls}">${TAG_EMOJI[tg]||""} ${TAG_LABEL[tg]||tg}</span>`;
    body.appendChild(title); body.appendChild(sub);

    const right = document.createElement("div"); right.className="right-chip";
    const chip = document.createElement("span"); chip.className="version-chip"; chip.textContent = safe(item.version,"v1.0");
    right.appendChild(chip);

    li.appendChild(img); li.appendChild(body); li.appendChild(right);

    li.addEventListener("click", ()=> { openMiniModal(item); selectRow(li); });
    li.addEventListener("keydown", (e)=>{ if (e.key === "Enter") { openMiniModal(item); selectRow(li); } });
    ul.appendChild(li);
  });
}
function selectRow(li){
  document.querySelectorAll(".pub-item").forEach(n=> n.classList.remove("selected"));
  li.classList.add("selected");
}
function openMiniModal(item){
  const wrap = document.querySelector(".list-wrap"); wrap?.classList.add("mini-open");
  const aside = document.getElementById("mini-modal"); aside.setAttribute("aria-hidden","false"); aside.innerHTML="";
  const head = document.createElement("div"); head.className="mini-head";
  const img = document.createElement("img"); img.src = safe(item.imagen,"https://picsum.photos/600/340?blur=2"); img.alt = safe(item.nombre,"Publicación");
  const hwrap = document.createElement("div");
  const title = document.createElement("div"); title.className="mini-title"; title.textContent = safe(item.nombre, item.id||"Sin nombre");
  const sub = document.createElement("div"); sub.className="mini-sub";
  const tg = (Array.isArray(item.tags)&&item.tags[0]) ? item.tags[0] : "Offline";
  const cls = (typeof TAG_COLOR!=="undefined" && TAG_COLOR[tg]) ? TAG_COLOR[tg] : "offline";
  sub.innerHTML = `<span class="tag-pill tag-${cls==="+"+"18" ? "18" : cls}">${(typeof TAG_EMOJI!=="undefined" && TAG_EMOJI[tg])?TAG_EMOJI[tg]:""} ${(typeof TAG_LABEL!=="undefined" && TAG_LABEL[tg])?TAG_LABEL[tg]:tg}</span>`;
  const vers = document.createElement("div"); vers.className="mini-version"; vers.innerHTML = `<span class="version-chip">${safe(item.version,"v1.0")}</span>`;
  hwrap.appendChild(title); hwrap.appendChild(sub); hwrap.appendChild(vers); head.appendChild(img); head.appendChild(hwrap);

  const btns = document.createElement("div"); btns.className="btns";
  const dl = button("📥 DESCARGAR","btn btn--dl", ()=>{
    const link = safe(item.descargar, item.link || "#");
    try{ if (window.openAdInterstitial) window.openAdInterstitial(link); else window.open(link,"_blank","noopener"); }
    catch{ window.open(link,"_blank","noopener"); }
  });
  const pwd = button("🔑 CONTRASEÑA","btn btn--pwd", ()=>{
    const p = safe(item.contraseña, item.password || ""); if(!p){ alert("Sin contraseña"); return; }
    navigator.clipboard.writeText(p).then(()=> { pwd.textContent="✅ COPIADA"; setTimeout(()=> pwd.textContent="🔑 CONTRASEÑA", 1200); });
  });
  const buy = button("🛒 COMPRAR","btn btn--buy", ()=>{
    const s = safe(item.comprar, item.store || "#"); if (s && s!=="#") window.open(s,"_blank","noopener");
  });
  btns.appendChild(dl); btns.appendChild(pwd); btns.appendChild(buy);
  aside.appendChild(head); aside.appendChild(btns);

  document.addEventListener("keydown", (e)=>{
    if (e.key === "Escape") {
      wrap.classList.remove("mini-open"); aside.setAttribute("aria-hidden","true"); aside.innerHTML=""; 
      document.querySelectorAll(".pub-item").forEach(n=> n.classList.remove("selected"));
    }
  }, { once:true });
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
  const q = (document.getElementById("search").value||"").toLowerCase().trim();
  state.filtered = state.all.filter(it=>{
    const inText = (safe(it.nombre,"")+" "+arr(it.tags).join(" ")+" "+safe(it.version,"")).toLowerCase().includes(q);
    const matchTag = state.filterTag ? arr(it.tags).includes(state.filterTag) : true;
    return inText && matchTag;
  });
  renderList();
}
