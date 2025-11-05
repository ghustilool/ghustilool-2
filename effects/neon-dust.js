/*! Neon Dust Add-on
 *  Subtle glowing particles drifting slowly (inspired in look & feel).
 *  Layers for parallax, gentle twinkle, minimal CPU.
 *
 *  Config (set window.NEON_DUST before this script):
 *    {
 *      enabled: true,
 *      palette: ["#00ffa3","#00ffc8","#00e6b3","#00ffd0"],
 *      density: 0.000035,   // particles per pixel (total across layers)
 *      sizeMin: 1.0,        // logical px (scaled with DPR)
 *      sizeMax: 2.6,
 *      speedY: [4, 12],     // px/sec across layers (slow drift)
 *      speedX: [-3, 3],     // slight sideways wander
 *      twinkle: 0.25,       // 0..1 intensity of alpha breathing
 *      blur: 6.0,           // shadow blur for glow
 *      layers: 3            // parallax layers
 *    }
 */
(function(){
  const DEF = {
    enabled: true,
    palette: ["#00ffa3","#00ffc8","#00e6b3","#00ffd0"],
    density: 0.000035,
    sizeMin: 1.0,
    sizeMax: 2.6,
    speedY: [4, 12],
    speedX: [-3, 3],
    twinkle: 0.25,
    blur: 6.0,
    layers: 3
  };
  const cfg = Object.assign({}, DEF, (window.NEON_DUST||{}));
  if (!cfg.enabled) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let canvas, ctx, w=0, h=0, DPR=1, raf=null, last=0;
  let parts=[];

  function initCanvas(){
    canvas = document.getElementById("neon-dust-canvas");
    if (!canvas){
      canvas = document.createElement("canvas");
      canvas.id = "neon-dust-canvas";
      document.body.prepend(canvas);
    }
    ctx = canvas.getContext("2d");
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    onResize();
    spawn();
    loopStart();
  }

  function onResize(){
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight||0);
    w = Math.floor(vw * DPR); h = Math.floor(vh * DPR);
    canvas.width = w; canvas.height = h;
    canvas.style.width = vw + "px"; canvas.style.height = vh + "px";
  }

  function pick(a){ return a[(Math.random()*a.length)|0]; }
  function rand(a,b){ return Math.random()*(b-a)+a; }

  function spawn(){
    parts.length = 0;
    const total = Math.floor(w*h*cfg.density);
    const perLayer = Math.max(1, Math.floor(total / (cfg.layers||3)));
    const blur = cfg.blur * DPR;
    for (let L=0; L<(cfg.layers||3); L++){
      for (let i=0;i<perLayer;i++){
        const size = DPR * rand(cfg.sizeMin, cfg.sizeMax) * (1 + L*0.15);
        const x = Math.random()*w, y = Math.random()*h;
        const vy = DPR * rand(cfg.speedY[0], cfg.speedY[1]) * (1 + L*0.35);
        const vx = DPR * rand(cfg.speedX[0], cfg.speedX[1]) * (L===0 ? 0.3 : 1);
        const phase = Math.random()*Math.PI*2;
        const color = pick(cfg.palette);
        parts.push({x,y,vx,vy,size,phase,color,blur});
      }
    }
  }

  function step(dt){
    ctx.clearRect(0,0,w,h);
    ctx.save();
    for (let i=0;i<parts.length;i++){
      const p = parts[i];
      p.x += p.vx*dt; p.y += p.vy*dt;
      if (p.x < -10) p.x = w+10; else if (p.x > w+10) p.x = -10;
      if (p.y > h+10) p.y = -10;
      // twinkle: low-frequency alpha breathe
      p.phase += dt * (0.5 + Math.random()*0.2);
      const a = 0.4 + Math.sin(p.phase)*0.5*cfg.twinkle; // 0.4..~0.65
      ctx.shadowBlur = p.blur;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function loop(ts){
    if (!last) last = ts;
    const dt = Math.min(0.05, (ts-last)/1000);
    last = ts;
    step(dt);
    raf = requestAnimationFrame(loop);
  }
  function loopStart(){ if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
  function loopStop(){ if (raf){ cancelAnimationFrame(raf); raf=null; } }

  window.NEON_DUST_API = {
    start(){ loopStart(); },
    stop(){ loopStop(); },
    destroy(){
      loopStop();
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      parts.length = 0; canvas = null; ctx = null;
    }
  };

  document.addEventListener("visibilitychange", ()=>{
    if (document.hidden) loopStop(); else loopStart();
  });
  window.addEventListener("resize", ()=>{
    const running = !!raf;
    loopStop();
    onResize();
    spawn();
    if (running) loopStart();
  });

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initCanvas);
  } else { initCanvas(); }
})();
