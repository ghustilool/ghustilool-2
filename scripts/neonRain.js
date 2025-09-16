const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.getElementById('neon-background').appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const columns = Math.floor(canvas.width / 20);
const drops = Array(columns).fill(0);

const colors = [
  'rgba(0,255,255,0.8)',   // cian eléctrico
  'rgba(255,0,204,0.8)',   // magenta
  'rgba(0,153,255,0.8)',   // azul eléctrico
  'rgba(255,0,255,0.6)',   // violeta neón
];

function drawRain() {
  ctx.fillStyle = 'rgba(10,10,15,0.2)'; // fondo oscuro con transparencia
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = '16px monospace';

  for (let i = 0; i < drops.length; i++) {
    const char = String.fromCharCode(0x30A0 + Math.random() * 96); // caracteres estilo katakana
    const x = i * 20;
    const y = drops[i] * 20;

    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillText(char, x, y);

    if (y > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }

  requestAnimationFrame(drawRain);
}

drawRain();
