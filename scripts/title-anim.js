document.addEventListener('DOMContentLoaded', () => {
  const left  = document.getElementById('emoji-left');
  const right = document.getElementById('emoji-right');
  if (!left || !right) return;

  const EMOJIS = ['☠️','🧉','⬇️','💾','🔑','🏴‍☠️','🎮','💻'];
  const ROTATE_MS = 2500;

  let i = 0;

  const shake = el => {
    el.classList.remove('emoji-shake');
    void el.offsetHeight;
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
