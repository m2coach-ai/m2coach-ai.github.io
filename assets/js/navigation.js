const toggle=document.querySelector('[data-nav-toggle]');const nav=document.querySelector('[data-nav]');const close=document.querySelector('[data-nav-close]');
function setNav(open){if(!nav||!toggle)return;nav.classList.toggle('open',open);nav.setAttribute('aria-hidden',String(!open));toggle.setAttribute('aria-expanded',String(open));if(open)nav.querySelector('a,button')?.focus();}
toggle?.addEventListener('click',()=>setNav(!nav.classList.contains('open')));close?.addEventListener('click',()=>setNav(false));document.addEventListener('keydown',e=>{if(e.key==='Escape')setNav(false)});

// Book page controls on the homepage: Previous / Next move one chapter, which
// scrolls the page and turns the book. Works with or without the 3D scene.
const chapters=[...document.querySelectorAll('[data-chapter]')];const pageLabel=document.querySelector('[data-page-label]');
if(chapters.length&&pageLabel){
// Leaving the book for an inner page remembers the chapter. Coming back from
// that page (Back, or a link home) opens the book at the same chapter. Any
// other visit starts at the closed cover with the lamp switching on.
try{
  let ret=null;try{ret=JSON.parse(sessionStorage.getItem('desk-return')||'null')}catch(e){}
  sessionStorage.removeItem('desk-return');sessionStorage.removeItem('desk-return-done');
  const nav=(performance.getEntriesByType('navigation')[0]||{}).type;
  let fromInner=false;try{const r=new URL(document.referrer);fromInner=r.origin===location.origin&&r.pathname!==location.pathname}catch(e){}
  const fresh=ret&&Date.now()-ret.t<3600000&&chapters[ret.i];
  if(fresh&&(nav==='back_forward'||fromInner)){
    sessionStorage.setItem('desk-return-done',String(ret.i));
    history.scrollRestoration='manual';window.scrollTo({top:chapters[ret.i].offsetTop,behavior:'instant'});
  }else if(nav!=='back_forward'&&!location.hash){
    history.scrollRestoration='manual';window.scrollTo({top:0,behavior:'instant'});
  }
}catch(e){}
// A page restored from the browser's memory is already where it was left.
addEventListener('pageshow',e=>{if(e.persisted)try{sessionStorage.removeItem('desk-return')}catch(x){}});
document.addEventListener('click',e=>{const a=e.target.closest('.story a[href]');if(!a)return;const u=new URL(a.href,location.href);if(u.origin!==location.origin||(u.pathname===location.pathname&&u.hash))return;
const mid=scrollY+innerHeight/2;let i=0;chapters.forEach((c,k)=>{if(c.offsetTop<=mid)i=k});try{sessionStorage.setItem('desk-return',JSON.stringify({i,t:Date.now()}))}catch(e){}},true);const prev=document.querySelector('[data-page="prev"]'),next=document.querySelector('[data-page="next"]');
const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const current=()=>{const mid=scrollY+innerHeight/2;let i=0;chapters.forEach((c,k)=>{if(c.offsetTop<=mid)i=k});return i};
const go=i=>{i=Math.max(0,Math.min(chapters.length-1,i));chapters[i].scrollIntoView({behavior:calm?'auto':'smooth',block:'start'})};
const update=()=>{const i=current();pageLabel.textContent=chapters[i].dataset.chapter;prev.disabled=i===0;next.disabled=i===chapters.length-1;next.textContent=i===0?'Open the book':'Next page'};
prev.addEventListener('click',()=>go(current()-1));next.addEventListener('click',()=>go(current()+1));
document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,[contenteditable]'))return;if(e.key==='ArrowRight'){e.preventDefault();go(current()+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(current()-1)}});
addEventListener('scroll',update,{passive:true});update();}
