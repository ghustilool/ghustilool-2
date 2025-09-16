const autores = ['ghustilool', 'lissuwu']; // Agregá más nombres sin extensión
const todasLasPublicaciones = [];

function cargarPublicacionesIniciales() {
  const contenedor = document.getElementById('publicaciones-todas');
  contenedor.innerHTML = '';

  let cargados = 0;

  autores.forEach(autor => {
    fetch(`autores/${autor}.json`)
      .then(res => res.json())
      .then(data => {
        todasLasPublicaciones.push(...data);
        cargados++;
        if (cargados === autores.length) {
          mostrarPublicacionesOrdenadas();
        }
      })
      .catch(err => {
        console.error(`Error al cargar ${autor}.json`, err);
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

    const descripcionHTML = juego.descripcion
      ? `<p>${juego.descripcion}</p>`
      : '';

    const descargarHTML = juego.descargar
      ? `<a href="${juego.descargar}" target="_blank">Descargar</a>`
      : `<a style="background:#555;cursor:default;">Sin descarga</a>`;

    const comprarHTML = juego.comprar
      ? `<br><a href="${juego.comprar}" target="_blank">Comprar</a>`
      : '';

    card.innerHTML = `
      ${imagenHTML}
      ${nombreHTML}
      ${descripcionHTML}
      ${descargarHTML}
      ${comprarHTML}
    `;

    contenedor.appendChild(card);
  });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarPublicacionesIniciales);
