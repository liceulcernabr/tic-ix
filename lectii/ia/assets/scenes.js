/* Scene desenate pe canvas, legate de scroll (p = 0…1).
   Se folosesc cât timp nu există hero.mp4 în folderul paginii. */
(function(){
const css = n => getComputedStyle(document.body).getPropertyValue(n).trim();
const lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const seg=(p,a,b)=>clamp((p-a)/(b-a));
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function glow(ctx,c,b){ctx.shadowColor=c;ctx.shadowBlur=b;}
function bg(ctx,w,h,c1,c2){const g=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)*.7);g.addColorStop(0,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h);}

const S = {};

/* a IX-a — Hardware: zoom în placa de bază */
S.hardware = function(ctx,w,h,p,t){
  const A=css('--accent');
  bg(ctx,w,h,'#0c2a2a','#030a0d');
  const s=Math.min(w,h)*.42;
  // traseul camerei: [p, x, y, zoom] – placa → CPU → RAM → SSD
  const K=[[0,0,0,.8],[.18,0,0,1.05],[.3,0,0,2.3],[.48,0,0,2.3],[.6,.58,-.3,2.1],[.73,.58,-.3,2.1],[.85,-.8,-.08,2.7],[1,-.8,-.08,2.7]];
  let i=0;while(i<K.length-2&&p>K[i+1][0])i++;
  const f=ease(seg(p,K[i][0],K[i+1][0]));
  const cx=lerp(K[i][1],K[i+1][1],f)*s, cy=lerp(K[i][2],K[i+1][2],f)*s, z=lerp(K[i][3],K[i+1][3],f);
  const stage=p<.28?0:p<.53?1:p<.78?2:3;
  ctx.save();ctx.translate(w/2,h/2);ctx.scale(z,z);ctx.translate(-cx,-cy);
  // placa
  ctx.fillStyle='#0d3b2e';rr(ctx,-s*1.3,-s,s*2.6,s*2,14);ctx.fill();
  ctx.strokeStyle='rgba(120,255,200,.12)';ctx.lineWidth=1/z;
  for(let i=-12;i<=12;i++){ctx.beginPath();ctx.moveTo(-s*1.3,i*s/12);ctx.lineTo(s*1.3,i*s/12);ctx.stroke();}
  // trasee animate
  ctx.lineWidth=2.2/z;
  for(let i=0;i<14;i++){
    const y=-s*.85+i*s*.13, x0=-s*1.2, x1=lerp(-s*.2,s*1.2,(i%5)/4);
    ctx.strokeStyle='rgba(255,210,120,.35)';ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1*.5,y);ctx.lineTo(x1,y+s*.08);ctx.stroke();
    const k=((t/2000+i*.13)%1);ctx.fillStyle=A;glow(ctx,A,10);
    ctx.beginPath();ctx.arc(lerp(x0,x1*.5,k),y,2.5/z*1.5,0,7);ctx.fill();ctx.shadowBlur=0;
  }
  const hl=(i)=>stage===i?A:'rgba(255,255,255,.25)';
  // CPU
  ctx.fillStyle='#1b1f2a';rr(ctx,-s*.22,-s*.22,s*.44,s*.44,6);ctx.fill();
  ctx.strokeStyle=hl(1);ctx.lineWidth=3/z;if(stage===1)glow(ctx,A,20);ctx.stroke();ctx.shadowBlur=0;
  ctx.fillStyle='#c9ced8';rr(ctx,-s*.14,-s*.14,s*.28,s*.28,4);ctx.fill();
  ctx.fillStyle='#1b1f2a';ctx.font=`700 ${s*.06}px Inter,sans-serif`;ctx.textAlign='center';ctx.fillText('CPU',0,s*.02);
  // RAM
  for(let i=0;i<4;i++){const x=s*.42+i*s*.11;ctx.fillStyle='#14324a';rr(ctx,x,-s*.75,s*.07,s*.9,3);ctx.fill();
    ctx.strokeStyle=hl(2);ctx.lineWidth=2/z;if(stage===2)glow(ctx,A,14);ctx.stroke();ctx.shadowBlur=0;
    for(let j=0;j<6;j++){ctx.fillStyle='#0a0f18';ctx.fillRect(x+s*.012,-s*.7+j*s*.14,s*.046,s*.09);}}
  // Stocare (SSD M.2)
  ctx.fillStyle='#222';rr(ctx,-s*1.05,-s*.15,s*.5,s*.14,4);ctx.fill();ctx.strokeStyle=hl(3);if(stage===3)glow(ctx,A,14);ctx.stroke();ctx.shadowBlur=0;
  // GPU / slot PCIe
  ctx.fillStyle='#262b38';rr(ctx,-s*.9,s*.45,s*1.6,s*.12,4);ctx.fill();ctx.strokeStyle=hl(4);ctx.stroke();ctx.shadowBlur=0;
  ctx.restore();
};

/* a X-a — Rețele: pachetul călătorește client → router → DNS → server */
S.retele = function(ctx,w,h,p,t){
  const A=css('--accent'),B=css('--accent2');
  bg(ctx,w,h,'#06222e','#020810');
  const m=Math.min(w,h);
  const N=[ {x:.12,y:.62,n:'Client'}, {x:.32,y:.38,n:'Router'}, {x:.5,y:.66,n:'DNS'}, {x:.68,y:.36,n:'Router ISP'}, {x:.88,y:.6,n:'Server'} ]
    .map(o=>({...o,x:o.x*w,y:o.y*h}));
  // fundal: rețea de puncte
  ctx.fillStyle='rgba(0,245,212,.08)';
  for(let i=0;i<70;i++){const x=(i*137.5%100)/100*w,y=(i*61.8%100)/100*h;ctx.beginPath();ctx.arc(x,y,1.5,0,7);ctx.fill();}
  // cabluri
  ctx.lineWidth=3;
  for(let i=0;i<N.length-1;i++){ctx.strokeStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.moveTo(N[i].x,N[i].y);ctx.lineTo(N[i+1].x,N[i+1].y);ctx.stroke();}
  // traseu parcurs
  const tot=(N.length-1)*p, k=Math.floor(Math.min(tot,N.length-1.0001)), f=tot-k;
  ctx.strokeStyle=A;glow(ctx,A,12);
  for(let i=0;i<k;i++){ctx.beginPath();ctx.moveTo(N[i].x,N[i].y);ctx.lineTo(N[i+1].x,N[i+1].y);ctx.stroke();}
  const px=lerp(N[k].x,N[k+1].x,f), py=lerp(N[k].y,N[k+1].y,f);
  ctx.beginPath();ctx.moveTo(N[k].x,N[k].y);ctx.lineTo(px,py);ctx.stroke();ctx.shadowBlur=0;
  // noduri
  N.forEach((o,i)=>{const on=i<=k;ctx.fillStyle=on?'#0b2b36':'#0a1520';ctx.strokeStyle=on?A:'rgba(255,255,255,.3)';ctx.lineWidth=2.5;
    rr(ctx,o.x-m*.055,o.y-m*.04,m*.11,m*.08,10);ctx.fill();if(on)glow(ctx,A,16);ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle=on?'#fff':'#9aa6c7';ctx.font=`600 ${Math.max(11,m*.022)}px Inter,sans-serif`;ctx.textAlign='center';ctx.fillText(o.n,o.x,o.y+m*.008);});
  // pachetul
  const r=m*.022*(1+.15*Math.sin(t/180));
  const g=ctx.createRadialGradient(px,py,0,px,py,r*3);g.addColorStop(0,'#fff');g.addColorStop(.3,A);g.addColorStop(1,'transparent');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,r*3,0,7);ctx.fill();
  ctx.fillStyle=B;ctx.font=`600 ${Math.max(10,m*.018)}px monospace`;ctx.fillText('GET /index.html',px,py-r*3.2);
};

/* a XI-a — Baze de date / Excel: celule care se umplu și devin grafic */
S.date = function(ctx,w,h,p,t){
  const A=css('--accent');
  bg(ctx,w,h,'#0e2a16','#04100a');
  const cols=6, rows=8, m=Math.min(w,h), cw=Math.min(w*.11,120), ch=m*.065;
  const ox=w/2-cols*cw/2, oy=h/2-rows*ch/2;
  const vals=[[34,52,41,66,58,73],[12,19,25,22,31,28]];
  const fill=seg(p,0,.45), morph=ease(seg(p,.5,.9));
  ctx.font=`500 ${Math.max(10,ch*.36)}px Inter,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
  const heads=['Ian','Feb','Mar','Apr','Mai','Iun'];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const x=ox+c*cw, y=oy+r*ch, idx=r*cols+c, shown=idx/(rows*cols)<fill;
    ctx.globalAlpha=1-morph*.85;
    ctx.fillStyle=r===0?'#1d4d2b':(shown?'#123321':'#0b1d12');ctx.fillRect(x,y,cw,ch);
    ctx.strokeStyle='rgba(128,237,153,.25)';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,cw,ch);
    if(r===0){ctx.fillStyle='#fff';ctx.fillText(heads[c],x+cw/2,y+ch/2);}
    else if(shown){ctx.fillStyle=r<=2?A:'#cfe9d6';ctx.fillText(r<=2?vals[r-1][c]:((c*7+r*13)%90+10),x+cw/2,y+ch/2);}
  }
  ctx.globalAlpha=1;
  // cursorul de selecție
  if(fill<1&&fill>0){const i=Math.floor(fill*rows*cols),x=ox+(i%cols)*cw,y=oy+Math.floor(i/cols)*ch;ctx.strokeStyle=A;ctx.lineWidth=3;ctx.strokeRect(x,y,cw,ch);}
  // grafic
  if(morph>0){
    const base=oy+rows*ch, maxH=rows*ch*.85;
    vals.forEach((serie,s)=>serie.forEach((v,c)=>{
      const bw=cw*.32, x=ox+c*cw+cw*.18+s*bw*1.05, bh=maxH*(v/80)*morph;
      ctx.fillStyle=s===0?A:'rgba(255,255,255,.55)';glow(ctx,s===0?A:'#fff',s===0?12:0);
      rr(ctx,x,base-bh,bw,bh,4);ctx.fill();ctx.shadowBlur=0;}));
    ctx.globalAlpha=morph;ctx.fillStyle='#fff';ctx.font=`600 ${Math.max(12,m*.026)}px Inter,sans-serif`;
    ctx.fillText('=MEDIE(B2:G2)  →  54',w/2,oy-ch*.9);ctx.globalAlpha=1;
  }
};

/* a XII-a — Web design: pagina se construiește singură */
S.web = function(ctx,w,h,p,t){
  const A=css('--accent'),B=css('--accent2');
  bg(ctx,w,h,'#2a1c06','#0d0803');
  const pw=Math.min(w*.8,820), ph=Math.min(h*.72,560), x=w/2-pw/2, y=h/2-ph/2;
  const wire=seg(p,0,.3), color=ease(seg(p,.3,.6)), text=seg(p,.6,.85), live=seg(p,.85,1);
  // fereastra browser
  ctx.fillStyle='#16110a';rr(ctx,x,y,pw,ph,14);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#231a0e';rr(ctx,x,y,pw,34,14);ctx.fill();
  ['#ff5f57','#febc2e','#28c840'].forEach((c,i)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x+20+i*18,y+17,5,0,7);ctx.fill();});
  ctx.fillStyle='#0d0904';rr(ctx,x+80,y+9,pw-100,16,8);ctx.fill();
  ctx.fillStyle='#bba';ctx.font='11px monospace';ctx.textAlign='left';
  ctx.fillText(live>0?'liceulcernabr.github.io/site-ul-meu':'index.html',x+92,y+21);
  const boxes=[[.04,.1,.92,.1,'nav'],[.04,.25,.55,.38,'hero'],[.63,.25,.33,.38,'img'],[.04,.68,.28,.26,'c'],[.36,.68,.28,.26,'c'],[.68,.68,.28,.26,'c']];
  boxes.forEach((b,i)=>{
    const d=clamp(wire*boxes.length-i);if(d<=0)return;
    const bx=x+b[0]*pw, by=y+34+b[1]*(ph-34), bw=b[2]*pw, bh=b[3]*(ph-34);
    if(color>0){ctx.globalAlpha=color;
      const g=ctx.createLinearGradient(bx,by,bx+bw,by+bh);
      if(b[4]==='img'){g.addColorStop(0,A);g.addColorStop(1,B);}else if(b[4]==='hero'){g.addColorStop(0,'#2e220f');g.addColorStop(1,'#3a2a12');}else{g.addColorStop(0,'#2a2010');g.addColorStop(1,'#2a2010');}
      ctx.fillStyle=g;rr(ctx,bx,by,bw,bh,10);ctx.fill();ctx.globalAlpha=1;}
    ctx.setLineDash(color<1?[6,6]:[]);ctx.strokeStyle=color<1?'rgba(255,190,11,.7)':'rgba(255,255,255,.1)';ctx.lineWidth=1.5;
    rr(ctx,bx,by,bw*d,bh*d,10);ctx.stroke();ctx.setLineDash([]);
    if(text>0&&b[4]!=='img'){ctx.globalAlpha=text;
      if(b[4]==='nav'){ctx.fillStyle=A;ctx.font=`700 ${bh*.38}px Inter,sans-serif`;ctx.fillText('Site-ul meu',bx+14,by+bh*.62);
        ctx.fillStyle='#ddd';ctx.font=`${bh*.3}px Inter,sans-serif`;['Acasă','Despre','Contact'].forEach((s,j)=>ctx.fillText(s,bx+bw-230+j*75,by+bh*.62));}
      else if(b[4]==='hero'){ctx.fillStyle='#fff';ctx.font=`800 ${bh*.13}px Inter,sans-serif`;ctx.fillText('Primul meu site',bx+18,by+bh*.3);
        ctx.fillStyle='#bbb';ctx.font=`${bh*.07}px Inter,sans-serif`;ctx.fillText('HTML + CSS + un pic de JS',bx+18,by+bh*.45);
        ctx.fillStyle=A;rr(ctx,bx+18,by+bh*.6,bw*.32,bh*.17,bh*.085);ctx.fill();ctx.fillStyle='#120c02';ctx.font=`700 ${bh*.07}px Inter,sans-serif`;ctx.fillText('Începe',bx+30,by+bh*.71);}
      else{for(let k=0;k<4;k++){ctx.fillStyle=k?'rgba(255,255,255,.25)':'#fff';ctx.fillRect(bx+14,by+16+k*bh*.2,(bw-28)*(k?.9-k*.15:.5),k?6:10);}}
      ctx.globalAlpha=1;}
  });
  // etichete de cod
  const tag=['<html>','<header>','<section>','<style>','display:grid;','</html>'][Math.min(5,Math.floor(p*6))];
  ctx.font=`700 ${Math.max(14,Math.min(w,h)*.03)}px monospace`;ctx.fillStyle=A;ctx.textAlign='center';glow(ctx,A,14);
  ctx.fillText(tag,w/2,y+ph+Math.min(h*.06,46));ctx.shadowBlur=0;
};

/* Siguranță online: lacătul se închide peste fluxul de date */
S.securitate = function(ctx,w,h,p,t){
  const safe=ease(seg(p,.35,.75));
  const red='#ff4d6d', green='#2dd4a0', col=safe>.5?green:red;
  bg(ctx,w,h,safe>.5?'#062a20':'#2a0612','#05030a');
  // ploaie de date
  const fs=Math.max(12,Math.min(w,h)*.022), cols=Math.ceil(w/fs);
  ctx.font=`${fs}px monospace`;ctx.textAlign='center';
  for(let i=0;i<cols;i++){
    const sp=.04+(i*7%11)/200, off=(t*sp+i*97)%(h+400)-200;
    for(let j=0;j<10;j++){const yy=off-j*fs;if(yy<0||yy>h)continue;
      ctx.fillStyle=`rgba(${safe>.5?'45,212,160':'255,77,109'},${(1-j/10)*.35})`;
      const ch=safe>.6&&j%3===0?'*':(((i*31+j*17+Math.floor(t/150))%2)?'1':'0');ctx.fillText(ch,i*fs+fs/2,yy);}
  }
  // lacăt
  const m=Math.min(w,h), cx=w/2, cy=h/2+m*.05, bw=m*.28, bh=m*.22;
  const lift=lerp(m*.12,0,safe);
  ctx.lineWidth=m*.035;ctx.strokeStyle='#d9dde6';ctx.lineCap='round';glow(ctx,col,25);
  // toarta: piciorul stâng intră în corp; când e ridicată, piciorul drept rămâne deasupra corpului
  const top=cy-bh*.5, archY=top-bh*.45-lift;
  ctx.beginPath();ctx.moveTo(cx-bw*.3,top+bh*.05);ctx.lineTo(cx-bw*.3,archY);
  ctx.arc(cx,archY,bw*.3,Math.PI,0);
  ctx.lineTo(cx+bw*.3,Math.min(top+bh*.05,archY+bh*.5));ctx.stroke();
  ctx.fillStyle='#1a1d26';rr(ctx,cx-bw/2,cy-bh/2,bw,bh,m*.03);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=col;ctx.stroke();ctx.shadowBlur=0;
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(cx,cy-bh*.06,m*.022,0,7);ctx.fill();ctx.fillRect(cx-m*.008,cy-bh*.06,m*.016,bh*.24);
  ctx.font=`700 ${m*.03}px Inter,sans-serif`;ctx.fillStyle=col;
  ctx.fillText(safe>.5?'CONEXIUNE SECURIZATĂ · https://':'DATE EXPUSE · http://',cx,cy+bh*.5+m*.07);
};

/* a IX-a — Inteligența artificială: exemple etichetate → antrenare → predicție → chatbot */
S.ia = function(ctx,w,h,p,t){
  const A=css('--accent'), B=css('--accent2');
  bg(ctx,w,h,'#1c0f33','#07040f');
  const m=Math.min(w,h), port=w<h*.9, cy=port?h*.44:h*.42;
  const fr=m*(port?.034:.028);
  const RED='#ff5d73', GRN='#a6e05a';
  function fruit(x,y,r,kind,a){
    ctx.globalAlpha=a;
    if(kind==='mar'||kind==='marv'){ctx.fillStyle=kind==='mar'?RED:GRN;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
      ctx.strokeStyle='#7a4a2a';ctx.lineWidth=Math.max(1.5,r*.14);ctx.beginPath();ctx.moveTo(x,y-r*.8);ctx.lineTo(x+r*.15,y-r*1.3);ctx.stroke();
      ctx.fillStyle='#5cc77c';ctx.beginPath();ctx.ellipse(x+r*.45,y-r*1.15,r*.32,r*.15,-.5,0,7);ctx.fill();}
    else{ctx.fillStyle=GRN;ctx.beginPath();ctx.arc(x,y+r*.25,r*.9,0,7);ctx.fill();ctx.beginPath();ctx.arc(x,y-r*.55,r*.55,0,7);ctx.fill();
      ctx.strokeStyle='#7a4a2a';ctx.lineWidth=Math.max(1.5,r*.14);ctx.beginPath();ctx.moveTo(x,y-r*1.05);ctx.lineTo(x+r*.1,y-r*1.45);ctx.stroke();}
    ctx.globalAlpha=1;
  }
  // rețeaua
  const LN=[4,5,5,2], LX=port?[.16,.38,.6,.76]:[.37,.48,.59,.7];
  const span=port?Math.min(h*.26,w*.62):Math.min(h*.44,m*.55);
  const nodes=LN.map((n,k)=>Array.from({length:n},(_,i)=>({x:LX[k]*w,y:cy+(i-(n-1)/2)*(k===3?span*.45:span/(Math.max(...LN)-1))})));
  // exemplele de antrenare
  const kinds=['mar','para','mar','mar','para','para','mar','para','mar','para','mar','para'];
  const ex=kinds.map((k,i)=>{
    if(port){const c=i%6,r=Math.floor(i/6);return {k,x:w*(.12+c*.152),y:h*.12+r*fr*3.6};}
    const c=i%3,r=Math.floor(i/3),g=Math.min(w*.065,m*.1);return {k,x:w*.07+c*g+fr,y:cy+(r-1.5)*m*.12};
  });
  const show=seg(p,0,.12), tag=seg(p,.1,.24);
  const netA=seg(p,.2,.3)*(1-seg(p,.76,.84));
  const train=seg(p,.28,.5);
  // legăturile
  if(netA>0){
    for(let k=0;k<LN.length-1;k++)nodes[k].forEach((a,i)=>nodes[k+1].forEach((b,j)=>{
      const lit=seg(p,.58+k*.035,.6+k*.035)*(1-seg(p,.74,.78));
      const pulse=.5+.5*Math.sin(t/260+i*1.7+j*2.3+k);
      const al=(.1+.3*pulse*train*(1-seg(p,.5,.54))+.55*lit)*netA;
      ctx.strokeStyle=lit>.3?A:`rgba(199,125,255,1)`;ctx.globalAlpha=Math.min(1,al);ctx.lineWidth=lit>.3?2:1.2;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}));
    ctx.globalAlpha=1;
    nodes.forEach((L,k)=>L.forEach((n,i)=>{
      const lit=seg(p,.57+k*.035,.6+k*.035)*(1-seg(p,.74,.78));
      const win=k===3&&i===0;
      ctx.globalAlpha=netA;ctx.fillStyle=lit>.5&&(k<3||win)?A:'#2a1b48';ctx.strokeStyle=A;ctx.lineWidth=2;
      if(lit>.5&&(k<3||win))glow(ctx,A,16);
      ctx.beginPath();ctx.arc(n.x,n.y,m*.018,0,7);ctx.fill();ctx.stroke();ctx.shadowBlur=0;}));
    // ieșirea: procentele
    const out=seg(p,.68,.74)*netA;
    if(out>0){ctx.globalAlpha=out;ctx.textAlign='left';ctx.textBaseline='middle';
      ctx.font=`700 ${Math.max(12,m*.03)}px Inter,sans-serif`;
      ctx.fillStyle='#fff';ctx.fillText('măr  92%',nodes[3][0].x+m*.035,nodes[3][0].y);
      ctx.fillStyle='rgba(255,255,255,.45)';ctx.fillText('pară  8%',nodes[3][1].x+m*.035,nodes[3][1].y);
      ctx.globalAlpha=1;}
    ctx.globalAlpha=1;
  }
  // exemplele apar, primesc etichete, apoi „intră” în rețea
  ctx.textAlign='center';ctx.textBaseline='middle';
  ex.forEach((e,i)=>{
    const a0=clamp(show*12-i), mv=ease(seg(p,.3+i*.012,.42+i*.012));
    if(a0<=0||mv>=1)return;
    const tgt=nodes[0][i%4], x=lerp(e.x,tgt.x,mv), y=lerp(e.y,tgt.y,mv), r=fr*(1-mv*.6), a=a0*(1-mv*mv);
    fruit(x,y,r,e.k,a);
    if(tag>0&&mv<.2){ctx.globalAlpha=tag*(1-mv*5);ctx.font=`600 ${Math.max(10,fr*.6)}px Inter,sans-serif`;
      ctx.fillStyle=e.k==='mar'?RED:GRN;ctx.fillText(e.k==='mar'?'măr':'pară',x,y+r*1.75);ctx.globalAlpha=1;}
  });
  // exemplul nou, fără etichetă
  const nA=seg(p,.5,.54)*(1-seg(p,.6,.63));
  if(nA>0){
    const sx=port?w*.5:w*.2, sy=port?h*.16:cy, mv=ease(seg(p,.53,.6)), tgt=nodes[0][1];
    const x=lerp(sx,tgt.x,mv), y=lerp(sy,tgt.y,mv);
    fruit(x,y,fr*1.4,'mar',nA);
    ctx.globalAlpha=nA;ctx.fillStyle='#fff';ctx.font=`800 ${fr*1.2}px Inter,sans-serif`;ctx.fillText('?',x,y+fr*.1);
    ctx.font=`600 ${Math.max(11,fr*.6)}px Inter,sans-serif`;ctx.fillStyle=A;ctx.fillText('exemplu nou',x,y+fr*2.4);ctx.globalAlpha=1;
  }
  // chatbotul: cuvânt cu cuvânt
  const cA=seg(p,.8,.86);
  if(cA>0){
    const bw=Math.min(w*.88,640), bx=w/2-bw/2, by=cy-m*.26, fs=Math.max(15,Math.min(m*.038,30));
    ctx.globalAlpha=cA;ctx.fillStyle='rgba(30,18,56,.92)';ctx.strokeStyle=A;ctx.lineWidth=2;
    rr(ctx,bx,by,bw,fs*2.4,fs*.8);ctx.fill();ctx.stroke();
    const typed=seg(p,.93,.98), word='București';
    ctx.textAlign='left';ctx.font=`600 ${fs}px Inter,sans-serif`;ctx.fillStyle='#fff';
    const pre='Capitala României este ', tw=ctx.measureText(pre).width;
    ctx.fillText(pre,bx+fs,by+fs*1.2);
    ctx.fillStyle=A;ctx.fillText(word.slice(0,Math.round(word.length*typed))+(typed<1&&Math.floor(t/400)%2?'▍':''),bx+fs+tw,by+fs*1.2);
    const C=[['București',.87],['Cluj',.06],['Iași',.04],['Paris',.03]], bars=seg(p,.85,.92);
    const rowH=fs*1.5, lx=bx+fs, barX=bx+bw*.34, barW=bw*.5;
    ctx.font=`500 ${fs*.8}px Inter,sans-serif`;
    C.forEach(([wd,pr],i)=>{
      const y=by+fs*3.6+i*rowH, a=clamp(bars*4-i);
      ctx.globalAlpha=cA*a;ctx.fillStyle=i?'rgba(255,255,255,.7)':'#fff';ctx.textAlign='left';ctx.fillText(wd,lx,y);
      ctx.fillStyle='rgba(255,255,255,.08)';rr(ctx,barX,y-fs*.35,barW,fs*.7,fs*.35);ctx.fill();
      ctx.fillStyle=i?B:A;if(!i)glow(ctx,A,12);rr(ctx,barX,y-fs*.35,Math.max(fs*.7,barW*pr*a),fs*.7,fs*.35);ctx.fill();ctx.shadowBlur=0;
      ctx.fillStyle='#fff';ctx.textAlign='right';ctx.fillText(Math.round(pr*100)+'%',bx+bw-fs*.6,y);
    });
    ctx.globalAlpha=1;ctx.textAlign='center';
  }
};

window.TIC_SCENES=S;
})();
