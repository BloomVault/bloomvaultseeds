/* ===== Active link highlight + hamburger ===== */
(function(){
  const drawer = document.querySelector('.bv-drawer');
  const burger = document.querySelector('.bv-burger');
  const closeArea = drawer?.querySelector('[data-closearea]');

  function markActive(){
    const here = location.pathname.split('/').pop() || 'index.html';
    drawer?.querySelectorAll('a').forEach(a=>{
      const href = a.getAttribute('href');
      if (href === here) a.classList.add('active');
    });
  }
  markActive();

  function open(){ if(drawer) drawer.dataset.open = '1'; }
  function close(){ if(drawer) drawer.dataset.open = '0'; }

  burger?.addEventListener('click', open);
  closeArea?.addEventListener('click', close);
  drawer?.querySelectorAll('a').forEach(a=> a.addEventListener('click', close));
})();

/* ===== Compliance ribbon on scroll (after 300px) ===== */
(function(){
  const ribbon = document.querySelector('.bv-ribbon');
  if(!ribbon) return;
  const onScroll = ()=> ribbon.dataset.show = (window.scrollY > 300) ? '1' : '0';
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
})();

/* ===== Cart store ===== */
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
function updateQty(id, qty){ const it = readCart().find(i=>i.id===id); if(it){ it.qty = Math.max(1, qty|0); writeCart(readCart()); renderCart(); } }

document.addEventListener('DOMContentLoaded', updateCartBubbles);

/* ===== Catalogue: 12 Coming Soon placeholders ===== */
const PRODUCTS = Array.from({length:12}).map((_,i)=>({
  id:`bv-coming-${i+1}`,
  name:`BloomVault ${i+1}`,         // kept your text
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

/* ===== Cart rendering (sticky bar + empty + continue) ===== */
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

/* action buttons on cart */
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
