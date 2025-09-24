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

/* ---------- Compliance ribbon on scroll ---------- */
(function(){
  const ribbon = document.querySelector('.bv-ribbon') || document.querySelector('.compliance-ribbon');
  if(!ribbon) return;

  const onScroll = ()=> (window.scrollY > 300 ? ribbon.setAttribute('data-show','1') : ribbon.setAttribute('data-show','0'));
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
  price:null,
  lineage:'—',
  notes:'Premium genetics are being finalized. Join the drop list to get first access when this strain goes live.'
}));

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
  const grid = document.getElementById('catalogue-grid') || document.querySelector('[data-grid]');
  if(!grid) return;

  const items = PRODUCTS;
  grid.innerHTML = items.map(placeholderCardHTML).join('');

  grid.querySelectorAll('[data-info], .bv-card.placeholder').forEach(el=>{
    el.addEventListener('click', (e)=>{
      const id = e.currentTarget.getAttribute('data-info') || e.currentTarget.getAttribute('data-id');
      const prod = PRODUCTS.find(p=>p.id===id);
      if(prod) openProductModal(prod);
    });
  });
}
document.addEventListener('DOMContentLoaded', renderCatalogue);

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
  document.getElementById('bv-modal-title').textContent = prod.name;
  document.getElementById('bv-modal-meta').textContent = `${prod.category} • ${prod.type} • ${prod.available ? 'Available' : 'Coming Soon'}`;
  document.getElementById('bv-modal-lineage').innerHTML = `<strong>Lineage:</strong> ${prod.lineage || '—'}`;
  document.getElementById('bv-modal-notes').textContent = prod.notes || '—';
  document.querySelector('.bv-modal-backdrop').setAttribute('data-show', '1');
}
function closeProductModal(){
  document.querySelector('.bv-modal-backdrop').removeAttribute('data-show');
}

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
          <input id="qty-${i.id}" type="number" min="1" value="${i.qty}">
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

/* ===== Seed Rain Banner ===== */
(function(){
  const banner = document.getElementById('seed-rain-banner');
  if(!banner) return;
  const SEED_SRC = 'assets/img/seed.png';
  const FALLBACK_ASPECT = 0.64;

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function addSeeds(aspect){
    for(let i=0;i<50;i++){
      const el=document.createElement('img');
      el.className='seed';
      el.src=SEED_SRC; el.alt='';
      el.width=20; el.height=20*aspect;
      el.style.left=rand(0,banner.clientWidth)+'px';
      el.style.animationDuration=rand(3.5,7.8)+'s';
      banner.appendChild(el);
    }
  }

  const probe=new Image();
  probe.onload=()=> addSeeds(probe.naturalHeight/probe.naturalWidth||FALLBACK_ASPECT);
  probe.onerror=()=> addSeeds(FALLBACK_ASPECT);
  probe.src=SEED_SRC;
})();

/* ===== Subscribe form → EmailJS send ===== */
(function(){
  const form = document.getElementById('subscribe-form');
  if (!form || typeof emailjs === 'undefined') return;

  const input = document.getElementById('subscribe-email');
  const msg   = document.getElementById('subscribe-msg');
  const btn   = form.querySelector('button[type="submit"]');

  const SERVICE_ID  = 'service_5n04n5s';
  const TEMPLATE_ID = 'template_5567czh';

  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = (input.value || '').trim();

    if (!isEmail(email)){
      msg.textContent = 'Please enter a valid email address.';
      msg.style.color = '#f77';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    msg.textContent = '';

    try{
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        customer_email: email,
        page_url: location.href,
        timestamp: new Date().toISOString()
      });

      msg.textContent = 'Thanks! You’re on the drop list.';
      msg.style.color = '';
      form.reset();
    }catch(err){
      console.error(err);
      msg.textContent = 'Something went wrong. Try again later.';
      msg.style.color = '#f77';
    }finally{
      btn.disabled = false;
      btn.textContent = 'Subscribe';
    }
  });
})();
