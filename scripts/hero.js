
// Slides definition (local assets)
const slides = [
  { id:"discord",   title:"Únete a la comunidad de Discord", desc:"Dejá tu reseña y pedí juegos. Enterate de novedades y charlá con la banda.", cta:"Entrar al Discord", url:"https://discord.com/invite/c7NpNyD5q4", img:"assets/social/discord.png" },
  { id:"youtube",   title:"Suscribite al canal de YouTube",   desc:"Gameplays, pruebas y contenido para la comunidad. ¡Sumate!", cta:"Ir a YouTube", url:"https://www.youtube.com/@6aZ71_", img:"assets/social/youtube.webp" },
  { id:"kick",      title:"Seguime en Kick",                  desc:"Streams chill, charlas y juegos con la comunidad.", cta:"Ir a Kick", url:"https://kick.com/gaz71", img:"assets/social/kick.png" },
  { id:"instagram", title:"Seguime en Instagram",             desc:"Clips, historias y adelantos de lo que se viene.", cta:"Abrir Instagram", url:"https://www.instagram.com/6az71_", img:"assets/social/instagram.png" },
  { id:"tiktok",    title:"Seguime en TikTok",                desc:"Clips cortitos, fails y momentazos.", cta:"Abrir TikTok", url:"https://www.tiktok.com/@6az71", img:"assets/social/tiktok.png" },
  { id:"x",         title:"Seguime en X (Twitter)",           desc:"Noticias rápidas, anuncios y memes frescos.", cta:"Abrir X", url:"https://x.com/GhustiLoOL", img:"assets/social/x.png" },
  { id:"steam",     title:"Agregame en Steam",                desc:"Sumate y compartamos partidas. ¡Agregame para jugar juntos!", cta:"Abrir Steam", url:"https://steamcommunity.com/id/GAZ71", img:"assets/social/steam.png" }
];

(function(){
  const track = document.getElementById('hero-track');
  const dots  = document.getElementById('hero-dots');
  if(!track || !dots) return;

  // Build slides
  track.innerHTML = slides.map(s => `
    <article class="hero-slide">
      <div class="hero-copy">
        <h2 class="hero-title">${s.title}</h2>
        <p class="hero-desc">${s.desc}</p>
        <a class="hero-cta" href="${s.url}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9Zm9-7.5A7.5 7.5 0 1 0 19.5 12 7.51 7.51 0 0 0 12 4.5Zm-.75 3h1.5v4.19l3.56 2.13-.75 1.23-4.31-2.56Z"/></svg>
          ${s.cta}
        </a>
      </div>
      <div class="hero-media"><img class="hero-img" alt="${s.id}" src="${s.img}"/></div>
    </article>
  `).join("");

  let current = 0;
  const slidesEls = Array.from(track.querySelectorAll('.hero-slide'));

  // Build dots
  dots.innerHTML = slidesEls.map((_,i)=>`<div class="hero-dot${i===0?' active':''}"></div>`).join("");
  function setActive(i){ 
    slidesEls.forEach((el,idx)=> el.classList.toggle('active', idx===i)); 
    dots.querySelectorAll('.hero-dot').forEach((d,idx)=> d.classList.toggle('active', idx===i));
  }
  setActive(0);

  // dots click
  dots.querySelectorAll('.hero-dot').forEach((d,i)=> d.addEventListener('click', ()=>{ current=i; setActive(current); }));

  // auto rotate
  let timer = setInterval(()=>{ current = (current+1)%slidesEls.length; setActive(current); }, 5000);
  document.getElementById('hero')?.addEventListener('mouseenter', ()=> clearInterval(timer));
  document.getElementById('hero')?.addEventListener('mouseleave', ()=> timer = setInterval(()=>{ current = (current+1)%slidesEls.length; setActive(current); }, 5000));
})();
