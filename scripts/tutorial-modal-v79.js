
// v78 — Botón "🎥 TUTORIAL" en mini-modal + modal de video (ESC cierra)
(() => {
  const VIDEO_URL = "https://www.youtube.com/embed/GS6Uy2C_3xY?autoplay=1&rel=0&modestbranding=1";

  function ensureTutorialBtn() {
    const mm = document.getElementById('mini-modal');
    if (!mm) return;

    // Buscar contenedor de botones
    const btns = mm.querySelector('.btns');
    if (!btns) return;

    // Si ya existe, no duplicar
    if (btns.querySelector('.btn--tutorial')) return;

    const btn = document.createElement('button');
    btn.className = 'btn btn--tutorial';
    btn.setAttribute('type', 'button');
    btn.innerHTML = '🎥 <strong>TUTORIAL DE EJEMPLO</strong>';
    // Ubicar al final (debajo de COMPRAR)
    btns.appendChild(btn);

    btn.addEventListener('click', openVideoModal);
  }

  function openVideoModal() {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'video-overlay';
    overlay.innerHTML = `
      <div class="video-modal" role="dialog" aria-label="Tutorial" aria-modal="true">
        <button class="video-close" title="Cerrar" aria-label="Cerrar">✖</button>
        <iframe
          src="${VIDEO_URL}"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    `;

    // Cerrar por click fuera o en X o ESC
    function close() {
      window.removeEventListener('keydown', onKey);
      overlay.remove();
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
    }

    overlay.addEventListener('click', (e) => {
      if (e.target.classList.contains('video-overlay')) close();
    });
    overlay.querySelector('.video-close').addEventListener('click', close);
    window.addEventListener('keydown', onKey);

    document.body.appendChild(overlay);
  }

  // Cuando cambie el mini-modal (al seleccionar otra publicación), reinsertar botón
  const mm = document.getElementById('mini-modal');
  if (mm) {
    const mo = new MutationObserver(() => ensureTutorialBtn());
    mo.observe(mm, { childList: true, subtree: true });
  }
  // Intento inicial por si ya está renderizado
  ensureTutorialBtn();

  // Exponer por si lo necesitás
  window._tutorialModal_v78 = { openVideoModal, ensureTutorialBtn };
})();
