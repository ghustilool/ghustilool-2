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
      const info = data[steamID];

      if (info?.success && info.data) {
        const steamData = info.data;
        if (!nombre) nombre = steamData.name;
        if (!descripcion) descripcion = steamData.short_description;
        if (!imagen) imagen = steamData.header_image;
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

    const imagenHTML = juego.imagen
      ? `<img src="${juego.imagen}" alt="${juego.nombre}">`
      : `<div style="width:100%;height:120px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:4px;">Sin imagen</div>`;

    const descripcionHTML = juego.descripcion
      ? `<p>${juego.descripcion}</p>`
      : '';

    const comprarHTML = juego.comprar
      ? `<br><a href="${juego.comprar}" target="_blank">Comprar en Steam</a>`
      : '';

    card.innerHTML = `
      ${imagenHTML}
      <h3>${juego.nombre}</h3>
      ${descripcionHTML}
      <a href="${juego.descargar}" target="_blank">Descargar</a>
      ${comprarHTML}
    `;

    contenedor.appendChild(card);
  });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarPublicacionesIniciales);
