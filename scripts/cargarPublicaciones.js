const autores = ['ghustilool']; // Agregá más nombres si tenés otros JSON
const todasLasPublicaciones = [];

function cargarPublicacionesIniciales() {
  const contenedor = document.getElementById('publicaciones-todas');
  contenedor.innerHTML = '';

  let cargados = 0;

  autores.forEach(autor => {
    fetch(`autores/${autor}.json`)
      .then(res => {
        if (!res.ok) throw new Error(`No se pudo cargar ${autor}.json`);
        return res.json();
      })
      .then(data => {
        todasLasPublicaciones.push(...data);
        cargados++;
        if (cargados === autores.length) {
          mostrarPublicacionesOrdenadas();
        }
      })
      .catch(err => {
        console.error(`Error al cargar ${autor}.json:`, err);
        cargados++;
        if (cargados === autores.length) {
          mostrarPublicacionesOrdenadas();
        }
      });
  });
}

function mostrarPublicacionesOrdenadas() {
  const contenedor = document.getElementById('publicaciones-todas');
  contenedor.innerHTML = '';

  if (todasLasPublicaciones.length === 0) {
    contenedor.innerHTML = '<p style="color:#ff0033;text-align:center;">No se encontraron publicaciones.</p>';
    return;
  }

  const ordenadas = todasLasPublicaciones.sort((a, b) =>
    (a.nombre || '').localeCompare(b.nombre || '')
  );

  ordenadas.forEach(juego => {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-tags', juego.tags?.join(',') || '');

    const imagenHTML = juego.imagen
      ? `<img src="${juego.imagen}" alt="${juego.nombre}">`
      : `<div style="width:100%;height:120px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:4px;">Sin imagen</div>`;

    const nombreHTML = juego.nombre
      ? `<h3>${juego.nombre}</h3>`
      : `<h3>Sin nombre</h3>`;

    card.innerHTML = `
      ${imagenHTML}
      ${nombreHTML}
    `;

    card.onclick = () => abrirModal(juego);
    contenedor.appendChild(card);
  });
}

function abrirModal(juego) {
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

  const descargarHTML = juego.descargar
    ? `<a href="${juego.descargar}" target="_blank">Descargar</a>`
    : `<a style="background:#555;cursor:default;">Sin descarga</a>`;

  const comprarHTML = juego.comprar
    ? `<br><a href="${juego.comprar}" target="_blank">Comprar</a>`
    : '';

  modalBody.innerHTML = `
    ${imagenHTML}
    ${nombreHTML}
    ${descripcionHTML}
    ${descargarHTML}
    ${comprarHTML}
  `;

  modal.style.display = 'block';
}

// Cierre del modal
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      document.getElementById('modal-juego').style.display = 'none';
    };
  }

  window.onclick = (event) => {
    const modal = document.getElementById('modal-juego');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  cargarPublicacionesIniciales();
});
