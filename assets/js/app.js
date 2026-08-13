/* BloomVault site app */
const PRODUCTS = [
  {
    id: 'citrus-society',
    name: 'Citrus Society',
    img: 'assets/img/strains/citrus-society.webp',
    available: true,
    type: 'Regular',
    flower_type: 'Photoperiod',
    packs: { 3: 10, 7: 22, 12: 45 },
    lineage: 'Lemon Tree × Triangle Kush',
    flavors: 'Bright lemon peel, citrus candy, kush, earth and fuel',
    notes: 'A collision of Lemon Tree’s sharp, sweet citrus character with the old-school Florida kush influence of Triangle Kush. Expect vigorous photoperiod plants with a citrus-forward profile backed by earthy kush, fuel and spice. This is a new BloomVault breeding release and phenotype expression can vary across a regular seed population.'
  },
  {
    id: 'cookie-essence', name: 'Cookie Essence', img: null, available: false,
    type: 'Feminized', flower_type: 'Photoperiod', packs: { 3: 10, 7: 22, 12: 45 },
    lineage: 'Chimera #3 × Animal Cookies', flavors: 'Cookie dough, cream, gas, earthy spice', notes: 'Locked preview.'
  },
  {
    id: 'octane-peel', name: 'Octane Peel', img: null, available: false,
    type: 'Feminized', flower_type: 'Photoperiod', packs: { 3: 10, 7: 22, 12: 45 },
    lineage: 'Lemon Tree × AJ Sour Diesel', flavors: 'Citrus zest, jet fuel, diesel haze, burnt rubber', notes: 'Locked preview.'
  },
  {
    id: 'detonator-cake', name: 'Detonator Cake', img: null, available: false,
    type: 'Feminized', flower_type: 'Photoperiod', packs: { 3: 10, 7: 22, 12: 45 },
    lineage: 'Cake n Chem × Cali Cannon', flavors: 'Vanilla cake, sweet dough, high-octane gas, light chem', notes: 'Locked preview.'
  },
  {
    id: 'lemon-hazmat', name: 'Lemon HazMat', img: null, available: false,
    type: 'Feminized', flower_type: 'Photoperiod', packs: { 3: 10, 7: 22, 12: 45 },
    lineage: 'Roadkill Skunk × Lemon Tree', flavors: 'Lemon peel, skunk spray, fuel, earth, solvent zest', notes: 'Locked preview.'
  }
];
window.PRODUCTS = PRODUCTS;

const CART_KEY = 'bv_cart_v1';
const LOCKED_STOCK = 'assets/img/locked-bud.jpg';
const readCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } };
const writeCart = items => localStorage.setItem(CART_KEY, JSON.stringify(items));
const cartCount = () => readCart().reduce((n, i) => n + i.qty, 0);

function updateCartBubbles(){
  document.querySelectorAll('[data-cart-count],[data-cart-tab-count]').forEach(el => el.textContent = cartCount());
}
function isLocked(p){ return !p.img; }
function flavorBucket(p){
  const txt = `${p.flavors || ''} ${p.name || ''}`.toLowerCase();
  if (/(cookie|cake|cream|vanilla|dessert|bakery)/.test(txt)) return 'desserts';
  if (/(gas|diesel|fuel|octane|rubber)/.test(txt)) return 'gas';
  if (/(skunk|funk|rks|roadkill)/.test(txt)) return 'skunk';
  if (/(chem|chemical|og)/.test(txt)) return 'chem';
  if (/(candy|fruit|berry|lemon|citrus|orange|grape)/.test(txt)) return 'candy';
  return 'classics';
}
function buildCard(p){
  const locked = isLocked(p);
  return `<article class="bv-card ${locked ? 'locked' : ''}" data-id="${p.id}">
    <div class="card-image"><img src="${locked ? LOCKED_STOCK : p.img}" alt="${p.name}" loading="lazy"></div>
    <div class="card-body">
      <h3 class="strain-name">${locked ? 'Locked' : p.name}</h3>
      ${locked ? '' : `<div class="muted" style="margin:-2px 0 10px">${p.lineage} · ${p.type}</div>`}
      <div class="card-cta">
        ${locked ? '<span class="btn" aria-disabled="true">Details</span>' : `<a class="btn" href="strain.html?id=${encodeURIComponent(p.id)}">Details</a>`}
        <button class="btn" type="button" data-add="${p.id}" ${p.available && !locked ? '' : 'disabled'}>${p.available && !locked ? 'Add' : 'Coming Soon'}</button>
      </div>
    </div>
  </article>`;
}
function wireAddButtons(root=document){
  root.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => {
    const p = PRODUCTS.find(x => x.id === btn.dataset.add);
    if (p?.available && p.img) openPackModal(p);
  }));
}
function renderCatalogue(){
  const sections = document.querySelectorAll('[data-cat]');
  if (!sections.length) return;
  sections.forEach(s => s.innerHTML = '');
  const type = document.getElementById('filter-type')?.value || '';
  let items = PRODUCTS.filter(p => !type || p.flower_type === type || p.type === type);
  const sort = document.getElementById('sort-price')?.value || '';
  const lowPrice = p => Math.min(...Object.values(p.packs || {0:p.price || 0}));
  if (sort === 'asc') items.sort((a,b) => lowPrice(a)-lowPrice(b));
  if (sort === 'desc') items.sort((a,b) => lowPrice(b)-lowPrice(a));
  items.forEach(p => {
    const target = document.querySelector(`[data-cat="${flavorBucket(p)}"]`);
    if (target) target.insertAdjacentHTML('beforeend', buildCard(p));
  });
  wireAddButtons(document);
}
function renderFeatured(){
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  grid.innerHTML = PRODUCTS.filter(p => p.available && p.img).slice(0,2).map(buildCard).join('');
  wireAddButtons(grid);
}
function addToCart(item){
  const items = readCart();
  const found = items.find(i => i.id === item.id);
  if (found) found.qty += item.qty || 1; else items.push({...item, qty:item.qty || 1});
  writeCart(items); updateCartBubbles(); renderCart();
}
function removeFromCart(id){ writeCart(readCart().filter(i => i.id !== id)); updateCartBubbles(); renderCart(); }
function updateQty(id, qty){
  const items = readCart(); const item = items.find(i => i.id === id);
  if (item){ item.qty = Math.max(1, qty|0); writeCart(items); updateCartBubbles(); renderCart(); }
}
function renderCart(){
  const root = document.querySelector('[data-cart-root]');
  if (!root) return;
  const items = readCart();
  const empty = document.querySelector('[data-cart-empty]');
  const checkout = document.querySelector('[data-cart-checkout]');
  if (!items.length){ root.innerHTML=''; if(empty) empty.style.display='block'; if(checkout) checkout.style.display='none'; document.querySelectorAll('[data-total]').forEach(e=>e.textContent='$0.00'); return; }
  if(empty) empty.style.display='none'; if(checkout) checkout.style.display='block';
  root.innerHTML = items.map(i => `<div class="bv-card"><div class="top"><div><div class="bv-title">${i.name}</div><div class="bv-meta">Pack: ${i.pack} seeds</div></div><button class="bv-btn" data-remove="${i.id}">Remove</button></div><div class="bv-actions"><div class="bv-meta">Unit: $${Number(i.price).toFixed(2)}</div><div style="margin-left:auto"><label class="bv-meta">Qty <input data-qty="${i.id}" type="number" min="1" value="${i.qty}" style="width:70px"></label></div></div></div>`).join('');
  root.querySelectorAll('[data-remove]').forEach(b => b.onclick = () => removeFromCart(b.dataset.remove));
  root.querySelectorAll('[data-qty]').forEach(i => i.onchange = () => updateQty(i.dataset.qty, +i.value));
  const total = items.reduce((n,i)=>n+(i.price||0)*i.qty,0);
  document.querySelectorAll('[data-total]').forEach(e=>e.textContent=`$${total.toFixed(2)}`);
}

let PACK_MODAL_PRODUCT = null;
function ensurePackModal(){
  if (document.getElementById('pack-modal-backdrop')) return;
  const wrap=document.createElement('div'); wrap.id='pack-modal-backdrop';
  wrap.innerHTML=`<div id="pack-modal" role="dialog" aria-modal="true"><h3>Select Pack Size</h3><div class="muted">Choose a pack for <span id="pack-prod-name"></span>.</div><div class="choices"><button data-pack="3"></button><button data-pack="7"></button><button data-pack="12"></button></div><div class="row-end"><button class="btn" data-pack-cancel>Cancel</button></div></div>`;
  document.body.appendChild(wrap);
  wrap.onclick=e=>{ if(e.target===wrap) closePackModal(); };
  wrap.querySelector('[data-pack-cancel]').onclick=closePackModal;
  wrap.querySelectorAll('[data-pack]').forEach(btn=>btn.onclick=()=>{
    if(!PACK_MODAL_PRODUCT) return;
    const pack=+btn.dataset.pack, price=PACK_MODAL_PRODUCT.packs?.[pack] ?? PACK_MODAL_PRODUCT.price;
    addToCart({id:`${PACK_MODAL_PRODUCT.id}-p${pack}`,name:PACK_MODAL_PRODUCT.name,price,pack,qty:1});
    closePackModal();
  });
}
function openPackModal(prod){
  ensurePackModal(); PACK_MODAL_PRODUCT=prod;
  document.getElementById('pack-prod-name').textContent=prod.name;
  document.querySelectorAll('#pack-modal [data-pack]').forEach(btn=>{ const pk=btn.dataset.pack; btn.textContent=`${pk} Seeds — $${Number(prod.packs?.[pk] ?? prod.price).toFixed(2)}`; });
  document.getElementById('pack-modal-backdrop').setAttribute('data-show','1');
}
function closePackModal(){ document.getElementById('pack-modal-backdrop')?.removeAttribute('data-show'); PACK_MODAL_PRODUCT=null; }
window.openPackModal=openPackModal;

function setupSubscribe(){
  const form=document.getElementById('subscribe-form'); if(!form || typeof emailjs==='undefined') return;
  form.addEventListener('submit',async e=>{ e.preventDefault(); const email=(document.getElementById('subscribe-email')?.value||'').trim(); const msg=document.getElementById('subscribe-msg'); if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){msg.textContent='Please enter a valid email address.';return;} try{await emailjs.send('service_5n04n5s','template_5567czh',{customer_email:email,page_url:location.href,timestamp:new Date().toISOString()});msg.textContent='Thanks! You’re on the list.';form.reset();}catch{msg.textContent='Something went wrong. Try again later.';} });
}
function setupOrder(){
  const form=document.getElementById('order-form'); if(!form || typeof emailjs==='undefined') return;
  form.addEventListener('submit',async e=>{ e.preventDefault(); const cart=readCart(), msg=document.getElementById('order-msg'); if(!cart.length){msg.textContent='Your cart is empty.';return;} const total=cart.reduce((n,i)=>n+(i.price||0)*i.qty,0); try{await emailjs.send('service_5n04n5s','template_sujzntx',{customer_name:document.getElementById('order-name')?.value||'',customer_email:document.getElementById('order-email')?.value||'',customer_address:document.getElementById('order-address')?.value||'',cart_contents:cart.map(i=>`${i.name} | ${i.pack} seeds | Qty:${i.qty} | $${Number(i.price).toFixed(2)}`).join('\n'),total_amount:`$${total.toFixed(2)}`,timestamp:new Date().toISOString(),to_email:'bloomvaultfarms@gmail.com'});msg.textContent='Order sent! We’ll be in touch soon.';form.reset();writeCart([]);renderCart();updateCartBubbles();}catch{msg.textContent='Something went wrong. Try again later.';} });
}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.bv-tabs a').forEach(a=>{const here=(location.pathname.split('/').pop()||'index.html').toLowerCase();if((a.getAttribute('href')||'').toLowerCase()===here)a.classList.add('active');});
  document.querySelectorAll('[data-cart-count],[data-cart-tab-count]').forEach(()=>updateCartBubbles());
  ['filter-type','sort-price'].forEach(id=>document.getElementById(id)?.addEventListener('change',renderCatalogue));
  renderCatalogue(); renderFeatured(); renderCart(); ensurePackModal(); setupSubscribe(); setupOrder();
  const year=document.getElementById('year'); if(year) year.textContent=new Date().getFullYear();
});