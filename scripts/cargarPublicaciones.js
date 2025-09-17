import { abrirModal, verificarFragmentoURL } from './modal.js';

const autores = ['ghustilool']; // Agregá más si tenés más JSON
export const todasLasPublicaciones = [];

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
          verificarFragmentoURL(); // ✅ Abrir modal si hay #id en la URL
        }
      })
      .catch(err => {
        console.error(`Error al cargar ${autor}.json:`, err);
        cargados++;
        if (cargados === autores.length) {
          mostrarPublicacionesOrdenadas();
          verificarFragmentoURL();
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
    const etiquetaPrincipal = juego.tags?.[0]?.toLowerCase().trim() || 'default';

    const card = document.createElement('div');
    card.className = `card card-${etiquetaPrincipal}`;

    const tagsNormalizados = juego.tags?.map(t => t.toLowerCase().trim()).join(',') || '';
    card.setAttribute('data-tags', tagsNormalizados);
    card.setAttribute('data-id', juego.id || '');

    const imagenHTML = juego.imagen
      ? `<img src="${juego.imagen}" alt="${juego.nombre}">`
      : `<div style="width:100%;height:120px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:4px;">Sin imagen</div>`;

    const nombreHTML = juego.nombre
      ? `<h3>${juego.nombre}</h3>`
      : `<h3>Sin nombre</h3>`;

    const etiquetaHTML = `<div class="card-etiqueta">${etiquetaPrincipal.toUpperCase()}</div>`;

    card.innerHTML = `
      ${imagenHTML}
      ${nombreHTML}
      ${etiquetaHTML}
    `;

    card.onclick = () => abrirModal(juego);
    contenedor.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarPublicacionesIniciales();
});
