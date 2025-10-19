
// v82 — Intercepta DESCARGAR del mini‑modal usando estado de app si hace falta
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
        const all = app.state.all || [];
        const it = all.find(x => x.id === id);
        if(it && it.descargar) return it.descargar;
      }
    }catch(e){/* ignore */}
    return null;
  }

  function resolveTargetUrl(clicked){
    // 1) href del anchor más cercano
    const a = clicked.closest && clicked.closest('a[href]');
    if(a && a.getAttribute('href')) return a.getAttribute('href');

    // 2) atributos de datos comunes
    const h = clicked.closest('[data-href]');
    if(h && h.getAttribute('data-href')) return h.getAttribute('data-href');

    const link = clicked.getAttribute && clicked.getAttribute('href');
    if(link) return link;

    // 3) estado de la app (descargar del item seleccionado)
    const fromState = getSelectedDownloadUrl();
    if(fromState) return fromState;

    return null;
  }

  // Interceptar específicamente dentro del mini‑modal
  const mm = document.getElementById('mini-modal');

  function onMiniClick(ev){
    const target = ev.target;
    const btn = target.closest('.btn, a, button');
    if(!btn) return;

    const text = norm(btn.textContent);
    const isDownload = text.includes('descargar') || btn.classList.contains('btn-download');
    if(!isDownload) return;

    const direct = resolveTargetUrl(btn);
    const inter = makeInterUrl(direct);
    if(!inter) return;

    // Previene navegación original y manda al interstitial en la misma pestaña
    ev.preventDefault();
    ev.stopPropagation();
    window.location.href = inter;
  }

  if(mm){
    // Usar capture para adelantar y ganarle a otros listeners
    mm.addEventListener('click', onMiniClick, true);

    // Cada vez que cambia el contenido, reescribir HREF del botón de Descargar
    const mo = new MutationObserver(()=>{
      const links = mm.querySelectorAll('.btns a, a.btn, a.button');
      let candidate = null;
      links.forEach(a=>{
        const t = norm(a.textContent);
        if(t.includes('descargar')) candidate = candidate || a;
      });
      if(!candidate && links.length) candidate = links[0];
      if(candidate){
        const direct = resolveTargetUrl(candidate) || getSelectedDownloadUrl();
        const inter = makeInterUrl(direct);
        if(inter) candidate.setAttribute('href', inter);
      }
    });
    mo.observe(mm, {childList:true, subtree:true});
  }

  // Redundancia: delegación global por si el botón está fuera del #mini-modal
  document.addEventListener('click', function(ev){
    const t = ev.target;
    const inMini = t.closest && t.closest('#mini-modal');
    if(inMini) return; // ya manejado
    const btn = t.closest && t.closest('.btn, a, button');
    if(!btn) return;
    const tx = norm(btn.textContent);
    if(!tx.includes('descargar')) return;
    const direct = resolveTargetUrl(btn) || getSelectedDownloadUrl();
    const inter = makeInterUrl(direct);
    if(!inter) return;
    ev.preventDefault();
    window.location.href = inter;
  }, true);
})();
