// scripts/modal.js
// Modal con borde dinámico por etiqueta, animación suave y accesibilidad básica.

import { todasLasPublicaciones } from './cargarPublicaciones.js';

const EMOTES = {
  offline: '🎮',
  lan: '🔌',
  online: '🌐',
  adult: '🔞',
  default: '🏠',
};

// Normaliza primer tag del juego a una de: offline | lan | online | adult | default
function normalizarEtiqueta(tags) {
  const raw = (tags?.[0] || '').toString().toLowerCase().trim();
  const compact = raw.replace(/\s+/g, '');
  if (/(\+?18|adult|adulto|18\+|mayores)/.test(compact)) return 'adult';
  if (compact.includes('lan')) return 'lan';
  if (compact.includes('online')) return 'online';
  if (compact.includes('offline') || raw.includes('sin internet')) return 'offline';
  return 'default';
}

// Abre/cierra el modal (clase is-open + aria + bloqueo de scroll)
function setModalOpen(isOpen) {
  const modal = document.getElementById('modal-juego');
  if (!modal) return;
  if (isOpen) {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    // foco al botón cerrar para teclado
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn?.focus({ preventScroll: true });
  } else {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
}

// API principal: abrir modal con datos del juego
export function abrirModal(juego, origenElemento = null) {
  const modal = document.getElementById('modal-juego');
  const modalBody = document.getElementById('modal-body');
  const modalContent = modal?.querySelector('.modal-content');
  if (!modal || !modalBody || !modalContent) return;

  // Etiqueta dinámica para el borde/colores
  const etiqueta = normalizarEtiqueta(juego.tags);
  modalBody.className = 'modal-body';
  modalContent.className = 'modal-content';
  modalBody.classList.add(`modal-${etiqueta}`);
  modalContent.classList.add(`modal-content-${etiqueta}`);

  // Partes del contenido
  const emote = EMOTES[etiqueta] || EMOTES.default;

  const imagenHTML = juego.imagen
    ? `<img src="${juego.imagen}" alt="${juego.nombre || 'Juego'}">`
    : `<div style="width:100%;height:220px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:6px;">Sin imagen</div>`;

  const etiquetaHTML = `<div class="modal-etiqueta">${emote} ${etiqueta.toUpperCase()}</div>`;
  const nombreHTML = `<h2 style="margin:6px 0 8px">${juego.nombre || 'Sin nombre'}</h2>`;
  const descripcionHTML = juego.descripcion ? `<p>${juego.descripcion}</p>` : '';

  const enlaceDescarga = juego.descargar;
  const contrasena = juego.contraseña ?? juego.contrasena; // soporta ambas claves
  const enlaceCompra = juego.comprar;

  const btnDescargar = enlaceDescarga
    ? `<a href="${enlaceDescarga}" target="_blank" rel="noopener noreferrer">DESCARGAR</a>`
    : '';
  const btnContrasena = contrasena
    ? `<a href="#" onclick="copiarContraseña('${(contrasena + '').replace(/'/g, "\\'")}');return false;">CONTRASEÑA</a>`
    : '';
  const btnComprar = enlaceCompra
    ? `<a href="${enlaceCompra}" target="_blank" rel="noopener noreferrer">COMPRAR</a>`
    : '';

  const botonesHTML =
    btnDescargar || btnContrasena || btnComprar
      ? `<div class="modal-body-buttons">${btnDescargar}${btnContrasena}${btnComprar}</div>`
      : '';

  const versionHTML = juego.version ? `<div class="modal-version">VERSIÓN: ${juego.version}</div>` : '';

  // Inyectar
  modalBody.innerHTML = `${imagenHTML}${etiquetaHTML}${nombreHTML}${descripcionHTML}${botonesHTML}${versionHTML}`;

  // Origen de la animación (opcional, desde la card clickeada)
  if (origenElemento && origenElemento.getBoundingClientRect) {
    const rect = origenElemento.getBoundingClientRect();
    modalContent.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
  } else {
    modalContent.style.transformOrigin = '50% 50%';
  }
  // Reiniciar animación para que siempre dispare
  modalContent.style.animation = 'none';
  // Forzamos reflow
  // eslint-disable-next-line no-unused-expressions
  modalContent.offsetWidth;
  modalContent.style.animation = 'zoomInModal .28s ease-out forwards';

  // Abrir modal + actualizar hash
  setModalOpen(true);
  if (juego.id) {
    try { history.replaceState(null, '', `#${juego.id}`); } catch {}
  }
}

// Cerrar modal
function cerrarModal() {
  const modal = document.getElementById('modal-juego');
  if (!modal?.classList.contains('is-open')) return;
  setModalOpen(false);
  try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch {}
}

// Abrir modal si hay hash (deep link tipo /#id)
export function verificarFragmentoURL() {
  const id = window.location.hash.replace('#', '');
  if (!id) return;
  const juego = (todasLasPublicaciones || []).find((j) => j.id === id);
  if (juego) abrirModal(juego);
}

// Utilidad global para copiar contraseña
window.copiarContraseña = function (texto) {
  if (!texto) return;
  navigator.clipboard
    .writeText(texto)
    .then(() => mostrarNotificacion('Contraseña copiada al portapapeles'))
    .catch(() => mostrarNotificacion('No se pudo copiar la contraseña'));
};

// Toast simple
function mostrarNotificacion(msg) {
  const aviso = document.createElement('div');
  aviso.textContent = msg;
  Object.assign(aviso.style, {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#ff00cc',
    color: '#000',
    padding: '10px 16px',
    borderRadius: '8px',
    fontFamily: 'Roboto Mono, monospace',
    fontWeight: '700',
    boxShadow: '0 6px 18px rgba(255,0,204,0.35)',
    zIndex: '1000',
    opacity: '0',
    transition: 'opacity .25s ease',
  });
  document.body.appendChild(aviso);
  requestAnimationFrame(() => (aviso.style.opacity = '1'));
  setTimeout(() => {
    aviso.style.opacity = '0';
    setTimeout(() => aviso.remove(), 250);
  }, 1800);
}

// Listeners globales
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-juego');
  const closeBtn = modal?.querySelector('.modal-close');

  closeBtn?.addEventListener('click', cerrarModal);

  // Cerrar clickeando el overlay (pero no el contenido)
  window.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  // Esc para cerrar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
  });
});
