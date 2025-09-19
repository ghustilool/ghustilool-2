// Emoji rotativo a la izquierda y derecha del título
document.addEventListener('DOMContentLoaded', () => {
  const left = document.getElementById('emoji-left');
  const right = document.getElementById('emoji-right');
  if (!left || !right) return;

  const emojis = ['☠️', '🧉', '🇦🇷'];
  let i = 0;

  const tick = () => {
    const e = emojis[i % emojis.length];
    left.textContent = e;
    right.textContent = e;
    i++;
  };

  tick();
  setInterval(tick, 1000);
});
