// scripts/modal.js
// Modal con etiqueta arriba-izquierda, versi¨®n encima de botones,
// sin optional chaining ni nullish (compatibilidad total).

var EMOTES = { offline: '??', lan: '??', online: '??', adult: '??', default: '??' };

function normalizarEtiqueta(tags) {
  var raw = '';
  if (tags && tags.length) raw = String(tags[0]).toLowerCase().trim();
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

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/* ---------- API ---------- */
export function abrirModal(juego, origenElemento) {
  var modal = document.getElementById('modal-juego');
  var modalBody = document.getElementById('modal-body');
  var modalContent = modal ? modal.querySelector('.modal-content') : null;
  if (!modal || !modalBody || !modalContent) return;

  var etiqueta = normalizarEtiqueta(juego && juego.tags ? juego.tags : []);
  var emote = EMOTES[etiqueta] || EMOTES.default;

  // reset + clases por tipo (para borde/glow)
  modalBody.className = 'modal-body';
  modalContent.className = 'modal-content';
  modalBody.classList.add('modal-' + etiqueta);
  modalContent.classList.add('modal-content-' + etiqueta);

  var imagenHTML = juego && juego.imagen
    ? '<img src="' + juego.imagen + '" alt="' + (juego.nombre ? escAttr(juego.nombre) : 'Juego') + '">'
    : '<div style="width:100%;height:200px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:6px;">Sin imagen</div>';

  var nombreHTML = '<h2 class="modal-title">' + (juego && juego.nombre ? juego.nombre : 'Sin nombre') + '</h2>';
  var versionHTML = (juego && juego.version) ? '<div class="modal-version">VERSI¨®N: ' + juego.version + '</div>' : '';
  var descripcionHTML = (juego && juego.descripcion) ? '<p class="modal-description">' + juego.descripcion + '</p>' : '';

  // Datos de botones
  var enlaceDescarga = juego && juego.descargar ? juego.descargar : '';
  var passProp = (juego && Object.prototype.hasOwnProperty.call(juego, 'contrase?a')) ? juego['contrase?a'] : (juego && juego.contrasena ? juego.contrasena : '');
  var enlaceCompra = juego && juego.comprar ? juego.comprar : '';

  var pieces = [];
  if (enlaceDescarga) {
    pieces.push('<a href="' + enlaceDescarga + '" target="_blank" rel="noopener">DESCARGAR</a>');
  }
  if (passProp) {
    pieces.push('<a href="#" class="btn-copy" data-pass="' + escAttr(passProp) + '">CONTRASE?A</a>');
  }
  if (enlaceCompra) {
    pieces.push('<a href="' + enlaceCompra + '" target="_blank" rel="noopener">COMPRAR</a>');
  }
  var botonesHTML = pieces.length ? '<div class="modal-body-buttons">' + pieces.join('') + '</div>' : '';

  // Etiqueta arriba-izquierda
  var tagHTML = '<div class="modal-tag"><span class="modal-etiqueta tag-pill tag-' + etiqueta + '">' + emote + ' ' + etiqueta.toUpperCase() + '</span></div>';

  // Orden final
  modalBody.innerHTML = imagenHTML + nombreHTML + versionHTML + descripcionHTML + botonesHTML + tagHTML;

  // Listener seguro para copiar contrase?a
  var copyBtn = modalBody.querySelector('.btn-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var t = copyBtn.getAttribute('data-pass') || '';
      if (t && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).catch(function(){});
      }
    });
  }

  // Origen est¨¦tico del zoom
  modalContent.style.transformOrigin = '50% 50%';
  if (origenElemento && origenElemento.getBoundingClientRect) {
    var r = origenElemento.getBoundingClientRect();
    modalContent.style.transformOrigin = (r.left + r.width / 2) + 'px ' + (r.top + r.height / 2) + 'px';
  }

  showModal(modal);
  if (juego && juego.id) {
    try { history.replaceState(null, '', '#' + juego.id); } catch (e) {}
  }
}

function cerrarModal() {
  var modal = document.getElementById('modal-juego');
  if (!modal) return;
  hideModal(modal);
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
}

/* Abre por hash */
export function verificarFragmentoURL() {
  var id = location.hash.replace('#', '');
  var lista = (window.__PUBLICACIONES__ && Array.isArray(window.__PUBLICACIONES__)) ? window.__PUBLICACIONES__ : [];
  if (!id || !lista.length) return;
  var juego = null;
  for (var i = 0; i < lista.length; i++) {
    var j = lista[i];
    if ((j.id || '') === id) { juego = j; break; }
  }
  if (juego) abrirModal(juego);
}

/* Listeners globales */
document.addEventListener('DOMContentLoaded', function () {
  var modal = document.getElementById('modal-juego');
  var closeBtn = modal ? modal.querySelector('.modal-close') : null;
  if (closeBtn) closeBtn.addEventListener('click', cerrarModal);
  window.addEventListener('click', function (e) { if (e.target === modal) cerrarModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarModal(); });
  window.addEventListener('hashchange', verificarFragmentoURL);
});
