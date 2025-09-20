// Modal: etiqueta centrada abajo con MISMO estilo que los botones principales,
// toast que baja desde arriba, y beep. Unicode escapado + ES6 básico.

var EMOTES = {
  offline: '\uD83C\uDFAE',  // ??
  lan:     '\uD83D\uDD0C',  // ??
  online:  '\uD83C\uDF10',  // ??
  adult:   '\uD83D\uDD1E',  // ??
  default: '\uD83C\uDFE0'   // ??
};
var ICON_DL   = '\uD83D\uDCE5'; // ??
var ICON_KEY  = '\uD83D\uDD11'; // ??
var ICON_CART = '\uD83D\uDED2'; // ??

function normalizarEtiqueta(tags){
  var raw=''; if (tags && tags.length) raw=String(tags[0]).toLowerCase().trim();
  var compact=raw.replace(/\s+/g,'');
  if (/(\+?18|adult|adulto|18\+|mayores)/.test(compact)) return 'adult';
  if (compact.indexOf('lan')!==-1) return 'lan';
  if (compact.indexOf('online')!==-1) return 'online';
  if (compact.indexOf('offline')!==-1 || raw.indexOf('sin internet')!==-1) return 'offline';
  return 'default';
}
function showModal(m){ m.style.display='flex'; m.classList.remove('fade-out'); m.classList.add('fade-in'); document.body.classList.add('modal-open'); }
function hideModal(m){
  m.classList.remove('fade-in'); m.classList.add('fade-out');
  var onEnd=function(){ m.style.display='none'; m.removeEventListener('transitionend',onEnd); document.body.classList.remove('modal-open'); };
  m.addEventListener('transitionend',onEnd);
}
function escAttr(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

function buscarPassword(j){
  if(!j) return '';
  // Soportar ambas claves: con ñ y sin ñ
  if (Object.prototype.hasOwnProperty.call(j,'contrase\u00F1a')) return j['contrase\u00F1a']||'';
  if (Object.prototype.hasOwnProperty.call(j,'contrasena'))    return j['contrasena']||'';
  try{
    for (var k in j){
      if(!Object.prototype.hasOwnProperty.call(j,k)) continue;
      var nk=k.toLowerCase();
      var nk2=(nk.normalize?nk.normalize('NFD').replace(/[\u0300-\u036f]/g,''):nk);
      if (nk.indexOf('contrase')!==-1 || nk2.indexOf('contrasena')!==-1) return j[k]||'';
    }
  }catch(e){}
  return '';
}

/* ===== Soniditos (WebAudio) ===== */
var _ctx = null;
function _ensureCtx(){
  if(!_ctx){
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC) _ctx = new AC();
  }
}
function beep(type){
  _ensureCtx(); if(!_ctx) return;
  var o = _ctx.createOscillator();
  var g = _ctx.createGain();
  o.type = 'sine';
  o.frequency.value = (type === 'ok') ? 880 : 300;  // ok agudo / error medio
  g.gain.setValueAtTime(0.0001, _ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.08, _ctx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, _ctx.currentTime + 0.15);
  o.connect(g); g.connect(_ctx.destination);
  o.start(); o.stop(_ctx.currentTime + 0.18);
}

/* Toast desde arriba del modal (centrado) */
function showToastTop(modalContent, msg, kind){
  var toast=modalContent.querySelector('.copy-toast');
  if(!toast){ toast=document.createElement('div'); toast.className='copy-toast'; modalContent.appendChild(toast); }
  toast.textContent=msg;
  toast.classList.remove('ok','err','show');
  toast.classList.add(kind==='err'?'err':'ok');
  void toast.offsetWidth;           // restart anim
  toast.classList.add('show');
  clearTimeout(showToastTop._t);
  showToastTop._t=setTimeout(function(){ toast.classList.remove('show'); },1600);
}

/* API */
export function abrirModal(juego, origenElemento){
  var modal=document.getElementById('modal-juego');
  var modalBody=document.getElementById('modal-body');
  var modalContent=modal?modal.querySelector('.modal-content'):null;
  if(!modal||!modalBody||!modalContent) return;

  var etiqueta=normalizarEtiqueta(juego && juego.tags ? juego.tags : []);
  var emote=EMOTES[etiqueta]||EMOTES.default;

  /* reset + clases por tipo */
  modalBody.className='modal-body';
  modalContent.className='modal-content';
  modalBody.classList.add('modal-'+etiqueta);
  modalContent.classList.add('modal-content-'+etiqueta);

  /* contenido scrolleable dentro de #modal-body */
  var imagenHTML=(juego && juego.imagen)
    ? '<img src="'+juego.imagen+'" alt="'+(juego.nombre?escAttr(juego.nombre):'Juego')+'">'
    : '<div style="width:100%;height:200px;background:#222;color:#888;display:flex;align-items:center;justify-content:center;border-radius:6px;">Sin imagen</div>';

  var nombreHTML   = '<h2 class="modal-title">'+(juego && juego.nombre?juego.nombre:'Sin nombre')+'</h2>';
  var versionHTML  = (juego && juego.version)?'<div class="modal-version">VERSI\u00D3N: '+juego.version+'</div>':'';
  var descripcionHTML = (juego && juego.descripcion)?'<p class="modal-description">'+juego.descripcion+'</p>':'';

  var enlaceDescarga=(juego && juego.descargar)?juego.descargar:'';
  var passProp=buscarPassword(juego);
  var enlaceCompra=(juego && juego.comprar)?juego.comprar:'';

  var pieces=[];
  if(enlaceDescarga){ pieces.push('<a class="btn btn--dl" href="'+enlaceDescarga+'" target="_blank" rel="noopener">'+ICON_DL+' DESCARGAR</a>'); }
  if(passProp){       pieces.push('<a class="btn btn--pass btn-copy" href="#" data-pass="'+escAttr(passProp)+'">'+ICON_KEY+' CONTRASE\u00D1A</a>'); }
  if(enlaceCompra){   pieces.push('<a class="btn btn--buy" href="'+enlaceCompra+'" target="_blank" rel="noopener)">'+ICON_CART+' COMPRAR</a>'); }
  var botonesHTML = pieces.length?'<div class="modal-body-buttons">'+pieces.join('')+'</div>':'';

  modalBody.innerHTML = imagenHTML + nombreHTML + versionHTML + descripcionHTML + botonesHTML;

  /* === Chapita ahora usa el MISMO estilo que los botones principales (.tag-button) === */
  var oldTag = modalContent.querySelector('.modal-tag');
  if (oldTag) oldTag.remove();
  var tagWrap = document.createElement('div');
  tagWrap.className = 'modal-tag';
  tagWrap.innerHTML =
    '<button class="tag-button tag-button-' + etiqueta + ' modal-tag-button" disabled>' +
      emote + ' ' + etiqueta.toUpperCase() +
    '</button>';
  modalContent.appendChild(tagWrap);

  /* Origen del zoom */
  modalContent.style.transformOrigin='50% 50%';
  if(origenElemento && origenElemento.getBoundingClientRect){
    var r=origenElemento.getBoundingClientRect();
    modalContent.style.transformOrigin=(r.left+r.width/2)+'px '+(r.top+r.height/2)+'px';
  }

  showModal(modal);
  if(juego && juego.id){ try{ history.replaceState(null,'','#'+juego.id); }catch(e){} }
}

function cerrarModal(){
  var modal=document.getElementById('modal-juego');
  if(!modal) return;
  hideModal(modal);
  try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){}
}

/* Abre por hash */
export function verificarFragmentoURL(){
  var id=location.hash.replace('#','');
  var lista=(window.__PUBLICACIONES__ && Array.isArray(window.__PUBLICACIONES__))?window.__PUBLICACIONES__:[];
  if(!id||!lista.length) return;
  var juego=null; for(var i=0;i<lista.length;i++){ var j=lista[i]; if((j.id||'')===id){ juego=j; break; } }
  if(juego) abrirModal(juego);
}

/* Listeners globales (una sola vez) */
document.addEventListener('DOMContentLoaded',function(){
  var modal=document.getElementById('modal-juego');
  var closeBtn=modal?modal.querySelector('.modal-close'):null;
  if(closeBtn){
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label','Cerrar');
    closeBtn.addEventListener('click',cerrarModal);
  }
  window.addEventListener('click',function(e){ if(e.target===modal) cerrarModal(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') cerrarModal(); });
  window.addEventListener('hashchange',verificarFragmentoURL);

  // Delegación para el botón CONTRASEÑA
  var modalBody=document.getElementById('modal-body');
  if(modalBody && !modalBody.dataset.copyBound){
    modalBody.addEventListener('click',function(e){
      var btn=e.target.closest('.btn-copy');
      if(!btn) return;
      e.preventDefault();

      var t = btn.getAttribute('data-pass')||'';
      var modalContent = modalBody.closest('.modal-content') ||
                         document.querySelector('#modal-juego .modal-content');

      if(!t){ beep('err'); showToastTop(modalContent,'No hay contrase\u00F1a \u274C','err'); return; }

      var p = (navigator.clipboard && navigator.clipboard.writeText)
        ? navigator.clipboard.writeText(t)
        : (function(){ var ta=document.createElement('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.focus(); ta.select(); var ok=document.execCommand('copy'); document.body.removeChild(ta); return ok?Promise.resolve():Promise.reject(); })();

      p.then(function(){ beep('ok');  showToastTop(modalContent,'Contrase\u00F1a copiada \u2705','ok'); })
       .catch(function(){ beep('err'); showToastTop(modalContent,'No se pudo copiar \u274C','err'); });
    });
    modalBody.dataset.copyBound='1';
  }
});
