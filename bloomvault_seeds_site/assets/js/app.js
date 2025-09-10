
// ========== Utilities ==========
const $ = (sel, ctx=document)=>ctx.querySelector(sel);
const $$ = (sel, ctx=document)=>[...ctx.querySelectorAll(sel)];
const store = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch{ return d } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)) }
}

// ========== Seed Data (placeholders) ==========
const SEEDS = [
  {id:'bv-001', name:'Chimera Cookies', category:'Cookies/Cake', type:'Feminized', availability:'Coming Soon', price:80, img:'assets/img/placeholder.svg', badges:['New','Limited'], lineage:['Chimera 3','Animal Cookies'], flavor:'sweet dough, resinous, hint of citrus', desc:'Coming soon placeholder. Detailed morphology, flowering time, and test notes will be added prior to release.'},
  {id:'bv-002', name:'Diesel Heritage', category:'Gas', type:'Regular', availability:'Coming Soon', price:70, img:'assets/img/placeholder.svg', badges:['Tester Batch'], lineage:['AJ Sour Diesel','Classic NY lineage'], flavor:'diesel, lemon peel', desc:'Coming soon placeholder text.'},
  {id:'bv-003', name:'Vault OG', category:'OG', type:'Feminized', availability:'Coming Soon', price:85, img:'assets/img/placeholder.svg', badges:['Back in Stock'], lineage:['Secret OG','Vault selection'], flavor:'pine, gas, earthy', desc:'Coming soon placeholder text.'},
  {id:'bv-004', name:'Candy Reserve', category:'Candy', type:'Feminized', availability:'Coming Soon', price:75, img:'assets/img/placeholder.svg', badges:['New'], lineage:['Z-terps','Sweet reserve'], flavor:'candy, tropical', desc:'Coming soon placeholder text.'},
  {id:'bv-005', name:'Cake n Chem', category:'Cookies/Cake', type:'Regular', availability:'Coming Soon', price:90, img:'assets/img/placeholder.svg', badges:['Limited'], lineage:['Wedding Cake','Chem'], flavor:'vanilla cake, fuel', desc:'Coming soon placeholder text.'},
  {id:'bv-006', name:'Lemon Tree Punch', category:'Candy', type:'Feminized', availability:'Coming Soon', price:80, img:'assets/img/placeholder.svg', badges:['New'], lineage:['Lemon Tree','Fruit Punch'], flavor:'lemon zest, fruit', desc:'Coming soon placeholder text.'}
];

// ========== Cart ==========
function getCart(){ return store.get('cart', []) }
function setCart(c){ store.set('cart', c); updateCartCount() }
function addToCart(itemId, qty=1){
  const cart = getCart();
  const idx = cart.findIndex(i=>i.id===itemId);
  if(idx>-1){ cart[idx].qty+=qty } else { cart.push({id:itemId, qty}) }
  setCart(cart);
}
function removeFromCart(itemId){
  setCart(getCart().filter(i=>i.id!==itemId));
}
function updateQty(itemId, qty){
  const cart = getCart().map(i=> i.id===itemId ? {...i, qty:Math.max(1, qty)} : i);
  setCart(cart);
}
function updateCartCount(){
  const count = getCart().reduce((n,i)=>n+i.qty,0);
  const el = $('#cart-count'); if(el) el.textContent = count;
}
updateCartCount();

// Render cart view
function renderCart(){
  const wrap = $('#cart-view'); if(!wrap) return;
  const items = getCart();
  const empty = $('#cart-empty');
  if(items.length===0){ wrap.innerHTML=''; if(empty) empty.style.display='block'; return; }
  if(empty) empty.style.display='none';
  let total = 0;
  wrap.innerHTML = items.map(it=>{
    const seed = SEEDS.find(s=>s.id===it.id);
    const line = seed ? `${seed.name}` : it.id;
    const price = seed ? seed.price : 0;
    total += price * it.qty;
    return `
      <div class="card flex between center-v" style="gap:12px;flex-wrap:wrap">
        <div style="display:flex;gap:12px;align-items:center">
           <img src="${seed?.img || 'assets/img/placeholder.svg'}" alt="" style="width:90px;height:70px;object-fit:cover;border-radius:8px;border:1px solid #273628">
           <div><strong>${line}</strong><div class="muted">$${price} – ${seed?.type || ''}</div></div>
        </div>
        <div>
          <input type="number" min="1" value="${it.qty}" data-id="${it.id}" class="qty-input">
          <button class="btn" data-remove="${it.id}">Remove</button>
        </div>
      </div>`
  }).join('') + `
  <div class="card"><h3>Subtotal: $${total}</h3><p class="muted">Checkout will be enabled on release. For now, this cart demonstrates full functionality.</p></div>`;

  $$('.qty-input', wrap).forEach(inp=>{
    inp.addEventListener('change', e=> updateQty(e.target.dataset.id, parseInt(e.target.value||1,10)));
  });
  $$('[data-remove]', wrap).forEach(btn=> btn.addEventListener('click', e=> removeFromCart(e.target.dataset.remove)));
}

// ========== Catalogue Rendering & Filters ==========
function badgeHtml(list){
  return `<div class="badges">` + list.map(b=>`<span class="badge ${/new|limited/i.test(b)?'gold':''}">${b}</span>`).join('') + `</div>`;
}
function cardHtml(seed){
  const disabled = seed.availability!=='Available' ? 'disabled' : '';
  return `
    <article class="strain-card">
      <div class="media" style="position:relative">
        ${seed.badges?badgeHtml(seed.badges):''}
        <a href="strain.html?id=${seed.id}"><img src="${seed.img}" class="strain-thumb" alt="${seed.name}"></a>
      </div>
      <div class="strain-body">
        <h3 class="strain-name">${seed.name}</h3>
        <div class="lineage">${seed.lineage.map(l=>`<span class="chip">${l}</span>`).join('')}</div>
        <p class="muted">${seed.desc}</p>
      </div>
      <div class="strain-actions">
        <span class="price">$${seed.price}</span>
        <button class="btn add-to-cart" data-id="${seed.id}" ${disabled}>Add to Cart</button>
        <small class="muted" style="margin-left:auto">${seed.availability}</small>
      </div>
    </article>`;
}
function renderCatalogue(list){
  const grid = $('#catalogue-grid'); if(!grid) return;
  grid.innerHTML = list.map(cardHtml).join('');
  $$('.add-to-cart', grid).forEach(btn=> btn.addEventListener('click', e=> addToCart(e.target.dataset.id)));
}
function applyFilters(){
  const cat = $('#filter-category')?.value || '';
  const typ = $('#filter-type')?.value || '';
  const av  = $('#filter-availability')?.value || '';
  const q   = ($('#search')?.value || '').toLowerCase();
  const filtered = SEEDS.filter(s=>
    (!cat || s.category===cat) &&
    (!typ || s.type===typ) &&
    (!av  || s.availability===av) &&
    (!q   || s.name.toLowerCase().includes(q) || s.lineage.join(' ').toLowerCase().includes(q))
  );
  renderCatalogue(filtered);
}

// ========== Strain Detail ==========
function renderStrain(){
  const wrap = $('#strain-detail'); if(!wrap) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const s = SEEDS.find(x=>x.id===id) || SEEDS[0];
  wrap.innerHTML = `
    <div class="grid-2">
      <div>
        <img class="hero-img" src="${s.img}" alt="${s.name}">
      </div>
      <div>
        <h1 class="page-title">${s.name}</h1>
        <p class="muted">${s.desc}</p>
        <dl class="meta">
          <dt>Lineage</dt><dd>${s.lineage.join(' × ')}</dd>
          <dt>Category</dt><dd>${s.category}</dd>
          <dt>Seed Type</dt><dd>${s.type}</dd>
          <dt>Flavor Notes</dt><dd>${s.flavor}</dd>
          <dt>Availability</dt><dd>${s.availability}</dd>
        </dl>
        <div class="strain-actions">
          <span class="price">$${s.price}</span>
          <button class="btn add-detail" ${s.availability!=='Available'?'disabled':''} data-id="${s.id}">Add to Cart</button>
        </div>
      </div>
    </div>`;
  $('.add-detail')?.addEventListener('click', e=> addToCart(e.target.dataset.id));
}

// ========== Featured on Home ==========
function renderFeatured(){
  const grid = $('#featured-grid'); if(!grid) return;
  const picks = SEEDS.slice(0,3);
  grid.innerHTML = picks.map(cardHtml).join('');
  $$('.add-to-cart', grid).forEach(btn=> btn.addEventListener('click', e=> addToCart(e.target.dataset.id)));
}

// ========== Subscribe (local only for now) ==========
$('#subscribe-form')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const email = $('#subscribe-email').value.trim();
  if(!email) return;
  const list = store.get('mailing_list', []);
  if(!list.includes(email)) list.push(email);
  store.set('mailing_list', list);
  $('#subscribe-msg').textContent = 'Subscribed locally. We'll enable email delivery later.';
  e.target.reset();
});

// ========== Filters init ==========
$('#filter-category')?.addEventListener('change', applyFilters);
$('#filter-type')?.addEventListener('change', applyFilters);
$('#filter-availability')?.addEventListener('change', applyFilters);
$('#search')?.addEventListener('input', applyFilters);

// ========== Page bootstrap ==========
document.addEventListener('DOMContentLoaded', ()=>{
  // Current year in footer
  const y = new Date().getFullYear(); const yel = document.getElementById('year'); if(yel) yel.textContent = y;

  if($('#catalogue-grid')){ renderCatalogue(SEEDS); applyFilters(); }
  if($('#strain-detail')){ renderStrain(); }
  if($('#featured-grid')){ renderFeatured(); }
  if($('#cart-view')){ renderCart(); }

  // Keep cart count updated across actions
  window.addEventListener('storage', updateCartCount);
});
