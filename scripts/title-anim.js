// Emoji rotativo (más lento) + efecto de temblor al cambiar
document.addEventListener('DOMContentLoaded', () => {
  const left  = document.getElementById('emoji-left');
  const right = document.getElementById('emoji-right');
  if (!left || !right) return;

  // Emojis en la onda descarga/piratería/gaming (sin 🇦🇷)
  const EMOJIS = ['☠️','🧉','⬇️','💾','🔑','🏴‍☠️','🎮','💻'];
  const ROTATE_MS = 2500;  // <-- velocidad del cambio

  let i = 0;

  const shake = el => {
    el.classList.remove('emoji-shake'); // reinicia si estaba animando
    // Forzar reflow para reiniciar la animación
    // eslint-disable-next-line no-unused-expressions
    el.offsetHeight;
    el.classList.add('emoji-shake');
  };

  const tick = () => {
    const next = EMOJIS[i % EMOJIS.length];
    left.textContent  = next;
    right.textContent = next;
    shake(left);
    shake(right);
    i++;
  };

  tick();
  setInterval(tick, ROTATE_MS);
});
