
(function(){
  const slides = [
  { id:"discord", title:"Únete a la comunidad de Discord", desc:"Dejá tu reseña y pedí juegos. Enterate de novedades y charlá con la banda.", cta:"Entrar al Discord", url:"https://discord.com/invite/c7NpNyD5q4", svg:`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 5.5c-1.2-.5-2.6-.9-4.1-1.1l-.2.4c1.8.4 2.7 1.1 2.7 1.1-1.1-.5-2.1-.8-3.1-1-1-.2-2-.3-3-.3s-2 .1-3 .3c-1 .2-2 .5-3.1 1 0 0 .9-.7 2.7-1.1l-.2-.4C7.1 4.6 5.7 5 4.5 5.5 2.8 8 2.3 10.5 2.5 13c1.7 1.3 3.3 2 4.9 2.3l1.1-1.7c-.6-.2-1.1-.4-1.6-.7.1 0 .1 0 0 0 0 0 0 0 0 0 .1 0 .2.1.3.1 1.3.6 2.6.9 4 .9s2.7-.3 4-.9c.1 0 .2-.1.3-.1 0 0 0 0 0 0-.5.3-1 .5-1.6.7l1.1 1.7c1.6-.3 3.2-1 4.9-2.3.2-2.5-.3-5-1.9-7.5Z" fill="#5865F2"/><circle cx="9" cy="11" r="1.2" fill="#fff"/><circle cx="15" cy="11" r="1.2" fill="#fff"/></svg>` },
  { id:"youtube", title:"Suscribite al canal de YouTube", desc:"Gameplays, pruebas y contenido para la comunidad. ¡Sumate!", cta:"Ir a YouTube", url:"https://www.youtube.com/@6aZ71_", svg:`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect fill="#FF0000" rx="4" width="24" height="17" y="3"/><polygon points="10,8 16,12 10,16" fill="#fff"/></svg>` },
  { id:"kick", title:"Seguime en Kick", desc:"Streams chill, charlas y juegos con la comunidad.", cta:"Ir a Kick", url:"https://kick.com/gaz71", svg:`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="#111"/><path d="M5 5h6v6h2V5h6v14h-6v-6h-2v6H5V5z" fill="#53FC18"/></svg>` },
  { id:"instagram", title:"Seguime en Instagram", desc:"Clips, historias y adelantos de lo que se viene.", cta:"Abrir Instagram", url:"https://www.instagram.com/6az71_", svg:`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" x2="1" y1="1" y2="0"><stop offset="0" stop-color="#f58529"/><stop offset=".5" stop-color="#dd2a7b"/><stop offset="1" stop-color="#515bd4"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#g)"/><circle cx="12" cy="12" r="5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="#fff"/></svg>` },
  { id:"tiktok", title:"Seguime en TikTok", desc:"Clips cortitos, fails y momentazos.", cta:"Abrir TikTok", url:"https://www.tiktok.com/@6az71", svg:`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 3h3c.2 1.9 1.5 3.5 3 3.9v3c-1.4 0-2.8-.5-4-1.3v6.4c0 3-2.4 5.4-5.4 5.4S5.2 18 5.2 15c0-3 2.4-5.4 5.4-5.4.5 0 1 .1 1.4.2V13c-.4-.2-.9-.3-1.4-.3-1.4 0-2.6 1.2-2.6 2.6S9.2 18 10.6 18 13.2 16.8 13.2 15V3z" fill="#25F4EE"/><path d="M14 3h3c.2 1.9 1.5 3.5 3 3.9v3c-1.4 0-2.8-.5-4-1.3v6.4c0 3-2.4 5.4-5.4 5.4-1.8 0-3.4-.9-4.4-2.3 1 .5 2.2.8 3.4.8 3 0 5.4-2.4 5.4-5.4V3z" fill="#FE2C55"/></svg>` },
  { id:"x", title:"Seguime en X (Twitter)", desc:"Noticias rápidas, anuncios y memes frescos.", cta:"Abrir X", url:"https://x.com/GhustiLoOL", svg:`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#000"/><path d="M6 6h3l3.5 4.6L16.5 6H19l-5 6.4L19 18h-3l-3.7-4.8L8 18H5l5.4-6.8L6 6z" fill="#fff"/></svg>` }
];

  const track = document.getElementById('hero-track');
  const dots = document.getElementById('hero-dots');
  const prev = document.getElementById('hero-prev');
  const next = document.getElementById('hero-next');
  if(!track || !dots) return;

  track.innerHTML = slides.map(s => `
    <article class="hero-slide">
      <div class="hero-copy">
        <h2 class="hero-title">${s.title}</h2>
        <p class="hero-desc">${s.desc}</p>
        <a class="hero-cta" href="${s.url}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9Zm9-7.5A7.5 7.5 0 1 0 19.5 12 7.51 7.51 0 0 0 12 4.5Zm-.75 3h1.5v4.19l3.56 2.13-.75 1.23-4.31-2.56Z"/></svg>
          ${s.cta}
        </a>
      </div>
      <div class="hero-media">
        <img class="hero-img" onerror="this.style.display=\'none\';" loading="lazy" alt="${s.id}" src="${s.img}"/>
      </div>
    </article>
  `).join("");

  dots.innerHTML = slides.map((_,i)=>`<div class="hero-dot${i===0?' active':''}"></div>`).join("");

  let page = 0;
  const pages = slides.length;

  function update(){
    const hero = document.getElementById('hero');
    const w = hero ? hero.getBoundingClientRect().width : track.getBoundingClientRect().width;
    track.style.transform = `translate3d(${-page*w}px,0,0)`;
    dots.querySelectorAll('.hero-dot').forEach((d,i)=> d.classList.toggle('active', i===page));
  }
  function go(n){ page = (n+pages)%pages; update(); }

  prev?.addEventListener('click', ()=> go(page-1));
  next?.addEventListener('click', ()=> go(page+1));
  dots.querySelectorAll('.hero-dot').forEach((d,i)=> d.addEventListener('click', ()=> go(i)));

  let timer = setInterval(()=> go(page+1), 5000);
  document.getElementById('hero')?.addEventListener('mouseenter', ()=>{ clearInterval(timer); });
  document.getElementById('hero')?.addEventListener('mouseleave', ()=>{ timer = setInterval(()=> go(page+1), 5000); });

  window.addEventListener('resize', update);
  update();
})();
