const viewer = document.querySelector('image-compare');
const source = window.COMPARISON;
let count = source.images.length;
const previews = source.images.map(item => ({...item}));
const urls = new Map();
const notice = document.querySelector('#notice');
function render() {
  viewer.configure({...source, images:previews.slice(0,count)});
  document.querySelectorAll('[data-count]').forEach(button => {button.setAttribute('aria-pressed',Number(button.dataset.count)===count); button.disabled=Number(button.dataset.count)>previews.length;});
  document.querySelectorAll('.upload').forEach((label,i) => {label.hidden=i>=count;});
}
document.querySelectorAll('[data-count]').forEach(button => button.addEventListener('click', () => {count=Number(button.dataset.count); render();}));
document.querySelector('#reset').addEventListener('click',()=>viewer.reset());
previews.forEach((item,i) => {
  const label=document.createElement('label'); label.className='upload'; label.textContent=`${i+1} · ${item.label}`;
  const input=document.createElement('input'); input.type='file'; input.accept='image/png,image/jpeg,image/webp,image/avif';
  input.addEventListener('change',()=>{
    const file=input.files[0]; if(!file)return;
    const url=URL.createObjectURL(file); const check=new Image();
    check.onload=()=>{if(urls.has(i))URL.revokeObjectURL(urls.get(i)); urls.set(i,url); previews[i].src=url; render(); notice.textContent=`Previewing ${file.name} (${check.width} × ${check.height}). Update config.js to save your published setup.`;};
    check.onerror=()=>{URL.revokeObjectURL(url); notice.textContent='That image could not be opened. Try PNG, JPG or WebP.';}; check.src=url;
  });
  label.append(input); document.querySelector('#uploads').append(label);
});
render();
