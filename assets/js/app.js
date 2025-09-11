/* =========================================================
   BloomVault – App JS (drawer, ribbon, catalogue, cart)
   ========================================================= */

/* ---------- Active link highlight + hamburger/drawer ---------- */
(function(){
  const drawer = document.querySelector('.bv-drawer');
  const burger = document.querySelector('.bv-burger');
  const closeArea = drawer?.querySelector('[data-closearea]');

  function isSamePage(href){
    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const target = (href || '').toLowerCase();
    if (here === target) return true;
    if (here === 'index.html' && (target === '' || target === './' || target === '/')) return true;
    return false;
  }

  function markActive(){
    drawer?.querySelectorAll('a').forEach(a=>{
      const href = a.getAttribute('href');
      if (isSamePage(href)) a.classList.add('active');
    });
  }
  markActive();

  function open(){
    if(!drawer) return;
    drawer.dataset.open = '1';
    burger?.setAttribute('aria-expanded','true');
    drawer.setAttribute('aria-hidden','false');
  }
  function close(){
    if(!drawer) return;
    drawer.dataset.open = '0';
    burger?.setAttribute('aria-expanded','false');
    drawer.setAttribute('aria-hidden','true');
  }

  burger?.addEventListener('click', open);

  // NEW: click-away only via dedicated overlay (does NOT overlap the drawer)
  closeArea?.addEventListener('click', close);

  // Close when a nav link is clicked
  drawer?.querySelectorAll('a').forEach(a=> a.addEventListener('click', close));

  // Esc to close
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && drawer?.dataset.open === '1') close();
  });

  // NOTE: We intentionally removed the old global document click-away
  // listener to avoid accidental overlaps stealing link clicks.
})();

/* ---------- Compliance ribbon on scroll (after 300px) ---------- */
(function(){
  const ribbon = document.querySelector('.bv-ribbon');
  if(!ribbon) return;
  const onScroll = ()=> { ribbon.dataset.show = (window.scrollY > 300) ? '1' : '0'; };
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

/* ===================== CATALOGUE RENDER ===================== */
const PRODUCTS = Array.from({length:12}).map((_,i)=>({
  id:`bv-coming-${i+1}`,
  name:`BloomVault ${i+1}`,         // placeholder names
  category:['OG','Cookies/Cake','Candy','Gas'][i%4],
  type:(i%2===0)?'Regular':'Feminized',
  available:false,
  price:null                        // shows "—"
}));

function renderCatalogue(){
  const grid = document.querySelector('[data-grid]');
  if(!grid) return;
  const cat = document.querySelector('#filter-category')?.value || 'All';
  const typ = document.querySelector('#filter-type')?.value || 'All';
  const avail = document.querySelector('#filter-availability')?.value || 'All';
  const items = PRODUCTS.filter(p =>
    (cat==='All'||p.category===cat) &&
    (typ==='All'||p.type===typ) &&
    (avail==='All'|| (avail==='Available'? p.available : !p.available))
  );
  grid.innerHTML = items.map(p=>`
    <div class="bv-card">
      <div class="top">
        <div>
          <div class="bv-title">${p.name}</div>
          <div class="bv-meta">${p.category} • ${p.type}</div>
        </div>
        <span class="bv-pill">${p.available ? 'Available' : 'Coming&nbsp;Soon'}</span>
      </div>
      <div class="bv-coming"><span>COMING SOON.</span></div>
      <div class="bv-actions">
        <button class="bv-btn" ${p.available?'':'disabled'} data-add="${p.id}">
          ${p.available? 'Add to Cart' : 'Add Disabled'}
        </button>
        <span class="bv-meta">${p.price==null ? '—' : `$${p.price.toFixed(2)}`}</span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('[data-add]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const prod = PRODUCTS.find(p=>p.id===btn.getAttribute('data-add'));
      if(!prod || !prod.available) return;
      addToCart({ id: prod.id, name: prod.name, price: prod.price || 0 });
    });
  });
}

['filter-category','filter-type','filter-availability'].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener('change', renderCatalogue);
});
document.addEventListener('DOMContentLoaded', renderCatalogue);

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
  grid.innerHTML = picks.map(p=>`
    <div class="bv-card">
      <div class="top">
        <div>
          <div class="bv-title">${p.name}</div>
          <div class="bv-meta">${p.category} • ${p.type}</div>
        </div>
        <span class="bv-pill">Coming&nbsp;Soon</span>
      </div>
      <div class="bv-coming"><span>COMING SOON.</span></div>
      <div class="bv-actions">
        <button class="bv-btn" disabled>Add Disabled</button>
        <span class="bv-meta">—</span>
      </div>
    </div>
  `).join('');
}
document.addEventListener('DOMContentLoaded', renderFeatured);

/* ===== Seed Rain Banner ===== */
(function(){
  const banner = document.getElementById('seed-rain-banner');
  if(!banner) return;

  // Inline SVG “seed” (realistic shading; transparent background)
  const seedSVG = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 18">
      <defs>
        <radialGradient id="g1" cx="40%" cy="40%" r="70%">
          <stop offset="0%"  stop-color="#c7b08b"/>
          <stop offset="45%" stop-color="#9b835f"/>
          <stop offset="100%" stop-color="#5b4b35"/>
        </radialGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="rgba(255,255,255,.55)"/>
          <stop offset="1" stop-color="rgba(255,255,255,0)"/>
        </linearGradient>
      </defs>
      <!-- Seed body -->
      <ellipse cx="14" cy="9" rx="12" ry="7.2" fill="url(#g1)"/>
      <!-- Seam / mottling -->
      <path d="M3.5 8.7c4.5 4.8 16.2 4.8 21.0 0" fill="none" stroke="rgba(30,20,12,.35)" stroke-width="1.2" stroke-linecap="round"/>
      <!-- Specular highlight -->
      <ellipse cx="10" cy="6.2" rx="4.2" ry="2.1" fill="url(#shine)" />
    </svg>
  `);

  const SEED_COUNT = Math.min(80, Math.max(36, Math.floor(window.innerWidth / 18))); // scale with width
  const MIN_SIZE = 10;   // px (smallest seed width)
  const MAX_SIZE = 28;   // px (largest seed width)
  const MIN_DURATION = 3.8; // seconds
  const MAX_DURATION = 7.5; // seconds
  const MAX_DELAY = 6.0;    // seconds (staggered starts)

  function rand(min, max){ return Math.random() * (max - min) + min; }

  for(let i=0; i<SEED_COUNT; i++){
    const el = document.createElement('img');
    el.className = 'seed';

    // Depth layers
    if (Math.random() < 0.45) el.classList.add('small');
    if (Math.random() < 0.35) el.classList.add('blur');
    if (Math.random() < 0.60) el.classList.add('spin');

    const size = rand(MIN_SIZE, MAX_SIZE);
    el.width = size; el.height = size * 0.64; // keep proportions
    el.alt = ''; el.decoding = 'async';
    el.src = `data:image/svg+xml;charset=utf-8,${seedSVG}`;

    // Position & animation
    const x = rand(0, banner.clientWidth);
    el.style.left = `${x}px`;

    // Slight horizontal drift per lane (avoid overlap)
    const drift = (Math.random() < 0.5 ? -1 : 1) * rand(0.4, 1.2);
    el.style.animationDuration = `${rand(MIN_DURATION, MAX_DURATION)}s`;
    el.style.animationDelay = `${rand(0, MAX_DELAY)}s`;

    // Individualized keyframes with drift (per element)
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

    // When a seed finishes a cycle, re-randomize its lane for a natural distribution
    el.addEventListener('animationiteration', ()=>{
      const nx = rand(0, banner.clientWidth);
      el.style.left = `${nx}px`;
    });

    banner.appendChild(el);
  }

  // Reflow on resize so lanes match width
  let t;
  window.addEventListener('resize', ()=>{
    clearTimeout(t);
    t = setTimeout(()=>{
      document.querySelectorAll('#seed-rain-banner .seed').forEach(el=>{
        el.style.left = `${rand(0, banner.clientWidth)}px`;
      });
    }, 120);
  });

  function rand(min, max){ return Math.random() * (max - min) + min; }
})();
