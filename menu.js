/* menu.js : menu commun pour relier toutes les pages.
   Ajoute dans le <head> de chaque page : <script src="menu.js" defer></script>
   Pour ajouter une page, ajoute une ligne dans la liste PAGES ci-dessous. */
(function(){
'use strict';
var PAGES=[
  ['index.html','🏠','Accueil'],
  ['calendriers.html','🕌','Calendriers et prières'],
  ['coran-audio.html','📖','Coran audio'],
  ['adhkar.html','📿','Adhkar'],
  ['livre-comptes.html','💰','Livre de comptes']
];
var cur=(location.pathname.split('/').pop()||'index.html').toLowerCase();
var here=PAGES.filter(function(p){return p[0]===cur})[0]||PAGES[0];

var s=document.createElement('style');
s.textContent='#mn-bar{position:sticky;top:0;z-index:1000;display:flex;align-items:center;gap:10px;margin:calc(-12px - env(safe-area-inset-top,0px)) -12px 12px;padding:calc(8px + env(safe-area-inset-top,0px)) 12px 8px;background:#071A38}'
+'#mn-btn{width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#fff;font-size:1.2rem;cursor:pointer;padding:0}'
+'#mn-ttl{font-weight:800;color:#fff;font-size:1rem}'
+'#mn-pn{display:none;position:absolute;top:100%;left:12px;right:12px;margin-top:6px;background:var(--card,#fff);border:1px solid var(--bd,#E3E9F2);border-radius:14px;box-shadow:0 12px 24px rgba(0,0,0,.25);overflow:hidden}'
+'#mn-pn.on{display:block}'
+'#mn-pn a{display:flex;align-items:center;gap:12px;padding:14px 16px;color:var(--tx,#0F172A);text-decoration:none;font-size:1rem;border-top:1px solid var(--bd,#E3E9F2)}'
+'#mn-pn a:first-child{border-top:0}'
+'#mn-pn a.cur{background:var(--ac2,#E6EEFC);color:var(--ac,#2563EB);font-weight:700;box-shadow:inset 4px 0 0 #FAB202}'
+'#mn-pn span{font-size:1.4rem}';
document.head.appendChild(s);

function build(){
  var bar=document.createElement('div');bar.id='mn-bar';
  bar.innerHTML='<button id="mn-btn" aria-label="Menu" aria-expanded="false">☰</button><div id="mn-ttl">'+here[1]+' '+here[2]+'</div>'
    +'<nav id="mn-pn">'+PAGES.map(function(p){return '<a href="'+p[0]+'"'+(p[0]===here[0]?' class="cur"':'')+'><span>'+p[1]+'</span>'+p[2]+'</a>'}).join('')+'</nav>';
  document.body.insertBefore(bar,document.body.firstChild);
  var btn=document.getElementById('mn-btn'),pn=document.getElementById('mn-pn');
  function set(on){pn.classList.toggle('on',on);btn.setAttribute('aria-expanded',on?'true':'false');btn.textContent=on?'✕':'☰'}
  btn.onclick=function(e){e.stopPropagation();set(!pn.classList.contains('on'))};
  document.addEventListener('click',function(e){if(!bar.contains(e.target))set(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
}
if(document.body)build();else document.addEventListener('DOMContentLoaded',build);
})();
