// Aplica degradado al bloque si hay soporte y maneja Bonzi en la "T"
document.addEventListener('DOMContentLoaded', () => {
  // 1) Degradado bandera solo si el navegador lo soporta
  const supportsGradient =
    CSS.supports('-webkit-background-clip:text') ||
    CSS.supports('background-clip:text');

  const word = document.getElementById('brandWord');
  if (supportsGradient && word) {
    word.classList.add('gradient');
  }

  // 2) Bonzi en la T (clic -> aparece ~1.8s)
  const trigger = document.getElementById('bonziTrigger');
  if (!trigger) return;
  const bonzi = trigger.querySelector('.brand-bonzi');
  if (!bonzi) return;

  let hideTimer = null;
  const showBonzi = () => {
    bonzi.classList.add('show');
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      bonzi.classList.remove('show');
    }, 1800);
  };

  trigger.addEventListener('click', showBonzi);
});
