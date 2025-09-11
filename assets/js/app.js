
const $=(s,c=document)=>c.querySelector(s);const $$=(s,c=document)=>[...c.querySelectorAll(s)];
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){localStorage.setItem(k,JSON.stringify(v))}};

// Build 12 placeholder strains
const SEEDS = Array.from({length:12}).map((_,i)=>({
  id:`bv-${String(i+1).padStart(3,'0')}`,
  name:`BloomVault ${i+1}`,
  category:['OG','Cookies/Cake','Candy','Gas'][i%4],
  type: (i%2===0)?'Feminized':'Regular',
  availability:'Coming Soon',
  price: 0,
  img:'assets/img/placeholder.svg',
  badges:['Coming Soon'],
  lineage:['Coming Soon.'],
  flavor:'Coming Soon.',
  desc:'Coming Soon.'
}));

// Cart
function getCart(){return store.get('cart',[])}
function setCart(c){store.set('cart',c);updateCartCount()}
function addToCart(id,qty=1){
  const s = SEEDS.find(x=>x.id===id);
  if(s && s.availability!=='Available'){ alert('This item is Coming Soon.'); return; }
  const c=getCart();const idx=c.findIndex(x=>x.id===id);
  if(idx>-1){c[idx].qty+=qty}else{c.push({id,qty})} setCart(c);
}
function removeFromCart(id){setCart(getCart().filter(i=>i.id!==id))}
function updateQty(id,qty){setCart(getCart().map(i=>i.id===id?{...i,qty:Math.max(1,qty)}:i))}
function updateCartCount(){const el=$('#cart-count');if(!el)return;el.textContent=getCart().reduce((n,i)=>n+i.qty,0)};updateCartCount();

function renderCart(){
  const wrap=$('#cart-view');if(!wrap)return;
  const items=getCart();const empty=$('#cart-empty');
  if(items.length===0){wrap.innerHTML=''; if(empty) empty.style.display='block'; return;}
  if(empty) empty.style.display='none';
  let total=0;
  wrap.innerHTML=items.map(it=>{
    const s=SEEDS.find(x=>x.id===it.id);
    const price = s ? s.price : 0; total += price*it.qty;
    return `<div class="card flex between center-v" style="gap:12px;flex-wrap:wrap">
      <div style="display:flex;gap:12px;align-items:center">
        <img src="${s?.img||'assets/img/placeholder.svg'}" style="width:90px;height:70px;object-fit:cover;border-radius:8px;border:1px solid #242424">
        <div><strong>${s?s.name:it.id}</strong><div class="muted">$${price} – ${s?.type||''}</div></div>
      </div>
      <div>
        <input type="number" min="1" value="${it.qty}" data-id="${it.id}" class="qty-input">
        <button class="btn" data-remove="${it.id}">Remove</button>
      </div>
    </div>`
  }).join('')+`<div class="card"><h3>Subtotal: $${total}</h3><p class="muted">Checkout enables when products are Available.</p></div>`;
  $$('.qty-input',wrap).forEach(inp=>inp.addEventListener('change',e=>updateQty(e.target.dataset.id,parseInt(e.target.value||1,10))));
  $$('[data-remove]',wrap).forEach(btn=>btn.addEventListener('click',e=>removeFromCart(e.target.dataset.remove)));
}

// Filters & Catalogue
function badgeHtml(list){return `<div class="badges">`+list.map(b=>`<span class="badge ${/new|limited/i.test(b)?'gold':''}">${b}</span>`).join('')+`</div>`}
function cardHtml(s){
  const dis = s.availability!=='Available' ? 'disabled' : '';
  return `<article class="strain-card">
    <div class="media" style="position:relative">
      ${s.badges?badgeHtml(s.badges):''}
      <a href="strain.html?id=${s.id}"><img src="${s.img}" class="strain-thumb" alt="${s.name}"></a>
    </div>
    <div class="strain-body">
      <h3 class="strain-name">${s.name}</h3>
      <div class="lineage">${s.lineage.map(l=>`<span class="chip">${l}</span>`).join('')}</div>
      <p class="muted">${s.desc}</p>
    </div>
    <div class="strain-actions">
      <span class="price">$${s.price}</span>
      <button class="btn add-to-cart" data-id="${s.id}" ${dis}>Add to Cart</button>
      <small class="muted" style="margin-left:auto">${s.availability}</small>
    </div>
  </article>`;
}
function renderCatalogue(list){
  const grid=$('#catalogue-grid'); if(!grid) return;
  grid.innerHTML = list.map(cardHtml).join('');
  $$('.add-to-cart',grid).forEach(btn=>btn.addEventListener('click',e=>addToCart(e.target.dataset.id)));
}
function applyFilters(){
  const cat=$('#filter-category')?.value||'';
  const typ=$('#filter-type')?.value||'';
  const av=$('#filter-availability')?.value||'';
  const q=($('#search')?.value||'').toLowerCase();
  const filtered=SEEDS.filter(s=>(!cat||s.category===cat)&&(!typ||s.type===typ)&&(!av||s.availability===av)&&(!q||s.name.toLowerCase().includes(q)||s.lineage.join(' ').toLowerCase().includes(q)));
  renderCatalogue(filtered);
}

// Strain detail
function renderStrain(){
  const wrap=$('#strain-detail'); if(!wrap) return;
  const id=new URLSearchParams(location.search).get('id');
  const s = SEEDS.find(x=>x.id===id) || SEEDS[0];
  wrap.innerHTML = `<div class="grid-2">
    <div><img class="hero-img" src="${s.img}" alt="${s.name}"></div>
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
  $('.add-detail')?.addEventListener('click',e=>addToCart(e.target.dataset.id));
}

// Featured
function renderFeatured(){const grid=$('#featured-grid'); if(!grid) return; grid.innerHTML = SEEDS.slice(0,3).map(cardHtml).join('');
  $$('.add-to-cart',grid).forEach(btn=>btn.addEventListener('click',e=>addToCart(e.target.dataset.id)));
}

// Subscribe (local only)
$('#subscribe-form')?.addEventListener('submit',e=>{e.preventDefault();const email=$('#subscribe-email').value.trim();if(!email)return;
  const list=store.get('mailing_list',[]); if(!list.includes(email)) list.push(email); store.set('mailing_list',list);
  $('#subscribe-msg').textContent='Subscribed locally. Email delivery will be enabled later.'; e.target.reset();
});

// Filters
$('#filter-category')?.addEventListener('change',applyFilters);
$('#filter-type')?.addEventListener('change',applyFilters);
$('#filter-availability')?.addEventListener('change',applyFilters);
$('#search')?.addEventListener('input',applyFilters);

// Drawer toggle
$('#hamburger')?.addEventListener('click', ()=> $('#drawer').classList.toggle('open'));

document.addEventListener('DOMContentLoaded',()=>{
  const yel = document.getElementById('year'); if(yel) yel.textContent = new Date().getFullYear();
  if($('#catalogue-grid')){ renderCatalogue(SEEDS); applyFilters(); }
  if($('#strain-detail')){ renderStrain(); }
  if($('#featured-grid')){ renderFeatured(); }
  if($('#cart-view')){ renderCart(); }
  window.addEventListener('storage', updateCartCount);
});
