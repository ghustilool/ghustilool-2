
// v85 — SAFE intercept: sólo prevenimos si tenemos interstitial listo
(function(){
  const INTERSTITIAL_URL = "ads/interstitial-v80.html";
  const SECONDS = 20;
  const norm = (s)=> (s||"").toLowerCase().replace(/\s+/g,' ').trim();

  const makeInterUrl = (to) => {
    if(!to) return null;
    try { new URL(to); } catch(e) { return null; }
    const u = new URL(INTERSTITIAL_URL, location.href);
    u.searchParams.set('to', to);
    u.searchParams.set('s', String(SECONDS));
    return u.pathname + u.search;
  };

  function getFromState(){
    try{
      if(window.app && app.state){
        const id = app.state.selectedId;
        const it = (app.state.all||[]).find(x=>x.id===id);
        if(it && it.descargar) return it.descargar;
      }
    }catch(e){}
    try{
      if(window.state && state.selectedId && Array.isArray(state.all)){
        const it = state.all.find(x=>x.id===state.selectedId);
        if(it && it.descargar) return it.descargar;
      }
    }catch(e){}
    return null;
  }

  const mm = document.getElementById('mini-modal');

  function findDownloadAnchor(){
    if(!mm) return null;
    const anchors = mm.querySelectorAll('.btns a[href], a.btn[href], a.button[href]');
    for(const a of anchors){
      if(norm(a.textContent).includes('descargar')) return a;
    }
    return anchors[0] || null;
  }

  function resolveDirectUrl(clicked){
    // 1) closest anchor href
    const a = clicked.closest && clicked.closest('a[href]');
    if(a && a.getAttribute('href')) return a.getAttribute('href');

    // 2) anchor de descargar dentro del mini-modal
    const ad = findDownloadAnchor();
    if(ad && ad.getAttribute('href')) return ad.getAttribute('href');

    // 3) from app state
    const st = getFromState();
    if(st) return st;

    return null;
  }

  function rewriteAnchorHref(){
    const a = findDownloadAnchor();
    if(!a) return;
    const direct = a.getAttribute('href') || getFromState();
    const inter = makeInterUrl(direct);
    if(inter) a.setAttribute('href', inter);
  }

  // Reescribe cuando cambia el mini-modal
  if(mm){
    const mo = new MutationObserver(()=> rewriteAnchorHref());
    mo.observe(mm, {childList:true, subtree:true});
  }
  // Intento inicial
  rewriteAnchorHref();

  // Intercepta click en mini-modal (sólo si tenemos a dónde ir)
  function onClick(ev){
    const inMini = ev.target.closest && ev.target.closest('#mini-modal');
    if(!inMini) return;
    const btn = ev.target.closest('.btns a, a.btn, a.button, .btns button, .btns .btn');
    if(!btn) return;
    if(!norm(btn.textContent).includes('descargar')) return;

    const direct = resolveDirectUrl(btn);
    const inter = makeInterUrl(direct);
    if(!inter) return; // sin inter, dejamos que fluya el click normal

    ev.preventDefault();
    ev.stopPropagation();
    window.location.href = inter;
  }
  document.addEventListener('click', onClick, true);
})();
