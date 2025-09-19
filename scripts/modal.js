// Modal con: etiqueta centrada abajo (fuera del scroller), imagen grande,
// t¨ªtulo, "VERSI¨®N" y tres botones con color por acci¨®n.
// ES6 b¨¢sico y Unicode escapado para evitar problemas de codificaci¨®n.

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
  if (Object.prototype.hasOwnProperty.call(j,'contrase?a')) return j['contrase?a']||'';
  if (Object.prototype.hasOwnProperty.call(j,'contrasena')) return j['contrasena']||'';
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

/* Copiado + Toast */
function copyToClipboard(text){
  if(!text) return Promise.reject(new Error('empty'));
  if(navigator.clipboard && navigator.clipboard.writeText){
    return navigator.clipboard.writeText(text);
  }
  try{
    var ta=document.createElement('textarea'); ta.value=text;
    ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta);
    ta.focus(); ta.select(); var ok=document.execCommand('copy'); document.body.removeChild(ta);
    return ok?Promise.resolve():Promise.reject(new Error('execCommand'));
  }catch(e){ return Promise.reject(e); }
}
function showToast(modalContent,msg){
  var toast=modalContent.querySelector('.copy-toast');
  if(!toast){ toast=document.createElement('div'); toast.className='copy-toast'; modalContent.appendChild(toast); }
  toast.textContent=msg; toast.classList.remove('show'); void toast.offsetWidth; toast.classList.add('show');
  clearTimeout(showToast._t); showToast._t=setTimeout(function(){ toast.classList.remove('show'); },1600);
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

  /* construir contenido SCROLLEABLE dentro de #modal-body */
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
  if(enlaceDescarga){ pieces.push('<a class="btn btn--dl" href="'+enlaceDescarga+'" target="_blank" rel="noopener">\uD83D\uDCE5 DESCARGAR</a>'); }
  if(passProp){       pieces.push('<a class="btn btn--pass btn-copy" href="#" data-pass="'+escAttr(passProp)+'">\uD83D\uDD11 CONTRASE\u00D1A</a>'); }
  if(enlaceCompra){   pieces.push('<a class="btn btn--buy" href="'+enlaceCompra+'" target="_blank" rel="noopener">\uD83D\uDED2 COMPRAR</a>'); }
  var botonesHTML = pieces.length?'<div class="modal-body-buttons">'+pieces.join('')+'</div>':'';

  /* PINTAR SOLO EL CONTENIDO en #modal-body (sin la chapita) */
  modalBody.innerHTML = imagenHTML + nombreHTML + versionHTML + descripcionHTML + botonesHTML;

  /* Agregar/actualizar la CHAPITA como HERMANA de #modal-body (no se scrollea) */
  var oldTag = modalContent.querySelector('.modal-tag');
  if (oldTag) oldTag.remove();
  var tagWrap = document.createElement('div');
  tagWrap.className = 'modal-tag';
  tagWrap.innerHTML = '<span class="modal-etiqueta tag-pill tag-'+etiqueta+'">'+emote+' '+etiqueta.toUpperCase()+'</span>';
  modalContent.appendChild(tagWrap);

  /* Copiar contrase?a + toast */
  var copyBtn=modalBody.querySelector('.btn-copy');
  if(copyBtn){
    copyBtn.addEventListener('click',function(e){
      e.preventDefault();
      var t = copyBtn.getAttribute('data-pass')||'';
      copyToClipboard(t)
        .then(function(){ showToast(modalContent,'Contrase\u00F1a copiada'); })
        .catch(function(){ showToast(modalContent,'No se pudo copiar'); });
    });
  }

  /* Origen est¨¦tico del zoom */
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

/* Listeners globales */
document.addEventListener('DOMContentLoaded',function(){
  var modal=document.getElementById('modal-juego');
  var closeBtn=modal?modal.querySelector('.modal-close'):null;
  if(closeBtn) closeBtn.addEventListener('click',cerrarModal);
  window.addEventListener('click',function(e){ if(e.target===modal) cerrarModal(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') cerrarModal(); });
  window.addEventListener('hashchange',verificarFragmentoURL);
});
