// Filtrado por etiquetas + búsqueda por texto (combinados)

(function(){
  const grid = document.getElementById('publicaciones-todas');
  const filters = document.getElementById('tag-filters');
  const input  = document.getElementById('search-input');
  const btn    = document.getElementById('search-btn');

  if (!grid || !filters) return;

  // estado actual
  let etiquetaActual = null;   // null = todas
  let textoActual    = '';     // ''  = sin búsqueda

  // Helpers
  function tagToKey(tag){
    if (!tag) return null;
    const t = String(tag).toLowerCase();
    if (t.includes('adult'))  return 'adult';
    if (t.includes('lan'))    return 'lan';
    if (t.includes('online')) return 'online';
    if (t.includes('offline'))return 'offline';
    return 'default';
  }
  function matchEtiqueta(card, key){
    if (key === null) return true;
    if (card.classList.contains('card-' + key)) return true;
    const pill = card.querySelector('.tag-pill');
    if (pill && pill.classList.contains('tag-' + key)) return true;
    return false;
  }
  function matchTexto(card, q){
    if (!q) return true;
    const titulo = (card.querySelector('h3')?.textContent || '').toLowerCase();
    return titulo.includes(q);
  }

  function aplicarFiltros(){
    const q = (textoActual || '').toLowerCase();
    const cards = grid.querySelectorAll('.card');

    cards.forEach(card => {
      const okTag   = matchEtiqueta(card, etiquetaActual);
      const okTexto = matchTexto(card, q);
      card.style.display = (okTag && okTexto) ? '' : 'none';
    });

    if (window.fitTitles) try { window.fitTitles(); } catch(_){}
  }

  // Público (para los botones del HTML)
  window.filtrarPorEtiqueta = function(tag){
    etiquetaActual = tagToKey(tag);
    // activar visualmente el botón correcto
    const allBtns = filters.querySelectorAll('.tag-button');
    allBtns.forEach(b=>b.classList.remove('active'));
    if (etiquetaActual === null) {
      const b = filters.querySelector('.tag-button-all');
      if (b) b.classList.add('active');
    } else {
      const b = filters.querySelector('.tag-button-' + etiquetaActual);
      if (b) b.classList.add('active');
    }
    aplicarFiltros();
  };

  // Búsqueda por texto
  function filtrarPorTexto(q){
    textoActual = (q || '').trim();
    aplicarFiltros();
  }

  if (input && btn) {
    input.addEventListener('input', () => filtrarPorTexto(input.value));
    btn.addEventListener('click',   () => filtrarPorTexto(input.value));
  }

  // Exponer por si otro script quiere re-aplicar
  window.__aplicarFiltroTexto__ = () => aplicarFiltros();

})();
