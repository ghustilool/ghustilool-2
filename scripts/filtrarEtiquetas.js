function filtrarPorEtiqueta(etiqueta) {
  const botones = document.querySelectorAll('.tag-button');
  botones.forEach(btn => btn.classList.remove('active'));

  if (etiqueta === null) {
    document.querySelector('.tag-button-all').classList.add('active');
  } else {
    document.querySelector(`.tag-button-${etiqueta.toLowerCase()}`).classList.add('active');
  }

  const tarjetas = document.querySelectorAll('.card');
  tarjetas.forEach(card => {
    const etiquetas = card.getAttribute('data-tags');
    if (!etiqueta || (etiquetas && etiquetas.includes(etiqueta))) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}
