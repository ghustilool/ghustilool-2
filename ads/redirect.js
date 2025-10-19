
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
  var t = 20;
  function tick(){
    if(cdEl) cdEl.textContent = String(t);
    if(t <= 0){
      // enable button
      if(goEl){ goEl.style.pointerEvents='auto'; goEl.style.opacity='1'; }
      // navigate
      try{ location.href = target; }catch(e){ window.open(target, '_blank'); }
      return;
    }
    t -= 1;
    setTimeout(tick, 1000);
  }
  tick();

  // Keep the page title informative
  try{ document.title = (title ? title + ' — ' : '') + 'Publicidad'; }catch(_){}
})();
