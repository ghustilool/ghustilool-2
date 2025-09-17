import { abrirModal, verificarFragmentoURL } from './modal.js';

const autores = ['ghustilool']; // Agregá más si tenés más JSON
export const todasLasPublicaciones = [];

// Normaliza la etiqueta igual que el modal (evita "card-+18", "on line", etc.)
function normalizarEtiqueta(tags) {
  const raw = (tags?.[0] || '').toString().toLowerCase().trim();
  const compact = raw.replace(/\s+/g, '');
  if (/(\+?18|adult|adulto|18\+|mayores)/.test(compact)) return 'adult';
  if (compact.includes('lan')) return 'lan';
  if (compact.includes('online')) return 'online';
  if (compact.includes('offline') || raw.includes('sin internet')) return 'offline';
  return 'default';
}

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
        // El JSON es un array: agregamos todos los juegos
        if (Array.isArray(data)) {
          todasLasPublicaciones.push(...data);
        } else {
          console.warn(`El JSON de ${autor} no es un array`, data);
        }
        cargados++;
        if (cargados === autores.length) {
          mostrarPublicacionesOrdenadas();
          verificarFragmentoURL(); // abre modal si hay #id en la URL
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
    const etiqueta = normalizarEtiqueta(juego.tags);

    const card = document.createElement('div');
    card.className = `card card-${etiqueta}`;

    // Para el filtro por etiqueta
    const tagsNormalizados = (juego.tags || [])
      .map(t => t.toString().toLowerCase().trim())
      .join(',') || '';
    card.setAttribute('data-tags', tagsNormalizados);
    card.setAttribute('data-id', juego.id || '');

    const imagenHTML = juego.imagen
      ? `<img src="${juego.imagen}" alt="${juego.nombre || 'Juego'}">`
      : `<div style="width:100%;height:120px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:4px;">Sin imagen</div>`;

    const nombreHTML = `<h3>${juego.nombre || 'Sin nombre'}</h3>`;
    const etiquetaHTML = `<div class="card-etiqueta">${etiqueta.toUpperCase()}</div>`;

    card.innerHTML = `
      ${imagenHTML}
      ${nombreHTML}
      ${etiquetaHTML}
    `;

    // Pasamos la card para que el modal anime desde el origen
    card.onclick = () => abrirModal(juego, card);

    contenedor.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarPublicacionesIniciales();
});
