const WHATSAPP_NUMBER = "919994848298";
const INSTAGRAM_REEL = "https://www.instagram.com/reel/DWp1QWaEcHA/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==";
const whatsappUrl = message => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

// WhatsApp: edit data-wa in index.html to change any message.
document.querySelectorAll('[data-wa]').forEach(link => {
  link.href = whatsappUrl(link.dataset.wa || 'Hi, I would like to know more about Shruthi Designer & Boutique. ✨');
  link.target = '_blank'; link.rel = 'noopener';
});

// Mobile navigation.
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
menuBtn?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.textContent = open ? '×' : '☰';
});
document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', () => {
  mobileNav.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); menuBtn.textContent='☰';
}));

// Light / dark mode.
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('shruthi-theme');
if (savedTheme === 'dark') document.body.classList.add('dark');
function updateTheme(){ themeToggle.textContent = document.body.classList.contains('dark') ? '☀' : '☾'; }
updateTheme();
themeToggle?.addEventListener('click', () => { document.body.classList.toggle('dark'); localStorage.setItem('shruthi-theme', document.body.classList.contains('dark') ? 'dark':'light'); updateTheme(); });

// Hero automatic carousel.
const slides = [...document.querySelectorAll('.hero-slide')];
const dots = [...document.querySelectorAll('.hero-dots button')];
let heroIndex = 0, heroTimer;
function showHero(i){ heroIndex=(i+slides.length)%slides.length; slides.forEach((s,n)=>s.classList.toggle('active',n===heroIndex)); dots.forEach((d,n)=>d.classList.toggle('active',n===heroIndex)); }
function restartHero(){ clearInterval(heroTimer); heroTimer=setInterval(()=>showHero(heroIndex+1),5200); }
document.querySelector('.hero-arrow.prev')?.addEventListener('click',()=>{showHero(heroIndex-1);restartHero();});
document.querySelector('.hero-arrow.next')?.addEventListener('click',()=>{showHero(heroIndex+1);restartHero();});
dots.forEach(d=>d.addEventListener('click',()=>{showHero(+d.dataset.slide);restartHero();}));
restartHero();

// Six medium cards: automatic carousel, arrows and touch/trackpad scrolling.
const track = document.getElementById('occasionTrack');
const cards = [...document.querySelectorAll('.occasion-card')];
const progress = document.getElementById('occasionProgress');
let paused=false, timer;
const step=()=>cards[0] ? cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap||18) : 0;
function updateProgress(){ if(!track||!progress)return; const max=Math.max(1,track.scrollWidth-track.clientWidth); progress.style.width=`${Math.max(6,(track.scrollLeft/max)*100)}%`; }
function moveNext(){ if(paused||!track)return; const max=track.scrollWidth-track.clientWidth; let next=track.scrollLeft+step(); if(next>=max-5) next=0; track.scrollTo({left:next,behavior:'smooth'}); setTimeout(updateProgress,500); }
function restartCollection(){clearInterval(timer);timer=setInterval(moveNext,4000);}
function pause(ms=5000){paused=true;clearTimeout(pause.t);pause.t=setTimeout(()=>paused=false,ms);}
track?.addEventListener('scroll',()=>requestAnimationFrame(updateProgress),{passive:true});
track?.addEventListener('mouseenter',()=>paused=true);track?.addEventListener('mouseleave',()=>paused=false);track?.addEventListener('touchstart',()=>pause(6500),{passive:true});

// Pointer-drag support for the CURATED FOR YOU carousel.
// Desktop: click + drag. Mobile/tablet: swipe naturally; pointer dragging also works.
if(track){
  let dragging=false, startX=0, startScroll=0, moved=false;
  const endDrag=()=>{
    if(!dragging)return;
    dragging=false;
    track.classList.remove('is-dragging');
    track.releasePointerCapture?.(track._pointerId);
    pause(6500);
    setTimeout(()=>{moved=false},40);
  };
  track.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse' && e.button!==0)return;
    dragging=true; moved=false;
    track._pointerId=e.pointerId;
    startX=e.clientX; startScroll=track.scrollLeft;
    track.setPointerCapture?.(e.pointerId);
    track.classList.add('is-dragging');
    clearTimeout(pause.t); paused=true;
  });
  track.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const dx=e.clientX-startX;
    if(Math.abs(dx)>6)moved=true;
    track.scrollLeft=startScroll-dx;
    if(moved && e.pointerType==='mouse')e.preventDefault();
  });
  track.addEventListener('pointerup',endDrag);
  track.addEventListener('pointercancel',endDrag);
  track.addEventListener('lostpointercapture',()=>{ if(dragging) endDrag(); });
  track.addEventListener('click',e=>{
    if(moved){ e.preventDefault(); e.stopPropagation(); }
  },true);
}
document.querySelector('.collection-prev')?.addEventListener('click',()=>{track.scrollBy({left:-step(),behavior:'smooth'});pause();});
document.querySelector('.collection-next')?.addEventListener('click',()=>{track.scrollBy({left:step(),behavior:'smooth'});pause();});
window.addEventListener('resize',updateProgress);restartCollection();updateProgress();

// Card detail modal and product-specific WhatsApp inquiry.
const modal=document.getElementById('detailModal');
document.querySelectorAll('.occasion-card').forEach(card=>{
  const title=card.dataset.title, category=card.dataset.category, description=card.dataset.description, message=card.dataset.wa;
  card.querySelector('.view-btn')?.addEventListener('click',()=>{
    document.getElementById('modalTitle').textContent=title;
    document.getElementById('modalCategory').textContent=category;
    document.getElementById('modalDescription').textContent=description;
    const best=document.getElementById('modalBest');
    if(best) best.textContent=card.dataset.best || 'Special occasions';
    const featureList=document.getElementById('modalFeatures');
    if(featureList){
      featureList.innerHTML='';
      (card.dataset.features || '').split('|').filter(Boolean).forEach(item=>{
        const li=document.createElement('li'); li.textContent=item; featureList.appendChild(li);
      });
    }
    const image = card.querySelector('.occasion-media img');
    const modalImage = document.getElementById('modalImage');
    if(image && modalImage){ modalImage.src=image.currentSrc || image.src; modalImage.alt=image.alt || title; }
    const btn=document.getElementById('modalInquiry'); btn.href=whatsappUrl(message); btn.target='_blank'; btn.rel='noopener';
    modal.showModal();
  });
  card.querySelector('.inquiry-btn')?.addEventListener('click',()=>window.open(whatsappUrl(message),'_blank','noopener'));
});
document.getElementById('modalClose')?.addEventListener('click',()=>modal.close());
document.getElementById('modalCloseBottom')?.addEventListener('click',()=>modal.close());
modal?.addEventListener('click',e=>{if(e.target===modal)modal.close();});

// Quick enquiry -> WhatsApp.
document.getElementById('whatsappForm')?.addEventListener('submit',e=>{
  e.preventDefault(); const d=new FormData(e.currentTarget);
  const lines=['Hi, I would like to know more about this. ✨','',`Name: ${d.get('name')}`,`Phone: ${d.get('phone')}`,`Interested in: ${d.get('interest')}`,d.get('occasion')?`Occasion: ${d.get('occasion')}`:'',d.get('message')?`Message: ${d.get('message')}`:''].filter(Boolean);
  window.open(whatsappUrl(lines.join('\n')),'_blank','noopener');
});

// Reveal animations.
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// Make all Instagram tiles point to the supplied reel URL.
document.querySelectorAll('.insta-tile').forEach(a=>a.href=INSTAGRAM_REEL);


/* YouTube background autoplay controller — muted for browser autoplay compatibility. */
(function(){
  const iframe = document.querySelector('.video-card iframe');
  if(!iframe) return;
  let player;
  let retryTimer;
  const videoId = 'tx80zK9QKDU';
  window.onYouTubeIframeAPIReady = function(){
    player = new YT.Player(iframe, {
      events: {
        onReady: function(e){
          e.target.mute();
          e.target.setVolume(0);
          e.target.playVideo();
          retryTimer = setInterval(function(){
            try {
              if(e.target.getPlayerState() !== YT.PlayerState.PLAYING){
                e.target.mute(); e.target.playVideo();
              }
            } catch(_) {}
          }, 5000);
        },
        onStateChange: function(e){
          if(e.data === YT.PlayerState.ENDED) e.target.playVideo();
        }
      }
    });
  };
  if(!document.getElementById('youtube-iframe-api')){
    const tag=document.createElement('script');
    tag.id='youtube-iframe-api';
    tag.src='https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }
  document.addEventListener('visibilitychange', function(){
    if(!document.hidden && player){ try { player.mute(); player.playVideo(); } catch(_) {} }
  });
})();

// V6 polish: scroll progress, active navigation and subtle reveal staggering.
(function(){
  const header=document.getElementById('header');
  const sections=[...document.querySelectorAll('main section[id]')];
  const links=[...document.querySelectorAll('.nav a')];
  function onScroll(){
    const max=document.documentElement.scrollHeight-window.innerHeight;
    document.body.style.setProperty('--scroll-progress', max>0 ? `${window.scrollY/max}` : '0');
    header?.classList.toggle('scrolled',window.scrollY>12);
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  if('IntersectionObserver' in window){
    const navObs=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const id=entry.target.id;
      links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${id}`));
    }),{rootMargin:'-35% 0px -55% 0px',threshold:0});
    sections.forEach(s=>navObs.observe(s));
  }
  document.querySelectorAll('.service-grid .reveal,.instagram-grid .reveal,.review-layout .reveal').forEach((el,i)=>{el.style.setProperty('--reveal-delay',`${Math.min(i*55,330)}ms`);el.style.animationDelay='var(--reveal-delay)';});
})();
