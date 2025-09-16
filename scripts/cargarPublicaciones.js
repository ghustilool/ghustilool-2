const autores = ['ghustilool', 'lissuwu']; // Podés agregar más sin tocar el HTML

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
    a.nombre.localeCompare(b.nombre)
  );

  ordenadas.forEach(juego => {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-tags', juego.tags.join(','));

    card.innerHTML = `
      <img src="${juego.imagen}" alt="${juego.nombre}">
      <h3>${juego.nombre}</h3>
      <p>${juego.descripcion}</p>
      <a href="${juego.instalador}">Instalar</a>
    `;

    contenedor.appendChild(card);
  });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarPublicacionesIniciales);
