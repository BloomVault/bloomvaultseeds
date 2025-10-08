/* =========================================================
   BloomVault – App JS (tabs, ribbon, catalogue, cart)
   ========================================================= */

/* ===================== PRODUCTS ===================== */
const PRODUCTS = [
  {
    id: 'cookie-essence',
    name: 'Cookie Essence',
    img: 'assets/img/strains/cookie-essence.png', // make sure this file exists
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
    img: 'assets/img/strains/octane-peel.png',
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
    img: 'assets/img/strains/detonator-cake.png',
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
    img: 'assets/img/strains/lemon-hazmat.png',
    available: true,
    type: 'Feminized',
    flower_type: 'Photoperiod',
    packs: { 3: 10, 7: 22, 12: 45 },
    lineage: 'Lemon Tree × Hazmat OG',
    flavors: 'Sharp lemon, industrial gas, pine, sour diesel',
    notes: [
      'Cuts Lemon Tree’s bright citrus with Hazmat OG’s heavy chem/fuel.',
      'Stacks speared, diesel-glazed colas with a loud lemon-solvent nose.',
      'Medium–tall with strong apical growth; responds well to topping and SCROG.',
      '9–10 weeks; dial for expression between lemon-candy and chemical pine.'
    ].join(' ')
  }
];

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
  return `
    <div class="bv-card" data-id="${p.id}">
      <div class="card-image">
        ${hasImg ? `<img src="${p.img}" alt="${p.name}">` : `<div class="coming-soon">COMING SOON</div>`}
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
  const picks = PRODUCTS.slice(0,2);  // 2 featured cards
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
    // reset totals
    document.querySelectorAll('[data-total]').forEach(el=> el.textContent = '$0.00');
    return;
  }

  if(empty) empty.style.display = 'none';
  if(checkoutBox) checkoutBox.style.display = 'block';

  // Clean item layout: title, pack, unit + qty (no per-item "Line: $")
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

  // wire up actions
  root.querySelectorAll('[data-remove]').forEach(b=> b.addEventListener('click',()=> removeFromCart(b.getAttribute('data-remove'))));
  items.forEach(i=>{
    const inp = document.getElementById(`qty-${i.id}`);
    if(inp) inp.addEventListener('change', ()=> updateQty(i.id, +inp.value));
  });

  // update all totals (there may be more than one [data-total] on the page)
  const total = items.reduce((n,i)=> n + (i.price||0)*i.qty, 0);
  const t = `$${total.toFixed(2)}`;
  document.querySelectorAll('[data-total]').forEach(el=> el.textContent = t);
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

/* ===== Order form → EmailJS send ===== */
(function(){
  const form = document.getElementById('order-form');
  if (!form || typeof emailjs === 'undefined') return;

  const msg = document.getElementById('order-msg');

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();

    const name    = (document.getElementById('order-name')   ?.value || '').trim();
    const email   = (document.getElementById('order-email')  ?.value || '').trim();
    const address = (document.getElementById('order-address')?.value || '').trim();
    const cart    = readCart();

    if(!cart.length){
      msg.textContent = "Your cart is empty.";
      msg.style.color = "#f77";
      return;
    }

    // Human-readable + JSON cart summaries
    const cartReadable = cart.map(i =>
      `${i.name}  |  Pack: ${i.pack || '-'}  |  Qty: ${i.qty}  |  ${i.price != null ? '$'+Number(i.price).toFixed(2) : '—'}`
    ).join('\n');

    const total = cart.reduce((n,i)=> n + (i.price || 0) * i.qty, 0);

    try{
      await emailjs.send("service_5n04n5s", "template_sujzntx", {
        // Preferred fields
        customer_name: name,
        customer_email: email,
        customer_address: address,
        cart_contents: cartReadable,
        total_amount: `$${total.toFixed(2)}`,
        timestamp: new Date().toISOString(),

        // Legacy compatibility (if your template still references these)
        from_name: name,
        from_email: email,
        phone: "",
        street: address,
        city: "", state: "", zip: "",
        notes: "",
        cart_readable: cartReadable,
        cart_json: JSON.stringify(cart, null, 2),
        submitted_at: new Date().toLocaleString(),
        submit_ms: 0,

        // Delivery helpers
        to_email: "bloomvaultfarms@gmail.com",
        reply_to: email
      });

      msg.textContent = "✅ Order sent! We’ll be in touch soon.";
      msg.style.color = "";
      form.reset();
      writeCart([]); // clear cart
      renderCart();
      updateCartBubbles();
    }catch(err){
      console.error(err);
      msg.textContent = "❌ Something went wrong. Try again later.";
      msg.style.color = "#f77";
    }
  });
})();

// === Ensure compliance ribbon only appears once and in footer ===
(function(){
  const ribbonHTML = `
    <div class="compliance-ribbon" style="margin-top:10px">
      Seeds are sold as novelty/souvenir genetics. Buyer is responsible for compliance with local laws. 21+ only.
    </div>`;
  const footer = document.querySelector('footer.site-footer');
  const existing = document.querySelector('.compliance-ribbon');

  if (!footer) return;

  // If there's a ribbon already somewhere else, remove it.
  if (existing && existing.parentElement !== footer) existing.remove();

  // Ensure it's appended to the footer if missing
  if (!footer.querySelector('.compliance-ribbon')) {
    footer.insertAdjacentHTML('beforeend', ribbonHTML);
  }
})();
