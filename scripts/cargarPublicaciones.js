// scripts/cargarPublicaciones.js
import { abrirModal, verificarFragmentoURL } from './modal.js';

const autores = ['ghustilool']; // agrega otros si tenés más JSONs
export const todasLasPublicaciones = [];

/* ------------ helpers ------------ */
function normalizarEtiqueta(tags) {
  const raw = (tags?.[0] || '').toString().toLowerCase().trim();
  const compact = raw.replace(/\s+/g, '');
  if (/(\+?18|adult|adulto|18\+|mayores)/.test(compact)) return 'adult';
  if (compact.includes('lan')) return 'lan';
  if (compact.includes('online')) return 'online';
  if (compact.includes('offline') || raw.includes('sin internet')) return 'offline';
  return 'default';
}

/**
 * Reduce la fuente de h3.card-title hasta que quepa en 3 líneas.
 * No usa "..." y funciona con el alto fijo de la card.
 */
function fitTitles() {
  const TITLES = document.querySelectorAll('.card-title');
  TITLES.forEach((el) => {
    // reset por si venimos de otra corrida (ej: resize)
    el.style.fontSize = '';
    el.style.lineHeight = '';

    const styles = getComputedStyle(el);
    let fontSize = parseFloat(styles.fontSize) || 16;
    let lineHeight = parseFloat(styles.lineHeight) || fontSize * 1.15;

    const MAX_LINES = 3;
    const MAX_HEIGHT = lineHeight * MAX_LINES;

    // Si ya entra, listo
    if (el.scrollHeight <= MAX_HEIGHT) return;

    // Intento de ajuste: bajo fuente hasta 12px como mínimo
    while (el.scrollHeight > MAX_HEIGHT && fontSize > 12) {
      fontSize -= 1;
      lineHeight = Math.max(14, Math.round(fontSize * 1.15));
      el.style.fontSize = fontSize + 'px';
      el.style.lineHeight = lineHeight + 'px';
    }
  });
}

/* ------------ carga inicial ------------ */
function cargarPublicacionesIniciales() {
  const contenedor = document.getElementById('publicaciones-todas');
  contenedor.innerHTML = '';

  let cargados = 0;

  autores.forEach((autor) => {
    fetch(`autores/${autor}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`No se pudo cargar ${autor}.json`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          todasLasPublicaciones.push(...data);
        } else {
          console.warn(`El JSON de ${autor} no es un array`, data);
        }
        cargados++;
        if (cargados === autores.length) {
          mostrarPublicacionesOrdenadas();
          verificarFragmentoURL(); // abre modal si hay #id
        }
      })
      .catch((err) => {
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
    contenedor.innerHTML =
      '<p style="color:#ff0033;text-align:center;">No se encontraron publicaciones.</p>';
    return;
  }

  const ordenadas = [...todasLasPublicaciones].sort((a, b) =>
    (a.nombre || '').localeCompare(b.nombre || '')
  );

  ordenadas.forEach((juego) => {
    const etiqueta = normalizarEtiqueta(juego.tags);

    const card = document.createElement('div');
    card.className = `card card-${etiqueta}`;
    card.setAttribute(
      'data-tags',
      (juego.tags || []).map((t) => t.toString().toLowerCase().trim()).join(',') || ''
    );
    card.setAttribute('data-id', juego.id || '');

    const imagenHTML = juego.imagen
      ? `<img src="${juego.imagen}" alt="${juego.nombre || 'Juego'}">`
      : `<div style="width:100%;height:120px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:4px;">Sin imagen</div>`;

    const nombreHTML = `<h3 class="card-title">${juego.nombre || 'Sin nombre'}</h3>`;
    const etiquetaHTML = `<div class="card-etiqueta">${etiqueta.toUpperCase()}</div>`;

    card.innerHTML = `
      ${imagenHTML}
      ${nombreHTML}
      ${etiquetaHTML}
    `;

    // Abrir modal desde la card (para animar desde el origen)
    card.onclick = () => abrirModal(juego, card);

    contenedor.appendChild(card);
  });

  // Ajuste de títulos largos (después de pintar)
  fitTitles();
}

/* ------------ init ------------ */
document.addEventListener('DOMContentLoaded', () => {
  cargarPublicacionesIniciales();

  // Recalcular títulos si cambia el ancho (responsive)
  window.addEventListener('resize', () => {
    // debounce simple
    clearTimeout(window.__fitTitlesTO);
    window.__fitTitlesTO = setTimeout(fitTitles, 100);
  });
});
