function filtrarPorEtiqueta(etiqueta) {
  const botones = document.querySelectorAll('.tag-button');
  botones.forEach(btn => btn.classList.remove('active'));

  if (etiqueta === null) {
    document.querySelector('.tag-button-all').classList.add('active');
  } else {
    const selector = `.tag-button-${etiqueta.toLowerCase()}`;
    const botonActivo = document.querySelector(selector);
    if (botonActivo) botonActivo.classList.add('active');
  }

  const tarjetas = document.querySelectorAll('.card');
  tarjetas.forEach(card => {
    const rawTags = card.getAttribute('data-tags') || '';
    const tags = rawTags.split(',').map(t => t.trim().toLowerCase());

    if (etiqueta === null || tags.includes(etiqueta.toLowerCase())) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}
