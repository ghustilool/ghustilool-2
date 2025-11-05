
(function(){
  const slides = [
    { id:"discord", title:"Únete a la comunidad de Discord", desc:"Dejá tu reseña y pedí juegos. Enterate de novedades y charlá con la banda.", cta:"Entrar al Discord", url:"https://discord.com/invite/c7NpNyD5q4", img:"https://raw.githubusercontent.com/edent/SuperTinyIcons/master/images/svg/discord.svg" },
    { id:"youtube", title:"Suscribite al canal de YouTube", desc:"Gameplays, pruebas y contenido para la comunidad. ¡Sumate!", cta:"Ir a YouTube", url:"https://www.youtube.com/@6aZ71_", img:"https://raw.githubusercontent.com/edent/SuperTinyIcons/master/images/svg/youtube.svg" },
    { id:"kick", title:"Seguime en Kick", desc:"Streams chill, charlas y juegos con la comunidad.", cta:"Ir a Kick", url:"https://kick.com/gaz71", img:"https://raw.githubusercontent.com/edent/SuperTinyIcons/master/images/svg/kick.svg" },
    { id:"instagram", title:"Seguime en Instagram", desc:"Clips, historias y adelantos de lo que se viene.", cta:"Abrir Instagram", url:"https://www.instagram.com/6az71_", img:"https://raw.githubusercontent.com/edent/SuperTinyIcons/master/images/svg/instagram.svg" },
    { id:"tiktok", title:"Seguime en TikTok", desc:"Clips cortitos, fails y momentazos.", cta:"Abrir TikTok", url:"https://www.tiktok.com/@6az71", img:"https://raw.githubusercontent.com/edent/SuperTinyIcons/master/images/svg/tiktok.svg" },
    { id:"x", title:"Seguime en X (Twitter)", desc:"Noticias rápidas, anuncios y memes frescos.", cta:"Abrir X", url:"https://x.com/GhustiLoOL", img:"https://raw.githubusercontent.com/edent/SuperTinyIcons/master/images/svg/twitter.svg" }
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
