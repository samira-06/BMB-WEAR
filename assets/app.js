const SEED=[
{id:'p1',name:'Windbreaker Brazil 94 Jaune/Vert',cat:'windbreaker',price:25000,old:32000,trend:1,isnew:1,emoji:'🇧🇷'},
{id:'p2',name:'Windbreaker Brazil Noir Premium',cat:'windbreaker',price:28000,old:35000,trend:1,isnew:1,emoji:'🧥'},
{id:'p3',name:'Windbreaker Brazil Retro 2002',cat:'windbreaker',price:22000,old:0,trend:0,isnew:1,emoji:'💚'},
{id:'p4',name:'Ensemble Nike Tech Fleece Noir',cat:'nike',price:35000,old:42000,trend:1,isnew:1,emoji:'👟'},
{id:'p5',name:'Ensemble Nike Dri-Fit Blanc',cat:'nike',price:30000,old:0,trend:0,isnew:0,emoji:'🏃'},
{id:'p6',name:'Ensemble Adidas Adicolor Noir',cat:'adidas',price:32000,old:38000,trend:1,isnew:1,emoji:'⚡'},
{id:'p7',name:'Ensemble Adidas Tiro Blanc/Noir',cat:'adidas',price:27000,old:0,trend:0,isnew:0,emoji:'⭐'},
{id:'p8',name:'Bonnet + Chaussettes BMB',cat:'accessoire',price:8000,old:10000,trend:0,isnew:1,emoji:'🧢'}];
const DB={get(k,f){try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch{return f}},set(k,v){localStorage.setItem(k,JSON.stringify(v))}};
if(!DB.get('bmb_products'))DB.set('bmb_products',SEED);
if(!DB.get('bmb_orders'))DB.set('bmb_orders',[]);
let cat='all',pay='Wave',cart=DB.get('bmb_cart',[]);
const $=id=>document.getElementById(id);
function toast(m){const t=$('toast');if(!t)return; t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2200)}
function setCat(b){cat=b.dataset.c;document.querySelectorAll('#cats button').forEach(x=>x.classList.remove('on'));b.classList.add('on');renderShop()}
function card(p){return `<div class="card"><div class="im">${p.emoji||'👕'}<div class="badge">${p.isnew?'<i>NEW</i>':''}${p.old?'<i class="red">-'+Math.round((1-p.price/p.old)*100)+'%</i>':''}</div></div><div class="bd"><h3>${p.name}</h3><div class="price">${p.price.toLocaleString()} FCFA ${p.old?`<s>${p.old.toLocaleString()}</s>`:''}</div><div class="row"><button class="add" onclick="add('${p.id}')">+ Panier</button><button class="fav" onclick="fav('${p.id}')">♡</button></div></div></div>`}
function renderShop(){if(!$('grid'))return;let arr=DB.get('bmb_products',SEED);
const q=(($('q')?.value)||'').toLowerCase(),s=$('sort')?.value||'new';
let f=arr.filter(p=>(cat==='all'||p.cat===cat)&&p.name.toLowerCase().includes(q));
if(s==='asc')f.sort((a,b)=>a.price-b.price);if(s==='desc')f.sort((a,b)=>b.price-a.price);
$('grid').innerHTML=f.map(card).join('')||'Aucun produit.';if($('nprod'))$('nprod').textContent=f.length+' articles';}
function renderTrend(){if(!$('trend'))return;$('trend').innerHTML=DB.get('bmb_products',[]).filter(p=>p.trend).map(card).join('')}
function add(id){const l=cart.find(x=>x.id===id);if(l)l.qty++;else cart.push({id,qty:1});DB.set('bmb_cart',cart);updCart();toast('Ajouté ✓');$('drawer')?.classList.add('open')}
function fav(id){let f=DB.get('bmb_favs',[]);f.includes(id)?f=f.filter(x=>x!==id):f.push(id);DB.set('bmb_favs',f);renderAcc();toast('Favoris ♡')}
function updCart(){if(!$('count'))return;$('count').textContent=cart.reduce((a,c)=>a+c.qty,0);
const prods=DB.get('bmb_products',[]);
if($('citems'))$('citems').innerHTML=cart.map(c=>{const p=prods.find(x=>x.id===c.id);if(!p)return '';return `<div class="citem"><div style="font-size:2rem">${p.emoji}</div><div class="t"><b>${p.name}</b><br><small>${p.price.toLocaleString()}</small><div class="qty"><button onclick="chq('${c.id}',-1)">-</button>${c.qty}<button onclick="chq('${c.id}',1)">+</button></div></div><button onclick="rm('${c.id}')">✕</button></div>`}).join('')||'Panier vide.';
const tot=cart.reduce((a,c)=>{const p=prods.find(x=>x.id===c.id);return a+(p?p.price*c.qty:0)},0);
if($('ctotal'))$('ctotal').innerHTML='<b>Total: '+tot.toLocaleString()+' FCFA</b>'}
function chq(id,d){const l=cart.find(x=>x.id===id);if(!l)return;l.qty+=d;if(l.qty<1)cart=cart.filter(x=>x.id!==id);DB.set('bmb_cart',cart);updCart()}
function rm(id){cart=cart.filter(x=>x.id!==id);DB.set('bmb_cart',cart);updCart()}
function toggleCart(){$('drawer')?.classList.toggle('open')}
function setPay(b,v){pay=v;document.querySelectorAll('.pay button').forEach(x=>x.classList.remove('on'));b.classList.add('on');sum()}
function openCheckout(){if(!cart.length)return toast('Panier vide');$('drawer')?.classList.remove('open');$('checkout')?.classList.add('open');sum()}
function closeM(id){$(id)?.classList.remove('open')}
function ship(z){return (z||'').includes('Banlieue')?3000:(z||'').includes('Régions')?5000:2000}
function sum(){if(!$('osum'))return;const prods=DB.get('bmb_products',[]);let st=cart.reduce((a,c)=>{const p=prods.find(x=>x.id===c.id);return a+(p?p.price*c.qty:0)},0);
let s=ship($('c_zone')?.value||'');if(st>=50000)s=0;$('osum').innerHTML=`Sous-total ${st.toLocaleString()} + Livraison ${s} = <b style="color:#fff">${(st+s).toLocaleString()} FCFA</b> via ${pay}`}
function confirmOrder(){const nom=$('c_nom')?.value.trim(),tel=$('c_tel')?.value.trim();if(!nom||!tel)return toast('Nom + téléphone requis');
const prods=DB.get('bmb_products',[]);let st=cart.reduce((a,c)=>{const p=prods.find(x=>x.id===c.id);return a+(p?p.price*c.qty:0)},0);
let s=ship($('c_zone').value);if(st>=50000)s=0;const num='CMD'+Date.now().toString().slice(-6);
const o={num,nom,tel,zone:$('c_zone').value,adr:$('c_adr').value,pay,items:cart,total:st+s,status:'En attente',date:new Date().toLocaleString()};
const all=DB.get('bmb_orders',[]);all.unshift(o);DB.set('bmb_orders',all);cart=[];DB.set('bmb_cart',cart);updCart();closeM('checkout');
if($('s_txt'))$('s_txt').innerHTML=`Merci ${nom} ! <b>${num}</b> — <b>${o.total.toLocaleString()} FCFA</b>`;$('success')?.classList.add('open');renderAcc()}
function track(e){e.preventDefault();const t=$('t_tel').value.trim(),c=$('t_cmd').value.trim().toUpperCase();
const o=DB.get('bmb_orders',[]).find(x=>x.num.toUpperCase()===c&&x.tel.includes(t));
$('t_res').innerHTML=o?`<h3>${o.num} — ${o.status}</h3><p>${o.nom} • ${o.total.toLocaleString()} FCFA • ${o.pay}<br>${o.date}</p>`:'<b>Commande introuvable.</b>'}
function renderAcc(){if(!$('favs'))return;const prods=DB.get('bmb_products',[]),f=DB.get('bmb_favs',[]);
$('favs').innerHTML=f.map(id=>{const p=prods.find(x=>x.id===id);return p?`<p>${p.emoji} ${p.name} <button onclick="add('${p.id}')">+ panier</button></p>`:''}).join('')||'Aucun favori.';
$('myorders').innerHTML=DB.get('bmb_orders',[]).slice(0,6).map(o=>`<p><b>${o.num}</b> ${o.total.toLocaleString()} — ${o.status}</p>`).join('')||'Aucune commande.'}
function contact(e){e.preventDefault();window.open('https://wa.me/221774789875?text='+encodeURIComponent('Bonjour BMB Wear !'),'blank')}
const io=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add('v')),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
renderShop();renderTrend();updCart();renderAcc();
$('c_zone')?.addEventListener('change',sum);
