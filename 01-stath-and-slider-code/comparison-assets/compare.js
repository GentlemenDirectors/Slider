class ImageCompare extends HTMLElement {
  configure(config) {
    this.controller?.abort();
    this.resizeObserver?.disconnect();
    this.controller = new AbortController();
    const signal = this.controller.signal;
    if (!config || !Array.isArray(config.images) || ![2, 3].includes(config.images.length)) {
      this.textContent = 'Set two or three images in config.js.';
      return;
    }
    this.replaceChildren();
    this.images = config.images;
    this.angle = Math.max(-30, Math.min(30, Number(config.dividerAngle) || 0));
    this.style.aspectRatio = config.aspectRatio || '16 / 9';
    this.setAttribute('role', 'group');
    this.setAttribute('aria-label', 'Interactive image comparison');
    this.points = this.images.length === 3 ? [33.33, 66.67] : [50];
    this.layers = this.images.map((item) => {
      const layer = document.createElement('div'); layer.className = 'layer';
      const img = document.createElement('img');
      img.alt = item.alt || item.label; img.draggable = false;
      img.addEventListener('error', () => { const error = document.createElement('span'); error.className = 'image-error'; error.textContent = `Could not load ${item.label}. Check the image path in config.js.`; layer.append(error); }, {signal});
      img.src = item.src; layer.append(img); this.append(layer); return layer;
    });
    this.labels = this.images.map(item => {
      const label = document.createElement('span'); label.className = 'image-label'; label.textContent = item.label; this.append(label); return label;
    });
    this.handles = this.points.map((_, index) => {
      const handle = document.createElement('div'); handle.className = 'divider'; handle.tabIndex = 0;
      handle.setAttribute('role', 'slider'); handle.setAttribute('aria-orientation', 'horizontal');
      handle.setAttribute('aria-label', `${this.images[index].label} / ${this.images[index+1].label} divider`);
      const grip = document.createElement('span'); grip.className = 'grip'; grip.textContent = '‹ ›'; grip.setAttribute('aria-hidden','true'); handle.append(grip);
      handle.addEventListener('keydown', e => {
        const step = e.shiftKey ? 10 : 1;
        const [min,max] = this.bounds(index);
        const values = {ArrowLeft: this.points[index]-step, ArrowRight: this.points[index]+step, ArrowDown: this.points[index]-step, ArrowUp: this.points[index]+step, Home:min, End:max};
        if (e.key in values) { e.preventDefault(); this.move(index,values[e.key]); }
      }, {signal});
      this.append(handle); return handle;
    });
    let active = null, startX = 0, startPoint = 0;
    const movePointer = e => {const box = this.getBoundingClientRect(); this.move(active, startPoint + (e.clientX-startX)/box.width*100);};
    this.addEventListener('pointerdown', e => {
      if (!e.isPrimary || e.button !== 0) return;
      const box = this.getBoundingClientRect(); const x = (e.clientX-box.left)/box.width*100;
      const hit = this.handles.findIndex(h => h.contains(e.target));
      const y = (e.clientY-box.top)/box.height;
      const distances = this.points.map((p,i) => Math.abs(p + this.offset(i)*(1-2*y)-x));
      active = hit >= 0 ? hit : distances.indexOf(Math.min(...distances));
      if (hit < 0) this.move(active,x-this.offset(active)*(1-2*y));
      startX=e.clientX; startPoint=this.points[active];
      this.setPointerCapture(e.pointerId); this.handles[active].focus({preventScroll:true});
    }, {signal});
    this.addEventListener('pointermove', e => { if (active !== null && this.hasPointerCapture(e.pointerId)) movePointer(e); }, {signal});
    ['pointerup','pointercancel','lostpointercapture'].forEach(type => this.addEventListener(type, () => {active=null;}, {signal}));
    this.resizeObserver = new ResizeObserver(() => this.paint());
    this.resizeObserver.observe(this);
    this.paint();
  }
  bounds(index) { return [index===0 ? 0 : this.points[index-1]+6, index===this.points.length-1 ? 100 : this.points[index+1]-6]; }
  offset(index) {
    const box=this.getBoundingClientRect();
    const amount=box.width ? Math.tan(this.angle*Math.PI/180)*box.height/box.width*50 : 0;
    // Ease the slant to vertical at the edges, allowing a complete reveal.
    return Math.sign(amount)*Math.min(Math.abs(amount),this.points[index],100-this.points[index]);
  }
  move(index,value) {const [min,max]=this.bounds(index); this.points[index]=Math.max(min,Math.min(max,value)); this.paint();}
  reset() {this.points = this.images.length===3 ? [33.33,66.67] : [50]; this.paint();}
  paint() {
    const top = [0,...this.points.map((p,i)=>p+this.offset(i)),100];
    const bottom = [0,...this.points.map((p,i)=>p-this.offset(i)),100];
    const edges = bottom;
    this.layers.forEach((layer,i) => {layer.style.clipPath=`polygon(${top[i]}% 0, ${top[i+1]}% 0, ${bottom[i+1]}% 100%, ${bottom[i]}% 100%)`;});
    this.labels.forEach((label,i) => {label.style.left=`${(edges[i]+edges[i+1])/2}%`; label.style.maxWidth=`calc(${edges[i+1]-edges[i]}% - 12px)`; label.style.visibility=edges[i+1]-edges[i]<9 ? 'hidden' : 'visible';});
    this.handles.forEach((handle,i) => {
      handle.style.left=`${this.points[i]}%`;
      const box=this.getBoundingClientRect();
      const skew=box.height ? Math.atan(-2*this.offset(i)/100*box.width/box.height)*180/Math.PI : 0;
      handle.style.transform=`translateX(-50%) skewX(${skew}deg)`;
      handle.querySelector('.grip').style.transform=`translate(-50%,-50%) skewX(${-skew}deg)`;
      const [min,max]=this.bounds(i);
      handle.setAttribute('aria-valuemin',min.toFixed(2)); handle.setAttribute('aria-valuemax',max.toFixed(2));
      handle.setAttribute('aria-valuenow',this.points[i].toFixed(2)); handle.setAttribute('aria-valuetext',`${Math.round(this.points[i])}% from the left`);
    });
  }
  disconnectedCallback() {this.controller?.abort(); this.resizeObserver?.disconnect();}
}
customElements.define('image-compare',ImageCompare);
