
// v86 — ENFORCE: el PRIMER botón de .btns del mini‑modal se fuerza al interstitial
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

  function enforceFirstIsInterstitial(){
    if(!mm) return;
    const btns = mm.querySelector('.btns');
    if(!btns) return;
    const anchors = btns.querySelectorAll('a[href], button, .btn');
    if(!anchors.length) return;

    // 1) Preferir el que tenga texto "descargar"
    let first = null;
    anchors.forEach(a=>{ if(!first && norm(a.textContent).includes('descargar')) first = a; });
    // 2) Si no hay, tomamos el PRIMERO de la fila (por diseño es "Descargar")
    if(!first) first = anchors[0];

    // Resolver URL directa
    let direct = (first.getAttribute && (first.getAttribute('href') || first.getAttribute('data-href'))) || null;
    if(!direct) direct = getFromState();
    if(!direct) return;

    const inter = makeInterUrl(direct);
    if(!inter) return;

    // Reescribir/forzar navegación
    if(first.tagName === 'A'){
      first.setAttribute('href', inter);
      first.removeAttribute('target');
    } else {
      first.setAttribute('data-href', inter);
    }

    // Handlers que redirigen sí o sí
    function go(ev){
      try{ ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); }catch(e){}
      window.location.href = inter;
      return false;
    }
    first.onclick = null;
    first.addEventListener('click', go, true);
    first.addEventListener('click', go, false);

    // Marca para debug
    first.dataset.adsBound = 'v86';
  }

  // Vincular al render del mini‑modal
  if(mm){
    const mo = new MutationObserver(()=> enforceFirstIsInterstitial());
    mo.observe(mm, {childList:true, subtree:true});
  }
  // Primer intento
  enforceFirstIsInterstitial();

  // Redundancia: captura click en el primer anchor de .btns
  document.addEventListener('click', function(ev){
    const inMini = ev.target.closest && ev.target.closest('#mini-modal .btns');
    if(!inMini) return;
    const btns = inMini.closest('#mini-modal .btns') || inMini;
    const anchors = btns.querySelectorAll('a[href], button, .btn');
    if(!anchors.length) return;
    let first = null;
    anchors.forEach(a=>{ if(!first && norm(a.textContent).includes('descargar')) first = a; });
    if(!first) first = anchors[0];
    if(!first) return;

    const inter = first.getAttribute('href') || first.getAttribute('data-href');
    if(!inter || !inter.includes('ads/interstitial')) return;
    try{ ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); }catch(e){}
    window.location.href = inter;
  }, true);
})();
