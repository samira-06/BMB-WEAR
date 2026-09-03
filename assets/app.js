const CFG={zones:[{n:'Dakar Centre',f:2000},{n:'Banlieue',f:3000},{n:'Régions',f:5000}],free:50000,pay:{'Wave':'77 478 98 75','Orange Money':'77 478 98 75','Free Money':'76 443 02 18'},wa:'221774789875'};
const QUART={ 'Dakar Centre (2000)':['Plateau','Médina','Fann','Point E','Almadies','Ngor','Ouakam','Yoff','Mermoz','Sacré-Cœur','Liberté 1-6','Sicap','HLM','Grand Dakar','Fass','Colobane','Pikine (Dakar)'], 'Banlieue (3000)':['Parcelles Assainies','Grand Yoff','Pikine','Guédiawaye','Keur Massar','Malika','Yeumbeul','Thiaroye','Mbao','Rufisque','Bargny','Diamniadio','Sangalkam','Keur Ndiaye Lô'], 'Régions (5000)':['Thiès','Mbour','Saly','Saint-Louis','Kaolack','Ziguinchor','Touba','Tivaouane','Louga','Diourbel','Kolda','Tambacounda','Matam','Fatick']};
function notifyNtfy(o){try{const t=DB.get('bmb_ntfy','bmb-wear-orders');fetch('https://ntfy.sh/'+encodeURIComponent(t),{method:'POST',body:'🧢 '+o.num+' — '+o.nom+' ('+o.tel+') | '+o.total.toLocaleString()+'F | '+(o.quartier||'')+' '+(o.zone||'')+' | '+o.pay+' | '+o.items.map(i=>i.name+' '+i.color+'/'+i.size+'x'+i.qty).join(', ')}).catch(()=>{})}catch(e){}}
const SEED=[
{id:'p1',name:'Windbreaker Brazil 94',cat:'windbreaker',price:25000,old:32000,trend:1,isnew:1,emoji:'🇧🇷',desc:'Coupe-vent Brazil 94, tissu déperlant, broderie poitrine.',images:[],colors:[{name:'Jaune/Vert',hex:'#d4ff00',sizes:{S:4,M:8,L:6,XL:3}},{name:'Noir',hex:'#111111',sizes:{S:2,M:2,L:1,XL:0}}]},
{id:'p2',name:'Ensemble Nike Tech Fleece',cat:'nike',price:35000,old:42000,trend:1,isnew:1,emoji:'👟',desc:'Haut + pantalon Tech Fleece, coupe regular.',images:[],colors:[{name:'Noir',hex:'#000000',sizes:{S:6,M:10,L:8,XL:5}},{name:'Gris',hex:'#888888',sizes:{S:3,M:4,L:4,XL:2}}]},
{id:'p3',name:'Ensemble Adidas Adicolor',cat:'adidas',price:32000,old:38000,trend:1,isnew:1,emoji:'⚡',desc:'Trefoil brodé, bandes mythiques.',images:[],colors:[{name:'Noir',hex:'#000000',sizes:{S:5,M:5,L:5,XL:5}},{name:'Blanc',hex:'#ffffff',sizes:{S:1,M:2,L:1,XL:1}}]},
{id:'p4',name:'Windbreaker Brazil Retro 2002',cat:'windbreaker',price:22000,old:0,trend:0,isnew:1,emoji:'💚',desc:'Edition retro 2002.',images:[],colors:[{name:'Vert',hex:'#00a651',sizes:{S:8,M:8,L:8,XL:8}}]},
{id:'p5',name:'Bonnet BMB + Chaussettes',cat:'accessoire',price:8000,old:10000,trend:0,isnew:1,emoji:'🧢',desc:'Pack accessoires.',images:[],colors:[{name:'Noir',hex:'#000000',sizes:{TU:12}}]}];
const DB={get(k,f){try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch{return f}},set(k,v){localStorage.setItem(k,JSON.stringify(v))}};
if(!DB.get('bmb_products_v2'))DB.set('bmb_products_v2',SEED);
if(!DB.get('bmb_orders'))DB.set('bmb_orders',[]);
if(!DB.get('bmb_users'))DB.set('bmb_users',[]);
let cat='all',pay='Wave',cart=DB.get('bmb_cart',[]),curP=null,curC=0,curS=null,curQ=1;
const $=id=>document.getElementById(id);
const STEPS=['Paiement en attente','Commande confirmée','En cours de traitement','En cours de livraison','Commande livrée'];
const STEP_ICON=['⏳','✔','📦','🚚','🎉'];
function normStatus(s){s=String(s||'');if(s.includes('annul'))return 'Commande annulée';if(s==='En attente'||s.includes('Paiement'))return STEPS[0];if(s==='Confirmée'||s.includes('confirm'))return STEPS[1];if(s.includes('traitement'))return STEPS[2];if(s.includes('livraison')&&!s.includes('livr'))return STEPS[3];if(s==='Livrée'||s.includes('livr'))return STEPS[4];return STEPS[0]}
function stepIdx(s){const i=STEPS.indexOf(normStatus(s));return i<0?0:i}
function toast(m){const t=$('toast');if(!t)return;t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2400)}
function me(){const s=DB.get('bmb_session',null);return DB.get('bmb_users',[]).find(u=>u.tel===s)||null}
function stockOf(p){let t=0;(p.colors||[]).forEach(c=>Object.values(c.sizes||{}).forEach(q=>t+=+q||0));return t}
function lowOf(p){const s=stockOf(p);return s>0&&s<5}
function setCat(b){cat=b.dataset.c;document.querySelectorAll('#cats button').forEach(x=>x.classList.remove('on'));b.classList.add('on');renderShop()}
function imgOf(p,i){const u=(p.images||[])[i||0];if(u)return u;const c=(p.colors||[])[i||0];return (c&&c.img)||''}
function coverOf(p){return (p.images||[]).find(Boolean)||((p.colors||[]).map(c=>c.img).find(Boolean))||''}
function card(p){const s=stockOf(p);
return `<div class="card" onclick="openP('${p.id}')"><div class="im">${coverOf(p)?`<img src="${coverOf(p)}">`:(p.emoji||'👕')}<div class="badge">${p.isnew?'<i>NEW</i>':''}${p.old?'<i class="red">-'+Math.round((1-p.price/p.old)*100)+'%</i>':''}${s===0?'<i class="red">RUPTURE</i>':lowOf(p)?'<i class="warn">BIENTÔT RUPTURE</i>':''}</div></div><div class="bd"><h3>${p.name}</h3><div class="price">${p.price.toLocaleString()} FCFA ${p.old?`<s>${p.old.toLocaleString()}</s>`:''}</div><div class="row"><button class="add" onclick="event.stopPropagation();quickAdd('${p.id}')">+ Panier</button><button class="fav" onclick="event.stopPropagation();fav('${p.id}')">♡</button></div></div></div>`}
function renderShop(){if(!$('grid'))return;const arr=DB.get('bmb_products_v2',[]);
const q=(($('q')?.value)||'').toLowerCase(),s=$('sort')?.value||'new';
let f=arr.filter(p=>(cat==='all'||p.cat===cat)&&p.name.toLowerCase().includes(q));
if(s==='asc')f.sort((a,b)=>a.price-b.price);if(s==='desc')f.sort((a,b)=>b.price-a.price);
$('grid').innerHTML=f.map(card).join('')||'Aucun produit.';if($('nprod'))$('nprod').textContent=f.length+' articles'}
function renderTrend(){if(!$('trend'))return;$('trend').innerHTML=DB.get('bmb_products_v2',[]).filter(p=>p.trend).map(card).join('')}
function quickAdd(id){const p=DB.get('bmb_products_v2',[]).find(x=>x.id===id);if(!p)return;const c=(p.colors||[])[0];const sz=c?Object.keys(c.sizes||{})[0]:'TU';openP(id);if(c){curC=0;selC(0);if(sz)selS(sz)}}
function openP(id){const p=DB.get('bmb_products_v2',[]).find(x=>x.id===id);if(!p)return;curP=p;curC=0;curS=null;curQ=1;drawP();$('pdetail')?.classList.add('open')}
function galList(p,ci){const c=(p.colors||[])[ci];const L=[];if(c&&c.img)L.push(c.img);(p.images||[]).forEach(u=>{if(u&&!L.includes(u))L.push(u)});(p.colors||[]).forEach((x,i)=>{if(i!==ci&&x.img&&!L.includes(x.img))L.push(x.img)});return L.slice(0,6)}
function drawP(){const p=curP;if(!p)return;const L=galList(p,curC);
const gal=L.length?L.map((u,i)=>`<div class="${i===0?'on':''}" onclick="galGo(${i},event)"><img src="${u}"></div>`).join(''):`<div class="on">${p.emoji||'👕'}</div>`;
$('pd_body').innerHTML=`<div><div class="gal-main" id="galMain">${L[0]?`<img src="${L[0]}">`:(p.emoji||'👕')}</div><div class="gal-th">${gal}</div></div>
<div><h2>${p.name}</h2><div class="price" style="font-size:1.3rem">${p.price.toLocaleString()} FCFA ${p.old?`<s>${p.old.toLocaleString()}</s>`:''}</div>
<p style="color:#a3a3a3;font-size:.9rem">${p.desc||''}</p>
<p>${stockOf(p)===0?'<b style="color:#ff5555">Victime de son succès — bientôt de retour</b>':lowOf(p)?'<b style="color:#f59e0b">Plus que quelques pièces</b>':'<small style="color:#22c55e">Disponible</small>'}</p>
<label>Couleur</label><div class="sw">${(p.colors||[]).map((c,i)=>`<button title="${c.name}" style="background:${c.hex}" class="${i===curC?'on':''}" onclick="selC(${i})"></button>`).join('')}</div>
<small id="cname">${(p.colors||[])[curC]?.name||''}</small>
<label>Taille — <a href="#" onclick="event.preventDefault();$('guide').style.display=$('guide').style.display==='none'?'block':'none'" style="text-decoration:underline">${(p.cat||'')==='chaussure'?'Guide pointures':'Guide des tailles'}</a></label>
<div class="sz">${Object.entries(((p.colors||[])[curC]?.sizes)||{}).map(([s,q])=>`<button ${+q<=0?'disabled':''} class="${curS===s?'on':''}" onclick="selS('${s}')">${s}</button>`).join('')||'TU'}</div>
<div id="guide" style="display:none">${guideHtml(p)}</div>
<div class="qty" style="margin:.7rem 0"><button onclick="chQ(-1)">-</button><b id="qq">1</b><button onclick="chQ(1)">+</button></div>
<button class="btn" style="width:100%" onclick="addVar()">Ajouter au panier</button></div>`}
function guideHtml(p){const isShoe=(p.cat||'')==='chaussure';
if(isShoe)return `<table class="guide"><tr><th>Pointure EU</th><th>Pied (cm)</th></tr><tr><td>38</td><td>24,0</td></tr><tr><td>39</td><td>24,5</td></tr><tr><td>40</td><td>25,0</td></tr><tr><td>41</td><td>25,7</td></tr><tr><td>42</td><td>26,0</td></tr><tr><td>43</td><td>26,7</td></tr><tr><td>44</td><td>27,0</td></tr><tr><td>45</td><td>27,5</td></tr><tr><td>46</td><td>28,0</td></tr></table>`;
return `<table class="guide"><tr><th>Taille</th><th>Poitrine cm</th><th>Long. pull</th><th>Long. pantalon</th></tr><tr><td>S</td><td>96</td><td>66</td><td>100</td></tr><tr><td>M</td><td>100</td><td>68</td><td>102</td></tr><tr><td>L</td><td>104</td><td>70</td><td>104</td></tr><tr><td>XL</td><td>110</td><td>72</td><td>106</td></tr></table>`}
function galGo(i,e){e.stopPropagation();document.querySelectorAll('.gal-th div').forEach((d,j)=>d.classList.toggle('on',j===i));const u=galList(curP,curC)[i];$('galMain').innerHTML=u?`<img src="${u}">`:(curP.emoji||'👕')}
function selC(i){curC=i;curS=null;drawP()}
function selS(s){curS=s;document.querySelectorAll('.sz button').forEach(b=>b.classList.toggle('on',b.textContent.includes(s)))}
function chQ(d){curQ=Math.max(1,curQ+d);const e=$('qq');if(e)e.textContent=curQ}
function addVar(){const p=curP,c=(p.colors||[])[curC];const sz=curS||Object.keys(c?.sizes||{})[0];if(!sz)return toast('Choisis taille');
const av=+((c.sizes||{})[sz]||0);if(av<curQ)return toast('Plus assez de stock pour cette taille');
const key=p.id+'|'+c.name+'|'+sz;const l=cart.find(x=>x.key===key);if(l)l.qty+=curQ;else cart.push({key,id:p.id,color:c.name,size:sz,qty:curQ,price:p.price,name:p.name,emoji:p.emoji,img:c.img||(p.images||[])[0]||''});
DB.set('bmb_cart',cart);updCart();closeM('pdetail');toast('Ajouté ✓');$('drawer')?.classList.add('open')}
function fav(id){const u=me();if(!u){toast('Crée un compte pour les favoris');location.href='compte.html';return}
let f=DB.get('bmb_favs_'+u.tel,[]);f.includes(id)?f=f.filter(x=>x!==id):f.push(id);DB.set('bmb_favs_'+u.tel,f);renderAcc();toast('Favoris ♡')}
function updCart(){if(!$('count'))return;$('count').textContent=cart.reduce((a,c)=>a+c.qty,0);
if($('citems'))$('citems').innerHTML=cart.map((c,i)=>`<div class="citem"><div style="font-size:1.8rem">${c.img?`<img src="${c.img}" style="width:44px;height:52px;object-fit:cover;border-radius:8px">`:c.emoji||'👕'}</div><div class="t"><b>${c.name}</b><br><small><span class="dot" style="background:${dotOf(c)}"></span> ${c.color} • ${c.size} • ${c.price.toLocaleString()}</small><div class="qty"><button onclick="chq(${i},-1)">-</button>${c.qty}<button onclick="chq(${i},1)">+</button></div></div><button onclick="rm(${i})">✕</button></div>`).join('')||'Panier vide.';
const tot=cart.reduce((a,c)=>a+c.price*c.qty,0);if($('ctotal'))$('ctotal').innerHTML='<b>Total: '+tot.toLocaleString()+' FCFA</b>'}
function dotOf(c){const p=DB.get('bmb_products_v2',[]).find(x=>x.id===c.id);return (p?.colors||[]).find(x=>x.name===c.color)?.hex||'#555'}
function chq(i,d){cart[i].qty+=d;if(cart[i].qty<1)cart.splice(i,1);DB.set('bmb_cart',cart);updCart()}
function rm(i){cart.splice(i,1);DB.set('bmb_cart',cart);updCart()}
function toggleCart(){$('drawer')?.classList.toggle('open')}
function toggleMenu(){const m=$('mlinks');if(m)m.style.display=m.style.display==='flex'?'none':'flex'}
function setPay(b,v){pay=v;document.querySelectorAll('.pay button').forEach(x=>x.classList.remove('on'));b.classList.add('on');sum()}
function openCheckout(){if(!cart.length)return toast('Panier vide');$('drawer')?.classList.remove('open');$('checkout')?.classList.add('open');sum()}
function closeM(id){$(id)?.classList.remove('open')}
function shipF(z){const m=String(z||'').match(/(\d[\d ]*)/);if(m)return +m[1].replace(/\s/g,'');const f=CFG.zones.find(x=>z&&z.includes(x.n));return f?f.f:2000}
function fillQ(){const s=$('c_quart');if(!s)return;if(s.options.length>1)return;s.innerHTML='<option value="">— Choisir quartier / ville —</option>'+Object.entries(QUART).map(([z,qs])=>`<optgroup label="${z}">${qs.map(q=>`<option value="${q}|${z}">${q}</option>`).join('')}</optgroup>`).join('')}
function syncZone(){const q=$('c_quart')?.value||'';if(q&&q.includes('|')){const z=q.split('|')[1];const zs=$('c_zone');if(zs)zs.value=z}sum()}
function sum(){if(!$('osum'))return;let st=cart.reduce((a,c)=>a+c.price*c.qty,0);let s=shipF($('c_zone')?.value||'');if(st>=CFG.free)s=0;
$('osum').innerHTML=`Sous-total ${st.toLocaleString()} + Livraison ${s.toLocaleString()} = <b style="color:#fff">${(st+s).toLocaleString()} FCFA</b> via ${pay}<br><small>Wave/OM: ${CFG.pay['Wave']} • Free: ${CFG.pay['Free Money']}</small>`}
function confirmOrder(){const nom=$('c_nom')?.value.trim(),tel=$('c_tel')?.value.trim();const qv=$('c_quart')?.value||'';const quartier=qv.split('|')[0]||'';
if(!nom||!tel)return toast('Nom + téléphone requis');if($('c_quart')&&!quartier)return toast('Choisis ton quartier');
let st=cart.reduce((a,c)=>a+c.price*c.qty,0);let s=shipF($('c_zone').value);if(st>=CFG.free)s=0;const num='CMD'+Date.now().toString().slice(-6);
const o={num,nom,tel,zone:$('c_zone').value,quartier,adr:($('c_adr').value||'')+(quartier?' — '+quartier:''),pay,code:$('c_code')?.value||'',note:$('c_note')?.value||'',items:cart,total:st+s,status:'Paiement en attente',date:new Date().toLocaleString(),deadline:Date.now()+3600e3};
const all=DB.get('bmb_orders',[]);all.unshift(o);DB.set('bmb_orders',all);notifyNtfy(o);
try{if(typeof Cloud!=='undefined'&&Cloud.on())Cloud.pushOrder(o).catch(()=>{})}catch(e){}
decrStock(cart);cart=[];DB.set('bmb_cart',cart);updCart();closeM('checkout');
if($('s_txt'))$('s_txt').innerHTML=`Merci ${nom} ! <b>${num}</b> — <b>${o.total.toLocaleString()} FCFA</b><br>Envoie ${pay} au <b>${CFG.pay[pay]}</b> + capture WhatsApp.<br><span style="color:#f59e0b">⏳ 1h pour confirmer sinon annulation auto.</span><br><a class="btn" style="margin-top:.6rem;display:inline-block" href="https://wa.me/${CFG.wa}?text=${encodeURIComponent('Paiement '+num+' '+o.total)}">WhatsApp</a><br><small>Suivi: page Suivre avec ${tel} + ${num}</small>`;
$('success')?.classList.add('open');renderAcc()}
function decrStock(items){const ps=DB.get('bmb_products_v2',[]);items.forEach(it=>{const p=ps.find(x=>x.id===it.id);if(!p)return;const c=(p.colors||[]).find(x=>x.name===it.color);if(c&&c.sizes[it.size]!=null)c.sizes[it.size]=Math.max(0,(+c.sizes[it.size])-it.qty)});DB.set('bmb_products_v2',ps);renderShop();renderTrend()}
function track(e){e.preventDefault();const t=$('t_tel').value.trim(),c=$('t_cmd').value.trim().toUpperCase();
const found=DB.get('bmb_orders',[]).find(x=>x.num.toUpperCase()===c&&x.tel.replace(/\s/g,'').includes(t.replace(/\s/g,'')));
if(!found){$('t_res').innerHTML='<div class="ord"><div class="ord-head"><b>Introuvable</b></div><div class="ord-sec">Verifie le N CMD et le telephone.</div></div>';return}
const o=found,st=normStatus(o.status),idx=stepIdx(st),cancelled=(st==='Commande annulée'),pillCls=cancelled?'sx':'s'+idx;
let stepsHtml='';
if(cancelled){stepsHtml='<div class="ord-sec"><div class="cancel-box"><b>X Commande annulee.</b><br>Veuillez appeler le service client au <b>+221 77 478 98 75</b> pour en savoir plus.</div></div>'}
else{stepsHtml='<div class="steps">'+STEPS.map((s,i)=>'<div class="step '+(i<=idx?'done ':'')+(i===idx?'now':'')+'"><div class="sdot">'+(i<=idx?STEP_ICON[i]:'O')+'</div><div><h4>'+s+'</h4><small>'+(i===0?'Envoie Wave/OM au 77 478 98 75 + capture WhatsApp':(i===idx?'Etape actuelle':(i<idx?'Termine':'A venir')))+'</small></div></div>').join('')+'</div>'}
let itemsHtml=(o.items||[]).map(function(i){const vis=i.img?'<img src="'+i.img+'">':'<span style="font-size:1.6rem">'+(i.emoji||'T')+'</span>';return '<div class="oitem">'+vis+'<div style="flex:1"><b>'+i.name+'</b><br><small style="color:#9a9a9a">'+(i.color||'')+' - Taille '+(i.size||'')+' - Qte '+i.qty+'</small></div><b>'+((i.price||0)*(i.qty||1)).toLocaleString()+' F</b></div>'}).join('');
$('t_res').innerHTML='<div class="ord"><div class="ord-head"><span class="num">'+o.num+'</span><span class="pill '+pillCls+'">'+st+'</span></div>'+stepsHtml+'<div class="ord-sec"><h5>Details commande</h5><div class="kv"><span>Client</span><b>'+o.nom+'</b><span>Telephone</span><b>'+o.tel+'</b><span>Livraison</span><b>'+(o.quartier||'')+' '+(o.zone||'')+'</b><span>Adresse</span><b>'+(o.adr||'-')+'</b><span>Paiement</span><b>'+(o.pay||'')+'</b><span>Date</span><b>'+(o.date||'')+'</b><span>Total</span><b>'+(o.total||0).toLocaleString()+' FCFA</b></div></div><div class="ord-sec"><h5>Articles ('+(o.items||[]).length+')</h5>'+itemsHtml+'</div></div>'}

function register(e){e.preventDefault();const n=$('r_nom').value.trim(),t=$('r_tel').value.trim(),m=$('r_mail').value.trim().toLowerCase(),p=$('r_pass').value;
if(!n||!t||!m||!p)return toast('Tous champs requis');const us=DB.get('bmb_users',[]);
if(us.find(u=>u.tel===t))return toast('Numéro déjà utilisé');if(us.find(u=>u.email===m))return toast('Email déjà utilisé');
us.push({name:n,tel:t,email:m,pass:btoa(p),addr:$('r_adr').value.trim()});DB.set('bmb_users',us);DB.set('bmb_session',t);renderAcc();toast('Compte créé ✓')}
function login(e){e.preventDefault();const t=$('l_tel').value.trim(),p=$('l_pass').value;const u=DB.get('bmb_users',[]).find(x=>x.tel===t&&x.pass===btoa(p));
if(!u)return toast('Identifiants incorrects');DB.set('bmb_session',t);renderAcc();toast('Connecté ✓')}
function logout(){localStorage.removeItem('bmb_session');renderAcc()}
function renderAcc(){if(!$('acc_box'))return;const u=me();const prods=DB.get('bmb_products_v2',[]);
if(!u){$('acc_box').innerHTML=`<div class="auth-grid"><form class="box" onsubmit="register(event)"><h3>Créer compte</h3><input id="r_nom" placeholder="Nom & Prénom"><input id="r_tel" placeholder="Téléphone (unique)"><input id="r_mail" placeholder="Email (unique)"><input id="r_adr" placeholder="Adresse livraison"><input id="r_pass" type="password" placeholder="Mot de passe"><button class="btn" style="width:100%">Créer</button><small>1 compte / numéro + email</small></form><form class="box" onsubmit="login(event)"><h3>Connexion</h3><input id="l_tel" placeholder="Téléphone"><input id="l_pass" type="password" placeholder="Mot de passe"><button class="btn" style="width:100%">Se connecter</button></form></div>`}
else{const f=DB.get('bmb_favs_'+u.tel,[]);$('acc_box').innerHTML=`<div class="panel"><h3>Salut ${u.name} <button onclick="logout()">Sortir</button></h3><p><small>${u.tel} • ${u.email} • ${u.addr||''}</small></p></div><div class="track-grid" style="margin-top:1rem"><div class="panel"><h3>Favoris</h3>${f.map(id=>{const p=prods.find(x=>x.id===id);return p?`<p onclick="openP('${p.id}')" style="cursor:pointer">${p.emoji} ${p.name}</p>`:''}).join('')||'Aucun'}</div><div class="panel"><h3>Mes commandes</h3>${DB.get('bmb_orders',[]).filter(o=>o.tel===u.tel).slice(0,6).map(o=>`<p><b>${o.num}</b> ${o.total.toLocaleString()} — ${o.status}</p>`).join('')||'Aucune'}</div></div>`}}
function contact(e){e.preventDefault();window.open('https://wa.me/'+CFG.wa+'?text='+encodeURIComponent('Bonjour BMB Wear ! '+(document.getElementById('ct_msg')?.value||'')),'_blank')}
const io=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add('v')),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
renderShop();renderTrend();updCart();renderAcc();fillQ();$('c_zone')?.addEventListener('change',sum);$('c_quart')?.addEventListener('change',syncZone);
try{if(typeof Cloud!=='undefined'&&Cloud.on())Cloud.fetchProducts().then(ps=>{if(ps&&ps.length){DB.set('bmb_products_v2',ps);renderShop();renderTrend()}}).catch(()=>{})}catch(e){}