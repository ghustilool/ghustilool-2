// Modal DMCA – carga dmca.html y maneja abrir/cerrar
(function(){
  const openBtn = document.getElementById('open-dmca');
  const modal   = document.getElementById('modal-dmca');
  const bodyEl  = document.getElementById('modal-dmca-body');

  if(!openBtn || !modal || !bodyEl) return;

  const closeBtn = modal.querySelector('.modal-close');

  function openModal(){
    // carga perezosa del HTML si aún no se cargó
    if (!bodyEl.dataset.loaded){
      fetch('dmca.html', {cache: 'no-store'})
        .then(r => r.text())
        .then(html => {
          bodyEl.innerHTML = html;
          bodyEl.dataset.loaded = '1';
        })
        .catch(() => {
          bodyEl.innerHTML = '<p>Error al cargar el contenido.</p>';
        })
        .finally(() => {
          show();
        });
    } else {
      show();
    }
  }

  function show(){
    modal.classList.remove('fade-out');
    modal.classList.add('fade-in');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
  }

  function closeModal(){
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }

  // Abrir
  openBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    openModal();
  });

  // Cerrar
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && modal.classList.contains('fade-in')) {
      closeModal();
    }
  });
})();
