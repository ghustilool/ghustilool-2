/*! Neon Rain Add-on
 *  Lightweight, self-contained canvas effect.
 *  Usage:
 *    <link rel="stylesheet" href="effects/neon-rain.css">
 *    <script src="effects/neon-rain.js" defer></script>
 *  Config (optional, declare before the script tag):
 *    window.NEON_RAIN = {
 *      enabled: true,
 *      palette: ["#00eaff", "#00ff80", "#ff00ff", "#ffd000"], // neon colors
 *      density: 0.00007,   // drops per pixel
 *      speedMin: 300,      // px/s
 *      speedMax: 1200,     // px/s
 *      lengthMin: 24,      // px
 *      lengthMax: 110,     // px
 *      lineWidth: 1.2,     // px (device-independent, scales via DPR)
 *      bloom: 0.45,        // extra glow pass strength (0..1)
 *      angleDeg: 12,       // slanted rain
 *      composite: "lighter"// 'lighter' makes neon glow via additive blending
 *    };
 */

(function(){
  const defaultCfg = {
    enabled: true,
    palette: ["#00eaff", "#00ff80", "#ff00ff", "#ffd000"],
    density: 0.00007,
    speedMin: 300,
    speedMax: 1200,
    lengthMin: 24,
    lengthMax: 110,
    lineWidth: 1.2,
    bloom: 0.45,
    angleDeg: 12,
    composite: "lighter"
  };

  const cfg = Object.assign({}, defaultCfg, (window.NEON_RAIN||{}));

  if (!cfg.enabled) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let canvas, ctx, rafId = null, drops = [], lastT = 0;
  let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // cap at 2 for perf
  let w = 0, h = 0, sinA = 0, cosA = 1;

  function initCanvas(){
    canvas = document.getElementById("neon-rain-canvas");
    if (!canvas){
      canvas = document.createElement("canvas");
      canvas.id = "neon-rain-canvas";
      document.body.prepend(canvas);
    }
    ctx = canvas.getContext("2d", { alpha: true });
    ctx.globalCompositeOperation = cfg.composite;

    onResize();
    createDrops();
    start();
  }

  function onResize(){
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    w = Math.floor(vw * DPR);
    h = Math.floor(vh * DPR);
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";
    const ang = (cfg.angleDeg||0) * Math.PI / 180;
    sinA = Math.sin(ang);
    cosA = Math.cos(ang);
  }

  function rand(min, max){ return Math.random() * (max - min) + min; }
  function pick(arr){ return arr[(Math.random() * arr.length) | 0]; }

  function createDrops(){
    const count = Math.floor((w * h) * (cfg.density || 0.00007));
    drops = new Array(count).fill(null).map(()=> spawnDrop(true));
  }

  function spawnDrop(atTop=false){
    const len = DPR * rand(cfg.lengthMin, cfg.lengthMax);
    const lw  = DPR * (cfg.lineWidth || 1.2);
    const spd = DPR * rand(cfg.speedMin, cfg.speedMax); // px/sec scaled by DPR
    const x0 = Math.random() * w;
    const y0 = atTop ? rand(-h*0.25, 0) : rand(-h, h*1.2);
    const col = pick(cfg.palette);

    return {
      x: x0, y: y0, len, lw, spd, col,
    };
  }

  function step(dt){
    ctx.clearRect(0, 0, w, h);
    // main pass
    ctx.globalCompositeOperation = cfg.composite;
    for (let i=0; i<drops.length; i++){
      const d = drops[i];
      d.x += d.spd * cosA * dt;
      d.y += d.spd * sinA * dt;

      const x2 = d.x - d.len * cosA;
      const y2 = d.y - d.len * sinA;

      // base stroke
      ctx.lineWidth = d.lw;
      ctx.strokeStyle = d.col;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // glow pass (radial blur impression via thicker transparent strokes)
      if (cfg.bloom > 0){
        const b1 = d.lw * 3;
        const b2 = d.lw * 6;
        ctx.globalAlpha = 0.17 * cfg.bloom;
        ctx.lineWidth = b1;
        ctx.stroke();
        ctx.globalAlpha = 0.07 * cfg.bloom;
        ctx.lineWidth = b2;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = d.lw;
      }

      if (d.x > w + d.len || d.y > h + d.len){
        drops[i] = spawnDrop(true);
      }
    }
  }

  function loop(ts){
    if (!lastT) lastT = ts;
    const dt = Math.min(0.05, (ts - lastT) / 1000); // clamp
    lastT = ts;
    step(dt);
    rafId = requestAnimationFrame(loop);
  }

  function start(){
    stop();
    lastT = 0;
    rafId = requestAnimationFrame(loop);
  }

  function stop(){
    if (rafId !== null){
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Public toggle API
  window.NEON_RAIN_API = {
    start: ()=>{ cfg.enabled = true; initIfNeeded(); },
    stop: ()=>{ cfg.enabled = false; stop(); },
    destroy: ()=>{
      stop();
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      canvas = null; ctx = null;
    }
  };

  function initIfNeeded(){
    if (!canvas) initCanvas();
  }

  // Pause when tab hidden
  document.addEventListener("visibilitychange", ()=>{
    if (document.hidden) stop();
    else if (cfg.enabled) start();
  });

  // Resize handling
  window.addEventListener("resize", ()=>{
    const wasRunning = !!rafId;
    stop();
    onResize();
    createDrops();
    if (cfg.enabled && wasRunning) start();
  });

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initIfNeeded);
  } else {
    initIfNeeded();
  }
})();
