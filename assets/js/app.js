/* =========================================================
   BloomVault – App JS (tabs, ribbon, catalogue, cart)
   ========================================================= */

/* ===================== PRODUCTS ===================== */
/* Tip: leave img null to show the blurred “locked” art automatically */
const PRODUCTS = [
  {
    id: 'cookie-essence',
    name: 'Cookie Essence',
    img: null, // 'assets/img/strains/cookie-essence.png'
    available: true,
    type: 'Feminized',
    flower_type: 'Photoperiod',
    packs: { 3: 10, 7: 22, 12: 45 },
    lineage: 'Chimera #3 × Animal Cookies',
    flavors: 'Cookie dough, cream, gas, earthy spice',
    notes: [
      'Blends Animal Cookies’ creamy sweetness with Chimera #3’s resin-heavy structure.',
      'Dense, cookie-shaped buds drenched in frost; bakery terps with a chem/gas finish.',
      'Excellent bag appeal and potency; thrives with topping and light defoliation.',
      '8–9 weeks indoor for peak aroma and color.'
    ].join(' ')
  },
  {
    id: 'octane-peel',
    name: 'Octane Peel',
    img: null, // 'assets/img/strains/octane-peel.png'
    available: true,
    type: 'Feminized',
    flower_type: 'Photoperiod',
    packs: { 3: 10, 7: 22, 12: 45 },
    lineage: 'Lemon Tree × AJ Sour Diesel',
    flavors: 'Citrus zest, jet fuel, diesel haze, burnt rubber',
    notes: [
      'Lemon Tree’s tangy peel collides with AJ Sour Diesel’s raw fuel funk.',
      'Vigorous plants stack thick diesel colas; room-filling lemon-fuel aroma.',
      'Tall, upright structure; stakes/trellis recommended.',
      '9–10 weeks; energetic, high-terp profile.'
    ].join(' ')
  },
  {
    id: 'detonator-cake',
    name: 'Detonator Cake',
    img: null, // 'assets/img/strains/detonator-cake.png'
    available: true,
    type: 'Feminized',
    flower_type: 'Photoperiod',
    packs: { 3: 10, 7: 22, 12: 45 },
    lineage: 'Cake n Chem × Cali Cannon',
    flavors: 'Vanilla cake, sweet dough, high-octane gas, light chem',
    notes: [
      'Creamy Cake n Chem sweetness amplified by Cali Cannon’s explosive gas.',
      'Frosted, sticky flowers with doughy undertones and a sharp chem bite.',
      'Eye-catching bag appeal; great for flower or extracts.',
      '8–9 weeks; medium height, easy to train.'
    ].join(' ')
  },
  {
    id: 'lemon-hazmat',
    name: 'Lemon HazMat',
    img: null, // 'assets/img/strains/lemon-hazmat.png'
    available: true,
    type: 'Feminized',
    flower_type: 'Photoperiod',
    packs: { 3: 10, 7: 22, 12: 45 },
    lineage: 'Roadkill Skunk × Lemon Tree',
    flavors: 'Lemon peel, skunk spray, fuel, earth, solvent zest',
    notes: [
      'A fusion of Roadkill Skunk’s old-school funk and Lemon Tree’s sharp citrus tang.',
      'Bold nose of lemon-fuel solvent with that unmistakable skunky punch.',
      'Medium–tall frame, strong branching, and heavy bud set ideal for training.',
      '9–10 week flowering; expressive phenotypes range from lemon funk to citrus diesel.'
    ].join(' ')
  }
];

window.PRODUCTS = PRODUCTS;

/* ---------- Small style injector for locked cards (blur + badge) ---------- */
(function injectLockedStyles(){
  if (document.getElementById('bv-locked-styles')) return;
  const css = `
    .card-image.locked img{filter:blur(3.5px) brightness(.8); transform:scale(1.02);}
    .card-image{position:relative; overflow:hidden;}
    .card-image .lock-overlay{
      position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
      pointer-events:none;
    }
    .card-image .lock-badge{
      background:rgba(0,0,0,.55); border:1px solid rgba(211,176,98,.55);
      color:#d3b062; padding:8px 10px; border-radius:999px; font-weight:700; font-size:12px;
      letter-spacing:.3px; display:flex; align-items:center; gap:6px; backdrop-filter:saturate(140%) blur(1px);
    }
    .card-image .lock-badge svg{width:14px;height:14px;display:block}
  `;
  const tag = document.createElement('style');
  tag.id = 'bv-locked-styles';
  tag.textContent = css;
  document.head.appendChild(tag);
})();

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

/* ---------- Bottom compliance: ensure visible if present ---------- */
(function(){
  const rib = document.querySelector('.compliance-ribbon');
  if(rib) rib.style.display = 'block';
})();

/* ======================== CART STORE ======================== */
const CART_KEY = 'bv_cart_v1';
const readCart = ()=> { try{ return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); }catch{ return []; } };
const writeCart = items => localStorage.setItem(CART_KEY, JSON.stringify(items));
const cartCount = ()=> readCart().reduce((n,i)=>n+i.qty,0);

function updateCartBubbles(){
  document.querySelectorAll('[data-cart-count]').forEach(el=> el.textContent = cartCount());
  document.querySelectorAll('[data-cart-tab-count]').forEach(el=> el.textContent = cartCount());
}

/* ===================== Helpers ===================== */
const LOCKED_STOCK = 'assets/img/locked-bud.jpg';

function isLocked(p){ return !p.img; } // locked look when no custom image yet

function flavorBucket(p){
  const f = (p.flavors || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const txt = `${f} ${name}`;
  if (/(cookie|cake|cream|vanilla|dessert|bakery)/.test(txt)) return 'desserts';
  if (/(gas|diesel|fuel|octane|rubber)/.test(txt)) return 'gas';
  if (/(skunk|funk|rks|roadkill)/.test(txt)) return 'skunk';
  if (/(chem|chemical|og)/.test(txt)) return 'chem';
  if (/(candy|fruit|berry|lemon|citrus|orange|grape)/.test(txt)) return 'candy';
  return 'classics';
}

/* ===================== Card builder ===================== */
function lockIconSVG(){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>`;
}

function buildCard(p){
  const locked = isLocked(p);
  const imgSrc = locked ? LOCKED_STOCK : p.img;
  return `
    <div class="bv-card" data-id="${p.id}">
      <div class="card-image ${locked ? 'locked' : ''}">
        <img src="${imgSrc}" alt="${p.name}">
        ${locked ? `
          <div class="lock-overlay">
            <div class="lock-badge">${lockIconSVG()} Locked Preview</div>
          </div>` : ``}
      </div>
      <div class="card-body">
        <h3 class="strain-name">${p.name}</h3>
        <div class="card-cta">
          <a class="btn" href="strain.html?id=${encodeURIComponent(p.id)}">Details</a>
          <button class="btn" type="button" data-add="${p.id}" ${p.available ? '' : 'disabled'}>
            ${p.available ? 'Add' : 'Coming Soon'}
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ===================== CATALOGUE RENDER ===================== */
function renderCatalogue(){
  // If the page declares flavor sections, fill them; else fall back to one grid
  const sectionNodes = document.querySelectorAll('[data-cat]');
  const hasSections = sectionNodes.length > 0;

  const grid = document.getElementById('catalogue-grid') || document.querySelector('[data-grid]');
  const typeSel = document.getElementById('filter-type');
  const sortSel = document.getElementById('sort-price');

  const typeVal = (typeSel?.value || '').trim();
  const sortVal = (sortSel?.value || '').trim();

  let items = PRODUCTS.filter(p => !typeVal || p.type === typeVal);

  if (sortVal === 'asc'){
    items.sort((a,b)=> (a.price??Infinity) - (b.price??Infinity));
  } else if (sortVal === 'desc'){
    items.sort((a,b)=> (b.price??-1) - (a.price??-1));
  }

  if (hasSections){
    // Clear all sections
    sectionNodes.forEach(sec => sec.innerHTML = '');
    // Place each product into its flavor bucket
    items.forEach(p=>{
      const bucket = flavorBucket(p); // desserts, gas, skunk, chem, candy, classics
      const target = document.querySelector(`[data-cat="${bucket}"]`);
      if (target) target.insertAdjacentHTML('beforeend', buildCard(p));
    });
    // Wire Add buttons inside sections
    document.querySelectorAll('[data-cat] [data-add]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const prod = PRODUCTS.find(p=> p.id === btn.getAttribute('data-add'));
        if(prod && prod.available){ openPackModal(prod); }
      });
    });
  } else if (grid){
    grid.innerHTML = items.map(buildCard).join('');
    grid.querySelectorAll('[data-add]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const prod = PRODUCTS.find(p=> p.id === btn.getAttribute('data-add'));
        if(prod && prod.available){ openPackModal(prod); }
      });
    });
  }
}
['filter-type','sort-price'].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener('change', renderCatalogue);
});
document.addEventListener('DOMContentLoaded', renderCatalogue);

/* ====================== FEATURED (Home) ===================== */
function renderFeatured(){
  const grid = document.getElementById('featured-grid');
  if(!grid) return;
  const picks = PRODUCTS.slice(0,2);
  grid.innerHTML = picks.map(buildCard).join('');
  grid.querySelectorAll('[data-add]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const prod = PRODUCTS.find(p=> p.id === btn.getAttribute('data-add'));
      if(prod && prod.available){ openPackModal(prod); }
    });
  });
}
document.addEventListener('DOMContentLoaded', renderFeatured);

/* ======================= CART STORE FUNCS ======================= */
function addToCart(item){
  const items = readCart();
  const found = items.find(i=>i.id===item.id);
  if(found){ found.qty += item.qty||1; } else { items.push({...item, qty:item.qty||1}); }
  writeCart(items);
  updateCartBubbles();
  renderCart();
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

/* ======================= CART RENDER ======================== */
function renderCart(){
  const root = document.querySelector('[data-cart-root]');
  const empty = document.querySelector('[data-cart-empty]');
  const checkoutBox = document.querySelector('[data-cart-checkout]');
  if(!root) return;

  const items = readCart();

  if(!items.length){
    root.innerHTML = '';
    if(empty) empty.style.display = 'block';
    if(checkoutBox) checkoutBox.style.display = 'none';
    document.querySelectorAll('[data-total]').forEach(el=> el.textContent = '$0.00');
    return;
  }

  if(empty) empty.style.display = 'none';
  if(checkoutBox) checkoutBox.style.display = 'block';

  root.innerHTML = items.map(i=>{
    const unit = (i.price!=null) ? `$${Number(i.price).toFixed(2)}` : '—';
    return `
      <div class="bv-card">
        <div class="top" style="align-items:flex-start">
          <div>
            <div class="bv-title" style="margin-bottom:2px">${i.name}</div>
            <div class="bv-meta">${i.pack ? `Pack: ${i.pack}` : ''}</div>
          </div>
          <button class="bv-btn" data-remove="${i.id}">Remove</button>
        </div>
        <div class="bv-actions" style="gap:14px">
          <div class="bv-meta">Unit: ${unit}</div>
          <div style="margin-left:auto; display:flex; align-items:center; gap:8px">
            <label class="bv-meta" for="qty-${i.id}">Qty</label>
            <input id="qty-${i.id}" type="number" min="1" value="${i.qty}"
                   style="width:80px;padding:8px;border-radius:10px;border:1px solid var(--line);background:#0f0f0f;color:#ddd">
          </div>
        </div>
      </div>
    `;
  }).join('');

  root.querySelectorAll('[data-remove]').forEach(b=> b.addEventListener('click',()=> removeFromCart(b.getAttribute('data-remove'))));
  items.forEach(i=>{
    const inp = document.getElementById(`qty-${i.id}`);
    if(inp) inp.addEventListener('change', ()=> updateQty(i.id, +inp.value));
  });

  const total = items.reduce((n,i)=> n + (i.price||0)*i.qty, 0);
  const t = `$${total.toFixed(2)}`;
  document.querySelectorAll('[data-total]').forEach(el=> el.textContent = t);
}
document.addEventListener('DOMContentLoaded', renderCart);

/* ===== Pack Modal ===== */
(function(){
  if (document.getElementById('pack-modal-backdrop')) return;
  const wrap = document.createElement('div');
  wrap.id = 'pack-modal-backdrop';
  wrap.innerHTML = `
    <div id="pack-modal" role="dialog" aria-modal="true">
      <h3>Select Pack Size</h3>
      <div class="muted">Choose the number of seeds for <span id="pack-prod-name"></span>.</div>
      <div class="choices">
        <button data-pack="3">3 Seeds</button>
        <button data-pack="7">7 Seeds</button>
        <button data-pack="12">12 Seeds</button>
      </div>
      <div class="row-end">
        <button class="btn" data-pack-cancel>Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  wrap.addEventListener('click', e => { if(e.target === wrap) closePackModal(); });
  wrap.querySelector('[data-pack-cancel]').addEventListener('click', closePackModal);
})();
let PACK_MODAL_PRODUCT = null;

function fmtPrice(v){ return (v==null||isNaN(v)) ? '—' : `$${Number(v).toFixed(2)}`; }

function openPackModal(prod){
  PACK_MODAL_PRODUCT = prod;
  const nameEl = document.getElementById('pack-prod-name');
  if (nameEl) nameEl.textContent = prod?.name || '';
  const modal = document.getElementById('pack-modal');
  ['3','7','12'].forEach(pk=>{
    const btn = modal.querySelector(`[data-pack="${pk}"]`);
    if(!btn) return;
    const price = prod.packs?.[pk] ?? prod.price;
    btn.textContent = `${pk} Seeds — ${fmtPrice(price)}`;
  });
  document.getElementById('pack-modal-backdrop').setAttribute('data-show','1');
}
function closePackModal(){
  document.getElementById('pack-modal-backdrop').removeAttribute('data-show');
  PACK_MODAL_PRODUCT = null;
}
document.addEventListener('click', e=>{
  const choose = e.target.closest('#pack-modal .choices [data-pack]');
  if(choose && PACK_MODAL_PRODUCT){
    const pack = +choose.getAttribute('data-pack');
    const id = `${PACK_MODAL_PRODUCT.id}-p${pack}`;
    const name = `${PACK_MODAL_PRODUCT.name} — ${pack} Seeds`;
    const price = PACK_MODAL_PRODUCT.packs?.[pack] ?? PACK_MODAL_PRODUCT.price;
    addToCart({ id, name, price, qty:1, pack });
    closePackModal();
  }
});

/* ===== Subscribe form → EmailJS ===== */
(function(){
  const form = document.getElementById('subscribe-form');
  if (!form || typeof emailjs === 'undefined') return;
  const input = document.getElementById('subscribe-email');
  const msg = document.getElementById('subscribe-msg');
  const btn = form.querySelector('button[type="submit"]');
  const SERVICE_ID = 'service_5n04n5s';
  const TEMPLATE_ID = 'template_5567czh';
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const email = (input.value||'').trim();
    if(!isEmail(email)){
      msg.textContent='Please enter a valid email address.'; msg.style.color='#f77'; return;
    }
    btn.disabled=true; btn.textContent='Sending…'; msg.textContent='';
    try{
      await emailjs.send(SERVICE_ID, TEMPLATE_ID,{
        customer_email:email,
        page_url:location.href,
        timestamp:new Date().toISOString()
      });
      msg.textContent='Thanks! You’re on the list.'; msg.style.color='';
      form.reset();
    }catch(err){
      console.error(err);
      msg.textContent='Something went wrong. Try again later.'; msg.style.color='#f77';
    }finally{
      btn.disabled=false; btn.textContent='Subscribe';
    }
  });
})();

/* ===== Order form → EmailJS ===== */
(function(){
  const form=document.getElementById('order-form');
  if(!form||typeof emailjs==='undefined') return;
  const msg=document.getElementById('order-msg');
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const name=(document.getElementById('order-name')?.value||'').trim();
    const email=(document.getElementById('order-email')?.value||'').trim();
    const address=(document.getElementById('order-address')?.value||'').trim();
    const cart=readCart();
    if(!cart.length){ msg.textContent="Your cart is empty."; msg.style.color="#f77"; return; }
    const cartReadable=cart.map(i=>`${i.name} | Pack:${i.pack||'-'} | Qty:${i.qty} | ${i.price!=null?'$'+Number(i.price).toFixed(2):'—'}`).join('\n');
    const total=cart.reduce((n,i)=>n+(i.price||0)*i.qty,0);
    try{
      await emailjs.send("service_5n04n5s","template_sujzntx",{
        customer_name:name,
        customer_email:email,
        customer_address:address,
        cart_contents:cartReadable,
        total_amount:`$${total.toFixed(2)}`,
        timestamp:new Date().toISOString(),
        from_name:name,from_email:email,to_email:"bloomvaultfarms@gmail.com"
      });
      msg.textContent="✅ Order sent! We’ll be in touch soon."; msg.style.color="";
      form.reset(); writeCart([]); renderCart(); updateCartBubbles();
    }catch(err){
      console.error(err);
      msg.textContent="❌ Something went wrong. Try again later."; msg.style.color="#f77";
    }
  });
})();
