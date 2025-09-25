/* =========================================================
   BloomVault – App JS (tabs, ribbon, catalogue, cart)
   ========================================================= */

/* ===================== PRODUCTS ===================== */
const PRODUCTS = Array.from({length: 12}).map((_, i) => ({
  id: `bv-coming-${i+1}`,
  name: `BloomVault Drop ${String(i+1).padStart(2, '0')}`,
  category: ['OG','Cookies/Cake','Candy','Gas'][i % 4],   // not shown on cards anymore
  type: (i % 2 === 0) ? 'Regular' : 'Feminized',
  available: false,                 // flip to true when ready
  img: null,                        // set to "assets/img/mystrain.jpg" when you have images
  price: null,                      // null shows "—"
  lineage: '—',
  flavors: '—',
  flower_type: '—',                 // e.g., Photoperiod / Auto
  notes: 'Premium genetics are being finalized. Join the drop list to get first access when this strain goes live.'
}));

/* === Replace first placeholder with: Chimera #3 × Animal Cookies (+ pack prices) === */
Object.assign(PRODUCTS[0], {
  id: 'chimera3-animal-cookies',
  name: 'Chimera #3 × Animal Cookies',
  img: 'assets/img/strains/chimera-cookies.png',
  available: true,            // shows the Add (pack) button
  type: 'Feminized',          // adjust if you prefer Regular
  price: null,                // keep card showing “—”; pack prices used on add
  lineage: 'Chimera #3 × Animal Cookies',
  flavors: 'Sweet dough, vanilla, cocoa, berry, light gas',
  flower_type: 'Photoperiod',
  notes: [
    'Cookies-forward nose: warm bakery dough with vanilla-cocoa; berry top notes; subtle fuel.',
    'Dense, resin-heavy flowers with classic Cookies structure; medium internodes.',
    'Medium stretch; responds well to topping, LST, and SCROG.',
    '8–9 week indoor finish typical for Cookies-heavy hybrids (dial by phenotype).',
    'Balanced vigor; quality-first selection aimed at bag appeal and terp intensity.'
  ].join(' '),
  // ✅ pack-specific pricing
  packs: { 3: 10, 7: 22, 12: 45 }
});

/* Expose to other pages (strain.html) */
window.PRODUCTS = PRODUCTS;

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

/* Update both the old bubble (if present) and the Cart tab badge (always) */
function updateCartBubbles(){
  document.querySelectorAll('[data-cart-count]').forEach(el=> el.textContent = cartCount());
  document.querySelectorAll('[data-cart-tab-count]').forEach(el=> el.textContent = cartCount());
}

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

/* ===================== Card builder ===================== */
function buildCard(p){
  const hasImg = !!p.img;
  const priceText = (p.price == null) ? '—' : `$${Number(p.price).toFixed(2)}`;
  return `
    <div class="bv-card" data-id="${p.id}">
      <div class="card-image">
        ${hasImg ? `<img src="${p.img}" alt="${p.name}">` : `<div class="coming-soon">COMING SOON</div>`}
      </div>
      <div class="card-body">
        <h3 class="strain-name">${p.name}</h3>
        <div class="ph-sub" style="margin:4px 0 8px">Price: ${priceText}</div>
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

/* ===================== CATALOGUE RENDER (Seed Type + Price sort) ===================== */
function renderCatalogue(){
  const grid = document.getElementById('catalogue-grid') || document.querySelector('[data-grid]');
  if(!grid) return;

  const typeSel = document.getElementById('filter-type'); // "" | Feminized | Regular
  const sortSel = document.getElementById('sort-price');  // "" | asc | desc

  const typeVal = (typeSel?.value || '').trim();
  const sortVal = (sortSel?.value || '').trim();

  let items = PRODUCTS.filter(p => !typeVal || p.type === typeVal);

  if (sortVal === 'asc'){
    items.sort((a,b)=>{
      const pa = (a.price==null ? Infinity : +a.price);
      const pb = (b.price==null ? Infinity : +b.price);
      return pa - pb;
    });
  } else if (sortVal === 'desc'){
    items.sort((a,b)=>{
      const pa = (a.price==null ? -1 : +a.price);
      const pb = (b.price==null ? -1 : +b.price);
      return pb - pa;
    });
  }

  grid.innerHTML = items.map(buildCard).join('');

  grid.querySelectorAll('[data-add]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const prod = PRODUCTS.find(p=> p.id === btn.getAttribute('data-add'));
      if(prod && prod.available){
        openPackModal(prod);
      }
    });
  });
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
      if(prod && prod.available){
        openPackModal(prod);
      }
    });
  });
}
document.addEventListener('DOMContentLoaded', renderFeatured);

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
    return;
  }

  if(empty) empty.style.display = 'none';
  if(checkoutBox) checkoutBox.style.display = 'block';

  root.innerHTML = items.map(i=>`
    <div class="bv-card">
      <div class="top">
        <div>
          <div class="bv-title">${i.name}</div>
          <div class="bv-meta">ID: ${i.id}${i.pack ? ` • Pack: ${i.pack}` : ''}</div>
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
document.addEventListener('DOMContentLoaded', renderCart);

/* ===== Pack size chooser modal ===== */
(function(){
  if (document.getElementById('pack-modal-backdrop')) return;
  const wrap = document.createElement('div');
  wrap.id = 'pack-modal-backdrop';
  wrap.innerHTML = `
    <div id="pack-modal" role="dialog" aria-modal="true" aria-hidden="true">
      <h3>Select Pack Size</h3>
      <div class="muted">Choose the number of seeds for <span id="pack-prod-name"></span>.</div>
      <div class="choices">
        <button data-pack="3">3 Seeds</button>
        <button data-pack="7">7 Seeds</button>
        <button data-pack="12">12 Seeds</button>
      </div>
      <div class="row-end">
        <button class="btn" type="button" data-pack-cancel>Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  wrap.addEventListener('click', e => { if(e.target === wrap) closePackModal(); });
  wrap.querySelector('[data-pack-cancel]')?.addEventListener('click', closePackModal);
})();

let PACK_MODAL_PRODUCT = null;

function fmtPrice(v){
  if (v == null || isNaN(v)) return '—';
  return `$${Number(v).toFixed(2)}`;
}

function openPackModal(prod){
  PACK_MODAL_PRODUCT = prod;

  // Update title
  const nameEl = document.getElementById('pack-prod-name');
  if(nameEl) nameEl.textContent = prod?.name || '';

  // Update button labels to show prices if defined
  const modal = document.getElementById('pack-modal');
  if (modal && prod){
    ['3','7','12'].forEach(pk=>{
      const btn = modal.querySelector(`[data-pack="${pk}"]`);
      if(!btn) return;
      const priceForPack = prod.packs?.[pk] ?? prod.price;
      // e.g., "3 Seeds — $10.00" (falls back to "—" if null)
      btn.textContent = `${pk} Seeds — ${fmtPrice(priceForPack)}`;
    });
  }

  const bd = document.getElementById('pack-modal-backdrop');
  if(bd){ bd.setAttribute('data-show','1'); }
}
function closePackModal(){
  const bd = document.getElementById('pack-modal-backdrop');
  if(bd){ bd.removeAttribute('data-show'); }
  PACK_MODAL_PRODUCT = null;
}

/* Hook into pack choices */
document.addEventListener('click', (e)=>{
  const addBtn = e.target.closest('[data-add]');
  if(addBtn){
    const prod = PRODUCTS.find(p=> p.id === addBtn.getAttribute('data-add'));
    if(prod && prod.available){
      openPackModal(prod);
    }
  }

  const choose = e.target.closest('#pack-modal .choices [data-pack]');
  if(choose && PACK_MODAL_PRODUCT){
    const pack = +choose.getAttribute('data-pack');
    const variantId = `${PACK_MODAL_PRODUCT.id}-p${pack}`;
    const displayName = `${PACK_MODAL_PRODUCT.name} — ${pack} Seeds`;

    // ✅ Price comes from packs[pack]; falls back to product price if needed
    const priceForPack = (PACK_MODAL_PRODUCT.packs && PACK_MODAL_PRODUCT.packs[pack]) != null
      ? PACK_MODAL_PRODUCT.packs[pack]
      : PACK_MODAL_PRODUCT.price;

    addToCart({
      id: variantId,
      name: displayName,
      price: priceForPack ?? null,
      qty: 1,
      pack
    });

    closePackModal();
  }
});

/* ===== Seed Rain Banner (unchanged) ===== */
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
