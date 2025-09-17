import { todasLasPublicaciones } from './cargarPublicaciones.js';

export function abrirModal(juego) {
  const modal = document.getElementById('modal-juego');
  const modalBody = document.getElementById('modal-body');

  const imagenHTML = juego.imagen
    ? `<img src="${juego.imagen}" alt="${juego.nombre}">`
    : `<div style="width:100%;height:200px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:4px;">Sin imagen</div>`;

  const nombreHTML = juego.nombre
    ? `<h2>${juego.nombre}</h2>`
    : `<h2>Sin nombre</h2>`;

  const descripcionHTML = juego.descripcion
    ? `<p>${juego.descripcion}</p>`
    : '';

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
    ${nombreHTML}
    ${descripcionHTML}
    ${botonesHTML}
    ${versionHTML}
  `;

  modal.style.display = 'block';

  if (juego.id) {
    history.replaceState(null, '', `#${juego.id}`);
  }
}

window.copiarContraseña = function(texto) {
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
  aviso.style.fontFamily = 'Roboto Mono, monospace';
  aviso.style.boxShadow = '0 0 10px rgba(255,0,204,0.4)';
  aviso.style.zIndex = '1000';
  aviso.style.opacity = '0';
  aviso.style.transition = 'opacity 0.3s ease';

  document.body.appendChild(aviso);
  setTimeout(() => aviso.style.opacity = '1', 10);
  setTimeout(() => {
    aviso.style.opacity = '0';
    setTimeout(() => aviso.remove(), 300);
  }, 2000);
}

export function verificarFragmentoURL() {
  const fragmento = window.location.hash.replace('#', '');
  if (!fragmento) return;

  const juego = todasLasPublicaciones.find(j => j.id === fragmento);
  if (juego) abrirModal(juego);
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      document.getElementById('modal-juego').style.display = 'none';
      history.replaceState(null, '', window.location.pathname);
    };
  }

  window.onclick = (event) => {
    const modal = document.getElementById('modal-juego');
    if (event.target === modal) {
      modal.style.display = 'none';
      history.replaceState(null, '', window.location.pathname);
    }
  };
});
