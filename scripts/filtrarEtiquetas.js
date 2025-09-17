// scripts/filtrarEtiquetas.js
// Filtra las cards por etiqueta sin romper el layout (las cards usan display:flex)
// y re-ajusta los títulos si está disponible window.fitTitles (para mantener alturas iguales).

(function () {
  const SELECTOR_POR_ETIQUETA = {
    all: '.tag-button-all',
    offline: '.tag-button-offline',
    lan: '.tag-button-lan',
    online: '.tag-button-online',
    adult: '.tag-button-adult',
  };

  function activarBoton(etiqueta) {
    document.querySelectorAll('.tag-button').forEach((b) => b.classList.remove('active'));
    if (etiqueta === null) {
      document.querySelector(SELECTOR_POR_ETIQUETA.all)?.classList.add('active');
      return;
    }
    const key = (etiqueta || '').toString().toLowerCase();
    const mapKey = key === 'sin internet' ? 'offline' : key;
    const selector = SELECTOR_POR_ETIQUETA[mapKey];
    if (selector) document.querySelector(selector)?.classList.add('active');
  }

  function coincide(card, etiqueta) {
    if (etiqueta === null) return true;

    const tagsAttr = (card.getAttribute('data-tags') || '')
      .split(',')
      .map((s) => s.trim().toLowerCase());

    // Normalizamos: "on line" -> "online", "off line" -> "offline"
    const normalized = (etiqueta || '').toString().toLowerCase().trim();
    const compact = normalized.replace(/\s+/g, '');

    // soportar sinónimos
    const candidates = new Set([compact]);
    if (compact === '18+' || compact === '+18') candidates.add('adult');
    if (normalized === 'sin internet') candidates.add('offline');

    // match exacto contra data-tags (que ya están en minúsculas)
    return tagsAttr.some((t) => {
      const tt = t.replace(/\s+/g, '');
      return (
        candidates.has(tt) ||
        (candidates.has('adult') && (tt.includes('18') || tt === 'adult'))
      );
    });
  }

  // API global
  window.filtrarPorEtiqueta = function (etiqueta = null) {
    activarBoton(etiqueta);

    const cards = document.querySelectorAll('.card');
    cards.forEach((card) => {
      const show = coincide(card, etiqueta);
      // IMPORTANTE: no uses 'block' (rompe el flex); '' vuelve al valor del CSS
      card.style.display = show ? '' : 'none';
    });

    // Reajustar títulos para que todas las cards queden exactamente iguales en altura
    if (typeof window.fitTitles === 'function') {
      // en el próximo frame, cuando el layout ya se aplicó
      setTimeout(window.fitTitles, 0);
    }
  };
})();
