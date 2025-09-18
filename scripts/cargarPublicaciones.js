// scripts/cargarPublicaciones.js
import { abrirModal, verificarFragmentoURL } from './modal.js?v=27';

const autores = ['ghustilool'];
export const todasLasPublicaciones = [];

const EMOTES = { offline:'🎮', lan:'🔌', online:'🌐', adult:'🔞', default:'🏠' };

function normalizarEtiqueta(tags) {
  const raw = (tags?.[0] || '').toString().toLowerCase().trim();
  const compact = raw.replace(/\s+/g, '');
  if (/(\+?18|adult|adulto|18\+|mayores)/.test(compact)) return 'adult';
  if (compact.includes('lan')) return 'lan';
  if (compact.includes('online')) return 'online';
  if (compact.includes('offline') || raw.includes('sin internet')) return 'offline';
  return 'default';
}

function pintarEstado(msg, color = '#aeb3c0') {
  const cont = document.getElementById('publicaciones-todas');
  if (cont) cont.innerHTML = `<p style="color:${color};text-align:center;padding:20px">${msg}</p>`;
}

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

function cargarPublicacionesIniciales() {
  const contenedor = document.getElementById('publicaciones-todas');
  if (!contenedor) return;
  pintarEstado('Cargando…', '#888');

  let pendientes = autores.length;

  autores.forEach((autor) => {
    const url = new URL(`../autores/${autor}.json`, import.meta.url);
    fetch(url, { headers: { Accept: 'application/json' } })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => { if (Array.isArray(data)) todasLasPublicaciones.push(...data); })
      .catch((err) => { console.error(`[Publicaciones] Error cargando ${autor}.json →`, err); })
      .finally(() => {
        if (--pendientes === 0) {
          if (!todasLasPublicaciones.length) {
            pintarEstado('No se encontraron publicaciones. Revisa la consola.', '#ff3366');
            return;
          }
          window.__PUBLICACIONES__ = todasLasPublicaciones;
          mostrarPublicacionesOrdenadas();
          verificarFragmentoURL();
        }
      });
  });
}

function mostrarPublicacionesOrdenadas() {
  const contenedor = document.getElementById('publicaciones-todas');
  if (!contenedor) return;
  contenedor.innerHTML = '';

  const ordenadas = [...todasLasPublicaciones].sort((a, b) =>
    (a.nombre || '').localeCompare(b.nombre || '')
  );

  ordenadas.forEach((juego) => {
    const etiqueta = normalizarEtiqueta(juego.tags);
    const emote = EMOTES[etiqueta] || EMOTES.default;
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
    const badgeHTML  = `<div class="card-etiqueta tag-pill tag-${etiqueta}">${emote} ${etiqueta.toUpperCase()}</div>`;
    const footerHTML = `<div class="card-footer">${metaHTML}${badgeHTML}</div>`;

    const overlay = id ? `<a class="card-link" href="#${id}" aria-label="Abrir ${juego.nombre || 'publicación'}"></a>` : '';

    card.innerHTML = overlay + imagenHTML + nombreHTML + footerHTML;

    if (!id) {
      card.onclick = () => abrirModal(juego, card);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter') abrirModal(juego, card); });
    }

    contenedor.appendChild(card);
  });

  fitTitles();
}

document.addEventListener('DOMContentLoaded', () => {
  try { cargarPublicacionesIniciales(); }
  catch (e) { console.error('[Publicaciones] Error inesperado:', e); pintarEstado('Error inicializando publicaciones.', '#ff3366'); }

  window.addEventListener('hashchange', verificarFragmentoURL);

  let to;
  window.addEventListener('resize', () => { clearTimeout(to); to = setTimeout(fitTitles, 120); });
});
