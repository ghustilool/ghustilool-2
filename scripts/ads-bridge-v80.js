
// v84 — ULTRA CATCH: intercepta pointerdown/mousedown/touchstart/click y reescribe hrefs continuamente
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

  function pickDownloadBtn(){
    if(!mm) return null;
    const all = mm.querySelectorAll('.btns a[href], .btns button, .btns .btn, a.btn[href]');
    let c = null;
    all.forEach(el=>{ if(!c && norm(el.textContent).includes('descargar')) c = el; });
    return c || all[0] || null;
  }

  function currentDirectUrl(el){
    if(!el) return null;
    return el.getAttribute('href') || el.getAttribute('data-href') || null;
  }

  function ensureInter(el){
    const direct = currentDirectUrl(el) || getSelectedDownloadUrl();
    const inter = makeInterUrl(direct);
    if(!inter) return null;
    if(el.tagName === 'A'){
      el.setAttribute('href', inter);
      el.removeAttribute('target');
    } else {
      el.setAttribute('data-href', inter);
    }
    el.dataset.adsBound = 'v84';
    return inter;
  }

  function forceRewriteBurst(durationMs=2000){
    const start = Date.now();
    const tid = setInterval(()=>{
      const btn = pickDownloadBtn();
      if(btn) ensureInter(btn);
      if(Date.now()-start > durationMs) clearInterval(tid);
    }, 50);
  }

  function goInter(){
    const btn = pickDownloadBtn();
    const inter = ensureInter(btn);
    if(inter){
      window.location.href = inter;
      return true;
    }
    return false;
  }

  // Capturar múltiples eventos para adelantarnos a navegaciones por mousedown/pointerdown
  const events = ['pointerdown','mousedown','touchstart','click'];
  function handler(ev){
    const inMini = ev.target.closest && ev.target.closest('#mini-modal');
    if(!inMini) return;
    const btn = ev.target.closest('.btns a, .btns button, .btns .btn, a.btn');
    if(!btn) return;
    const isDownload = norm(btn.textContent).includes('descargar') || btn === pickDownloadBtn();
    if(!isDownload) return;
    try{ ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); }catch(e){}
    forceRewriteBurst(1500);
    goInter();
  }
  events.forEach(evt => document.addEventListener(evt, handler, true));

  // Reescritura al render
  if(mm){
    const mo = new MutationObserver(()=>{ forceRewriteBurst(1500); });
    mo.observe(mm, {childList:true, subtree:true});
  }
  // primer burst por si ya está renderizado
  forceRewriteBurst(1000);
})();
