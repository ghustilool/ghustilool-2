const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.getElementById('neon-background').appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Aplicamos blur al canvas
canvas.style.filter = 'blur(1px) brightness(0.9)';

const katakana = 'アカサタナハマヤラワガザダバパイキシチニヒミリギジヂビピウクスツヌフムユルグズヅブプエケセテネヘメレゲゼデベペオコソトノホモヨロゴゾドボポ';
const fontSize = 16;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(1);

function draw() {
  ctx.fillStyle = 'rgba(10, 10, 15, 0.15)'; // fondo más transparente
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `${fontSize}px monospace`;
  for (let i = 0; i < drops.length; i++) {
    const text = katakana.charAt(Math.floor(Math.random() * katakana.length));
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    ctx.fillStyle = getColor(i);
    ctx.globalAlpha = 0.6; // texto más suave
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;

    if (y > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

function getColor(i) {
  const palette = ['#ff00cc', '#00ffff', '#9933ff', '#66ccff'];
  return palette[i % palette.length];
}

setInterval(draw, 50);

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
