
// Lightweight 20s redirect that does NOT change the page layout.
// It only updates optional elements if present: #gh-title, #gh-countdown, #gh-go
(function(){
  function qs(k){
    try{ const u = new URL(location.href); return u.searchParams.get(k); }
    catch(_){ return null; }
  }
  function validTarget(u){
    try{ const url = new URL(u, location.href); return /^(https?:)$/i.test(url.protocol); }
    catch(_){ return false; }
  }
  var target = qs('target') || '';
  var title = qs('title') || '';
  try{ title = decodeURIComponent(title); }catch(_){}
  try{ target = decodeURIComponent(target); }catch(_){}

  var titleEl = document.getElementById('gh-title');
  var cdEl = document.getElementById('gh-countdown');
  var goEl = document.getElementById('gh-go');

  if(titleEl) titleEl.textContent = title || titleEl.textContent || 'descarga';
  if(goEl) { goEl.href = validTarget(target) ? target : '#'; }

  if(!validTarget(target)){ console.warn('Target inválido:', target); return; }

  var t = 20;
  function tick(){
    if(cdEl) cdEl.textContent = String(t);
    if(t <= 0){
      if(goEl){ goEl.removeAttribute('disabled'); goEl.style.pointerEvents='auto'; }
      try{ location.href = target; }catch(e){ window.open(target, '_blank'); }
      return;
    }
    t -= 1;
    setTimeout(tick, 1000);
  }
  tick();

  try{ if(title) document.title = title + ' — Publicidad'; }catch(_){}
})();
