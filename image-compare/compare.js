class ImageCompare extends HTMLElement {
  configure(config) {
    this.controller?.abort();
    this.controller = new AbortController();
    const signal = this.controller.signal;
    if (!config || !Array.isArray(config.images) || ![2, 3].includes(config.images.length)) {
      this.textContent = 'Set two or three images in config.js.';
      return;
    }
    this.replaceChildren();
    this.images = config.images;
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
    let active = null;
    const movePointer = e => {const box = this.getBoundingClientRect(); this.move(active, (e.clientX-box.left)/box.width*100);};
    this.addEventListener('pointerdown', e => {
      if (!e.isPrimary || e.button !== 0) return;
      const box = this.getBoundingClientRect(); const x = (e.clientX-box.left)/box.width*100;
      const hit = this.handles.findIndex(h => h.contains(e.target));
      active = hit >= 0 ? hit : this.points.reduce((best, p, i) => Math.abs(p-x)<Math.abs(this.points[best]-x) ? i : best, 0);
      this.setPointerCapture(e.pointerId); this.handles[active].focus({preventScroll:true}); movePointer(e);
    }, {signal});
    this.addEventListener('pointermove', e => { if (active !== null && this.hasPointerCapture(e.pointerId)) movePointer(e); }, {signal});
    ['pointerup','pointercancel','lostpointercapture'].forEach(type => this.addEventListener(type, () => {active=null;}, {signal}));
    this.paint();
  }
  bounds(index) { return [index===0 ? 0 : this.points[index-1]+4, index===this.points.length-1 ? 100 : this.points[index+1]-4]; }
  move(index,value) {const [min,max]=this.bounds(index); this.points[index]=Math.max(min,Math.min(max,value)); this.paint();}
  reset() {this.points = this.images.length===3 ? [33.33,66.67] : [50]; this.paint();}
  paint() {
    const edges = [0,...this.points,100];
    this.layers.forEach((layer,i) => {layer.style.clipPath=`inset(0 ${100-edges[i+1]}% 0 ${edges[i]}%)`;});
    this.labels.forEach((label,i) => {label.style.left=`${(edges[i]+edges[i+1])/2}%`; label.style.maxWidth=`calc(${edges[i+1]-edges[i]}% - 12px)`; label.style.visibility=edges[i+1]-edges[i]<9 ? 'hidden' : 'visible';});
    this.handles.forEach((handle,i) => {
      handle.style.left=`${this.points[i]}%`;
      const [min,max]=this.bounds(i);
      handle.setAttribute('aria-valuemin',min.toFixed(2)); handle.setAttribute('aria-valuemax',max.toFixed(2));
      handle.setAttribute('aria-valuenow',this.points[i].toFixed(2)); handle.setAttribute('aria-valuetext',`${Math.round(this.points[i])}% from the left`);
    });
  }
  disconnectedCallback() {this.controller?.abort();}
}
customElements.define('image-compare',ImageCompare);
