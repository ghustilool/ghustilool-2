// Bonzi aparece arriba de la 't' al hacer clic y se esconde solo
document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.getElementById('bonziTrigger');
  if (!trigger) return;
  const bonzi = trigger.querySelector('.bonzi-pop');
  if (!bonzi) return;

  let timer = null;

  trigger.addEventListener('click', () => {
    bonzi.classList.add('on');
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => bonzi.classList.remove('on'), 1800); // ~1.8s
  });
});
