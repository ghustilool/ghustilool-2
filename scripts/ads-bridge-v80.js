
// v80 — Intercepta "DESCARGAR" para pasar por interstitial con contador Adsterra
(function(){
  const INTERSTITIAL_URL = "ads/interstitial-v80.html";
  const SECONDS = 20; // duración del contador

  // Devuelve URL final codificada
  const makeUrl = (to) => {
    try { new URL(to); } catch(e) { return null; }
    const u = new URL(INTERSTITIAL_URL, location.href);
    u.searchParams.set('to', to);
    u.searchParams.set('s', String(SECONDS));
    return u.pathname + u.search;
  };

  function findHrefFromTarget(el){
    const a = el.closest('a[href]');
    if (a) return a.getAttribute('href');
    // si es un botón dentro de .btns con data-href
    const b = el.closest('[data-href]');
    if (b) return b.getAttribute('data-href');
    // buscar dentro
    const innerA = el.querySelector && el.querySelector('a[href]');
    if (innerA) return innerA.getAttribute('href');
    return null;
  }

  function isDownloadBtn(el){
    const btn = el.closest('.btn, .button, a, button');
    if (!btn) return false;
    const text = (btn.textContent||'').toLowerCase();
    return text.includes('descargar') || btn.classList.contains('btn-download');
  }

  // Delegado global
  document.addEventListener('click', (ev)=>{
    if(!isDownloadBtn(ev.target)) return;
    const href = findHrefFromTarget(ev.target);
    if(!href) return; // si no hay link real, no interceptar

    const interUrl = makeUrl(href);
    if(!interUrl) return;

    ev.preventDefault();
    // Mismo tab (como pediste)
    window.location.href = interUrl;
  });

  // Refuerzo: cada vez que renderice el mini-modal, aseguro que los anchors de "DESCARGAR" apunten al interstitial
  const mm = document.getElementById('mini-modal');
  if (mm){
    const mo = new MutationObserver(()=>{
      const links = mm.querySelectorAll('.btns a, a.btn, a.button');
      links.forEach(a=>{
        if(((a.textContent||'').toLowerCase().includes('descargar')) && a.href){
          const newHref = makeUrl(a.href);
          if (newHref) a.setAttribute('href', newHref);
        }
      });
    });
    mo.observe(mm, {childList:true, subtree:true});
  }
})();
