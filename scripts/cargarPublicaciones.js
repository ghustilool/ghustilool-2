function cargarPublicaciones(autor) {
  const contenedor = document.getElementById('publicaciones');
  contenedor.innerHTML = '';

  fetch(`autores/${autor}.json`)
    .then(res => res.json())
    .then(data => {
      data.forEach(juego => {
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
    })
    .catch(err => {
      contenedor.innerHTML = `<p style="color:#ff0033;">No se pudo cargar el autor "${autor}".</p>`;
      console.error(`Error al cargar ${autor}.json`, err);
    });
}
