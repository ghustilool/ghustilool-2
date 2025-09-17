// modal.js
import { todasLasPublicaciones } from './cargarPublicaciones.js';

/* ============ API ============ */
export function abrirModal(juego, origenElemento = null) {
  const modal = document.getElementById('modal-juego');
  const modalBody = document.getElementById('modal-body');
  const modalContent = modal.querySelector('.modal-content');

  // 🧠 Detectar etiqueta principal
  const etiqueta = juego.tags?.[0]?.toLowerCase().trim() || 'default';

  // 🧼 Limpiar clases anteriores
  modalBody.className = 'modal-body';
  modalContent.className = 'modal-content'; // base
  modalBody.classList.add(`modal-${etiqueta}`);
  modalContent.classList.add(`modal-content-${etiqueta}`);

  // 🎭 Emote por etiqueta
  const emotes = {
    offline: '🎮',
    lan: '🔌',
    online: '🌐',
    adult: '🔞',
    default: '🏠'
  };
  const emote = emotes[etiqueta] || emotes.default;

  // 🖼️ Contenido del modal
  const imagenHTML = juego.imagen
    ? `<img src="${juego.imagen}" alt="${juego.nombre}">`
    : `<div style="width:100%;height:200px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:4px;">Sin imagen</div>`;

  const etiquetaHTML = `<div class="modal-etiqueta">${emote} ${etiqueta.toUpperCase()}</div>`;

  const nombreHTML = juego.nombre
    ? `<h2>${juego.nombre}</h2>`
    : `<h2>Sin nombre</h2>`;

  const descripcionHTML = juego.descripcion ? `<p>${juego.descripcion}</p>` : '';

  const botonesHTML = `
    <div class="modal-body-buttons">
      ${juego.descargar ? `<a href="${juego.descargar}" target="_blank">DESCARGAR</a>` : ''}
      ${juego.contraseña ? `<a href="#" onclick="copiarContraseña('${juego.contraseña}');return false;">CONTRASEÑA</a>` : ''}
      ${juego.comprar ? `<a href="${juego.comprar}" target="_blank">COMPRAR</a>` : ''}
    </div>
  `;

  const versionHTML = juego.version
    ? `<div class="modal-version">VERSIÓN: ${juego.version}</div>`
    : '';

  modalBody.innerHTML = `
    ${imagenHTML}
    ${etiquetaHTML}
    ${nombreHTML}
    ${descripcionHTML}
    ${botonesHTML}
    ${versionHTML}
  `;

  // 🌀 Animación desde el origen del clic
  if (origenElemento) {
    const rect = origenElemento.getBoundingClientRect();
    modalContent.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
  } else {
    modalContent.style.transformOrigin = '50% 50%';
  }
  modalContent.classList.remove('animando');
  void modalContent.offsetWidth; // reflow
  modalContent.classList.add('animando');

  // ✅ Mostrar usando clases/aria (coincide con modal.css)
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  // Hash bonito
  if (juego.id) {
    history.replaceState(null, '', `#${juego.id}`);
  }
}

/* ============ Helpers globales ============ */
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
  aviso.style.position = 'fixed';
  aviso.style.bottom = '20px';
  aviso.style.left = '50%';
  aviso.style.transform = 'translateX(-50%)';
  aviso.style.background = '#ff00cc';
  aviso.style.color = '#000';
  aviso.style.padding = '10px 20px';
  aviso.style.borderRadius = '6px';
  aviso.style.fontFamily = 'Roboto Mono', monospace;
  aviso.style.boxShadow = '0 0 10px rgba(255,0,204,0.4)';
  aviso.style.zIndex = '1000';
  aviso.style.opacity = '0';
  aviso.style.transition = 'opacity 0.3s ease';

  document.body.appendChild(aviso);
  setTimeout(() => (aviso.style.opacity = '1'), 10);
  setTimeout(() => {
    aviso.style.opacity = '0';
    setTimeout(() => aviso.remove(), 300);
  }, 2000);
}

/* ============ Navegación por hash ============ */
export function verificarFragmentoURL() {
  const fragmento = window.location.hash.replace('#', '');
  if (!fragmento) return;

  const juego = todasLasPublicaciones.find(j => j.id === fragmento);
  if (juego) abrirModal(juego);
}

/* ============ Cierre centralizado ============ */
function cerrarModal() {
  const modal = document.getElementById('modal-juego');
  if (!modal.classList.contains('is-open')) return;

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  history.replaceState(null, '', window.location.pathname);
}

/* ============ Listeners DOM ============ */
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.onclick = () => cerrarModal();
  }

  // Cerrar haciendo click fuera del contenido
  window.onclick = (event) => {
    const modal = document.getElementById('modal-juego');
    if (event.target === modal) cerrarModal();
  };

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
  });

  // (Opcional) Animación desde tarjeta si existieran en el DOM inicial
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const juego = todasLasPublicaciones.find(j => j.id === id);
      if (juego) abrirModal(juego, card);
    });
  });
});
