// Keep visitor reporting independent of the decorative research animation.
(() => {
 const host=document.querySelector('#visitor-widget'),status=document.querySelector('#visitor-status');
 if(!host||!status)return;
 if(!['cklibra.github.io','www.cklibra.github.io'].includes(location.hostname.toLowerCase())){
  status.textContent='Live visitor statistics appear on the published website.';return;
 }
 const fallback=document.querySelector('.visitor-fallback');
 const observer=new MutationObserver(()=>{
  const counter=host.querySelector('.mapmyvisitors-visitors');
  if(counter&&/\d/.test(counter.textContent)){
   if(fallback)fallback.hidden=true;
   status.textContent='Visitor statistics · MapMyVisitors';
   clearTimeout(timeout);observer.disconnect();
  }
 });
 observer.observe(host,{childList:true,subtree:true,characterData:true});
 const timeout=setTimeout(()=>{
  status.textContent='Visitor statistics are taking longer to load. Please check your network or tracking protection.';
 },20000);
 const script=document.createElement('script');script.id='mapmyvisitors';script.async=true;
 script.src='https://mapmyvisitors.com/map.js?d=ciJk2tNIOy4QbDJj9y32mjLo8mgkJ-X2xf-oBdEyXeM&cl=ffffff&w=a';
 script.onerror=()=>{clearTimeout(timeout);observer.disconnect();status.textContent='Visitor statistics could not load. Please check your network or tracking protection.';};
 host.append(script);
})();
