// Bonzi aparece al hacer click en la "T", se oculta solo
(() => {
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
})();
