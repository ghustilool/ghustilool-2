(function(){
  var INTERSTITIAL = window.AD_INTERSTITIAL_URL || "/ads/interstitial.html";
  function b(s){ try{return btoa(unescape(encodeURIComponent(s)))}catch(e){return ""} }
  function mk(f,t){ var u=encodeURIComponent(b(f||"")); var tt=encodeURIComponent(t||document.title||"Descarga"); return INTERSTITIAL+"?u="+u+"&t="+tt; }
  function modal(){ return document.getElementById("modal-juego"); }
  function title(m){ var el=m&&m.querySelector(".modal-title,.title,h1,h2"); var t=el?(el.textContent||"").trim():""; return t||document.title||"Descarga"; }
  function final(el){ return el.getAttribute("data-download-url")||el.getAttribute("data-href")||el.getAttribute("href")||el.getAttribute("data-link")||""; }
  function seems(el){
    if(!el) return false;
    if(el.matches(".btn-download,.btn-descargar,[data-download-url]")) return true;
    var txt=(el.textContent||"").toLowerCase();
    return txt.includes("descarg") || txt.includes("download");
  }
  document.addEventListener("click", function(e){
    var m = modal();
    if(!m || !m.contains(e.target)) return;
    var el = e.target.closest("a,button");
    if(!el || !seems(el)) return;
    var f = final(el);
    if(!f) return;
    e.preventDefault();
    var url = mk(f, title(m));
    var w = window.open(url, "_blank");
    if (w) { try { w.opener = null; } catch(_){} }
  }, true);
})();