// modal.js
import { todasLasPublicaciones } from './cargarPublicaciones.js';

/* ============================
   Utils
============================ */
const EMOTES = {
  offline: '🎮',
  lan: '🔌',
  online: '🌐',
  adult: '🔞',
  default: '🏠',
};

function normalizarEtiqueta(tags) {
  const raw = (tags?.[0] || '').toString().toLowerCase().trim();
  if (/(\+?18|adult)/.test(raw)) return 'adult';
  if (raw.includes('lan')) return 'lan';
  if (raw.includes('online')) return 'online';
  if (raw.includes('offline') || raw.includes('sin internet')) return 'offline';
  return 'default';
}

function setModalOpen(isOpen) {
  const modal = document.getElementById('modal-juego');
  if (!modal) return;
  if (isOpen) {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  } else {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
}

/* ============================
   API
============================ */
export function abrirModal(juego, origenElemento = null) {
  const modal = document.getElementById('modal-juego');
  const modalBody = document.getElementById('modal-body');
  const modalContent = modal.querySelector('.modal-content');
  if (!modal || !modalBody || !modalContent) return;

  // Etiqueta y clases dinámicas
  const etiqueta = normalizarEtiqueta(juego.tags);
  modalBody.className = 'modal-body';
  modalContent.className = 'modal-content';
  modalBody.classList.add(`modal-${etiqueta}`);
  modalContent.classList.add(`modal-content-${etiqueta}`);

  // Contenidos
  const emote = EMOTES[etiqueta] || EMOTES.default;
  const imagenHTML = juego.imagen
    ? `<img src="${juego.imagen}" alt="${juego.nombre || 'Juego'}">`
    : `<div style="width:100%;height:200px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:6px;">Sin imagen</div>`;

  const etiquetaHTML = `<div class="modal-etiqueta">${emote} ${etiqueta.toUpperCase()}</div>`;
  const nombreHTML = `<h2>${juego.nombre || 'Sin nombre'}</h2>`;
  const descripcionHTML = juego.descripcion ? `<p>${juego.descripcion}</p>` : '';

  const btnDescargar = juego.descargar
    ? `<a href="${juego.descargar}" target="_blank" rel="noopener">DESCARGAR</a>` : '';
  const btnContrasena = juego.contraseña
    ? `<a href="#" onclick="copiarContraseña('${juego.contraseña.replace(/'/g, "\\'")}');return false;">CONTRASEÑA</a>` : '';
  const btnComprar = juego.comprar
    ? `<a href="${juego.comprar}" target="_blank" rel="noopener">COMPRAR</a>` : '';

  const botonesHTML = (btnDescargar || btnContrasena || btnComprar)
    ? `<div class="modal-body-buttons">${btnDescargar}${btnContrasena}${btnComprar}</div>` : '';

  const versionHTML = juego.version ? `<div class="modal-version">VERSIÓN: ${juego.version}</div>` : '';

  modalBody.innerHTML = `
    ${imagenHTML}
    ${etiquetaHTML}
    ${nombreHTML}
    ${descripcionHTML}
    ${botonesHTML}
    ${versionHTML}
  `;

  // Animación desde el origen del click
  if (origenElemento) {
    const rect = origenElemento.getBoundingClientRect();
    modalContent.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
  } else {
    modalContent.style.transformOrigin = '50% 50%';
  }
  // re-disparar animación
  modalContent.classList.remove('animando');
  void modalContent.offsetWidth;
  modalContent.classList.add('animando');

  // Mostrar
  setModalOpen(true);

  // Actualizar hash bonito
  if (juego.id) {
    history.replaceState(null, '', `#${juego.id}`);
  }
}

function cerrarModal() {
  const modal = document.getElementById('modal-juego');
  if (!modal) return;
  if (!modal.classList.contains('is-open')) return;

  setModalOpen(false);
  history.replaceState(null, '', window.location.pathname);
}

/* ============================
   Navegación por hash
============================ */
export function verificarFragmentoURL() {
  const fragmento = window.location.hash.replace('#', '');
  if (!fragmento) return;
  const juego = todasLasPublicaciones.find(j => j.id === fragmento);
  if (juego) abrirModal(juego);
}

/* ============================
   Helpers globales
============================ */
window.copiarContraseña = function (texto) {
  navigator.clipboard.writeText(texto).then(() => {
    mostrarNotificacion('Contraseña copiada al portapapeles');
  }).catch(err => {
    console.error('Error al copiar contraseña:', err);
  });
};

function mostrarNotificacion(mensaje) {
  const aviso = document.createElement('div');
  aviso.textContent = mensaje;
  Object.assign(aviso.style, {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#ff00cc',
    color: '#000',
    padding: '10px 20px',
    borderRadius: '6px',
    fontFamily: 'Roboto Mono, monospace',
    boxShadow: '0 0 10px rgba(255,0,204,0.4)',
    zIndex: '1000',
    opacity: '0',
    transition: 'opacity 0.3s ease'
  });
  document.body.appendChild(aviso);
  requestAnimationFrame(() => (aviso.style.opacity = '1'));
  setTimeout(() => {
    aviso.style.opacity = '0';
    setTimeout(() => aviso.remove(), 300);
  }, 2000);
}

/* ============================
   Listeners
============================ */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-juego');
  const closeBtn = modal?.querySelector('.modal-close');

  if (closeBtn) closeBtn.addEventListener('click', cerrarModal);

  // Cerrar clic fuera del contenido
  window.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
  });

  // (Opcional) Si tus cards existen en el DOM inicial y tienen data-id
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const juego = todasLasPublicaciones.find(j => j.id === id);
      if (juego) abrirModal(juego, card);
    });
  });
});
