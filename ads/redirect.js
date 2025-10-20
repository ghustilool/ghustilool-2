
(function(){
  function qs(k){ try{ return new URL(location.href).searchParams.get(k) }catch(_){ return null } }
  function valid(u){ try{ const x=new URL(u, location.href); return /^(https?:)$/i.test(x.protocol) }catch(_){ return false } }
  var target = decodeURIComponent(qs('target')||'');
  var title  = decodeURIComponent(qs('title')||'');
  var titleEl = document.getElementById('gh-title'); if(titleEl) titleEl.textContent = title || 'descarga';
  var go = document.getElementById('gh-go'); if(go) go.href = valid(target) ? target : '#';
  var ring = document.getElementById('gh-circle'); var num = document.getElementById('gh-count-num');
  var total=20, t=total;
  function tick(){
    if(num) num.textContent = String(t);
    if(ring) ring.style.setProperty('--p', String(((total - t)/total)*100));
    if(t<=0){
      if(go) go.removeAttribute('aria-disabled');
      try{ if(valid(target)) location.href = target; }catch(e){ window.open(target,'_blank'); }
      return;
    }
    t-=1; setTimeout(tick, 1000);
  }
  tick();
})();
