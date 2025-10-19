
// v75 - filtros inline junto al buscador
(function(){
  const normalize = (s) => (s||'').toString().trim()
    .replace(/^\s+|\s+$/g,'')
    .replace(/lan/i,'LAN')
    .replace(/offline/i,'Offline')
    .replace(/online/i,'Online')
    .replace(/programas?/i,'Programas')
    .replace(/(\+|plus)\s*18/i,'+18');

  function applyFilter(tag){
    // Preferir API del app si existe
    if (window.app && typeof window.app.filterByTag === 'function'){
      window.app.filterByTag(tag);
      return;
    }
    // Fallback: marcar activo y filtrar por data-tags en las filas renderizadas
    document.querySelectorAll('.filters-inline .tag-btn').forEach(b=>b.classList.toggle('active', b.dataset.tag===tag));
    const rows = document.querySelectorAll('#pub-list .row, #pub-list .pub, #pub-list .item, #pub-list article');
    rows.forEach(row=>{
      const tags = (row.getAttribute('data-tags')||'').split(',').map(t=>normalize(t));
      if(!tag){ row.style.display=''; return; }
      row.style.display = tags.includes(normalize(tag)) ? '' : 'none';
    });
  }

  // Click handlers
  document.addEventListener('click', (ev)=>{
    const btn = ev.target.closest('.filters-inline .tag-btn');
    if(!btn) return;
    ev.preventDefault();
    const tag = btn.dataset.tag || '';
    // toggle behavior: if already active, clear filter
    const isActive = btn.classList.contains('active');
    applyFilter(isActive ? '' : tag);
  });

  // Exponer por si se requiere desde otros lados
  window.inlineFilterApply = applyFilter;
})();
