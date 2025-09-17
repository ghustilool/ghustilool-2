// scripts/filtrarEtiquetas.js
// Filtra las cards por etiqueta sin romper el layout (cards usan display:flex)
// y re-ajusta los títulos si está disponible window.fitTitles (mantiene alturas iguales).

(function () {
  // Mapeo botón → selector (para marcar "active")
  const SELECTOR_POR_ETIQUETA = {
    all: '.tag-button-all',
    offline: '.tag-button-offline',
    lan: '.tag-button-lan',
    online: '.tag-button-online',
    adult: '.tag-button-adult',
  };

  // Activa/desactiva el estado visual de los botones del header
  function activarBoton(etiqueta) {
    document.querySelectorAll('.tag-button').forEach((b) => b.classList.remove('active'));

    if (etiqueta === null) {
      document.querySelector(SELECTOR_POR_ETIQUETA.all)?.classList.add('active');
      return;
    }

    const key = (etiqueta || '').toString().toLowerCase().trim();
    const mapKey = key === 'sin internet' ? 'offline' : key; // sinónimo
    const selector = SELECTOR_POR_ETIQUETA[mapKey];
    if (selector) document.querySelector(selector)?.classList.add('active');
  }

  // Normaliza y compara la etiqueta del filtro con los data-tags de cada card
  function coincide(card, etiqueta) {
    if (etiqueta === null) return true;

    const tagsAttr = (card.getAttribute('data-tags') || '')
      .split(',')
      .map((s) => s.trim().toLowerCase());

    // Normalizamos: "on line" -> "online", "off line" -> "offline"
    const normalized = (etiqueta || '').toString().toLowerCase().trim();
    const compact = normalized.replace(/\s+/g, '');

    // Soportar sinónimos: +18 / 18+ / adult / "sin internet"
    const candidates = new Set([compact]);
    if (compact === '18+' || compact === '+18') candidates.add('adult');
    if (normalized === 'sin internet') candidates.add('offline');

    return tagsAttr.some((t) => {
      const tt = t.replace(/\s+/g, '');
      return (
        candidates.has(tt) ||
        (candidates.has('adult') && (tt.includes('18') || tt === 'adult'))
      );
    });
  }

  // API global usada por los botones del header: filtrarPorEtiqueta('Offline' | 'LAN' | 'Online' | 'Adult' | null)
  window.filtrarPorEtiqueta = function (etiqueta = null) {
    activarBoton(etiqueta);

    const cards = document.querySelectorAll('.card');
    let visibles = 0;

    cards.forEach((card) => {
      const show = coincide(card, etiqueta);

      // IMPORTANTE: no usar 'block' (rompe el layout). '' restaura el valor del CSS (flex).
      card.style.display = show ? '' : 'none';
      if (show) visibles++;
    });

    // Reajusta títulos después del filtrado para mantener alturas iguales
    if (typeof window.fitTitles === 'function') {
      // Esperar al próximo frame para que el layout ya esté aplicado
      requestAnimationFrame(() => window.fitTitles());
    }

    // Si no hay resultados, podés mostrar un mensajito (opcional):
    // const grid = document.getElementById('publicaciones-todas');
    // grid.dataset.empty = visibles === 0 ? '1' : '0';
  };
})();
