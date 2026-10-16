// Track the last heading that has reached the reading line near the viewport top.
let tocEntries = [];
function refreshToc(){
 const links=document.querySelector('.toc-links');
 const content=document.querySelector('.post-content');
 if(!links || !content)return;
 const headings=[...content.querySelectorAll('h1,h2,h3,h4,h5,h6')];
 links.replaceChildren();
 headings.forEach((heading,index)=>{
  if(!heading.id)heading.id='section-'+index;
  const link=document.createElement('a');
  link.className='toc-level-'+heading.tagName.slice(1);
  link.href='#'+encodeURIComponent(heading.id);
  link.textContent=heading.textContent;
  links.append(link);
 });
 tocEntries=[...links.querySelectorAll('a')].map(link=>({link,heading:document.getElementById(decodeURIComponent(link.hash.slice(1)))})).filter(entry=>entry.heading);
 activeTocLink=null;
 if(headings.length)document.querySelector('.toc-locked')?.remove();
 scheduleToc();
}
let activeTocLink = null;
let tocFrame = 0;
function updateToc() {
 tocFrame = 0;
 let current = null;
 for(const entry of tocEntries) {
  if(entry.heading.getBoundingClientRect().top <= 100)current=entry;
  else break;
 }
 const link=current?.link || null;
 if(link===activeTocLink)return;
 activeTocLink?.removeAttribute('aria-current');
 link?.setAttribute('aria-current','location');
 activeTocLink=link;
 if(link){
  const toc=link.closest('.toc');
  if(getComputedStyle(toc).position==='sticky'){
   const rect=link.getBoundingClientRect(),bounds=toc.getBoundingClientRect();
   if(rect.top<bounds.top || rect.bottom>bounds.bottom)toc.scrollTop+=rect.top-bounds.top-toc.clientHeight/2;
  }
 }
}
function scheduleToc(){if(!tocFrame)tocFrame=requestAnimationFrame(updateToc)}
if(document.querySelector('.toc')){
 refreshToc();
 window.addEventListener('hexo-blog-decrypt',refreshToc);
 window.addEventListener('scroll',scheduleToc,{passive:true});
 window.addEventListener('resize',scheduleToc);
 window.addEventListener('hashchange',scheduleToc);
 window.addEventListener('load',scheduleToc);
 document.querySelectorAll('.prose img').forEach(img=>img.addEventListener('load',scheduleToc));
 if(window.ResizeObserver)new ResizeObserver(scheduleToc).observe(document.querySelector('.article-layout'));
 scheduleToc();
}

document.querySelector('#search')?.addEventListener('input',event=>{
 let count=0;
 const query=event.target.value.trim().toLocaleLowerCase();
 document.querySelectorAll('.post-row').forEach(row=>{
  row.hidden=!row.textContent.toLocaleLowerCase().includes(query);
  if(!row.hidden)count++;
 });
 document.querySelector('#empty').hidden=count>0;
});

document.addEventListener('click', async event => {
 const button=event.target.closest('.copy-code');
 if(!button)return;
 const block=button.closest('.code-block');
 const text=block.querySelector('code').textContent;
 const status=block.querySelector('.copy-status');
 button.disabled=true;
 try {
  if(navigator.clipboard && window.isSecureContext)await navigator.clipboard.writeText(text);
  else {
   const input=document.createElement('textarea');
   input.value=text;input.style.cssText='position:fixed;left:-9999px;top:0';
   document.body.append(input);input.select();
   let success;try{success=document.execCommand('copy')}finally{input.remove();button.focus()}
   if(!success)throw new Error('Copy unavailable');
  }
  button.textContent='已复制';status.textContent='代码已复制';
 } catch {
  button.textContent='重试';status.textContent='复制失败，请选中代码后手动复制。';
 } finally {
  button.disabled=false;
  clearTimeout(button.resetTimer);
  button.resetTimer=setTimeout(()=>{button.textContent='复制';status.textContent=''},2500);
 }
});
