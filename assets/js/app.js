/* =========================================================
   BloomVault – App JS (tabs, ribbon, catalogue, cart)
   ========================================================= */

/* ---------- Active link highlight (tabs-only) ---------- */
(function(){
  function isSamePage(href){
    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const target = (href || '').toLowerCase();
    if (here === target) return true;
    if (here === 'index.html' && (target === '' || target === './' || target === '/')) return true;
    return false;
  }
  document.querySelectorAll('.bv-tabs a')?.forEach(a=>{
    const href = a.getAttribute('href');
    if (isSamePage(href)) a.classList.add('active');
  });
})();

/* ---------- Compliance ribbon on scroll (supports old/new class) ---------- */
(function(){
  const ribbon = document.querySelector('.bv-ribbon') || document.querySelector('.compliance-ribbon');
  if(!ribbon) return;

  const show = ()=> {
    if ('show' in ribbon.dataset) ribbon.dataset.show = '1';
    ribbon.style.display = 'block';
  };
  const hide = ()=> {
    if ('show' in ribbon.dataset) ribbon.dataset.show = '0';
    ribbon.style.display = 'none';
  };

  const onScroll = ()=> (window.scrollY > 300 ? show() : hide());
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
})();

/* ======================== CART STORE ======================== */
const CART_KEY = 'bv_cart_v1';
const readCart = ()=> { try{ return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); }catch{ return []; } };
const writeCart = items => localStorage.setItem(CART_KEY, JSON.stringify(items));
const cartCount = ()=> readCart().reduce((n,i)=>n+i.qty,0);
const updateCartBubbles = ()=> document.querySelectorAll('[data-cart-count]').forEach(el=> el.textContent = cartCount());

function addToCart(item){
  const items = readCart();
  const found = items.find(i=>i.id===item.id);
  if(found){ found.qty += item.qty||1; } else { items.push({...item, qty:item.qty||1}); }
  writeCart(items); updateCartBubbles(); renderCart();
}
function removeFromCart(id){ writeCart(readCart().filter(i=>i.id!==id)); updateCartBubbles(); renderCart(); }
function updateQty(id, qty){
  const items = readCart();
  const it = items.find(i=>i.id===id);
  if(it){
    it.qty = Math.max(1, qty|0);
    writeCart(items);
    renderCart();
    updateCartBubbles();
  }
}

document.addEventListener('DOMContentLoaded', updateCartBubbles);

/* ===================== PRODUCT PLACEHOLDERS ===================== */
const PRODUCTS = Array.from({length:12}).map((_,i)=>({
  id:`bv-coming-${i+1}`,
  name:`BloomVault Drop ${String(i+1).padStart(2,'0')}`,
  category:['OG','Cookies/Cake','Candy','Gas'][i%4],
  type:(i%2===0)?'Regular':'Feminized',
  available:false,
  price:null,           // shows "—"
  lineage:'—',
  notes:'Premium genetics are being finalized. Join the drop list to get first access when this strain goes live.'
}));

/* Card template: playing-card style with text underneath */
function placeholderCardHTML(p){
  return `
    <div class="bv-card placeholder" data-id="${p.id}">
      <div class="ph-card-visual" data-info="${p.id}">
        <span class="ph-pill">COMING&nbsp;SOON</span>
        <div class="ph-mark">BV</div>
      </div>
      <div class="ph-body">
        <div class="ph-name">${p.name}</div>
        <div class="ph-sub">${p.category} • ${p.type}</div>
        <div class="ph-actions">
          <button class="btn" type="button" data-info="${p.id}">View Details</button>
        </div>
      </div>
    </div>
  `;
}

/* ===================== CATALOGUE RENDER ===================== */
function renderCatalogue(){
  // Prefer #catalogue-grid (your HTML), fallback to [data-grid] if present
  const grid = document.getElementById('catalogue-grid') || document.querySelector('[data-grid]');
  if(!grid) return;

  const cat = document.querySelector('#filter-category')?.value || 'All';
  const typ = document.querySelector('#filter-type')?.value || 'All';
  const avail = document.querySelector('#filter-availability')?.value || 'All';

  const items = PRODUCTS.filter(p =>
    (cat==='All'||p.category===cat) &&
    (typ==='All'||p.type===typ) &&
    (avail==='All'|| (avail==='Available'? p.available : !p.available))
  );

  grid.innerHTML = items.map(placeholderCardHTML).join('');

  // Open modal when clicking the card face or the "View Details" button
  grid.querySelectorAll('[data-info], .bv-card.placeholder').forEach(el=>{
    el.addEventListener('click', (e)=>{
      const id = e.currentTarget.getAttribute('data-info') || e.currentTarget.getAttribute('data-id');
      const prod = PRODUCTS.find(p=>p.id===id);
      if(prod) openProductModal(prod);
    });
  });
}
document.addEventListener('DOMContentLoaded', renderCatalogue);
['filter-category','filter-type','filter-availability'].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener('change', renderCatalogue);
});

/* ======================= CART RENDER ======================== */
function renderCart(){
  const root = document.querySelector('[data-cart-root]');
  if(!root) return;
  const items = readCart();

  if(!items.length){
    root.innerHTML = `<p>Your cart is empty. Visit the <a class="bv-link" href="catalogue.html">Seed Catalogue</a> to add items.</p>`;
    document.querySelector('[data-total]')?.replaceChildren(document.createTextNode('$0.00'));
    return;
  }

  root.innerHTML = items.map(i=>`
    <div class="bv-card">
      <div class="top">
        <div>
          <div class="bv-title">${i.name}</div>
          <div class="bv-meta">ID: ${i.id}</div>
        </div>
        <button class="bv-btn" data-remove="${i.id}">Remove</button>
      </div>
      <div class="bv-actions">
        <div class="bv-meta">Price: ${i.price!=null? `$${i.price.toFixed(2)}` : '—'}</div>
        <div style="margin-left:auto; display:flex; align-items:center; gap:6px">
          <label class="bv-meta" for="qty-${i.id}">Qty</label>
          <input id="qty-${i.id}" type="number" min="1" value="${i.qty}" style="width:74px;padding:8px;border-radius:10px;border:1px solid var(--line);background:#0f0f0f;color:#ddd">
        </div>
      </div>
    </div>
  `).join('');

  root.querySelectorAll('[data-remove]').forEach(b=> b.addEventListener('click',()=> removeFromCart(b.getAttribute('data-remove'))));
  items.forEach(i=>{
    const inp = document.getElementById(`qty-${i.id}`);
    if(inp) inp.addEventListener('change', ()=> updateQty(i.id, +inp.value));
  });

  const total = items.reduce((n,i)=> n + (i.price||0)*i.qty, 0);
  document.querySelector('[data-total]')?.replaceChildren(document.createTextNode(`$${total.toFixed(2)}`));
}

/* Cart action buttons */
document.addEventListener('click', (e)=>{
  const empty = e.target.closest('[data-empty]');
  if(empty){ e.preventDefault(); writeCart([]); updateCartBubbles(); renderCart(); }

  const shop = e.target.closest('[data-continue]');
  if(shop){ e.preventDefault(); location.href = 'catalogue.html'; }

  const checkout = e.target.closest('[data-checkout]');
  if(checkout){
    e.preventDefault();
    const items = readCart();
    if(!items.length) return;
    const body = encodeURIComponent(
      `Hi BloomVault,\n\nI’d like to purchase the following:\n\n` +
      items.map(i=>`• ${i.name} x${i.qty} — ${i.price!=null? `$${(i.price*i.qty).toFixed(2)}` : '—'}`).join('\n') +
      `\n\nTotal: $${items.reduce((n,i)=>n+(i.price||0)*i.qty,0).toFixed(2)}\n\nName:\nShipping address:\n\nThanks!`
    );
    location.href = `mailto:bloomvaultfarms@gmail.com?subject=BloomVault Order&body=${body}`;
  }
});

/* ====================== FEATURED (Home) ===================== */
function renderFeatured(){
  const grid = document.getElementById('featured-grid');
  if(!grid) return;
  const picks = PRODUCTS.slice(0,3);
  grid.innerHTML = picks.map(placeholderCardHTML).join('');

  grid.querySelectorAll('[data-info], .bv-card.placeholder').forEach(el=>{
    el.addEventListener('click', (e)=>{
      const id = e.currentTarget.getAttribute('data-info') || e.currentTarget.getAttribute('data-id');
      const prod = PRODUCTS.find(p=>p.id===id);
      if(prod) openProductModal(prod);
    });
  });
}
document.addEventListener('DOMContentLoaded', renderFeatured);

/* ======================= PRODUCT MODAL ======================= */
(function ensureModalMount(){
  if(document.getElementById('bv-modal-root')) return;
  const root = document.createElement('div');
  root.id = 'bv-modal-root';
  root.innerHTML = `
    <div class="bv-modal-backdrop" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="bv-modal" role="document">
        <h3 id="bv-modal-title">Strain Name</h3>
        <div class="meta" id="bv-modal-meta"></div>
        <p id="bv-modal-lineage"><strong>Lineage:</strong> —</p>
        <p id="bv-modal-notes"></p>
        <div class="actions">
          <button class="btn-close" type="button" data-close>Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  root.querySelector('[data-close]')?.addEventListener('click', closeProductModal);
  root.querySelector('.bv-modal-backdrop')?.addEventListener('click', (e)=>{
    if(e.target.classList.contains('bv-modal-backdrop')) closeProductModal();
  });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeProductModal(); });
})();

function openProductModal(prod){
  const backdrop = document.querySelector('.bv-modal-backdrop');
  if(!backdrop) return;

  document.getElementById('bv-modal-title').textContent = prod.name;
  document.getElementById('bv-modal-meta').textContent = `${prod.category} • ${prod.type} • ${prod.available ? 'Available' : 'Coming Soon'}`;
  document.getElementById('bv-modal-lineage').innerHTML = `<strong>Lineage:</strong> ${prod.lineage || '—'}`;
  document.getElementById('bv-modal-notes').textContent = prod.notes || '—';

  backdrop.setAttribute('data-show', '1');
  backdrop.setAttribute('aria-hidden','false');
}

function closeProductModal(){
  const backdrop = document.querySelector('.bv-modal-backdrop');
  if(!backdrop) return;
  backdrop.removeAttribute('data-show');
  backdrop.setAttribute('aria-hidden','true');
}

/* ===== Seed Rain Banner (custom image with fallback) ===== */
(function(){
  const banner = document.getElementById('seed-rain-banner');
  if(!banner) return;

  const SEED_SRC = 'assets/img/seed.png';
  const FALLBACK_ASPECT = 0.64;

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function addSeeds({src, aspect}){
    const SEED_COUNT   = Math.min(99, Math.max(50, Math.floor(window.innerWidth / 18)));
    const MIN_SIZE     = 10;
    const MAX_SIZE     = 30;
    const MIN_DURATION = 3.5;
    const MAX_DURATION = 7.8;
    const MAX_DELAY    = 6.0;

    for(let i=0; i<SEED_COUNT; i++){
      const el = document.createElement('img');
      el.className = 'seed';
      if (Math.random() < 0.45) el.classList.add('small');
      if (Math.random() < 0.35) el.classList.add('blur');
      if (Math.random() < 0.60) el.classList.add('spin');

      const size = rand(MIN_SIZE, MAX_SIZE);
      el.width  = Math.round(size);
      el.height = Math.round(size * aspect);
      el.alt = '';
      el.decoding = 'async';
      el.src = src;

      const x = rand(0, banner.clientWidth);
      el.style.left = `${x}px`;

      const drift = (Math.random() < 0.5 ? -1 : 1) * rand(0.4, 1.2);
      el.style.animationDuration = `${rand(MIN_DURATION, MAX_DURATION)}s`;
      el.style.animationDelay = `${rand(0, MAX_DELAY)}s`;

      const driftName = `fall-${i}`;
      const style = document.createElement('style');
      style.textContent = `
        @keyframes ${driftName}{
          0%   { transform: translateY(-20px) translateX(0); }
          100% { transform: translateY(${banner.clientHeight + 20}px) translateX(${drift * 18}px); }
        }
      `;
      document.head.appendChild(style);
      el.style.animationName = el.classList.contains('spin') ? `${driftName}, seed-spin` : driftName;

      el.addEventListener('animationiteration', ()=>{
        el.style.left = `${rand(0, banner.clientWidth)}px`;
      });

      banner.appendChild(el);
    }
  }

  const probe = new Image();
  probe.onload = ()=>{
    const aspect = probe.naturalHeight && probe.naturalWidth
      ? (probe.naturalHeight / probe.naturalWidth)
      : FALLBACK_ASPECT;
    addSeeds({ src: SEED_SRC, aspect });
  };
  probe.onerror = ()=>{
    console.warn('Seed sprite failed to load, using fallback.');
    addSeeds({ src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 18"><ellipse cx="14" cy="9" rx="12" ry="7.2" fill="#9b835f"/></svg>')}`, aspect: FALLBACK_ASPECT });
  };
  probe.src = SEED_SRC;

  let t;
  window.addEventListener('resize', ()=>{
    clearTimeout(t);
    t = setTimeout(()=>{
      document.querySelectorAll('#seed-rain-banner .seed').forEach(el=>{
        el.style.left = `${rand(0, banner.clientWidth)}px`;
      });
    }, 120);
  });
})();
