const CFG={zones:[{n:'Dakar Centre',f:2000},{n:'Banlieue',f:3000},{n:'Régions',f:5000}],free:50000,pay:{'Wave':'77 478 98 75','Orange Money':'77 478 98 75','Free Money':'76 443 02 18'},wa:'221774789875'};
const QUART={'Dakar Centre':['Plateau','Rebeuss','Médina','Fann','Fann Hock','Point E','Amitié','Almadies','Ngor','Ouakam','Yoff','Ouest Foire','Nord Foire','Virage','Mermoz','Sacré-Cœur','Liberté 1-6','Sicap','Dieuppeul','Derklé','Castors','HLM','Grand Dakar','Fass','Colobane','Bel Air','Hann','Maristes','Dalifort','Gueule Tapée','Niary Tally','Biscuiterie','Khar Yalla','Bopp'],'Banlieue':['Parcelles Assainies','Grand Yoff','Cambérène','Golf Sud','Sam Notaire','Pikine','Pikine Icotaf','Guinaw Rails','Thiaroye Gare','Thiaroye sur Mer','Djiddah','Diamaguène Sicap Mbao','Sicap Mbao','Fass Mbao','Petit Mbao','Grand Mbao','Mbao','Keur Mbaye Fall','Guédiawaye','Malika','Yeumbeul','Keur Massar','Jaxaay','Kounoune','Sangalkam','Keur Ndiaye Lô','Tivaouane Peulh','Bambilor','Rufisque','Bargny','Sébikotane','Diamniadio'],'Régions':['Thiès','Khombole','Pout','Mbour','Saly','Joal','Nguékhokh','Saint-Louis','Richard-Toll','Dagana','Podor','Louga','Linguère','Touba','Mbacké','Diourbel','Bambey','Kaolack','Kaffrine','Nioro','Fatick','Foundiougne','Sokone','Ziguinchor','Bignona','Oussouye','Kolda','Vélingara','Sédhiou','Tambacounda','Kédougou','Matam','Ourossogui','Kanel','Ranérou','Ngaparou','Somone','Popenguine','Toubab Dialaw','Kébémer','Guinguinéo','Diofior','Fimela','Palmarin','Goudomp','Bakel']};
function notifyNtfy(o){try{const t=DB.get('bmb_ntfy','bmb-wear-orders');fetch('https://ntfy.sh/'+encodeURIComponent(t),{method:'POST',body:'🧢 '+o.num+' — '+o.nom+' ('+o.tel+') | '+o.total.toLocaleString()+'F | '+(o.quartier||'')+' '+(o.zone||'')+' | '+o.pay+' | '+o.items.map(i=>i.name+' '+i.color+'/'+i.size+'x'+i.qty).join(', ')}).catch(()=>{})}catch(e){}}
const SEED=[
{id:'p1',name:'Windbreaker Brazil 94',cat:'windbreaker',price:25000,old:32000,trend:1,isnew:1,emoji:'🇧🇷',desc:'Coupe-vent Brazil 94, tissu déperlant, broderie poitrine.',images:[],colors:[{name:'Jaune/Vert',hex:'#d4ff00',sizes:{S:4,M:8,L:6,XL:3}},{name:'Noir',hex:'#111111',sizes:{S:2,M:2,L:1,XL:0}}]},
{id:'p2',name:'Ensemble Nike Tech Fleece',cat:'nike',price:35000,old:42000,trend:1,isnew:1,emoji:'👟',desc:'Haut + pantalon Tech Fleece, coupe regular.',images:[],colors:[{name:'Noir',hex:'#000000',sizes:{S:6,M:10,L:8,XL:5}},{name:'Gris',hex:'#888888',sizes:{S:3,M:4,L:4,XL:2}}]},
{id:'p3',name:'Ensemble Adidas Adicolor',cat:'adidas',price:32000,old:38000,trend:1,isnew:1,emoji:'⚡',desc:'Trefoil brodé, bandes mythiques.',images:[],colors:[{name:'Noir',hex:'#000000',sizes:{S:5,M:5,L:5,XL:5}},{name:'Blanc',hex:'#ffffff',sizes:{S:1,M:2,L:1,XL:1}}]},
{id:'p4',name:'Windbreaker Brazil Retro 2002',cat:'windbreaker',price:22000,old:0,trend:0,isnew:1,emoji:'💚',desc:'Edition retro 2002.',images:[],colors:[{name:'Vert',hex:'#00a651',sizes:{S:8,M:8,L:8,XL:8}}]},
{id:'p5',name:'Bonnet BMB + Chaussettes',cat:'accessoire',price:8000,old:10000,trend:0,isnew:1,emoji:'🧢',desc:'Pack accessoires.',images:[],colors:[{name:'Noir',hex:'#000000',sizes:{TU:12}}]}];
const DB={get(k,f){try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch{return f}},set(k,v){localStorage.setItem(k,JSON.stringify(v))}};
const PHOTO_MAP={p1:['assets/img/windbreaker-brazil-94.jpg'],p2:['assets/img/brillant.jpg'],p3:['assets/img/adidas-adicolor.jpg'],p4:['assets/img/brazil-retro-blanc.jpg','assets/img/brasil-menthe.jpg','assets/img/brazil-black.jpg'],p5:['assets/img/lot-3.jpg']};
if(!DB.get('bmb_products_v2'))DB.set('bmb_products_v2',SEED);
(function(){const ps=DB.get('bmb_products_v2',[]);let ch=false;ps.forEach(p=>{const m=PHOTO_MAP[p.id];if(m&&!(p.images||[]).length){p.images=m;ch=true}});if(ch)DB.set('bmb_products_v2',ps)})();
if(!DB.get('bmb_orders'))DB.set('bmb_orders',[]);
if(!DB.get('bmb_users'))DB.set('bmb_users',[]);
let cat='all',pay='Wave',cart=DB.get('bmb_cart',[]),curP=null,curC=0,curS=null,curQ=1;
const $=id=>document.getElementById(id);
const STEPS=['Paiement en attente','Commande confirmée','En cours de traitement','En cours de livraison','Commande livrée'];
function normStatus(s){s=String(s||'');if(s.includes('annul'))return 'Commande annulée';if(s==='En attente'||s.includes('Paiement'))return STEPS[0];if(s==='Confirmée'||s.includes('confirm'))return STEPS[1];if(s.includes('traitement'))return STEPS[2];if(s.includes('livraison')&&!s.includes('livr'))return STEPS[3];if(s==='Livrée'||s.includes('livr'))return STEPS[4];return STEPS[0]}
function stepIdx(s){const i=STEPS.indexOf(normStatus(s));return i<0?0:i}
function toast(m){const t=$('toast');if(!t)return;t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2400)}
function me(){const s=DB.get('bmb_session',null);return DB.get('bmb_users',[]).find(u=>u.tel===s)||null}
function stockOf(p){let t=0;(p.colors||[]).forEach(c=>Object.values(c.sizes||{}).forEach(q=>t+=+q||0));return t}
function salesCount(id){let n=0;DB.get('bmb_orders',[]).forEach(o=>(o.items||[]).forEach(i=>{if(i.id===id)n+=+(i.qty||1)}));return n}
function availBadge(p,s){if(s===0)return '<i class="red">RUPTURE</i>';if(lowOf(p))return '<i class="warn">BIENTÔT RUPTURE</i>';return '<i>DISPO</i>'}
function lowOf(p){const s=stockOf(p);return s>0&&s<5}
function setCat(b){cat=b.dataset.c;document.querySelectorAll('#cats button').forEach(x=>x.classList.remove('on'));b.classList.add('on');renderShop()}
function imgOf(p,i){const u=(p.images||[])[i||0];if(u)return u;const c=(p.colors||[])[i||0];return (c&&c.img)||''}
function coverOf(p){return (p.images||[]).find(Boolean)||((p.colors||[]).map(c=>c.img).find(Boolean))||''}
function card(p){const s=stockOf(p);
return `<div class="card" onclick="openP('${p.id}')"><div class="im">${coverOf(p)?`<img src="${coverOf(p)}" alt="${p.name}" loading="lazy" onerror="this.remove()">`:(p.emoji||'👕')}<div class="badge">${p.isnew?'<i>NEW</i>':''}${p.top?'<i class="gold">BEST</i>':''}${p.old?'<i class="red">-'+Math.round((1-p.price/p.old)*100)+'%</i>':''}${availBadge(p,s)}</div></div><div class="bd"><h3>${p.name}</h3><div class="price">${p.price.toLocaleString()} FCFA ${p.old?`<s>${p.old.toLocaleString()}</s>`:''}</div><div class="row"><button class="add" onclick="event.stopPropagation();quickAdd('${p.id}')">+ Panier</button><button class="fav" aria-label="Favori" onclick="event.stopPropagation();fav('${p.id}')">♡</button></div></div></div>`}
function renderShop(){if(!$('grid'))return;const arr=DB.get('bmb_products_v2',[]);
const q=(($('q')?.value)||'').toLowerCase(),s=$('sort')?.value||'new';
const pmin=+($('pmin')?.value||0),pmax=+($('pmax')?.value||0);
let f=arr.filter(p=>(cat==='all'||p.cat===cat)&&p.name.toLowerCase().includes(q)&&(!pmin||p.price>=pmin)&&(!pmax||p.price<=pmax));
if(s==='asc')f.sort((a,b)=>a.price-b.price);if(s==='desc')f.sort((a,b)=>b.price-a.price);if(s==='pop')f.sort((a,b)=>salesCount(b.id)-salesCount(a.id));
$('grid').innerHTML=f.map(card).join('')||'Aucun produit.';if($('nprod'))$('nprod').textContent=f.length+' articles'}
function renderTrend(){if(!$('trend'))return;$('trend').innerHTML=DB.get('bmb_products_v2',[]).filter(p=>p.trend).map(card).join('')}
function renderNew(){if(!$('newdrop'))return;$('newdrop').innerHTML=DB.get('bmb_products_v2',[]).filter(p=>p.isnew).slice(0,4).map(card).join('')||'Nouveautés en préparation — reviens vite.'}
function renderBest(){if(!$('best'))return;const ps=DB.get('bmb_products_v2',[]);let l=ps.filter(p=>p.top);if(!l.length)l=ps.slice().sort((a,b)=>salesCount(b.id)-salesCount(a.id)).filter(p=>salesCount(p.id)>0);if(!l.length)l=ps.filter(p=>p.trend);$('best').innerHTML=l.slice(0,4).map(card).join('')||'Tes futurs favoris arrivent.'}
const CATMETA={windbreaker:['Windbreaker Brazil','🇧🇷'],nike:['Nike','👟'],adidas:['Adidas','⚡'],chaussure:['Chaussures','👟'],accessoire:['Accessoires','🧢']};
function renderCatsHome(){const el=$('catshome');if(!el)return;const ps=DB.get('bmb_products_v2',[]);el.innerHTML=Object.entries(CATMETA).map(([k,v])=>{const l=ps.filter(p=>p.cat===k);if(!l.length)return '';const img=coverOf(l[0]);return `<a class="coll" href="boutique.html?cat=${k}"><div class="bg">${img?`<img src="${img}" alt="${v[0]}" loading="lazy">`:v[1]}</div><div class="tx"><span class="tag">${l.length} article${l.length>1?'s':''}</span><h3>${v[0]}</h3><p>À partir de ${Math.min(...l.map(p=>p.price)).toLocaleString()} FCFA</p><span class="btn">Shopper</span></div></a>`}).join('')}
const COLLS=[{k:'brazil',cat:'windbreaker',tag:'Brazil',t:'Windbreaker',d:'Coupe-vent jaune, vert, noir.'},{k:'nike',cat:'nike',tag:'Nike',t:'Ensembles Nike',d:'Tech fleece & dri-fit.'},{k:'adidas',cat:'adidas',tag:'Adidas',t:'Ensembles Adidas',d:'Adicolor & tiro.'}];
function renderColls(){const el=$('colls');if(!el)return;const ps=DB.get('bmb_products_v2',[]);
el.innerHTML=COLLS.map(c=>{const p=ps.find(x=>x.coll===c.k)||ps.find(x=>x.cat===c.cat);const img=p?coverOf(p):'';
return `<a class="coll" href="boutique.html?cat=${c.cat}"><div class="bg">${img?`<img src="${img}" alt="${p?p.name:c.t}" loading="lazy">`:c.tag[0]}</div><div class="tx"><span class="tag">${c.tag}</span><h3>${p?p.name:c.t}</h3><span class="coll-price">${p?p.price.toLocaleString()+' FCFA':c.d}</span><span class="btn">Shopper</span></div></a>`}).join('')}
function defaultContent(){return{about:'BMB WEAR\nUne sélection streetwear pensée pour ceux qui aiment les pièces fortes, les silhouettes simples et l\u2019attitude qui va avec. Brazil, Nike, Adidas et bien plus : BMB rassemble des essentiels streetwear faciles à porter, au quotidien.',why:[{t:'STYLE',d:'Des pièces streetwear choisies pour leur impact.'},{t:'SÉLECTION',d:'Des essentiels et des pièces fortes, réunis au même endroit.'},{t:'SIMPLE',d:'Commande, paiement et livraison pensés pour être simples au Sénégal.'}]}}
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function renderContent(c){const a=$('about_txt');if(a){const L=String(c.about||'').split('\n');a.innerHTML='<strong>'+escH(L[0])+'</strong><br>'+escH(L.slice(1).join('\n')).replace(/\n/g,'<br>')}const w=$('why_blocks');if(w)w.innerHTML=(c.why||[]).map((b,i)=>'<div><b>0'+(i+1)+'</b><strong> — '+escH(b.t)+'</strong><br>'+escH(b.d)+'</div>').join('')}
async function loadContent(){let c=null;try{c=DB.get('bmb_content',null)}catch(e){}try{if(typeof Cloud!=='undefined'&&Cloud.on()){const s=await Cloud.getSetting('content');if(s){c=s;DB.set('bmb_content',s)}}}catch(e){}if(!c)c=defaultContent();renderContent(c)}
function applyCatQuery(){try{const sp=new URLSearchParams(location.search);const q=sp.get('cat');if(q&&$('grid')&&['windbreaker','nike','adidas','chaussure','accessoire'].includes(q)){cat=q;document.querySelectorAll('#cats button').forEach(x=>x.classList.toggle('on',x.dataset.c===q))}const st=sp.get('sort');if(st&&$('sort')&&['new','asc','desc','pop'].includes(st))$('sort').value=st}catch(e){}}
function ensureChrome(){try{
if(!$('waFloat'))document.body.insertAdjacentHTML('beforeend','<a id="waFloat" class="wa-float" href="https://wa.me/'+CFG.wa+'?text='+encodeURIComponent('Bonjour BMB WEAR !')+'" target="_blank" aria-label="WhatsApp">✆</a>');
if(!$('invite'))document.body.insertAdjacentHTML('beforeend','<div class="modal" id="invite"><div class="sheet invite"><h2>♡ Garde tes favoris</h2><p>Connecte-toi pour retrouver tes articles préférés à chaque visite.</p><div class="row"><a class="btn" href="compte.html">Se connecter</a><button class="btn ghost" onclick="closeM(\'invite\')">Plus tard</button></div></div></div>');
const ct=$('ctotal');if(ct&&!$('shipgauge'))ct.insertAdjacentHTML('afterend','<div id="shipgauge"></div>');
const co=document.querySelector('#checkout .sheet');if(co&&!$('cksteps'))co.insertAdjacentHTML('afterbegin','<div class="ck-steps" id="cksteps"><div><b>1</b>Récap</div><div><b>2</b>Infos</div><div><b>3</b>Livraison</div><div><b>4</b>Paiement</div><div><b>5</b>Confirmé</div></div>');
}catch(e){}}
function quickAdd(id){const p=DB.get('bmb_products_v2',[]).find(x=>x.id===id);if(!p)return;const c=(p.colors||[])[0];const sz=c?Object.keys(c.sizes||{})[0]:'TU';openP(id);if(c){curC=0;selC(0);if(sz)selS(sz)}}
function openP(id){const p=DB.get('bmb_products_v2',[]).find(x=>x.id===id);if(!p)return;curP=p;curC=0;curS=null;curQ=1;drawP();$('pdetail')?.classList.add('open');const sh=document.querySelector('#pdetail .sheet');if(sh)sh.scrollTop=0}
function dedupImgs(L){const seen=new Set(),out=[];for(let u of (L||[])){if(!u)continue;u=String(u).trim();if(!u)continue;const k=u.length>300?('b64:'+u.length+':'+u.slice(-48)):('u:'+u);if(seen.has(k))continue;seen.add(k);out.push(u)}return out}
function galList(p,ci){const c=(p.colors||[])[ci];const L=[];if(c&&c.img)L.push(c.img);(p.images||[]).forEach(u=>L.push(u));(p.colors||[]).forEach((x,i)=>{if(i!==ci&&x.img)L.push(x.img)});return dedupImgs(L).slice(0,6)}
function drawP(){const p=curP;if(!p)return;const L=galList(p,curC);
$('pd_body').innerHTML=`<div id="pd_info"><div style="display:flex;gap:.8rem;align-items:center">${((p.colors||[])[curC]?.img||coverOf(p))?`<img src="${((p.colors||[])[curC]?.img||coverOf(p))}" onerror="this.remove()" style="width:64px;height:78px;object-fit:cover;border-radius:12px;border:1px solid #333;flex-shrink:0">`:''}<div><h2 style="font-size:1.15rem">${p.name}</h2><div class="price" style="font-size:1.25rem">${p.price.toLocaleString()} FCFA ${p.old?`<s>${p.old.toLocaleString()}</s>`:''}</div></div></div>
<p style="color:#a3a3a3;font-size:.9rem;margin-top:.6rem">${p.desc||''}</p>
<p>${stockOf(p)===0?'<b style="color:#ff5555">Victime de son succès — bientôt de retour</b>':lowOf(p)?'<b style="color:#f59e0b">Plus que quelques pièces</b>':'<small style="color:#22c55e">Disponible</small>'}</p>
<label>Couleur — <b id="cname" style="color:#fff">${(p.colors||[])[curC]?.name||''}</b></label><div class="sw">${(p.colors||[]).map((c,i)=>`<button title="${c.name}" style="background:${c.hex}" class="${i===curC?'on':''}" onclick="selC(${i})"></button>`).join('')}</div>
<label>Taille — <a href="#" onclick="event.stopPropagation();event.preventDefault();$('guide').style.display=$('guide').style.display==='none'?'block':'none'" style="text-decoration:underline">${(p.cat||'')==='chaussure'?'Guide pointures':'Guide des tailles'}</a></label>
<div class="sz">${Object.entries(((p.colors||[])[curC]?.sizes)||{}).map(([s,q])=>`<button ${+q<=0?'disabled':''} class="${curS===s?'on':''}" onclick="selS('${s}')">${s}</button>`).join('')||'TU'}</div>
<div id="guide" style="display:none">${guideHtml(p)}</div>
<div class="qty" style="margin:.7rem 0"><button onclick="chQ(-1)">-</button><b id="qq">1</b><button onclick="chQ(1)">+</button></div>
<button class="btn" style="width:100%" onclick="addVar()">Ajouter au panier</button>
<div class="row" style="display:flex;gap:.5rem;margin-top:.5rem"><button class="btn ghost" style="flex:1" onclick="fav(curP.id);closeM('pdetail')">♡ Favori</button><a class="btn ghost" style="flex:1;text-align:center" href="https://wa.me/${CFG.wa}?text=${encodeURIComponent('Bonjour BMB WEAR, je suis intéressé(e) par '+p.name+' ('+p.price.toLocaleString()+' FCFA)')}" target="_blank">WhatsApp</a></div></div>
<div id="pd_gal"><div class="gal-main" id="galMain">${L[0]?`<img src="${L[0]}" onerror="this.remove()">`:(p.emoji||'👕')}</div></div>`}
function guideHtml(p){const isShoe=(p.cat||'')==='chaussure';
if(isShoe)return `<table class="guide"><tr><th>Pointure EU</th><th>Pied (cm)</th></tr><tr><td>38</td><td>24,0</td></tr><tr><td>39</td><td>24,5</td></tr><tr><td>40</td><td>25,0</td></tr><tr><td>41</td><td>25,7</td></tr><tr><td>42</td><td>26,0</td></tr><tr><td>43</td><td>26,7</td></tr><tr><td>44</td><td>27,0</td></tr><tr><td>45</td><td>27,5</td></tr><tr><td>46</td><td>28,0</td></tr></table>`;
return `<table class="guide"><tr><th>Taille</th><th>Poitrine cm</th><th>Long. pull</th><th>Long. pantalon</th></tr><tr><td>S</td><td>96</td><td>66</td><td>100</td></tr><tr><td>M</td><td>100</td><td>68</td><td>102</td></tr><tr><td>L</td><td>104</td><td>70</td><td>104</td></tr><tr><td>XL</td><td>110</td><td>72</td><td>106</td></tr></table>`}
function selC(i){curC=i;curS=null;drawP()}
function selS(s){curS=s;document.querySelectorAll('.sz button').forEach(b=>b.classList.toggle('on',b.textContent.includes(s)))}
function chQ(d){curQ=Math.max(1,curQ+d);const e=$('qq');if(e)e.textContent=curQ}
function addVar(){const p=curP,c=(p.colors||[])[curC];const sz=curS||Object.keys(c?.sizes||{})[0];if(!sz)return toast('Choisis taille');
const av=+((c.sizes||{})[sz]||0);if(av<curQ)return toast('Plus assez de stock pour cette taille');
const key=p.id+'|'+c.name+'|'+sz;const l=cart.find(x=>x.key===key);if(l)l.qty+=curQ;else cart.push({key,id:p.id,color:c.name,size:sz,qty:curQ,price:p.price,name:p.name,emoji:p.emoji,img:c.img||(p.images||[])[0]||''});
DB.set('bmb_cart',cart);updCart();closeM('pdetail');toast('Ajouté ✓');$('drawer')?.classList.add('open')}
function fav(id){const u=me();if(!u){const m=$('invite');if(m){m.classList.add('open')}else{location.href='compte.html'}return}
let f=DB.get('bmb_favs_'+u.tel,[]);f.includes(id)?f=f.filter(x=>x!==id):f.push(id);DB.set('bmb_favs_'+u.tel,f);renderAcc();toast(f.includes(id)?'Ajouté aux favoris ♡':'Retiré des favoris')}
function addDefault(id){const ps=DB.get('bmb_products_v2',[]);const p=ps.find(x=>x.id===id);if(!p)return;const c=(p.colors||[])[0];if(!c)return toast('Rupture');const sz=Object.keys(c.sizes||{})[0]||'TU';const av=+((c.sizes||{})[sz]||0);if(av<1)return toast('Rupture sur cette taille');
const key=id+'|'+c.name+'|'+sz;const l=cart.find(x=>x.key===key);if(l)l.qty++;else cart.push({key,id,color:c.name,size:sz,qty:1,price:p.price,name:p.name,emoji:p.emoji,img:c.img||(p.images||[])[0]||''});DB.set('bmb_cart',cart);updCart();toast('Ajouté ✓')}
function updCart(){if(!$('count'))return;$('count').textContent=cart.reduce((a,c)=>a+c.qty,0);
if($('citems'))$('citems').innerHTML=cart.map((c,i)=>`<div class="citem"><div style="font-size:1.8rem">${c.img?`<img src="${c.img}" onerror="this.remove()" style="width:44px;height:52px;object-fit:cover;border-radius:8px">`:c.emoji||'👕'}</div><div class="t"><b>${c.name}</b><br><small><span class="dot" style="background:${dotOf(c)}"></span> ${c.color} • ${c.size} • ${c.price.toLocaleString()}</small><div class="qty"><button onclick="chq(${i},-1)">-</button>${c.qty}<button onclick="chq(${i},1)">+</button></div></div><button onclick="rm(${i})">✕</button></div>`).join('')||'Panier vide.';
const tot=cart.reduce((a,c)=>a+c.price*c.qty,0);if($('ctotal'))$('ctotal').innerHTML='<b>Total: '+tot.toLocaleString()+' FCFA</b>';
const sg=$('shipgauge');if(sg){const f=CFG.free;if(!cart.length)sg.innerHTML='';else if(tot>=f)sg.innerHTML='<div class="gauge"><i style="width:100%"></i></div><small style="color:#22c55e">Livraison offerte débloquée ✓</small>';else sg.innerHTML='<div class="gauge"><i style="width:'+Math.round(tot*100/f)+'%"></i></div><small>Plus que '+(f-tot).toLocaleString()+' FCFA pour la livraison offerte</small>'}}
function dotOf(c){const p=DB.get('bmb_products_v2',[]).find(x=>x.id===c.id);return (p?.colors||[]).find(x=>x.name===c.color)?.hex||'#555'}
function chq(i,d){cart[i].qty+=d;if(cart[i].qty<1)cart.splice(i,1);DB.set('bmb_cart',cart);updCart()}
function rm(i){cart.splice(i,1);DB.set('bmb_cart',cart);updCart()}
function toggleCart(){$('drawer')?.classList.toggle('open')}
function toggleMenu(){const m=$('mlinks');if(m)m.style.display=m.style.display==='flex'?'none':'flex'}
function setPay(b,v){pay=v;document.querySelectorAll('.pay button').forEach(x=>x.classList.remove('on'));b.classList.add('on');sum()}
function openCheckout(){if(!cart.length)return toast('Panier vide');$('drawer')?.classList.remove('open');$('checkout')?.classList.add('open');sum()}
function closeM(id){$(id)?.classList.remove('open')}
function shipF(z){const m=String(z||'').match(/(\d[\d ]*)/);if(m)return +m[1].replace(/\s/g,'');const f=CFG.zones.find(x=>z&&z.includes(x.n));return f?f.f:2000}
function shipCfg(){return Object.assign({dk:2000,bn:3000,rg:5000,free:50000},DB.get('bmb_ship',{}))}
function buildZones(){const sh=shipCfg();CFG.zones=[{n:'Dakar Centre',f:sh.dk},{n:'Banlieue',f:sh.bn},{n:'Régions',f:sh.rg}];CFG.free=sh.free;
const fee=n=>n==='Banlieue'?sh.bn:(n==='Régions'?sh.rg:sh.dk);
const zs=$('c_zone');if(zs)zs.innerHTML=CFG.zones.map(z=>`<option>${z.n} (${z.f.toLocaleString()} F)</option>`).join('');
const q=$('c_quart');if(q)q.innerHTML='<option value="">— Choisir quartier / ville —</option>'+Object.entries(QUART).map(([zn,qs])=>`<optgroup label="${zn}">${qs.map(x=>`<option value="${x}|${zn} (${fee(zn).toLocaleString()} F)">${x}</option>`).join('')}</optgroup>`).join('')}
function zoneLabel(){const q=$('c_quart')?.value||'';if(q&&q.includes('|'))return q.split('|')[1];return $('c_zone')?.value||'Dakar Centre'}
function syncZone(){const z=zoneLabel();const za=$('zone_auto');if(za)za.textContent=z?'Livraison : '+z:'';const zs=$('c_zone');if(zs)zs.value=z;sum()}
function sum(){const os=$('osum');const ck=$('cksteps');const nom0=$('c_nom')?.value.trim(),tel0=$('c_tel')?.value.trim(),qv0=$('c_quart')?.value||'';
if(ck){const lv=[cart.length>0,nom0&&tel0,qv0.includes('|'),true,false];[...ck.children].forEach((d,i)=>d.classList.toggle('on',!!lv[i]))}
if(!os)return;const nom=nom0,tel=tel0,qv=qv0;
if(!nom||!tel||!qv||!qv.includes('|')){os.innerHTML='';const za=$('zone_auto');if(za)za.textContent='';return}
let st=cart.reduce((a,c)=>a+c.price*c.qty,0);let s=shipF(zoneLabel());if(st>=CFG.free)s=0;
$('osum').innerHTML=`Sous-total ${st.toLocaleString()} + Livraison ${s.toLocaleString()} = <b style="color:#fff">${(st+s).toLocaleString()} FCFA</b> via ${pay}<br><small>Wave/OM: ${CFG.pay['Wave']} • Free: ${CFG.pay['Free Money']}</small>`}
function confirmOrder(){const nom=$('c_nom')?.value.trim(),tel=$('c_tel')?.value.trim();const qv=$('c_quart')?.value||'';const quartier=qv.split('|')[0]||'';
if(!nom||!tel)return toast('Nom + téléphone requis');if($('c_quart')&&!quartier)return toast('Choisis ton quartier');
let st=cart.reduce((a,c)=>a+c.price*c.qty,0);let s=shipF(zoneLabel());if(st>=CFG.free)s=0;const num='CMD'+Date.now().toString().slice(-6);
const o={num,nom,tel,zone:zoneLabel(),quartier,adr:($('c_adr').value||'')+(quartier?' — '+quartier:''),pay,code:$('c_code')?.value||'',note:$('c_note')?.value||'',items:cart,total:st+s,status:'Paiement en attente',date:new Date().toLocaleString(),deadline:Date.now()+3600e3};
const all=DB.get('bmb_orders',[]);all.unshift(o);DB.set('bmb_orders',all);notifyNtfy(o);
try{if(typeof Cloud!=='undefined'&&Cloud.on())Cloud.pushOrder(o).then(()=>{try{localStorage.setItem('bmb_lastsync',Date.now())}catch(x){}}).catch(()=>{try{Cloud.queue('order',o)}catch(x){}})}catch(e){}
decrStock(cart);cart=[];DB.set('bmb_cart',cart);updCart();const ck2=$('cksteps');if(ck2)[...ck2.children].forEach(d=>d.classList.add('on'));closeM('checkout');
if($('s_txt'))$('s_txt').innerHTML=`Merci ${nom} ! <b>${num}</b> — <b>${o.total.toLocaleString()} FCFA</b><br>Envoie ${pay} au <b>${CFG.pay[pay]}</b> + capture WhatsApp.<br><span style="color:#f59e0b">Votre commande est réservée pendant 1h dans l'attente de la confirmation du paiement.</span><br><a class="btn" style="margin-top:.6rem;display:inline-block" href="https://wa.me/${CFG.wa}?text=${encodeURIComponent('Paiement '+num+' '+o.total)}">WhatsApp</a><br><small>Suivi: page Suivre avec ${tel} + ${num}</small>`;
$('success')?.classList.add('open');renderAcc()}
function decrStock(items){const ps=DB.get('bmb_products_v2',[]);items.forEach(it=>{const p=ps.find(x=>x.id===it.id);if(!p)return;const c=(p.colors||[]).find(x=>x.name===it.color);if(c&&c.sizes[it.size]!=null)c.sizes[it.size]=Math.max(0,(+c.sizes[it.size])-it.qty)});DB.set('bmb_products_v2',ps);renderShop();renderTrend()}
function track(e){e.preventDefault();const t=$('t_tel').value.trim(),c=$('t_cmd').value.trim().toUpperCase();
const found=DB.get('bmb_orders',[]).find(x=>x.num.toUpperCase()===c&&x.tel.replace(/\s/g,'').includes(t.replace(/\s/g,'')));
if(!found){$('t_res').innerHTML='<div class="ord"><div class="ord-head"><b>Introuvable</b></div><div class="ord-sec">Verifie le N CMD et le telephone.</div></div>';return}
const o=found,st=normStatus(o.status),idx=stepIdx(st),cancelled=(st==='Commande annulée'),pillCls=cancelled?'sx':'s'+idx;
let stepsHtml='';
if(cancelled){stepsHtml='<div class="ord-sec"><div class="cancel-box"><b>X Commande annulee.</b><br>Veuillez appeler le service client au <b>+221 77 478 98 75</b> pour en savoir plus.</div></div>'}
else{stepsHtml='<div class="ord-sec"><h5>Suivi de commande</h5><div class="steps">'+STEPS.map((s,i)=>'<div class="step '+(i<=idx?'done ':'')+(i===idx?'now':'')+'"><div class="sdot"></div><div><h4>'+s+'</h4><small>'+(i===0?'Envoie Wave/OM au 77 478 98 75 + capture WhatsApp':(i===idx?'Etape actuelle':(i<idx?'Termine':'A venir')))+'</small></div></div>').join('')+'</div></div>'}
let itemsHtml=(o.items||[]).map(function(i){const vis=i.img?'<img src="'+i.img+'">':'<span style="font-size:1.6rem">'+(i.emoji||'T')+'</span>';return '<div class="oitem">'+vis+'<div style="flex:1"><b>'+i.name+'</b><br><small style="color:#9a9a9a">'+(i.color||'')+' - Taille '+(i.size||'')+' - Qte '+i.qty+'</small></div><b>'+((i.price||0)*(i.qty||1)).toLocaleString()+' F</b></div>'}).join('');
$('t_res').innerHTML='<div class="ord"><div class="ord-head"><span class="num">'+o.num+'</span><span class="pill '+pillCls+'">'+st+'</span></div><div class="ord-sec"><h5>Details commande</h5><div class="kv"><span>Client</span><b>'+o.nom+'</b><span>Telephone</span><b>'+o.tel+'</b><span>Livraison</span><b>'+(o.quartier||'')+' '+(o.zone||'')+'</b><span>Adresse</span><b>'+(o.adr||'-')+'</b><span>Paiement</span><b>'+(o.pay||'')+'</b><span>Date</span><b>'+(o.date||'')+'</b><span>Total</span><b>'+(o.total||0).toLocaleString()+' FCFA</b></div></div>'+stepsHtml+'<div class="ord-sec"><h5>Articles ('+(o.items||[]).length+')</h5>'+itemsHtml+'</div></div>'}

function register(e){e.preventDefault();const n=$('r_nom').value.trim(),t=$('r_tel').value.trim(),m=$('r_mail').value.trim().toLowerCase(),p=$('r_pass').value;
if(!n||!t||!m||!p)return toast('Tous champs requis');const us=DB.get('bmb_users',[]);
if(us.find(u=>u.tel===t))return toast('Numéro déjà utilisé');if(us.find(u=>u.email===m))return toast('Email déjà utilisé');
us.push({name:n,tel:t,email:m,pass:btoa(p),addr:$('r_adr').value.trim()});DB.set('bmb_users',us);DB.set('bmb_session',t);renderAcc();toast('Compte créé ✓')}
function login(e){e.preventDefault();const t=$('l_tel').value.trim(),p=$('l_pass').value;const u=DB.get('bmb_users',[]).find(x=>x.tel===t&&x.pass===btoa(p));
if(!u)return toast('Identifiants incorrects');DB.set('bmb_session',t);renderAcc();toast('Connecté ✓')}
function logout(){localStorage.removeItem('bmb_session');renderAcc()}
function renderAcc(){if(!$('acc_box'))return;const u=me();const prods=DB.get('bmb_products_v2',[]);
if(!u){$('acc_box').innerHTML=`<div class="auth-grid"><form class="box" onsubmit="register(event)"><h3>Créer compte</h3><input id="r_nom" placeholder="Nom & Prénom"><input id="r_tel" placeholder="Téléphone (unique)"><input id="r_mail" placeholder="Email (unique)"><input id="r_adr" placeholder="Adresse livraison"><input id="r_pass" type="password" placeholder="Mot de passe"><button class="btn" style="width:100%">Créer</button><small>1 compte / numéro + email</small></form><form class="box" onsubmit="login(event)"><h3>Connexion</h3><input id="l_tel" placeholder="Téléphone"><input id="l_pass" type="password" placeholder="Mot de passe"><button class="btn" style="width:100%">Se connecter</button></form></div>`}
else{const f=DB.get('bmb_favs_'+u.tel,[]);$('acc_box').innerHTML=`<div class="panel"><h3>Salut ${u.name} <button onclick="logout()">Sortir</button></h3><p><small>${u.tel} • ${u.email} • ${u.addr||''}</small></p></div><div class="track-grid" style="margin-top:1rem"><div class="panel"><h3>Favoris</h3><div class="fav-grid">${f.map(id=>{const p=prods.find(x=>x.id===id);if(!p)return '';const im=coverOf(p);return `<div class="fav-card" onclick="openP('${p.id}')"><button class="fav-add" title="Ajouter au panier" onclick="event.stopPropagation();addDefault('${p.id}')">+</button>${im?`<img src="${im}" alt="${p.name}" loading="lazy" onerror="this.remove()">`:`<span style="font-size:2rem">${p.emoji||'👕'}</span>`}<b>${p.name}</b><small>${p.price.toLocaleString()} F • ${stockOf(p)>0?'Dispo':'Rupture'}</small></div>`}).join('')||'Aucun'}</div></div><div class="panel"><h3>Mes commandes</h3>${DB.get('bmb_orders',[]).filter(o=>o.tel===u.tel).slice(0,6).map(o=>`<p><b>${o.num}</b> ${o.total.toLocaleString()} — ${o.status}</p>`).join('')||'Aucune'}</div></div>`}}
function validTel(t){const d=String(t||'').replace(/\D/g,'').replace(/^221/,'');return /^[367]\d{8}$/.test(d)?d:null}
function contact(e){e.preventDefault();const n=(document.getElementById('ctc_nom')?.value||'').trim(),t=(document.getElementById('ctc_tel')?.value||'').trim(),ml=(document.getElementById('ctc_mail')?.value||'').trim().toLowerCase(),m=(document.getElementById('ct_msg')?.value||'').trim();
if(!n||!t||!ml||!m)return toast('Nom + téléphone + email + message requis');
const tel=validTel(t);if(!tel)return toast('Numéro invalide (9 chiffres, ex: 77 123 45 67)');
if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ml))return toast('Email invalide');
const msg={id:'m'+Date.now(),nom:n,tel:tel,email:ml,msg:m,date:new Date().toLocaleString(),lu:false};
const all=DB.get('bmb_messages',[]);all.unshift(msg);DB.set('bmb_messages',all);
try{if(typeof Cloud!=='undefined'&&Cloud.on())Cloud.pushMessage(msg).catch(()=>{try{Cloud.queue('message',msg)}catch(x){}})}catch(x){}
try{const tp=DB.get('bmb_ntfy','bmb-wear-orders');fetch('https://ntfy.sh/'+encodeURIComponent(tp),{method:'POST',body:'✉️ '+n+' ('+tel+' / '+ml+') : '+m}).catch(()=>{})}catch(x){}
e.target.reset();toast('Message envoyé ✓ — on te répond vite')}
const io=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add('v')),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
updCart();renderAcc();buildZones();ensureChrome();['c_nom','c_tel','c_adr'].forEach(id=>{const el=$(id);if(el&&!el.dataset.sum)el.dataset.sum='1',el.addEventListener('input',sum)});$('c_zone')?.addEventListener('change',sum);$('c_quart')?.addEventListener('change',syncZone);
function mergeCloud(ps){const cur=DB.get('bmb_products_v2',[]);let del=[];try{del=JSON.parse(localStorage.getItem('bmb_deleted')||'[]')}catch(e){}let ch=false;const out=cur.slice();
for(const c of (ps||[])){if(del.includes(c.id))continue;const i=out.findIndex(p=>p.id===c.id);if(i<0){const nc=Object.assign({},c);delete nc.dirty;out.unshift(nc);ch=true}else if(!out[i].dirty&&JSON.stringify(out[i])!==JSON.stringify(c)){const nc=Object.assign({},c);delete nc.dirty;out[i]=nc;ch=true}}
if(ch)DB.set('bmb_products_v2',out);return ch}
async function boot(){try{if(typeof Catalog!=='undefined'){const c=await Catalog.load();if(c){const r=Catalog.merge(DB.get('bmb_products_v2',[]),c);if(r.changed)DB.set('bmb_products_v2',r.list)}}}catch(e){}applyCatQuery();renderShop();renderTrend();renderColls();renderNew();renderBest();renderCatsHome();loadContent();try{if(typeof Cloud!=='undefined'&&Cloud.on()){const ps=await Cloud.fetchProducts();if(ps&&ps.length&&mergeCloud(ps)){renderShop();renderTrend();renderColls();renderNew();renderBest();renderCatsHome()}}}catch(e){}}
boot();
setInterval(async()=>{try{if(typeof Cloud!=='undefined'&&Cloud.on()){const ps=await Cloud.fetchProducts();if(ps&&ps.length&&mergeCloud(ps)){renderShop();renderTrend();renderColls();renderNew();renderBest();renderCatsHome();loadContent();toast('Nouveautés synchronisées')}}}catch(e){}},45000);
setInterval(()=>{try{if(typeof Cloud!=='undefined'&&Cloud.on())Cloud.flushOut().catch(()=>{})}catch(e){}},30000);