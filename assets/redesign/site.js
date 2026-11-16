(() => {
  const svg = document.querySelector('#research-loop');
  if (!svg) return;
  const button = document.querySelector('#motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  let paused=preference.matches, visible=true, frame=0, last=0, time=0;
  let paths=[],nodes=[],cloudDots=[];
  const cloud=Array.from({length:64},(_,i)=>{const a=i*2.39996,z=1-2*(i+.5)/64,r=Math.sqrt(1-z*z);return [r*Math.cos(a)*29,z*27,r*Math.sin(a)*29];});
  const icons=[
    `<path d="M-29-8 0-23 29-8 0 8Z M-29-8v30L0 38 29 22V-8 M0 8v30"/><path class="ghost" d="M-20-22 9-37 38-22 9-6Z"/><path d="M-19 3 19 23 M-10-2 29 18 M-29 12 10 32 M-19 27 19 7 M-29 22 10 2" opacity=".35"/><circle cx="0" cy="8" r="3" class="filled"/>`,
    `<path d="M-34 0Q0-35 34 0Q0 35-34 0Z"/><circle r="11"/><circle r="3" class="filled"/><path d="M-28-20v-9h12 M28-20v-9H16 M-28 20v9h12 M28 20v9H16" opacity=".5"/>`,
    `<path d="M-30 29H3 M-16 25-11-6 15-23 31-7 M25-11l8-5 7 7 M30-5l-3 8 7 7" stroke-width="4"/><circle cx="-11" cy="-6" r="5" class="filled"/><circle cx="15" cy="-23" r="5" class="filled"/><path d="M-31 36H15" opacity=".4"/>`
  ];
  const labels=[['4D Sandbox','Reconstruction · 3D Vision'],['Perception','Understand the scene'],['Action','Act in the physical world']];
  function build(){
    const narrow=mobile.matches,w=narrow?350:920,h=narrow?450:290;
    const positions=narrow?[[145,55],[145,205],[145,355]]:[[170,105],[460,105],[750,105]];
    let links='';
    for(let i=0;i<positions.length-1;i++){
      const [x,y]=positions[i],[nx,ny]=positions[i+1];
      const d=narrow?`M${x} ${y+89}V${ny-47}`:`M${x+52} ${y}H${nx-52}`;
      links+=`<path class="loop-track" id="loop-path-${i}" d="${d}" marker-end="url(#loop-arrow)"/>`;
    }
    const feedback=narrow?'M200 355H287Q310 355 310 332V55Q310 30 285 30H202':'M750 190V214Q750 236 728 236H192Q170 236 170 214V190';
    links+=`<path class="loop-track feedback-track" id="loop-path-2" d="${feedback}" marker-end="url(#loop-arrow)"/>`;
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const stars=Array.from({length:45},(_,i)=>`<circle cx="${(i*139+43)%w}" cy="${(i*71+13)%h}" r="${i%3===0?1.2:.6}" fill="#88c9ec" opacity="${.1+(i%4)*.07}"/>`).join('');
    svg.innerHTML=`<defs><pattern id="scene-grid" width="23" height="23" patternUnits="userSpaceOnUse"><path d="M23 0H0V23" fill="none" stroke="#8fc5e3" stroke-opacity=".045"/></pattern><radialGradient id="halo-fill"><stop stop-color="#5bd5cc" stop-opacity=".14"/><stop offset="1" stop-color="#5bd5cc" stop-opacity="0"/></radialGradient><marker id="loop-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 7 3.5 0 7" fill="none" stroke="#72baa9" stroke-width="1.3"/></marker><filter id="pulse-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3"/></filter></defs><rect width="100%" height="100%" fill="url(#scene-grid)"/><g class="scene-stars">${stars}</g>${links}`+
      positions.map(([x,y],i)=>`<g class="loop-node" transform="translate(${x} ${y})"><circle r="58" fill="url(#halo-fill)"/><circle class="node-halo" r="45"/><g class="node-orbits"><ellipse rx="49" ry="15" transform="rotate(-28)"/><ellipse rx="48" ry="17" transform="rotate(32)"/><circle r="43" class="orbit-dash"/></g><g class="loop-icon icon-${i}">${icons[i]}${i===0?'<g class="sandbox-cloud">'+cloud.map(()=>'<circle r="1" fill="#bcfff2" stroke="none"/>').join('')+'</g>':''}</g><text class="loop-title" y="58">${labels[i][0]}</text><text class="loop-subtitle" y="76">${labels[i][1]}</text></g>`).join('')+
      (narrow?`<text class="feedback-label" transform="translate(334 205) rotate(-90)">OBSERVATIONS &amp; STATE FEEDBACK</text>`:`<text class="feedback-label" x="460" y="262">OBSERVATIONS &amp; STATE FEEDBACK</text>`)+
      Array.from({length:14},(_,i)=>`<circle class="comet-tail" r="${Math.max(.5,3.3-i*.2)}" fill="#7cf3da" opacity="${.6-i*.038}"/>`).join('')+
      `<circle id="loop-pulse-glow" r="7" fill="#90f4da" filter="url(#pulse-glow)"/><circle id="loop-pulse" r="3.5" fill="#b5ffe8"/>`;
    paths=[...svg.querySelectorAll('.loop-track')];nodes=[...svg.querySelectorAll('.loop-node')];cloudDots=[...svg.querySelectorAll('.sandbox-cloud circle')];draw();
  }
  function draw(){
    if(!paths.length)return;
    const phase=(time/2.6)%paths.length,index=Math.floor(phase),progress=phase-index;
    const path=paths[index],p=path.getPointAtLength(progress*path.getTotalLength());
    for(const id of ['loop-pulse','loop-pulse-glow']){const dot=svg.querySelector('#'+id);dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);}
    nodes.forEach((node,i)=>{
      node.classList.toggle('is-active',i===index);
      node.querySelector('.node-orbits').setAttribute('transform',`rotate(${time*(i%2?9:-7)+i*24})`);
    });
    svg.querySelectorAll('.comet-tail').forEach((dot,i)=>{
      const q=path.getPointAtLength(Math.max(0,progress-(i+1)*.014)*path.getTotalLength());
      dot.setAttribute('cx',q.x);dot.setAttribute('cy',q.y);
    });
    const angle=time*.55,c=Math.cos(angle),sn=Math.sin(angle);
    cloudDots.forEach((dot,i)=>{const [x,y,z]=cloud[i],xx=x*c-z*sn,zz=x*sn+z*c;dot.setAttribute('cx',xx);dot.setAttribute('cy',y*.65+zz*.2);dot.setAttribute('opacity',.3+(zz+30)/85);});
    const arm=nodes[2].querySelector('.loop-icon');arm.setAttribute('transform',`rotate(${Math.sin(time*1.6)*4})`);
  }
  function tick(now){frame=0;if(paused||!visible||document.hidden)return;time+=Math.min((now-last)/1000,.05);last=now;draw();frame=requestAnimationFrame(tick);}
  function sync(){button.textContent=paused?'Play animation':'Pause animation';button.setAttribute('aria-pressed',String(paused));cancelAnimationFrame(frame);frame=0;draw();if(!paused&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
  button.addEventListener('click',()=>{paused=!paused;sync();});
  preference.addEventListener('change',e=>{paused=e.matches;sync();});
  mobile.addEventListener('change',build);
  document.addEventListener('visibilitychange',sync);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(svg);
  build();sync();
})();
// Load the owner's visitor counter only on their production domain, so local
// previews do not inflate real traffic. The fallback remains if loading fails.
(() => {
  const host=document.querySelector('#visitor-widget'),status=document.querySelector('#visitor-status');
  if(!host)return;
  if(!['cklibra.github.io','www.cklibra.github.io'].includes(location.hostname.toLowerCase())){
    status.textContent='Live visitor globe appears on the published website.';return;
  }
  const script=document.createElement('script');script.id='mmvst_globe';script.async=true;
  script.src='https://mapmyvisitors.com/globe.js?d=tE2xxuAZNYQuKM2_-CTjijgb9JCvd9thcHRuxdSj2vY';
  script.onerror=()=>{status.textContent='The visitor globe is temporarily unavailable.';};
  host.append(script);
  const observer=new MutationObserver(()=>{
    if(host.querySelector('.mmvst_globe,canvas,iframe,object,svg,img')){document.querySelector('.visitor-fallback').hidden=true;status.textContent='Visitor locations · MapMyVisitors';observer.disconnect();}
  });observer.observe(host,{childList:true,subtree:true});
})();
