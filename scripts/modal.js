// scripts/modal.js
// Modal con fade/scale + etiqueta unificada abajo-derecha.

const EMOTES = { offline:'🎮', lan:'🔌', online:'🌐', adult:'🔞', default:'🏠' };

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

/* ---------- API ---------- */
export function abrirModal(juego, origenElemento = null) {
  const modal = document.getElementById('modal-juego');
  const modalBody = document.getElementById('modal-body');
  const modalContent = modal?.querySelector('.modal-content');
  if (!modal || !modalBody || !modalContent) return;

  const etiqueta = normalizarEtiqueta(juego.tags);
  const emote = EMOTES[etiqueta] || EMOTES.default;

  modalBody.className = 'modal-body';
  modalContent.className = 'modal-content';
  modalBody.classList.add(`modal-${etiqueta}`);
  modalContent.classList.add(`modal-content-${etiqueta}`);

  const imagenHTML = juego.imagen
    ? `<img src="${juego.imagen}" alt="${juego.nombre || 'Juego'}">`
    : `<div style="width:100%;height:220px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:6px;">Sin imagen</div>`;

  const nombreHTML = `<h2 class="modal-title">${juego.nombre || 'Sin nombre'}</h2>`;
  const descripcionHTML = juego.descripcion ? `<p class="modal-description">${juego.descripcion}</p>` : '';

  const enlaceDescarga = juego.descargar;
  const contrasena = juego.contraseña ?? juego.contrasena;
  const enlaceCompra = juego.comprar;

  const btnDescargar = enlaceDescarga ? `<a href="${enlaceDescarga}" target="_blank" rel="noopener">DESCARGAR</a>` : '';
  const btnContrasena = contrasena ? `<a href="#" onclick="copiarContraseña('${(contrasena + '').replace(/'/g, "\\'")}');return false;">CONTRASEÑA</a>` : '';
  const btnComprar   = enlaceCompra ? `<a href="${enlaceCompra}" target="_blank" rel="noopener">COMPRAR</a>` : '';

  const botonesHTML = (btnDescargar || btnContrasena || btnComprar)
    ? `<div class="modal-body-buttons">${btnDescargar}${btnContrasena}${btnComprar}</div>`
    : '';

  const versionHTML = juego.version ? `<div class="modal-version">VERSIÓN: ${juego.version}</div>` : '';

  /* ✅ etiqueta unificada, ubicada abajo-derecha (no tapa los botones) */
  const tagHTML = `<div class="modal-tag"><span class="modal-etiqueta tag-pill tag-${etiqueta}">${emote} ${etiqueta.toUpperCase()}</span></div>`;

  modalBody.innerHTML = `${imagenHTML}${nombreHTML}${descripcionHTML}${botonesHTML}${versionHTML}${tagHTML}`;

  // origen estético
  modalContent.style.transformOrigin = '50% 50%';
  if (origenElemento?.getBoundingClientRect) {
    const r = origenElemento.getBoundingClientRect();
    modalContent.style.transformOrigin = `${r.left + r.width/2}px ${r.top + r.height/2}px`;
  }

  showModal(modal);
  if (juego.id) { try { history.replaceState(null, '', `#${juego.id}`); } catch {} }
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
  const juego = lista.find(j => (j.id || '') === id);
  if (juego) abrirModal(juego);
}

window.copiarContraseña = (texto) => { if (texto) navigator.clipboard.writeText(texto).catch(() => {}); };

/* Listeners */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-juego');
  const closeBtn = modal?.querySelector('.modal-close');
  closeBtn?.addEventListener('click', cerrarModal);
  window.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });
  window.addEventListener('hashchange', verificarFragmentoURL);
});
