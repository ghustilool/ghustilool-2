
// v83 — HARD BIND: forzamos el botón "Descargar" del mini‑modal a pasar por interstitial
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

  function getSelectedDownloadUrl(){
    try{
      if(window.app && app.state){
        const id = app.state.selectedId;
        const it = (app.state.all||[]).find(x => x.id === id);
        if(it && it.descargar) return it.descargar;
      }
    }catch(e){}
    return null;
  }

  const mm = document.getElementById('mini-modal');

  function hardBindDownload(){
    if(!mm) return;
    // candidatos dentro del mini-modal
    const allLinks = mm.querySelectorAll('.btns a[href], a.btn[href], a.button[href], .btns button, .btns .btn');
    let candidate = null;
    allLinks.forEach(el=>{
      const t = norm(el.textContent);
      if(t.includes('descargar')) candidate = candidate || el;
    });
    if(!candidate && allLinks.length) candidate = allLinks[0];
    if(!candidate) return;

    // Resolver URL directa: href/data-href/estado app
    let direct = (candidate.getAttribute && (candidate.getAttribute('href') || candidate.getAttribute('data-href'))) || null;
    if(!direct) direct = getSelectedDownloadUrl();
    if(!direct) return;

    const inter = makeInterUrl(direct);
    if(!inter) return;

    // Forzar comportamiento
    // 1) si es <a>, cambiamos href y target
    if(candidate.tagName === 'A'){
      candidate.setAttribute('href', inter);
      candidate.removeAttribute('target');
    } else {
      // 2) si es <button> u otro, le ponemos data y fallback href
      candidate.setAttribute('data-href', inter);
    }

    // 3) desactivar onclick previos y listeners de burbujeo
    candidate.onclick = null;

    // 4) añadir listeners en captura y burbuja para ganar a otros scripts
    function handler(ev){
      try{ ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); }catch(e){}
      window.location.href = inter;
      return false;
    }
    candidate.addEventListener('click', handler, true);  // capture
    candidate.addEventListener('click', handler, false); // bubble

    // 5) marcar
    candidate.dataset.adsBound = "v83";
  }

  // Vinculación inicial y cada vez que se re-renderiza el mini‑modal
  hardBindDownload();
  if(mm){
    const mo = new MutationObserver(()=> hardBindDownload());
    mo.observe(mm, {childList:true, subtree:true});
  }

  // Redundancia total: capturamos clicks dentro del mini‑modal y forzamos igualmente
  function captureAll(ev){
    const inMini = ev.target.closest && ev.target.closest('#mini-modal');
    if(!inMini) return;
    const btn = ev.target.closest('.btns a, a.btn, a.button, .btns button, .btns .btn');
    if(!btn) return;

    let inter = null;
    const href = btn.getAttribute && (btn.getAttribute('href') || btn.getAttribute('data-href'));
    if(href && href.includes('ads/interstitial-v80.html')) inter = href;
    if(!inter){
      const direct = (href && !href.includes('ads/interstitial-v80.html')) ? href : getSelectedDownloadUrl();
      inter = makeInterUrl(direct);
    }
    if(!inter) return;

    try{ ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); }catch(e){}
    window.location.href = inter;
  }
  document.addEventListener('click', captureAll, true);
})();
