// app-v71.js – Steam-like pass (v71)
const JSON_URL = "autores/ghustilool.json?v=71";
const TAG_COLOR = {"Offline":"Offline","LAN":"LAN","Online":"Online","+18":"+18","Programas":"Programas","Tutorial":"Tutorial"};

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

/* ===== Carousel ===== */
function renderCarousel(){
  const track = document.getElementById("car-track");
  const dots = document.getElementById("car-dots");
  track.innerHTML = ""; dots.innerHTML = ""; state.dots = [];
  const top = state.all.slice(0, 9);
  top.forEach((it, i)=>{
    const card = document.createElement("article");
    card.className = "car-card";
    const img = document.createElement("img");
    img.src = safe(it.imagen, "https://picsum.photos/800/400?blur=2");
    img.alt = safe(it.nombre,"Publicación");

    const overlay = document.createElement("div");
    overlay.className = "car-overlay";
    const title = document.createElement("div");
    title.className = "car-title"; title.textContent = safe(it.nombre, it.id||"Sin nombre");
    const ver = document.createElement("span"); ver.className = "ver-chip"; ver.textContent = safe(it.version,"v1.0");

    overlay.appendChild(title); overlay.appendChild(ver);
    card.appendChild(img); card.appendChild(overlay); track.appendChild(card);

    const dot = document.createElement("span");
    dot.className = "car-dot" + (i===0?" active":"");
    dot.addEventListener("click", ()=> scrollToSlide(i));
    dots.appendChild(dot); state.dots.push(dot);
  });

  document.querySelector(".car-prev").onclick = ()=> scrollStep(-1);
  document.querySelector(".car-next").onclick = ()=> scrollStep(1);
}

function scrollStep(dir){
  const top = Math.min(state.all.length, 9);
  const maxIndex = top-1;
  state.slide = Math.max(0, Math.min(maxIndex, state.slide + dir));
  scrollToSlide(state.slide);
}
function scrollToSlide(i){
  state.slide = i;
  const track = document.getElementById("car-track");
  const card = track.children[i];
  if (card) track.scrollTo({ left: card.offsetLeft - 6, behavior:"smooth" });
  state.dots.forEach((d,idx)=> d.classList.toggle("active", idx===i));
}

/* ===== List + mini modal ===== */
function renderList(){
  const ul = document.getElementById("pub-list");
  ul.innerHTML = "";
  state.filtered.forEach(item=>{
    const li = document.createElement("li");
    li.className = "pub-item";
    li.dataset.id = safe(item.id, safe(item.nombre,"").toLowerCase().replace(/\s+/g,"-"));

    const img = document.createElement("img"); img.className="pub-cover";
    img.src = safe(item.imagen,"https://picsum.photos/160/100?blur=2"); img.alt = safe(item.nombre,"Publicación");

    const body = document.createElement("div");
    const title = document.createElement("div"); title.className="pub-title"; title.textContent = safe(item.nombre, item.id||"Sin nombre");
    const sub = document.createElement("div"); sub.className="pub-sub";
    const tg = arr(item.tags)[0] || "Offline"; sub.innerHTML = `<span class="tag-pill tag-${TAG_COLOR[tg]||"Offline"}">${tg}</span>`;
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
  const img = document.createElement("img"); img.src = safe(item.imagen,"https://picsum.photos/200/200?blur=2"); img.alt = safe(item.nombre,"Publicación");
  const hwrap = document.createElement("div");
  const title = document.createElement("div"); title.className="mini-title"; title.textContent = safe(item.nombre, item.id||"Sin nombre");
  const sub = document.createElement("div"); sub.className="mini-sub";
  const tg = arr(item.tags)[0] || "Offline"; sub.innerHTML = `<span class="tag-pill tag-${TAG_COLOR[tg]||"Offline"}">${tg}</span> • Versión: <b>${safe(item.version,"v1.0")}</b>`;
  hwrap.appendChild(title); hwrap.appendChild(sub); head.appendChild(img); head.appendChild(hwrap);

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
