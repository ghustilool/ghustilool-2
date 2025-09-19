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

  input.addEventListener('input', applyFilter);

  clear?.addEventListener('click', () => {
    input.value = '';
    applyFilter();
    input.focus();
  });

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

  const observer = new MutationObserver(applyFilter);
  observer.observe(grid, { childList: true });

  applyFilter();
});
