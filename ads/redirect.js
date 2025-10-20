(function(){
  'use strict';
  // ---- helpers ----
  const $ = sel => document.querySelector(sel);
  function decodeTarget(){
    const qs = new URLSearchParams(location.search);
    let t = qs.get('target') || qs.get('url') || '';
    try{ t = decodeURIComponent(t); }catch(e){}
    return t;
  }
  function readableName(u){
    try{
      const url = new URL(u);
      const last = (url.pathname.split('/').filter(Boolean).pop() || url.hostname);
      return (last || 'enlace').replace(/[-_]+/g,' ').slice(0,64);
    }catch(e){ return 'enlace'; }
  }
  function runScriptsFromHTML(html, mount){
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    // Move nodes; ensure scripts execute
    tmp.childNodes.forEach(node => {
      if(node.tagName && node.tagName.toLowerCase()==='script'){
        const s = document.createElement('script');
        for(const a of node.attributes || []) s.setAttribute(a.name, a.value);
        if(node.src){ s.src=node.src; s.async=true; } else { s.textContent=node.textContent; }
        mount.appendChild(s);
      }else{
        mount.appendChild(node.cloneNode(true));
      }
    });
  }
  function fetchAndMount(id, file){
    const el = (typeof id==='string') ? document.getElementById(id) : id;
    if(!el) return;
    fetch('codes/'+file, {cache:'no-store'})
      .then(r=>r.text())
      .then(t=>{ runScriptsFromHTML(t, el); el.removeAttribute('aria-hidden'); })
      .catch(()=>{});
  }

  // ---- rails positioning (static, no scroll listeners) ----
  function placeRails(){
    const L = $('#rail-left'), R = $('#rail-right'), card = $('#gh-card');
    if(!L || !R || !card) return;
    const r = card.getBoundingClientRect();
    const GAP=12, W=160;
    L.style.left = (r.left - GAP - W) + 'px';
    R.style.left = (r.right + GAP) + 'px';
    L.style.top = '50%'; R.style.top = '50%';
    L.style.transform = 'translateY(-50%)'; R.style.transform='translateY(-50%)';
    L.style.display='block'; R.style.display='block';
  }

  // ---- countdown/redirect ----
  function startCountdown(target){
    const ring = $('#gh-circle'); const num = $('#gh-count-num'); const btn = $('#gh-go');
    const total = 20; let t = total;
    function tick(){
      if(num) num.textContent = String(t);
      if(ring) ring.style.setProperty('--p', String(((total - t)/total)*100));
      if(t<=0){
        if(btn){ btn.removeAttribute('aria-disabled'); btn.href = target; }
        try{ if(/^(https?:)?\/\//i.test(target)) location.href = target; }catch(e){}
        return;
      }
      t -= 1; setTimeout(tick, 1000);
    }
    if(btn){
      btn.addEventListener('click', function(ev){
        if(btn.getAttribute('aria-disabled')) ev.preventDefault();
      });
    }
    tick();
  }

  // ---- boot ----
  window.addEventListener('DOMContentLoaded', function(){
    // Style tweaks via CSS class
    document.documentElement.classList.add('ads-ready');

    // Set title
    const target = decodeTarget();
    $('#gh-title').textContent = readableName(target);

    // Mount ads
    document.getElementById('ad-top').insertAdjacentHTML('afterbegin','<div id="ph-top" class="placeholder-ad">TOP 728×90 (test placeholder)</div>');
    fetchAndMount('ad-top', 'banner-728x90.html');
    document.body.insertAdjacentHTML('beforeend','<div id="ph-rail-left" class="placeholder-ad">LEFT 160×600 (test)</div>');
    fetchAndMount('rail-left', 'rail-left-160x600.html');
    document.body.insertAdjacentHTML('beforeend','<div id="ph-rail-right" class="placeholder-ad">RIGHT 160×300 (test)</div>');
    fetchAndMount('rail-right', 'rail-right-160x300.html');
    document.getElementById('ad-native').insertAdjacentHTML('afterbegin','<div id="ph-native" class="placeholder-ad">NATIVE (test)</div>');
    fetchAndMount('ad-native', 'native.html');

    // Background extras (popunder/social bar)
    fetch('codes/popunder.html', {cache:'no-store'}).then(r=>r.text()).then(t=>{ const s=document.createElement('div'); runScriptsFromHTML(t, s); document.body.appendChild(s); });
    fetch('codes/socialbar.html', {cache:'no-store'}).then(r=>r.text()).then(t=>{ const s=document.createElement('div'); runScriptsFromHTML(t, s); document.body.appendChild(s); });

    // Place rails once (static)
    placeRails();

    // Start countdown if we have target
    if(target) startCountdown(target);
  }, {once:true});
})();
