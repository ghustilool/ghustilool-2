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
        data.forEach(juego => {
          const juegoFinal = procesarJuego(juego);
          todasLasPublicaciones.push(juegoFinal);
        });
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

function procesarJuego(juego) {
  const steamID = juego.steamID;
  const usarSteam = !!steamID;

  const nombre = juego.nombre || (usarSteam ? `Juego Steam #${steamID}` : 'Sin nombre');
  const imagen = juego.imagen || (usarSteam
    ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${steamID}/header.jpg`
    : '');
  const descripcion = juego.descripcion || (usarSteam ? 'Descripción automática desde Steam.' : '');
  const comprar = juego.comprar || (usarSteam ? `https://store.steampowered.com/app/${steamID}` : '');

  return {
    nombre,
    imagen,
    descripcion,
    comprar,
    descargar: juego.descargar,
    tags: juego.tags || []
  };
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
      <a href="${juego.descargar}">Descargar</a>
      ${juego.comprar ? `<br><a href="${juego.comprar}" target="_blank">Comprar en Steam</a>` : ''}
    `;

    contenedor.appendChild(card);
  });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarPublicacionesIniciales);
