
(function(){
  function qs(k){
    try{
      const u = new URL(location.href);
      return u.searchParams.get(k);
    }catch(_){ return null; }
  }
  function validTarget(u){
    try{
      const url = new URL(u, location.href);
      return /^(https?:)$/i.test(url.protocol);
    }catch(_){ return false; }
  }
  var target = qs('target') || '';
  var title = qs('title') || '';
  try{ title = decodeURIComponent(title); }catch(_){}
  try{ target = decodeURIComponent(target); }catch(_){}

  var titleEl = document.getElementById('gh-title');
  var cdEl = document.getElementById('gh-countdown');
  var goEl = document.getElementById('gh-go');

  if(titleEl) titleEl.textContent = title || 'descarga';
  if(!validTarget(target)){
    if(cdEl) cdEl.textContent = '—';
    if(goEl){ goEl.textContent = 'Enlace inválido'; goEl.style.opacity = '.6'; goEl.style.pointerEvents = 'none'; }
    console.warn('Target inválido o ausente:', target);
    return;
  }

  // Prepare link but disable until countdown finishes
  if(goEl){ goEl.href = target; }

  // 20s countdown
  

  // Keep the page title informative
  try{ document.title = (title ? title + ' — ' : '') + 'Publicidad'; }catch(_){}

  var titleEl = document.getElementById('gh-title');
  var countNum = document.getElementById('gh-count-num');
  var circle = document.getElementById('gh-circle');
  var goEl = document.getElementById('gh-go');

  if(titleEl) titleEl.textContent = title || titleEl.textContent || 'descarga';
  if(goEl) { goEl.href = validTarget(target) ? target : '#'; }

  if(!validTarget(target)){ console.warn('Target inválido:', target); return; }

  })();
// Boceto countdown driver
(function(){
  function qs(k){ try{ return new URL(location.href).searchParams.get(k) }catch(_){ return null } }
  function valid(u){ try{ const x=new URL(u, location.href); return /^(https?:)$/i.test(x.protocol) }catch(_){ return false } }
  var target = decodeURIComponent(qs('target')||''); var title = decodeURIComponent(qs('title')||'');
  var titleEl = document.getElementById('gh-title'); if(titleEl) titleEl.textContent = title || titleEl.textContent || 'descarga';
  var go = document.getElementById('gh-go'); if(go) go.href = valid(target) ? target : '#';
  var ring = document.getElementById('gh-circle'); var num = document.getElementById('gh-count-num');
  var total=20, t=total;
  function tick(){
    if(num) num.textContent = String(t);
    if(ring) ring.style.setProperty('--p', String(((total - t)/total)*100));
    if(t<=0){
      if(go) go.setAttribute('aria-disabled','false');
      try{ if(valid(target)) location.href = target; }catch(e){ window.open(target,'_blank') }
      return;
    }
    t-=1; setTimeout(tick, 1000);
  }
  tick();
})();
