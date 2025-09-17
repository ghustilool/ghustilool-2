// scripts/cargarPublicaciones.js
import { abrirModal, verificarFragmentoURL } from './modal.js';

const autores = ['ghustilool'];
export const todasLasPublicaciones = [];

/* ---------- helpers ---------- */
function normalizarEtiqueta(tags) {
  const raw = (tags?.[0] || '').toString().toLowerCase().trim();
  const compact = raw.replace(/\s+/g, '');
  if (/(\+?18|adult|adulto|18\+|mayores)/.test(compact)) return 'adult';
  if (compact.includes('lan')) return 'lan';
  if (compact.includes('online')) return 'online';
  if (compact.includes('offline') || raw.includes('sin internet')) return 'offline';
  return 'default';
}

/* Ajusta títulos a 3 líneas si hiciera falta (backup) */
function fitTitles() {
  const TITLES = document.querySelectorAll('.card-title');
  TITLES.forEach((el) => {
    el.style.fontSize = ''; el.style.lineHeight = '';
    const cs = getComputedStyle(el);
    let fs = parseFloat(cs.fontSize) || 16;
    let lh = parseFloat(cs.lineHeight) || fs * 1.15;
    const MAX_LINES = 3;
    let maxH = lh * MAX_LINES;
    if (el.scrollHeight <= maxH) return;
    while (el.scrollHeight > maxH && fs > 12) {
      fs -= 1; lh = Math.max(14, Math.round(fs * 1.15));
      el.style.fontSize = fs + 'px';
      el.style.lineHeight = lh + 'px';
      maxH = lh * MAX_LINES;
    }
  });
}
window.fitTitles = fitTitles;

/* ---------- carga ---------- */
function cargarPublicacionesIniciales() {
  const contenedor = document.getElementById('publicaciones-todas');
  contenedor.innerHTML = '';
  let cargados = 0;

  autores.forEach((autor) => {
    fetch(`autores/${autor}.json`)
      .then((r) => { if (!r.ok) throw new Error(`No se pudo cargar ${autor}.json`); return r.json(); })
      .then((data) => {
        if (Array.isArray(data)) todasLasPublicaciones.push(...data);
        cargados++;
        if (cargados === autores.length) {
          window.__PUBLICACIONES__ = todasLasPublicaciones; // global para modal.js
          mostrarPublicacionesOrdenadas();
          verificarFragmentoURL(); // por si ya hay #id
        }
      })
      .catch((e) => {
        console.error(e);
        cargados++;
        if (cargados === autores.length) {
          window.__PUBLICACIONES__ = todasLasPublicaciones;
          mostrarPublicacionesOrdenadas();
          verificarFragmentoURL();
        }
      });
  });
}

function mostrarPublicacionesOrdenadas() {
  const contenedor = document.getElementById('publicaciones-todas');
  contenedor.innerHTML = '';

  if (!todasLasPublicaciones.length) {
    contenedor.innerHTML = '<p style="color:#ff0033;text-align:center;">No se encontraron publicaciones.</p>';
    return;
  }

  const ordenadas = [...todasLasPublicaciones].sort((a, b) =>
    (a.nombre || '').localeCompare(b.nombre || '')
  );

  ordenadas.forEach((juego) => {
    const etiqueta = normalizarEtiqueta(juego.tags);
    const id = juego.id || '';

    const card = document.createElement('div');
    card.className = `card card-${etiqueta}`;
    card.tabIndex = 0;

    const tagsNorm = (juego.tags || []).map(t => t.toString().toLowerCase().trim()).join(',') || '';
    card.setAttribute('data-tags', tagsNorm);
    card.setAttribute('data-id', id);

    const imagenHTML = juego.imagen
      ? `<img src="${juego.imagen}" alt="${juego.nombre || 'Juego'}" loading="lazy">`
      : `<div style="width:100%;height:120px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:4px;">Sin imagen</div>`;

    const nombreHTML = `<h3 class="card-title">${juego.nombre || 'Sin nombre'}</h3>`;
    const metaHTML   = juego.version ? `<div class="card-meta">v${juego.version}</div>` : '';
    const badgeHTML  = `<div class="card-etiqueta">${etiqueta.toUpperCase()}</div>`;
    const footerHTML = `<div class="card-footer">${metaHTML}${badgeHTML}</div>`;

    // 🔗 overlay: si hay id, el click cambia el hash y modal.js lo abre
    const overlay = id ? `<a class="card-link" href="#${id}" aria-label="Abrir ${juego.nombre || 'publicación'}"></a>` : '';

    card.innerHTML = overlay + imagenHTML + nombreHTML + footerHTML;

    // respaldo: si no hay id, abrimos directo
    if (!id) {
      card.onclick = () => abrirModal(juego, card);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter') abrirModal(juego, card); });
    }

    contenedor.appendChild(card);
  });

  fitTitles();
}

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarPublicacionesIniciales();

  // si cambian el hash manualmente o por el overlay, abrimos/cerramos
  window.addEventListener('hashchange', verificarFragmentoURL);

  let to;
  window.addEventListener('resize', () => { clearTimeout(to); to = setTimeout(fitTitles, 120); });
});
