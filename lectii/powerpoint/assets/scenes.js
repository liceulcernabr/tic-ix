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

/* a IX-a — Comunicare și colaborare: canalul → e-mailul formal → Cc/Bcc → documentul comun */
S.comunicare = function(ctx,w,h,p,t){
  const A=css('--accent'), B=css('--accent2');
  bg(ctx,w,h,'#0b1d3d','#030712');
  const m=Math.min(w,h), cy=h*.42, wide=w>700;
  const W=Math.min(w*.9,920), H=Math.min(h*.64,520), X=w/2-W/2, Y=cy-H/2;
  const fs=Math.max(11,Math.min(W*.03,22));
  function env(x,y,s,c){ctx.fillStyle='#f4f7fc';rr(ctx,x-s*.7,y-s*.48,s*1.4,s*.96,3);ctx.fill();ctx.strokeStyle=c||B;ctx.lineWidth=Math.max(1.5,s*.08);ctx.beginPath();ctx.moveTo(x-s*.7,y-s*.48);ctx.lineTo(x,y+s*.08);ctx.lineTo(x+s*.7,y-s*.48);ctx.stroke();}
  const EMO='"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  const typed=(s,f)=>s.slice(0,Math.round(s.length*clamp(f)));
  ctx.textBaseline='middle';
  // fundal: puncte care „vorbesc”
  for(let i=0;i<40;i++){const x=(i*137.5%100)/100*w,y=(i*61.8%100)/100*h;ctx.fillStyle=`rgba(91,157,255,${.06+.05*Math.sin(t/700+i)})`;ctx.beginPath();ctx.arc(x,y,2,0,7);ctx.fill();}

  // 1. Alegerea canalului
  const aA=1-seg(p,.24,.3);
  if(aA>0){
    const sel=ease(seg(p,.12,.2)), bs=Math.min(W*.29,230);
    const ch=[['💬','Chat','sincron · informal'],['✉️','E-mail','asincron · formal'],['🎥','Video','sincron']];
    ctx.textAlign='center';
    ctx.globalAlpha=aA*seg(p,0,.06);ctx.fillStyle='#fff';ctx.font=`600 ${fs*1.1}px Inter,sans-serif`;
    ctx.fillText('Mesaj pentru: doamna profesoară',w/2,cy-bs*.9);
    ch.forEach((c,i)=>{
      const on=i===1, sc=on?1+.08*sel:1, x=w/2+(i-1)*bs*1.1, bw=bs*sc, bh=bs*.95*sc;
      ctx.globalAlpha=aA*clamp(seg(p,0,.1)*3-i)*(on?1:1-.6*sel);
      ctx.fillStyle='#0f2347';ctx.strokeStyle=on&&sel>.3?A:'rgba(255,255,255,.18)';ctx.lineWidth=on?3:1.5;
      if(on&&sel>.3)glow(ctx,A,22);rr(ctx,x-bw/2,cy-bh/2,bw,bh,16);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
      if(on)env(x,cy-bh*.14,bw*.17,B);else{ctx.font=`${bw*.3}px ${EMO}`;ctx.fillText(c[0],x,cy-bh*.14);}
      ctx.fillStyle='#fff';ctx.font=`700 ${fs}px Inter,sans-serif`;ctx.fillText(c[1],x,cy+bh*.2);
      ctx.fillStyle=on?A:'#9aa6c7';ctx.font=`500 ${fs*.7}px Inter,sans-serif`;ctx.fillText(c[2],x,cy+bh*.36);
    });
    ctx.globalAlpha=1;
  }

  // 2. E-mailul formal se scrie
  const aB=seg(p,.27,.32)*(1-seg(p,.5,.55));
  if(aB>0){
    ctx.globalAlpha=aB;
    ctx.fillStyle='#f4f7fc';rr(ctx,X,Y,W,H,14);ctx.fill();
    ctx.fillStyle=B;rr(ctx,X,Y,W,fs*2.2,14);ctx.fill();ctx.fillRect(X,Y+fs*1.4,W,fs*.8);
    ctx.fillStyle='#fff';ctx.textAlign='left';ctx.font=`700 ${fs}px Inter,sans-serif`;ctx.fillText('Mesaj nou',X+fs,Y+fs*1.1);
    const L=[['Către','profesor.tic@liceu.ro',0],['Subiect','TIC – IX B – întrebare despre tema 3',0],
      ['Adresare','Bună ziua, doamna profesoară,',1],['Conținut','Nu am înțeles cerința 3 din tema pentru joi.',1],['','Ne puteți da un exemplu?',1],
      ['Încheiere','Vă mulțumesc,',1],['Semnătură','Ana Popescu, IX B',1]];
    const tot=L.reduce((a,l)=>a+l[1].length,0), f=seg(p,.31,.48)*tot;
    let done=0, y=Y+fs*3.6;
    const lh=Math.min(fs*1.9,(H-fs*6.5)/L.length);
    L.forEach((l,i)=>{
      const fi=(f-done)/l[1].length; done+=l[1].length;
      const tx=l[2]?X+fs:X+fs*5.4;
      if(!l[2]){ctx.fillStyle='#6b7688';ctx.font=`500 ${fs*.85}px Inter,sans-serif`;ctx.fillText(l[0]+':',X+fs,y);
        ctx.fillStyle='#1a2230';ctx.font=`${i?'700 ':''}${fs*.9}px Inter,sans-serif`;ctx.fillText(typed(l[1],fi),tx,y);
        ctx.strokeStyle='#d8dee8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X+fs,y+lh*.55);ctx.lineTo(X+W-fs,y+lh*.55);ctx.stroke();}
      else{ctx.fillStyle='#1a2230';ctx.font=`${fs*.95}px Inter,sans-serif`;ctx.fillText(typed(l[1],fi),tx,y);}
      if(fi>0&&fi<1&&Math.floor(t/400)%2){const tw=ctx.measureText(typed(l[1],fi)).width;ctx.fillStyle=B;ctx.fillRect(tx+tw+2,y-fs*.55,2,fs*1.1);}
      // eticheta structurii, în dreapta
      if(l[2]&&l[0]&&fi>0&&wide){ctx.globalAlpha=aB*clamp(fi*2);ctx.font=`600 ${fs*.7}px Inter,sans-serif`;const tw=ctx.measureText(l[0]).width+fs;
        ctx.fillStyle='rgba(58,109,240,.14)';rr(ctx,X+W-tw-fs,y-fs*.6,tw,fs*1.2,fs*.6);ctx.fill();ctx.fillStyle=B;ctx.textAlign='center';ctx.fillText(l[0],X+W-fs-tw/2,y);ctx.textAlign='left';ctx.globalAlpha=aB;}
      y+=lh+(i===1?fs*.6:0);
    });
    // butonul Trimite
    const sb=seg(p,.47,.49);ctx.fillStyle=sb>0?B:'#c5cedb';rr(ctx,X+W-fs*7,Y+H-fs*2.6,fs*6,fs*1.8,fs*.9);ctx.fill();
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font=`700 ${fs*.85}px Inter,sans-serif`;ctx.fillText('Trimite',X+W-fs*4,Y+H-fs*1.7);
    ctx.globalAlpha=1;
  }

  // 3. Cc sau Bcc
  const aC=seg(p,.52,.56)*(1-seg(p,.75,.8));
  if(aC>0){
    const bcc=p>.665, sx=X+W*.07, R=Math.max(14,m*.03), rx=X+W*.9, f=ease(seg(p,.55,.62));
    ctx.globalAlpha=aC;ctx.textAlign='center';ctx.font=`700 ${fs*1.15}px Inter,sans-serif`;
    ctx.fillStyle=bcc?'#2dd4a0':'#ff8fa3';ctx.fillText(bcc?'Bcc: fiecare vede doar adresa lui':'Cc: toți văd adresele tuturor',w/2,Y);
    ctx.fillStyle='#0f2347';ctx.strokeStyle=A;ctx.lineWidth=2;ctx.beginPath();ctx.arc(sx,cy,R*1.2,0,7);ctx.fill();ctx.stroke();
    env(sx,cy,R*.9);
    ctx.fillStyle='#9aa6c7';ctx.font=`500 ${fs*.75}px Inter,sans-serif`;ctx.fillText('diriginta',sx,cy+R*2);
    for(let i=0;i<4;i++){
      const ry=Y+H*.2+i*H*.22;
      ctx.strokeStyle=`rgba(91,157,255,${.15+.4*f})`;ctx.lineWidth=1.5;ctx.setLineDash([5,6]);ctx.beginPath();ctx.moveTo(sx+R*1.2,cy);ctx.lineTo(rx-R,ry);ctx.stroke();ctx.setLineDash([]);
      if(f>0&&f<1)env(lerp(sx,rx,f),lerp(cy,ry,f),R*.9);
      ctx.fillStyle='#0f2347';ctx.strokeStyle=f>=1?(bcc?'#2dd4a0':'#ff8fa3'):'rgba(255,255,255,.3)';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(rx,ry,R,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle='#fff';ctx.font=`700 ${fs*.8}px Inter,sans-serif`;ctx.fillText('P'+(i+1),rx,ry);
      if(f>=1){ctx.textAlign='right';ctx.font=`500 ${fs*.8}px Inter,sans-serif`;ctx.fillStyle=bcc?'#2dd4a0':'#ff8fa3';
        const all=wide?'vede: parinte1@…, parinte2@…, parinte3@…, parinte4@…':'vede toate cele 4 adrese';
        ctx.fillText(bcc?`🔒 vede doar: parinte${i+1}@…`:all,rx-R*1.6,ry);ctx.textAlign='center';}
    }
    ctx.globalAlpha=1;
  }

  // 4. Documentul comun și feedbackul
  const aD=seg(p,.78,.84);
  if(aD>0){
    const dw=wide?Math.min(W*.6,460):W, dh=H*.82, dx=wide?X:X, dy=cy-dh/2+fs*1.2;
    ctx.globalAlpha=aD;
    // drepturile de partajare
    const ps=seg(p,.9,.95);
    ctx.font=`600 ${fs*.75}px Inter,sans-serif`;let px=dx;
    ['Vizualizare','Comentarii','Editare'].forEach((s,i)=>{const tw=ctx.measureText(s).width+fs*1.4,on=i===2&&ps>0;
      ctx.fillStyle=on?A:'rgba(255,255,255,.08)';ctx.strokeStyle=on?A:'rgba(255,255,255,.2)';ctx.lineWidth=1.5;rr(ctx,px,dy-fs*2.4,tw,fs*1.6,fs*.8);ctx.fill();ctx.stroke();
      ctx.fillStyle=on?'#06122a':'#cfd8ea';ctx.textAlign='center';ctx.fillText(s,px+tw/2,dy-fs*1.6);px+=tw+fs*.5;});
    ctx.fillStyle='#f4f7fc';rr(ctx,dx,dy,dw,dh,12);ctx.fill();
    ctx.fillStyle='#1a2230';ctx.textAlign='left';ctx.font=`800 ${fs*1.1}px Inter,sans-serif`;ctx.fillText('Expoziția clasei IX B',dx+fs,dy+fs*1.5);
    const who=[['Ana','#ff9f43'],['Mihai','#2dd4a0'],['Ioana','#ff6b9a']], grow=seg(p,.8,.97);
    for(let r=0;r<7;r++){
      const ly=dy+fs*3.2+r*(dh-fs*4)/7, full=(dw-fs*2)*(.55+.4*((r*37)%10)/10), k=r%3, len=full*clamp(grow*1.6-r*.12);
      ctx.fillStyle='#c9d2e0';rr(ctx,dx+fs,ly,Math.max(0,len),fs*.5,fs*.25);ctx.fill();
      if(r>=4&&len>0&&len<full){const cx=dx+fs+len;ctx.fillStyle=who[k][1];ctx.fillRect(cx+2,ly-fs*.4,2.5,fs*1.3);
        ctx.font=`700 ${fs*.65}px Inter,sans-serif`;const tw=ctx.measureText(who[k][0]).width+fs*.6;
        rr(ctx,cx+2,ly-fs*1.5,tw,fs,fs*.3);ctx.fill();ctx.fillStyle='#fff';ctx.fillText(who[k][0],cx+2+fs*.3,ly-fs);}
    }
    // comentariul cu feedback constructiv
    const cm=seg(p,.86,.91);
    if(cm>0){
      const cw=wide?Math.min(W-dw-fs,fs*19):dw*.92, ch=fs*5, cx=wide?dx+dw+fs:dx+dw-cw-fs*.4, cyy=wide?dy+fs*2:dy+dh-ch-fs*.4;
      ctx.globalAlpha=aD*cm;ctx.fillStyle='#fff8d6';ctx.strokeStyle='#f2b705';ctx.lineWidth=2;rr(ctx,cx,cyy,cw,ch,10);ctx.fill();ctx.stroke();
      ctx.fillStyle='#6b5200';ctx.font=`700 ${fs*.75}px Inter,sans-serif`;ctx.fillText('Comentariu · Mihai',cx+fs*.7,cyy+fs);
      ctx.fillStyle='#1a2230';ctx.font=`${fs*.78}px Inter,sans-serif`;
      ['✔ Titlul e clar.','✎ Textul alb pe galben se citește greu:','➜ încearcă albastru închis.'].forEach((s,i)=>ctx.fillText(s,cx+fs*.7,cyy+fs*(2.1+i*.95)));
    }
    ctx.globalAlpha=1;
  }
  ctx.textBaseline='alphabetic';ctx.textAlign='center';
};

/* a IX-a — PowerPoint: o idee pe diapozitiv → coordonatorul → butoane de acțiune → expunerea particularizată */
S.prezentare = function(ctx,w,h,p,t){
  const A=css('--accent'), B=css('--accent2');
  bg(ctx,w,h,'#3a1408','#0d0402');
  const cy=h*.42, wide=w>700;
  const W=Math.min(w*.9,900), H=Math.min(h*.62,500), X=w/2-W/2, Y=cy-H/2;
  const fs=Math.max(11,Math.min(W*.028,21));
  const fade=(a,b,c,d)=>seg(p,a,b)*(1-seg(p,c,d));
  const F=(wt,s)=>`${wt} ${s}px Inter,sans-serif`;
  ctx.textBaseline='middle';
  function slide(x,y,sw,opt={}){
    const sh=sw*9/16;
    ctx.fillStyle=opt.bg||'#fffaf6';ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=opt.flat?0:16;rr(ctx,x,y,sw,sh,Math.max(3,sw*.02));ctx.fill();ctx.shadowBlur=0;
    if(opt.dashed){ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.5;rr(ctx,x,y,sw,sh,sw*.02);ctx.stroke();ctx.setLineDash([]);}
    if(opt.sel){ctx.strokeStyle=A;ctx.lineWidth=3;glow(ctx,A,14);rr(ctx,x,y,sw,sh,sw*.02);ctx.stroke();ctx.shadowBlur=0;}
    return sh;
  }
  function logo(x,y,r,a){ctx.save();ctx.globalAlpha*=a;ctx.fillStyle=A;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.font=F(800,r*.8);ctx.textAlign='center';ctx.fillText('PC',x,y+r*.05);ctx.restore();}

  // 1. Un diapozitiv aglomerat devine clar
  const a1=fade(-.01,0,.24,.29);
  if(a1>0){
    const sw=Math.min(W*.78,640), sx=w/2-sw/2, sy=cy-sw*9/32, cl=ease(seg(p,.1,.18));
    ctx.globalAlpha=a1;const sh=slide(sx,sy,sw);
    ctx.textAlign='left';ctx.fillStyle='#3a1408';ctx.font=F(800,cl>.5?Math.min(fs*1.5,sw*.05):Math.min(fs*.8,sw*.026));
    ctx.fillText(cl>.5?'Identitatea digitală':'Identitatea digitală – ce este, de ce contează și cum o protejăm',sx+sw*.06,sy+sh*.14);
    // zidul de text
    ctx.globalAlpha=a1*(1-cl);ctx.fillStyle='#b9a69c';
    for(let i=0;i<13;i++)for(let j=0;j<2;j++){const lw=sw*(j?.36:.5)*(.75+((i*7+j*3)%5)/16);rr(ctx,sx+sw*.06+j*sw*.52,sy+sh*.26+i*sh*.054,lw,sh*.022,2);ctx.fill();}
    // varianta clară
    ctx.globalAlpha=a1*cl;
    ['Tot ce postezi rămâne','Verifică setările','Gândește înainte de a posta'].forEach((s,i)=>{
      ctx.fillStyle=A;ctx.beginPath();ctx.arc(sx+sw*.08,sy+sh*(.38+i*.16),sw*.012,0,7);ctx.fill();
      ctx.fillStyle='#3a1408';ctx.font=F(600,Math.min(fs*1.05,sw*.035));ctx.fillText(s,sx+sw*.11,sy+sh*(.38+i*.16));});
    const ix=sx+sw*.62, iy=sy+sh*.3, iw=sw*.32, ih=sh*.55, gr=ctx.createLinearGradient(ix,iy,ix+iw,iy+ih);gr.addColorStop(0,A);gr.addColorStop(1,B);
    ctx.fillStyle=gr;rr(ctx,ix,iy,iw,ih,8);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(ix+iw*.5,iy+ih*.38,ih*.16,0,7);ctx.fill();rr(ctx,ix+iw*.25,iy+ih*.6,iw*.5,ih*.28,ih*.14);ctx.fill();
    ctx.globalAlpha=a1*seg(p,.04,.07);ctx.textAlign='center';ctx.font=F(700,fs*.9);ctx.fillStyle=cl>.5?'#5cc77c':'#ff8f7a';
    ctx.fillText(cl>.5?'✓ o idee, cuvinte-cheie, o imagine':'✗ 120 de cuvinte citite de pe ecran',w/2,sy+sh+fs*1.6);
    ctx.globalAlpha=1;
  }

  // 2. Coordonatorul de diapozitive
  const a2=fade(.25,.3,.5,.55);
  if(a2>0){
    const mw=wide?W*.48:W*.8, mx=wide?X:w/2-mw/2, my=wide?cy-mw*9/32:Y, drop=ease(seg(p,.32,.37));
    const tw=wide?W*.2:W*.28, gap=fs*.8;
    ctx.globalAlpha=a2;const mh=slide(mx,my,mw,{sel:true});
    ctx.fillStyle='#e8ddd6';rr(ctx,mx+mw*.06,my+mh*.08,mw*.6,mh*.14,4);ctx.fill();
    ctx.fillStyle='#3a1408';ctx.textAlign='left';ctx.font=F(800,fs*.85);ctx.fillText('Coordonator diapozitive',mx+mw*.08,my+mh*.15);
    ctx.fillStyle='#e8ddd6';for(let i=0;i<3;i++){rr(ctx,mx+mw*.06,my+mh*(.35+i*.14),mw*.55,mh*.06,3);ctx.fill();}
    const lr=mw*.06;logo(lerp(mx+mw*.5,mx+mw*.9,drop),lerp(my-mh*.4,my+mh*.15,drop),lr,seg(p,.3,.33));
    // miniaturile
    for(let i=0;i<6;i++){
      const c=wide?i%2:i%3, r=wide?Math.floor(i/2):Math.floor(i/3);
      const tx=wide?mx+mw+fs*2+c*(tw+gap):X+c*(tw+gap)+(W-3*tw-2*gap)/2, ty=wide?Y+r*(tw*9/16+gap)+fs:my+mh+fs*2+r*(tw*9/16+gap);
      ctx.globalAlpha=a2*seg(p,.28+i*.008,.31+i*.008);const th=slide(tx,ty,tw,{flat:true});
      ctx.fillStyle='#e8ddd6';rr(ctx,tx+tw*.08,ty+th*.12,tw*.55,th*.12,2);ctx.fill();
      for(let k=0;k<2;k++){rr(ctx,tx+tw*.08,ty+th*(.4+k*.18),tw*.5,th*.07,2);ctx.fill();}
      const got=seg(p,.38+i*.015,.4+i*.015);if(got>0)logo(tx+tw*.9,ty+th*.15,tw*.06,got);
      ctx.fillStyle='#8a7468';ctx.font=F(600,fs*.6);ctx.textAlign='left';ctx.fillText(String(i+1),tx+tw*.04,ty+th*.88);
    }
    ctx.globalAlpha=a2*seg(p,.4,.43);ctx.fillStyle='#fff';ctx.font=F(700,fs*.85);ctx.textAlign='center';
    ctx.fillText('Sigla pusă o singură dată apare pe toate diapozitivele',w/2,Y+H+fs*.6);
    ctx.globalAlpha=1;
  }

  // 3. Butoane de acțiune: navigare nelineară
  const a3=fade(.52,.56,.75,.8);
  if(a3>0){
    const sw=wide?W*.4:W*.62, s9x=wide?X:w/2-sw/2, s9y=wide?cy-sw*9/32:Y, rw=wide?W*.34:W*.46;
    const s11={x:wide?X+W-rw:X, y:wide?Y:s9y+sw*9/16+fs*4}, s12={x:wide?X+W-rw:X+W-rw, y:wide?Y+H-rw*9/16:s9y+sw*9/16+fs*4};
    ctx.globalAlpha=a3;const sh=slide(s9x,s9y,sw);
    ctx.fillStyle='#3a1408';ctx.textAlign='left';ctx.font=F(800,Math.min(fs,sw*.045));ctx.fillText('9 · Ce este un MOOC?',s9x+sw*.06,s9y+sh*.16);
    const btn=[['A','un virus'],['B','un curs online deschis']];
    const bpos=btn.map((b,i)=>({x:s9x+sw*.06,y:s9y+sh*(.42+i*.26),w:sw*.88,h:sh*.18}));
    const clickB=seg(p,.6,.62);
    btn.forEach((b,i)=>{const q=bpos[i], on=i===1&&clickB>0;
      ctx.fillStyle=on?A:'#f3e6de';rr(ctx,q.x,q.y,q.w,q.h,q.h/2);ctx.fill();
      ctx.fillStyle=on?'#fff':'#3a1408';ctx.font=F(700,Math.min(fs*.85,sw*.04));ctx.fillText(b[0]+'  '+b[1],q.x+q.h*.5,q.y+q.h/2);});
    const sr=rw;
    [[s11,'11 · Răspuns corect ✓','#2e8b47'],[s12,'12 · Mai încearcă','#c0392b']].forEach(([s,tx,c],i)=>{
      const rh=slide(s.x,s.y,sr,{dashed:true});ctx.fillStyle=c;ctx.textAlign='left';ctx.font=F(800,Math.min(fs*.9,sr*.06));ctx.fillText(tx,s.x+sr*.07,s.y+rh*.35);
      ctx.fillStyle='#8a7468';ctx.font=F(600,Math.min(fs*.65,sr*.045));ctx.fillText('diapozitiv ascuns · ↩ revenire',s.x+sr*.07,s.y+rh*.7);});
    // săgețile
    function arrow(x1,y1,x2,y2,f,c){if(f<=0)return;const x=lerp(x1,x2,f),y=lerp(y1,y2,f);ctx.strokeStyle=c;ctx.lineWidth=3;glow(ctx,c,10);
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x,y);ctx.stroke();ctx.shadowBlur=0;const an=Math.atan2(y2-y1,x2-x1);
      ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-12*Math.cos(an-.4),y-12*Math.sin(an-.4));ctx.lineTo(x-12*Math.cos(an+.4),y-12*Math.sin(an+.4));ctx.fill();}
    const bB=bpos[1], bA=bpos[0];
    arrow(wide?bB.x+bB.w:bB.x+bB.w*.3,wide?bB.y+bB.h/2:bB.y+bB.h,wide?s11.x:s11.x+sr*.5,wide?s11.y+sr*9/32:s11.y,ease(seg(p,.62,.67)),'#5cc77c');
    ctx.globalAlpha=a3*.6;arrow(wide?bA.x+bA.w:bA.x+bA.w*.8,wide?bA.y+bA.h/2:bA.y+bA.h,wide?s12.x:s12.x+sr*.5,wide?s12.y+sr*9/32:s12.y,ease(seg(p,.67,.71)),'#ff8f7a');
    ctx.globalAlpha=a3;
    // cursorul care apasă B
    if(p>.57&&p<.64){const cu=ease(seg(p,.57,.6)),px=lerp(w/2,bB.x+bB.w*.5,cu),py=lerp(cy+H*.4,bB.y+bB.h*.6,cu);
      ctx.fillStyle='#fff';ctx.strokeStyle='#000';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py+fs*1.3);ctx.lineTo(px+fs*.35,py+fs);ctx.lineTo(px+fs*.6,py+fs*1.5);ctx.lineTo(px+fs*.8,py+fs*1.4);ctx.lineTo(px+fs*.55,py+fs*.9);ctx.lineTo(px+fs*.95,py+fs*.9);ctx.closePath();ctx.fill();ctx.stroke();}
    ctx.globalAlpha=1;
  }

  // 4. Expunerea particularizată
  const a4=seg(p,.78,.84);
  if(a4>0){
    const pick=[0,2,5,7,9], n=5, gap=fs*.8, tw=(W-4*gap)/5*(wide?.7:1), big=Math.min(1.3,(W-4*gap)/(5*tw)), rows=1;
    const y0=cy-H*.38, y1=y0+2*(tw*9/16+gap)+fs*3, mv=ease(seg(p,.84,.92));
    ctx.globalAlpha=a4;ctx.fillStyle='#ffd7c7';ctx.textAlign='left';ctx.font=F(700,fs*.85);
    ctx.fillText('Prezentarea completă · 10 minute',X+(W-5*tw-4*gap)/2,y0-fs*1.2);
    for(let i=0;i<10;i++){
      const c=i%n, r=Math.floor(i/n), x=X+(W-5*tw-4*gap)/2+c*(tw+gap), y=y0+r*(tw*9/16+gap);
      const k=pick.indexOf(i), tx=X+(W-5*tw*big-4*gap)/2+k*(tw*big+gap), ty=y1;
      const fx=k<0?x:lerp(x,tx,mv), fy=k<0?y:lerp(y,ty,mv), sz=k<0?tw:lerp(tw,tw*big,mv);
      ctx.globalAlpha=a4*(k<0?1-.55*seg(p,.82,.86):1);
      const th=slide(fx,fy,sz,{flat:true,sel:k>=0&&p>.83});
      ctx.fillStyle='#e8ddd6';rr(ctx,fx+sz*.1,fy+th*.15,sz*.6,th*.14,2);ctx.fill();rr(ctx,fx+sz*.1,fy+th*.45,sz*.45,th*.08,2);ctx.fill();
      ctx.fillStyle='#3a1408';ctx.font=F(700,sz*.16);ctx.textAlign='center';ctx.fillText(String(i+1),fx+sz*.8,fy+th*.72);
    }
    ctx.globalAlpha=a4*seg(p,.9,.94);ctx.textAlign='left';ctx.fillStyle=A;ctx.font=F(800,fs);
    ctx.fillText('Părinți – 5 minute',X+(W-5*tw*big-4*gap)/2,y1-fs*1.2);
    ctx.globalAlpha=1;
  }
  ctx.textBaseline='alphabetic';ctx.textAlign='center';
};

window.TIC_SCENES=S;
})();
