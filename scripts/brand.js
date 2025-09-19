// Activa degradado si hay soporte y maneja Bonzi en la "T"
document.addEventListener('DOMContentLoaded', () => {
  // 1) Soporte para background-clip:text
  const supportsGradient =
    CSS.supports('-webkit-background-clip:text') ||
    CSS.supports('background-clip:text');

  if (supportsGradient) {
    document.querySelectorAll('.brand-letter').forEach(el => {
      el.classList.add('brand-letter--gradient');
    });
  }

  // 2) Bonzi sobre la "T"
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
    }, 1800); // ~1.8s visible
  };

  trigger.addEventListener('click', showBonzi);
});
