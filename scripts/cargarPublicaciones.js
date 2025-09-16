async function cargarPublicaciones(autor) {
  const res = await fetch(`data/${autor}.json`);
  const data = await res.json();

  const contenedor = document.getElementById('publicaciones');
  contenedor.innerHTML = '';

  data.publicaciones.forEach(pub => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
      <img src="${pub.imagen}" alt="${pub.titulo}">
      <h3>${pub.titulo}</h3>
      <p>${pub.descripcion}</p>
      <a href="${pub.link}" target="_blank">Descargar</a>
    `;
    contenedor.appendChild(div);
  });
}
