// scripts/modal.js
// Forma y animación replicadas del sitio de referencia (fade + scale), manteniendo tus colores. :contentReference[oaicite:1]{index=1}

import { todasLasPublicaciones } from './cargarPublicaciones.js';

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

/* ---------- abrir/cerrar con fade-in/fade-out ---------- */
function showModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('fade-out');
  modalEl.classList.add('fade-in');
  document.body.classList.add('modal-open');
}

function hideModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('fade-in');
  modalEl.classList.add('fade-out');
  // al terminar la transición, ocultamos completamente
  const onEnd = () => {
    modalEl.style.display = 'none';
    modalEl.removeEventListener('transitionend', onEnd);
    document.body.classList.remove('modal-open');
  };
  modalEl.addEventListener('transitionend', onEnd);
}

/* ---------- API principal ---------- */
export function abrirModal(juego, origenElemento = null) {
  const modal = document.getElementById('modal-juego');
  const modalBody = document.getElementById('modal-body');
  const modalContent = modal?.querySelector('.modal-content');
  if (!modal || !modalBody || !modalContent) return;

  // preparar display antes de animar
  modal.style.display = 'flex';

  const etiqueta = normalizarEtiqueta(juego.tags);
  modalBody.className = 'modal-body';
  modalContent.className = 'modal-content';
  modalBody.classList.add(`modal-${etiqueta}`);
  modalContent.classList.add(`modal-content-${etiqueta}`);

  const emote = EMOTES[etiqueta] || EMOTES.default;

  const imagenHTML = juego.imagen
    ? `<img src="${juego.imagen}" alt="${juego.nombre || 'Juego'}">`
    : `<div style="width:100%;height:220px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:6px;">Sin imagen</div>`;

  const etiquetaHTML = `<div class="modal-etiqueta">${emote} ${etiqueta.toUpperCase()}</div>`;
  const nombreHTML = `<h2 class="modal-title" style="text-align:center;margin:8px 0 14px">${juego.nombre || 'Sin nombre'}</h2>`;
  const descripcionHTML = juego.descripcion ? `<p class="modal-description" style="text-align:center">${juego.descripcion}</p>` : '';

  const enlaceDescarga = juego.descargar;
  const contrasena = juego.contraseña ?? juego.contrasena;
  const enlaceCompra = juego.comprar;

  const btnDescargar = enlaceDescarga
    ? `<a class="download-btn" href="${enlaceDescarga}" target="_blank" rel="noopener">DESCARGAR</a>`
    : '';
  const btnContrasena = contrasena
    ? `<a class="password-btn" href="#" onclick="copiarContraseña('${(contrasena + '').replace(/'/g, "\\'")}');return false;">CONTRASEÑA</a>`
    : '';
  const btnComprar = enlaceCompra
    ? `<a class="comprar-btn" href="${enlaceCompra}" target="_blank" rel="noopener">COMPRAR</a>`
    : '';

  const botonesHTML = (btnDescargar || btnContrasena || btnComprar)
    ? `<div class="modal-body-buttons">${btnDescargar}${btnContrasena}${btnComprar}</div>`
    : '';

  const versionHTML = juego.version ? `<div class="modal-version">VERSIÓN: ${juego.version}</div>` : '';

  modalBody.innerHTML = `${imagenHTML}${etiquetaHTML}${nombreHTML}${descripcionHTML}${botonesHTML}${versionHTML}`;

  // animación de apertura
  requestAnimationFrame(() => showModal(modal));

  // actualizar hash
  if (juego.id) { try { history.replaceState(null, '', `#${juego.id}`); } catch {} }
}

function cerrarModal() {
  const modal = document.getElementById('modal-juego');
  if (!modal) return;
  hideModal(modal);
  try { history.replaceState(null, '', location.pathname + location.search); } catch {}
}

/* Deep-link con #id */
export function verificarFragmentoURL() {
  const id = location.hash.replace('#', '');
  if (!id) return;
  const juego = (todasLasPublicaciones || []).find((j) => j.id === id);
  if (juego) abrirModal(juego);
}

/* Copiar pass */
window.copiarContraseña = function (texto) {
  if (!texto) return;
  navigator.clipboard.writeText(texto).then(
    () => console.log('Contraseña copiada'),
    () => console.warn('No se pudo copiar')
  );
};

/* Listeners */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-juego');
  const closeBtn = modal?.querySelector('.modal-close');

  closeBtn?.addEventListener('click', cerrarModal);

  // cerrar al clickear overlay
  window.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });

  // cerrar con ESC
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });
});
