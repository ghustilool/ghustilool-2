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
        const promesas = data.map(juego => procesarJuego(juego));
        Promise.all(promesas).then(juegosFinales => {
          todasLasPublicaciones.push(...juegosFinales);
          cargados++;
          if (cargados === autores.length) {
            mostrarPublicacionesOrdenadas();
          }
        });
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

async function procesarJuego(juego) {
  const steamID = juego.steamID?.trim();
  const usarSteam = steamID && steamID !== '';

  let nombre = juego.nombre || '';
  let descripcion = juego.descripcion || '';
  let imagen = juego.imagen || '';
  let comprar = juego.comprar || '';

  if (usarSteam) {
    try {
      const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamID}&l=spanish`);
      const data = await res.json();
      const info = data[steamID]?.data;

      if (info) {
        if (!nombre) nombre = info.name;
        if (!descripcion) descripcion = info.short_description;
        if (!imagen) imagen = info.header_image;
        if (!comprar) comprar = `https://store.steampowered.com/app/${steamID}`;
      }
    } catch (err) {
      console.warn(`No se pudo obtener datos de Steam para el juego ${steamID}`, err);
    }
  }

  return {
    nombre: nombre || `Juego Steam #${steamID}`,
    descripcion: descripcion || '',
    imagen: imagen || '',
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
      <a href="${juego.descargar}" target="_blank">Descargar</a>
      ${juego.comprar ? `<br><a href="${juego.comprar}" target="_blank">Comprar en Steam</a>` : ''}
    `;

    contenedor.appendChild(card);
  });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarPublicacionesIniciales);
