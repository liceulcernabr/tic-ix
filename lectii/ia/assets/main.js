/* Motorul paginii: hero lipit + scrub video/canvas la scroll + etichete + apariții.
   Pentru a folosi un clip: pune hero.mp4 (și opțional hero-mobil.mp4) lângă index.html. */
(function(){
const hero=document.querySelector('.hero');
const bar=document.querySelector('.progress');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let p=0;

if(hero){
  const canvas=hero.querySelector('canvas'), ctx=canvas.getContext('2d');
  const video=hero.querySelector('video');
  const allLabels=[...hero.querySelectorAll('.label')];
  const scene=window.TIC_SCENES[document.body.dataset.theme];
  let vw=0,vh=0,useVideo=false;

  function size(){const d=Math.min(devicePixelRatio||1,2);vw=canvas.clientWidth;vh=canvas.clientHeight;
    canvas.width=vw*d;canvas.height=vh*d;ctx.setTransform(d,0,0,d,0,0);}
  addEventListener('resize',size);size();

  // Clipul video, dacă există
  if(video){
    // MP4 (H.264) pentru majoritatea browserelor; WebM (VP9) ca rezervă, cu același nume
    const small=innerWidth<700&&video.dataset.mobile;
    let src=small?video.dataset.mobile:video.dataset.src;
    const mp4=video.canPlayType('video/mp4; codecs="avc1.42E01E"');
    if(!mp4&&video.canPlayType('video/webm; codecs="vp9"'))src=src.replace(/\.mp4$/,'.webm');
    video.src=src;
    video.muted=true;video.playsInline=true;video.preload='auto';
    video.addEventListener('loadedmetadata',()=>{useVideo=true;hero.classList.add('has-video');video.pause();});
    video.addEventListener('error',()=>{useVideo=false;},{once:true});
  }

  function progress(){
    const r=hero.getBoundingClientRect(), total=hero.offsetHeight-innerHeight;
    return reduce?.999:Math.max(0,Math.min(1,-r.top/total));
  }
  let target=0;
  function frame(t){
    target=progress();
    p+= (target-p)*.12;                       // netezire
    if(Math.abs(target-p)<.0005)p=target;
    hero.classList.toggle('scrolled',p>.04);
    if(useVideo&&video.duration){const tt=p*(video.duration-.05);if(Math.abs(video.currentTime-tt)>.03)video.currentTime=tt;}
    else if(scene){ctx.clearRect(0,0,vw,vh);scene(ctx,vw,vh,p,t);}
    // etichete: fiecare are data-at="început,sfârșit"
    const set=useVideo?'video':'canvas';
    allLabels.forEach(l=>{const f=l.parentElement.dataset.for;if(f&&f!==set){l.classList.remove('on');return;}const [a,b]=l.dataset.at.split(',').map(Number);l.classList.toggle('on',reduce||(p>=a&&p<b));});
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Bara de progres a paginii
addEventListener('scroll',()=>{const h=document.documentElement;if(bar)bar.style.width=(h.scrollTop/(h.scrollHeight-innerHeight)*100)+'%';},{passive:true});

// Apariții la scroll
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();
