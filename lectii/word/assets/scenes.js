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

/* a IX-a — Word: codurile literelor → stiluri → cuprins automat → îmbinarea corespondenței */
S.word = function(ctx,w,h,p,t){
  const A=css('--accent'), B=css('--accent2');
  bg(ctx,w,h,'#0a2250','#030816');
  const cy=h*.42, wide=w>700;
  const W=Math.min(w*.9,900), H=Math.min(h*.62,500), X=w/2-W/2, Y=cy-H/2;
  const fs=Math.max(11,Math.min(W*.028,21));
  const fade=(a,b,c,d)=>seg(p,a,b)*(1-seg(p,c,d));
  const F=(wt,s)=>`${wt} ${s}px Inter,sans-serif`, MONO=s=>`700 ${s}px Consolas,"Cascadia Mono",monospace`;
  ctx.textBaseline='middle';
  const page=(x,y,pw,ph)=>{ctx.fillStyle='#fdfdfd';ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=18;rr(ctx,x,y,pw,ph,6);ctx.fill();ctx.shadowBlur=0;};

  // 1. Fiecare literă este un număr
  const a1=fade(-.01,0,.24,.29);
  if(a1>0){
    const rows=[['A','65','41',1],['ș','U+0219','C8 99',2],['€','U+20AC','E2 82 AC',3]];
    const rh=Math.min(H/3.6,fs*5), c0=X+W*.06, c1=X+W*(wide?.26:.28), c2=X+W*(wide?.52:.56);
    ctx.globalAlpha=a1;ctx.font=F(600,fs*.8);ctx.fillStyle='#9fb4dc';ctx.textAlign='center';
    ctx.fillText('litera',c0+fs*1.6,cy-rh*1.75);ctx.fillText('codul',c1+fs*2,cy-rh*1.75);ctx.textAlign='left';ctx.fillText('octeți în UTF-8',c2,cy-rh*1.75);
    rows.forEach((r,i)=>{
      const y=cy+(i-1)*rh, s1=seg(p,.02+i*.05,.06+i*.05), s2=seg(p,.05+i*.05,.09+i*.05), s3=seg(p,.07+i*.05,.12+i*.05);
      ctx.globalAlpha=a1*s1;ctx.fillStyle='#fff';rr(ctx,c0,y-fs*1.6,fs*3.2,fs*3.2,10);ctx.fill();
      ctx.fillStyle='#0a2250';ctx.font=F(800,fs*2);ctx.textAlign='center';ctx.fillText(r[0],c0+fs*1.6,y+fs*.1);
      ctx.globalAlpha=a1*s2;ctx.strokeStyle=A;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(c0+fs*3.6,y);ctx.lineTo(c1-fs*.4,y);ctx.stroke();
      ctx.fillStyle=A;ctx.font=MONO(fs*1.05);ctx.fillText(r[1],c1+fs*2,y);
      ctx.globalAlpha=a1*s3;const bs=fs*2.4;
      r[2].split(' ').forEach((b,j)=>{const bx=c2+j*(bs+fs*.4);ctx.fillStyle=B;glow(ctx,B,10);rr(ctx,bx,y-bs/2,bs,bs,6);ctx.fill();ctx.shadowBlur=0;
        ctx.fillStyle='#fff';ctx.font=MONO(fs*.85);ctx.fillText(b,bx+bs/2,y);});
      ctx.textAlign='left';ctx.fillStyle='#9fb4dc';ctx.font=F(600,fs*.75);ctx.fillText(r[3]+(r[3]>1?' octeți':' octet'),c2+r[3]*(bs+fs*.4)+fs*.2,y);
    });
    ctx.globalAlpha=1;
  }

  // 2. Stilurile: toate titlurile se schimbă deodată
  const a2=fade(.25,.3,.5,.55);
  if(a2>0){
    const pw=wide?W*.56:W*.92, ph=H, px=wide?X+W*.06:w/2-pw/2, py=Y, st=ease(seg(p,.36,.42)), nav=seg(p,.42,.48);
    ctx.globalAlpha=a2;page(px,py,pw,ph);
    const man=[['#c0392b',1.25,'Comic Sans MS'],['#1b8a3a',1.05,'Georgia'],['#7d3cff',1.4,'Impact']];
    const T=['Bine ai venit la liceu','Platformele școlii','Reguli în laborator'];
    let y=py+fs*2;
    T.forEach((tl,i)=>{
      const c=st>.5?'#2f5597':man[i][0], s=lerp(man[i][1],1.15,st)*fs, fnt=st>.5?'Inter,sans-serif':`"${man[i][2]}",sans-serif`;
      ctx.fillStyle=c;ctx.textAlign='left';ctx.font=`700 ${s}px ${fnt}`;ctx.fillText(tl,px+fs*1.2+(st>.5?0:i*fs*.6),y);
      if(st>.5){ctx.fillStyle='rgba(47,85,151,.12)';ctx.font=F(600,fs*.6);}
      y+=fs*1.6;
      for(let k=0;k<3;k++){ctx.fillStyle='#d5dbe6';rr(ctx,px+fs*1.2,y-fs*.2,(pw-fs*2.4)*(k===2?.6:.95),fs*.45,fs*.2);ctx.fill();y+=fs*1;}
      y+=fs*.9;
    });
    // eticheta stilului
    ctx.globalAlpha=a2*seg(p,.33,.36);ctx.fillStyle=st>.5?A:'#ff8fa3';ctx.font=F(700,fs*.85);ctx.textAlign='center';
    ctx.fillText(st>.5?'Heading 1 aplicat: același aspect peste tot':'formatat „de mână”: fiecare titlu altfel',px+pw/2,py+ph+fs*1.3);
    // panoul de navigare
    if(wide&&nav>0){const nx=px+pw+fs*1.5, nw=X+W-nx;ctx.globalAlpha=a2*nav;ctx.fillStyle='#14284f';rr(ctx,nx,py,nw,ph*.6,10);ctx.fill();
      ctx.fillStyle='#fff';ctx.textAlign='left';ctx.font=F(700,fs*.8);ctx.fillText('Panou de navigare',nx+fs*.8,py+fs*1.4);
      T.forEach((tl,i)=>{ctx.fillStyle=i?'#c9d6ef':A;ctx.font=F(500,fs*.78);ctx.fillText('▸ '+tl,nx+fs*.8,py+fs*(3+i*1.6));});}
    ctx.globalAlpha=1;
  }

  // 3. Cuprinsul automat se actualizează
  const a3=fade(.52,.56,.75,.8);
  if(a3>0){
    const pw=Math.min(W*.7,560), ph=H, px=w/2-pw/2, py=Y, sw=ease(seg(p,.65,.7)), upd=seg(p,.69,.72);
    ctx.globalAlpha=a3;page(px,py,pw,ph);
    ctx.fillStyle='#2f5597';ctx.textAlign='left';ctx.font=F(800,fs*1.3);ctx.fillText('Cuprins',px+fs*1.4,py+fs*2);
    const E=[['1. Bine ai venit la liceu',2,2],['2. Platformele școlii',3,5],['3. Reguli în laborator',5,3],['4. Cum învăț mai eficient',6,6]];
    const lh=fs*2.2, y0=py+fs*4.2;
    E.forEach((e,i)=>{
      const ap=seg(p,.56+i*.02,.6+i*.02); let slot=i; if(i===1)slot=lerp(1,2,sw); if(i===2)slot=lerp(2,1,sw);
      const y=y0+slot*lh, num=upd>.5?e[2]:e[1], name=sw>.5&&(i===1||i===2)?(i===1?'3. ':'2. ')+e[0].slice(3):e[0];
      ctx.globalAlpha=a3*ap;ctx.fillStyle='#1a2230';ctx.font=F(500,fs*.95);ctx.textAlign='left';ctx.fillText(name,px+fs*1.4,y);
      const tw=ctx.measureText(name).width;ctx.fillStyle='#9aa6b8';ctx.font=F(500,fs*.95);
      let dots='';const dw=ctx.measureText('.').width||4;for(let x=px+fs*1.8+tw;x<px+pw-fs*3.2;x+=dw*1.6)dots+='.';ctx.fillText(dots,px+fs*1.8+tw,y);
      const ch=upd>0&&e[1]!==e[2];ctx.textAlign='right';ctx.fillStyle=ch&&upd<1?A:'#1a2230';ctx.font=F(700,fs*.95);ctx.fillText(String(num),px+pw-fs*1.4,y);
    });
    ctx.globalAlpha=a3*seg(p,.69,.71)*(1-seg(p,.74,.76));ctx.fillStyle=B;rr(ctx,px+pw-fs*12,py+ph-fs*3,fs*10.6,fs*2,fs);ctx.fill();
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font=F(700,fs*.8);ctx.fillText('↻ Actualizare cuprins',px+pw-fs*6.7,py+ph-fs*2);
    ctx.globalAlpha=1;
  }

  // 4. Îmbinarea corespondenței
  const a4=seg(p,.78,.84);
  if(a4>0){
    const names=[['Doamna','Ionescu','directoare'],['Domnul','Marin','diriginte'],['Doamna','Dobre','părinte']];
    const tw=wide?W*.3:W*.92, th=wide?H*.42:H*.3, tx=wide?X:w/2-tw/2, ty=wide?Y:Y-fs;
    ctx.globalAlpha=a4;page(tx,ty,tw,th);
    ctx.textAlign='left';ctx.fillStyle='#2f5597';ctx.font=F(800,fs*.9);ctx.fillText('Invitație',tx+fs,ty+fs*1.4);
    ctx.fillStyle='#1a2230';ctx.font=F(500,fs*.8);ctx.fillText('Stimată «Titlu» «Nume»,',tx+fs,ty+fs*3);
    ctx.fillStyle='#d5dbe6';[4.3,5.3].forEach(k=>{rr(ctx,tx+fs,ty+fs*k,tw-fs*2,fs*.4,fs*.2);ctx.fill();});
    // tabelul Excel
    const ex=wide?X:tx, ey=wide?Y+th+fs*1.6:ty+th+fs*1.2, ew=tw, rh=fs*1.6;
    ctx.fillStyle='#e9f5ee';rr(ctx,ex,ey,ew,rh*4,6);ctx.fill();ctx.fillStyle='#1d6f42';ctx.fillRect(ex,ey,ew,rh);
    ctx.font=F(700,fs*.72);ctx.fillStyle='#fff';['Titlu','Nume','Funcția'].forEach((s,i)=>ctx.fillText(s,ex+fs*.5+i*ew/3,ey+rh/2));
    names.forEach((n,i)=>{const hl=seg(p,.84+i*.035,.87+i*.035)>0&&seg(p,.84+i*.035,.87+i*.035)<1;
      if(hl){ctx.fillStyle='rgba(29,111,66,.25)';ctx.fillRect(ex,ey+rh*(i+1),ew,rh);}
      ctx.fillStyle='#1a2230';ctx.font=F(500,fs*.72);n.forEach((s,j)=>ctx.fillText(s,ex+fs*.5+j*ew/3,ey+rh*(i+1.5)));});
    // invitațiile generate
    names.forEach((n,i)=>{
      const g=ease(seg(p,.84+i*.035,.9+i*.035));if(g<=0)return;
      const iw=wide?W*.2:W*.8, ih=wide?H*.34:H*.22;
      const fx=wide?X+W*.36+i*W*.215:X+W*.05+i*W*.08, fy=wide?Y+H*.2+i*fs*1.2:Y+H*.6+i*fs*3.3;
      const sx=lerp(tx+tw/2,fx+iw/2,g)-iw/2, sy=lerp(ty+th/2,fy+ih/2,g)-ih/2;
      ctx.save();ctx.translate(sx+iw/2,sy+ih/2);ctx.rotate((i-1)*(wide?.06:.02)*g);ctx.translate(-iw/2,-ih/2);
      page(0,0,iw,ih);ctx.fillStyle='#2f5597';ctx.font=F(800,fs*.8);ctx.fillText('Invitație',fs*.7,fs*1.2);
      ctx.fillStyle='#1a2230';ctx.font=F(600,Math.min(fs*.78,iw/14));ctx.fillText(`${n[0]==='Doamna'?'Stimată':'Stimate'} ${n[0]} ${n[1]},`,fs*.7,fs*2.6);
      ctx.fillStyle='#d5dbe6';rr(ctx,fs*.7,fs*3.6,iw-fs*1.4,fs*.35,fs*.15);ctx.fill();ctx.restore();
    });
    ctx.globalAlpha=1;
  }
  ctx.textBaseline='alphabetic';ctx.textAlign='center';
};

window.TIC_SCENES=S;
})();
