
// v80 — Interstitial con countdown + redirect misma pestaña
(function(){
  function getParam(name, def){
    const u = new URL(window.location.href);
    return u.searchParams.get(name) || def;
  }
  const secs = Math.max(3, parseInt(getParam('s', '20'), 10) || 20); // mínimo 3s
  const to = getParam('to', '');

  const secsEl = document.getElementById('secs');
  const skip = document.getElementById('skip');
  let left = secs;
  secsEl.textContent = String(left);
  skip.textContent = `Saltar (${left})`;

  const tick = setInterval(()=>{
    left--;
    if(left <= 0){
      clearInterval(tick);
      proceed();
      return;
    }
    secsEl.textContent = String(left);
    skip.textContent = `Saltar (${left})`;
    if(left <= 1){ enableSkip(); }
  }, 1000);

  function enableSkip(){
    skip.classList.add('enabled');
    skip.setAttribute('aria-disabled', 'false');
  }

  function proceed(){
    if(to){
      window.location.href = to; // misma pestaña
    } else {
      // Si no vino 'to', volvemos atrás
      window.history.back();
    }
  }

  skip.addEventListener('click', function(e){
    if(!skip.classList.contains('enabled')) { e.preventDefault(); return; }
    e.preventDefault();
    proceed();
  });

  // Habilitar salto inmediato con tecla ESC
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      enableSkip();
      proceed();
    }
  });
})();
