// scripts/modal.js v28
// Modal con fade/scale, etiqueta arriba-izquierda y versi¨®n sobre los botones.
// Sin sintaxis moderna problem¨¢tica para evitar errores de parseo.

const EMOTES = { offline: '??', lan: '??', online: '??', adult: '??', default: '??' };

function normalizarEtiqueta(tags) {
  var raw = ((tags && tags[0]) || '').toString().toLowerCase().trim();
  var compact = raw.replace(/\s+/g, '');
  if (/(\+?18|adult|adulto|18\+|mayores)/.test(compact)) return 'adult';
  if (compact.indexOf('lan') !== -1) return 'lan';
  if (compact.indexOf('online') !== -1) return 'online';
  if (compact.indexOf('offline') !== -1 || raw.indexOf('sin internet') !== -1) return 'offline';
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
  var onEnd = function () {
    modalEl.style.display = 'none';
    modalEl.removeEventListener('transitionend', onEnd);
    document.body.classList.remove('modal-open');
  };
  modalEl.addEventListener('transitionend', onEnd);
}

/* ==================== API ==================== */
export function abrirModal(juego, origenElemento) {
  var modal = document.getElementById('modal-juego');
  var modalBody = document.getElementById('modal-body');
  var modalContent = modal ? modal.querySelector('.modal-content') : null;
  if (!modal || !modalBody || !modalContent) return;

  var etiqueta = normalizarEtiqueta(juego.tags);
  var emote = EMOTES[etiqueta] || EMOTES.default;

  // Reset clases
  modalBody.className = 'modal-body';
  modalContent.className = 'modal-content';
  modalBody.classList.add('modal-' + etiqueta);
  modalContent.classList.add('modal-content-' + etiqueta);

  // Imagen (contain, sin recortes)
  var imagenHTML = juego.imagen
    ? '<img src="' + juego.imagen + '" alt="' + (juego.nombre || 'Juego') + '">'
    : '<div style="width:100%;height:200px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:6px;">Sin imagen</div>';

  var nombreHTML = '<h2 class="modal-title">' + (juego.nombre || 'Sin nombre') + '</h2>';
  var versionHTML = juego.version ? '<div class="modal-version">VERSI¨®N: ' + juego.version + '</div>' : '';
  var descripcionHTML = juego.descripcion ? '<p class="modal-description">' + juego.descripcion + '</p>' : '';

  var enlaceDescarga = juego.descargar;
  var contrasena = (juego.contrase?a || juego.contrasena || '');
  var enlaceCompra = juego.comprar;

  var btnDescargar = enlaceDescarga ? '<a href="' + enlaceDescarga + '" target="_blank" rel="noopener">DESCARGAR</a>' : '';
  var btnContrasena = contrasena ? '<a href="#" id="btn-copy-pass">CONTRASE?A</a>' : '';
  var btnComprar = enlaceCompra ? '<a href="' + enlaceCompra + '" target="_blank" rel="noopener">COMPRAR</a>' : '';
  var botonesHTML = (btnDescargar || btnContrasena || btnComprar)
    ? '<div class="modal-body-buttons">' + btnDescargar + btnContrasena + btnComprar + '</div>'
    : '';

  // Etiqueta arriba-izquierda (mismo estilo que los botones)
  var tagHTML = '<div class="modal-tag"><span class="modal-etiqueta tag-pill tag-' + etiqueta + '">' + emote + ' ' + etiqueta.toUpperCase() + '</span></div>';

  // Orden final
  modalBody.innerHTML = imagenHTML + nombreHTML + versionHTML + descripcionHTML + botonesHTML + tagHTML;

  // Handler copiar contrase?a
  var btnCopy = modalBody.querySelector('#btn-copy-pass');
  if (btnCopy) {
    btnCopy.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(contrasena);
      }
    });
  }

  // Origen animaci¨®n si viene de una card
  modalContent.style.transformOrigin = '50% 50%';
  if (origenElemento && origenElemento.getBoundingClientRect) {
    var r = origenElemento.getBoundingClientRect();
    modalContent.style.transformOrigin = (r.left + r.width / 2) + 'px ' + (r.top + r.height / 2) + 'px';
  }

  showModal(modal);

  // Actualiza hash si hay id
  if (juego.id) {
    try { history.replaceState(null, '', '#' + juego.id); } catch (e) {}
  }
}

function cerrarModal() {
  var modal = document.getElementById('modal-juego');
  if (!modal) return;
  hideModal(modal);
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
}

export function verificarFragmentoURL() {
  var id = location.hash.replace('#', '');
  if (!id) return;
  var lista = Array.isArray(window.__PUBLICACIONES__) ? window.__PUBLICACIONES__ : [];
  if (!lista.length) return;
  var juego = null;
  for (var i = 0; i < lista.length; i++) {
    if ((lista[i].id || '') === id) { juego = lista[i]; break; }
  }
  if (juego) abrirModal(juego);
}

/* ==================== Listeners ==================== */
document.addEventListener('DOMContentLoaded', function () {
  var modal = document.getElementById('modal-juego');
  var closeBtn = modal ? modal.querySelector('.modal-close') : null;
  if (closeBtn) closeBtn.addEventListener('click', cerrarModal);
  window.addEventListener('click', function (e) { if (e.target === modal) cerrarModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarModal(); });
  window.addEventListener('hashchange', verificarFragmentoURL);
});
