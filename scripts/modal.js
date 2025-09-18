// scripts/modal.js
// Modal con fade/scale + etiqueta arriba-izquierda y versi車n sobre los botones.
// Sin inline-onclick; usamos event listeners para evitar errores de comillas.

const EMOTES = { offline: '??', lan: '??', online: '??', adult: '??', default: '??' };

function normalizarEtiqueta(tags) {
  const raw = (tags?.[0] || '').toString().toLowerCase().trim();
  const compact = raw.replace(/\s+/g, '');
  if (/(\+?18|adult|adulto|18\+|mayores)/.test(compact)) return 'adult';
  if (compact.includes('lan')) return 'lan';
  if (compact.includes('online')) return 'online';
  if (compact.includes('offline') || raw.includes('sin internet')) return 'offline';
  return 'default';
}

function showModal(modalEl) {
  modalEl.style.display = 'flex';
  modalEl.classList.remove('fade-out');
  modalEl.classList.add('fade-in');
  document.body.classList.add('modal-open');
}

function hideModal(modalEl) {
  modalEl.classList.remove('fade-in');
  modalEl.classList.add('fade-out');
  const onEnd = () => {
    modalEl.style.display = 'none';
    modalEl.removeEventListener('transitionend', onEnd);
    document.body.classList.remove('modal-open');
  };
  modalEl.addEventListener('transitionend', onEnd);
}

// Escapa para atributo HTML (data-*)
function escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

/* ---------- API ---------- */
export function abrirModal(juego, origenElemento = null) {
  const modal = document.getElementById('modal-juego');
  const modalBody = document.getElementById('modal-body');
  const modalContent = modal?.querySelector('.modal-content');
  if (!modal || !modalBody || !modalContent) return;

  const etiqueta = normalizarEtiqueta(juego.tags);
  const emote = EMOTES[etiqueta] || EMOTES.default;

  // reset + clases por tipo (para borde/glow)
  modalBody.className = 'modal-body';
  modalContent.className = 'modal-content';
  modalBody.classList.add(`modal-${etiqueta}`);
  modalContent.classList.add(`modal-content-${etiqueta}`);

  const imagenHTML = juego.imagen
    ? `<img src="${juego.imagen}" alt="${juego.nombre ? escAttr(juego.nombre) : 'Juego'}">`
    : `<div style="width:100%;height:200px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:6px;">Sin imagen</div>`;

  const nombreHTML = `<h2 class="modal-title">${juego.nombre || 'Sin nombre'}</h2>`;
  const versionHTML = juego.version ? `<div class="modal-version">VERSI車N: ${juego.version}</div>` : '';
  const descripcionHTML = juego.descripcion ? `<p class="modal-description">${juego.descripcion}</p>` : '';

  // Botones
  const pieces = [];
  if (juego.descargar) {
    pieces.push(`<a href="${juego.descargar}" target="_blank" rel="noopener">DESCARGAR</a>`);
  }
  if (juego.contrase?a ?? juego.contrasena) {
    const pass = escAttr(juego.contrase?a ?? juego.contrasena);
    pieces.push(`<a href="#" class="btn-copy" data-pass="${pass}">CONTRASE?A</a>`);
  }
  if (juego.comprar) {
    pieces.push(`<a href="${juego.comprar}" target="_blank" rel="noopener">COMPRAR</a>`);
  }
  const botonesHTML = pieces.length
    ? `<div class="modal-body-buttons">${pieces.join('')}</div>`
    : '';

  // Etiqueta arriba-izquierda
  const tagHTML = `<div class="modal-tag"><span class="modal-etiqueta tag-pill tag-${etiqueta}">${emote} ${etiqueta.toUpperCase()}</span></div>`;

  // Orden: imagen ↙ t赤tulo ↙ versi車n ↙ descripci車n ↙ botones ↙ etiqueta
  modalBody.innerHTML = `${imagenHTML}${nombreHTML}${versionHTML}${descripcionHTML}${botonesHTML}${tagHTML}`;

  // Listener para copiar contrase?a (sin inline onclick)
  const copyBtn = modalBody.querySelector('.btn-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const t = copyBtn.getAttribute('data-pass') || '';
      if (t) navigator.clipboard.writeText(t).catch(() => {});
    });
  }

  // Origen est谷tico del zoom
  modalContent.style.transformOrigin = '50% 50%';
  if (origenElemento?.getBoundingClientRect) {
    const r = origenElemento.getBoundingClientRect();
    modalContent.style.transformOrigin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
  }

  showModal(modal);
  if (juego.id) {
    try { history.replaceState(null, '', `#${juego.id}`); } catch {}
  }
}

function cerrarModal() {
  const modal = document.getElementById('modal-juego');
  if (!modal) return;
  hideModal(modal);
  try { history.replaceState(null, '', location.pathname + location.search); } catch {}
}

/* Abre por hash */
export function verificarFragmentoURL() {
  const id = location.hash.replace('#', '');
  const lista = Array.isArray(window.__PUBLICACIONES__) ? window.__PUBLICACIONES__ : [];
  if (!id || !lista.length) return;
  const juego = lista.find((j) => (j.id || '') === id);
  if (juego) abrirModal(juego);
}

/* Listeners globales */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-juego');
  const closeBtn = modal?.querySelector('.modal-close');
  closeBtn?.addEventListener('click', cerrarModal);
  window.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });
  window.addEventListener('hashchange', verificarFragmentoURL);
});
