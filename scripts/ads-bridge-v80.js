
// v81 — Intercepta DESCARGAR del mini‑modal (derecha) de forma robusta
(function(){
  const INTERSTITIAL_URL = "ads/interstitial-v80.html";
  const SECONDS = 20;

  const makeUrl = (to) => {
    try { new URL(to); } catch(e) { return null; }
    const u = new URL(INTERSTITIAL_URL, location.href);
    u.searchParams.set('to', to);
    u.searchParams.set('s', String(SECONDS));
    return u.pathname + u.search;
  };

  // Normaliza texto
  const norm = (s)=> (s||"").toLowerCase().replace(/\s+/g,' ').trim();

  // Intercepción global por si hay otros botones sueltos
  document.addEventListener('click', (ev)=>{
    const a = ev.target.closest('a[href]');
    if(!a) return;
    const txt = norm(a.textContent);
    if(!txt.includes('descargar')) return;

    const inter = makeUrl(a.href);
    if(!inter) return;
    ev.preventDefault();
    window.location.href = inter;
  }, true); // capture para adelantarnos

  // Parches específicos para el mini-modal (derecha)
  const mm = document.getElementById('mini-modal');

  function rewriteMiniModalLinks() {
    if(!mm) return;

    const inBtns = mm.querySelectorAll('.btns a[href], a.btn[href], a.button[href]');
    let candidate = null;

    // 1) Primero, el que diga "descargar"
    inBtns.forEach(a => {
      const txt = norm(a.textContent);
      if(txt.includes('descargar')) candidate = candidate || a;
    });

    // 2) Si no lo detecta por texto, tomamos el PRIMERO dentro de .btns (suele ser Descargar)
    if(!candidate && inBtns.length) candidate = inBtns[0];

    if(candidate && candidate.href) {
      const newHref = makeUrl(candidate.href);
      if(newHref) candidate.setAttribute('href', newHref);
    }
  }

  // Reescritura inmediata e incremental
  rewriteMiniModalLinks();

  if(mm){
    const mo = new MutationObserver(()=> rewriteMiniModalLinks());
    mo.observe(mm, {childList:true, subtree:true});
  }
})();
