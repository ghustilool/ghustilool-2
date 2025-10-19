
// v88 — Fix de carrusel "Añadido recientemente": flechas funcionales + recorte a 3 items
(function(){
  function q(root, sel){ return (root || document).querySelector(sel); }
  function qa(root, sel){ return Array.from((root || document).querySelectorAll(sel)); }

  function initCarouselFix(){
    const viewport = q(document, '.car-viewport, [data-carousel="viewport"], .recent .viewport');
    const track    = q(document, '.car-track, [data-carousel="track"], .recent .track');
    const dotsWrap = q(document, '.car-dots, [data-carousel="dots"], .recent .dots');
    const prevBtn  = q(document, '.car-prev, [data-carousel="prev"], .recent .prev');
    const nextBtn  = q(document, '.car-next, [data-carousel="next"], .recent .next');

    if(!viewport || !track) return;

    let slides = qa(track, '.car-slide, .slide, li, .item');
    if(!slides.length) return;

    // 1) Recortamos a 3 slides (o 2 si querés cambiar QUICK)
    const MAX = 3;
    if(slides.length > MAX){
      slides.slice(MAX).forEach(el => el.remove());
      slides = qa(track, '.car-slide, .slide, li, .item');
    }
    // 2) Recortamos dots a slides.length
    if(dotsWrap){
      const dots = qa(dotsWrap, 'button, .dot, li');
      if(dots.length > slides.length){
        dots.slice(slides.length).forEach(d => d.remove());
      }
    }

    let index = 0;
    let w = viewport.clientWidth;

    function size(){
      w = viewport.clientWidth;
      go(index, false);
    }

    function go(i, smooth=true){
      index = Math.max(0, Math.min(i, slides.length - 1));
      track.style.transition = smooth ? 'transform .35s ease' : 'none';
      track.style.transform = `translateX(${-index * w}px)`;
      // Activar dot si existe
      if(dotsWrap){
        qa(dotsWrap, 'button, .dot, li').forEach((d, k)=>{
          d.classList.toggle('active', k === index);
          d.setAttribute('aria-current', k === index ? 'true' : 'false');
        });
      }
    }

    // Flechas
    function onPrev(ev){ ev && ev.preventDefault(); go(index - 1); }
    function onNext(ev){ ev && ev.preventDefault(); go(index + 1); }
    prevBtn && (prevBtn.onclick = onPrev);
    nextBtn && (nextBtn.onclick = onNext);

    // Click en dots
    if(dotsWrap){
      dotsWrap.addEventListener('click', (ev)=>{
        const dots = qa(dotsWrap, 'button, .dot, li');
        const idx = dots.indexOf(ev.target.closest('button, .dot, li'));
        if(idx >= 0){ ev.preventDefault(); go(idx); }
      });
    }

    // Ajuste on resize
    window.addEventListener('resize', size);

    // Primer pintado
    size();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initCarouselFix);
  } else {
    initCarouselFix();
  }
})();
