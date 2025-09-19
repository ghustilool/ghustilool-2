// Buscador neon: filtra .card por texto (título, meta, etc.)
// Atajos: "/" enfoca, "Esc" limpia y desenfoca.

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  const wrap  = document.querySelector('.search-wrap');
  const clear = document.querySelector('.search-clear');
  const grid  = document.getElementById('publicaciones-todas');
  if (!input || !grid) return;

  const norm = s => (s || '')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase();

  const applyFilter = () => {
    const q = norm(input.value.trim());
    wrap?.classList.toggle('has-value', !!q);

    const cards = grid.querySelectorAll('.card');
    cards.forEach(card => {
      const text = norm(card.textContent);
      const match = q === '' || text.includes(q);
      card.classList.toggle('hidden-by-search', !match);
    });
  };

  // Filtra al escribir
  input.addEventListener('input', applyFilter);

  // Botón limpiar
  clear?.addEventListener('click', () => {
    input.value = '';
    applyFilter();
    input.focus();
  });

  // Atajos "/" para enfocar y "Esc" para limpiar
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.target.closest('input, textarea')) {
      e.preventDefault();
      input.focus();
      input.select();
    }
    if (e.key === 'Escape' && document.activeElement === input) {
      input.value = '';
      applyFilter();
      input.blur();
    }
  });

  // Si la grilla se actualiza dinámicamente, re-aplicar filtro
  const observer = new MutationObserver(applyFilter);
  observer.observe(grid, { childList: true });

  // Primera pasada
  applyFilter();
});
