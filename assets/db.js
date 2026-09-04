/* BMB Cloud — Supabase (durable) avec fallback local.
   Config dans Admin > Livraison/Paiement > Supabase URL + clé anon.
   Photos: uploadées vers Storage (URLs durables) si cloud actif,
   sinon compressées en local (limite navigateur). */
const Cloud={
DEF:{url:'https://hpnyjfefemgrbxxgzxpo.supabase.co',key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbnlqZmVmZW1ncmJ4eGd6eHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NTY4NzAsImV4cCI6MjEwNDAzMjg3MH0.iCmd_lQN4BTM6M4_stxsezMn2P5Fwt_cb1Li6EnLRWc'},
cfg(){try{const c=JSON.parse(localStorage.getItem('bmb_cloud')||'null');if(c&&c.url&&c.key)return c}catch(e){}return this.DEF},
on(){const c=this.cfg();return !!(c&&c.url&&c.key)},
H(extra){const c=this.cfg();const s=this.sess();const tok=(s&&s.at&&s.exp>Date.now())?s.at:c.key;return Object.assign({'apikey':c.key,'Authorization':'Bearer '+tok,'Content-Type':'application/json'},extra||{})},
async req(path,opt){const c=this.cfg();const r=await fetch(c.url.replace(/\/$/,'')+'/rest/v1/'+path,Object.assign({headers:this.H()},opt||{}));if(!r.ok)throw new Error('Supabase '+r.status);const t=await r.text();return t?JSON.parse(t):null},
async photos(){if(!this.on())return [];try{return await this.req('products?select=id,name&order=created_at.desc&limit=1000')||[]}catch(e){return[]}},
async fetchProducts(){const ps=await this.req('products?select=*&order=created_at.desc');const out=[];
for(const p of ps){let cols=[];try{cols=await this.req('colors?product_id=eq.'+encodeURIComponent(p.id)+'&select=*')}catch(e){}
out.push({id:p.id,name:p.name,cat:p.cat,price:p.price,old:p.old_price,desc:p.description,coll:p.coll||'',top:!!p.best,images:p.images||[],emoji:p.emoji||'👕',trend:!!p.trend,isnew:!!p.is_new,colors:cols.map(c=>({name:c.name,hex:c.hex,img:c.img||'',sizes:c.sizes||{}}))})}return out},
async saveProduct(p){const body={id:p.id,name:p.name,cat:p.cat,price:p.price,old_price:p.old||0,description:p.desc||'',coll:p.coll||'',best:!!p.top,images:p.images||[],emoji:p.emoji||'👕',trend:!!p.trend,is_new:!!p.isnew};
await this.req('products',{method:'POST',headers:this.H({'Prefer':'resolution=merge-duplicates'}),body:JSON.stringify(body)});
await this.req('colors?product_id=eq.'+encodeURIComponent(p.id),{method:'DELETE'});
for(const c of (p.colors||[]))await this.req('colors',{method:'POST',body:JSON.stringify({product_id:p.id,name:c.name,hex:c.hex,img:c.img||'',sizes:c.sizes||{}})})},
async delProduct(id){await this.req('colors?product_id=eq.'+encodeURIComponent(id),{method:'DELETE'});await this.req('products?id=eq.'+encodeURIComponent(id),{method:'DELETE'})},
async pushOrder(o){await this.req('orders',{method:'POST',headers:this.H({'Prefer':'resolution=merge-duplicates'}),body:JSON.stringify({num:o.num,name:o.nom,tel:o.tel,zone:o.zone||'',quartier:o.quartier||'',adr:o.adr||'',pay:o.pay||'',code:o.code||'',note:o.note||'',items:o.items||[],total:o.total||0,status:o.status||'En attente',deadline:o.deadline||0})})},
async fetchOrders(){try{return (await this.req('orders?select=*&order=created_at.desc&limit=200')).map(o=>({num:o.num,nom:o.name,tel:o.tel,zone:o.zone,quartier:o.quartier,adr:o.adr,pay:o.pay,code:o.code,note:o.note,items:o.items,total:o.total,status:o.status,date:o.created_at,deadline:o.deadline}))}catch(e){return[]}},
async uploadPhoto(dataUrl,name){const c=this.cfg();const s=this.sess();const tok=(s&&s.at&&s.exp>Date.now())?s.at:c.key;const b=await (await fetch(dataUrl)).blob();
const fname='p'+Date.now()+'-'+Math.random().toString(36).slice(2)+'-'+(name||'photo')+'.jpg';
const r=await fetch(c.url.replace(/\/$/,'')+'/storage/v1/object/product-photos/'+encodeURIComponent(fname),{method:'POST',headers:{'apikey':c.key,'Authorization':'Bearer '+tok,'Content-Type':'image/jpeg'},body:b});
if(!r.ok)throw new Error('upload '+r.status);return c.url.replace(/\/$/,'')+'/storage/v1/object/public/product-photos/'+encodeURIComponent(fname)},
async test(){await this.req('products?select=id&limit=1');return true},
sess(){try{return JSON.parse(localStorage.getItem('bmb_asession')||'null')}catch(e){return null}},
isAdmin(){const s=this.sess();return !!(s&&s.at&&s.exp>Date.now())},
async authSignIn(email,pass){const c=this.cfg();const r=await fetch(c.url.replace(/\/$/,'')+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'apikey':c.key,'Content-Type':'application/json'},body:JSON.stringify({email,password:pass})});if(!r.ok)throw new Error('login');const j=await r.json();const sess={at:j.access_token,exp:Date.now()+((+j.expires_in||3600)*1000)-60000,email};localStorage.setItem('bmb_asession',JSON.stringify(sess));return sess},
authOut(){try{localStorage.removeItem('bmb_asession')}catch(e){}},
async pushMessage(m){await this.req('messages',{method:'POST',headers:this.H({'Prefer':'resolution=merge-duplicates'}),body:JSON.stringify({id:m.id,name:m.nom,tel:m.tel,email:m.email||'',msg:m.msg,lu:!!m.lu})})},
async fetchMessages(){try{return (await this.req('messages?select=*&order=created_at.desc&limit=200')).map(m=>({id:m.id,nom:m.name,tel:m.tel,email:m.email||'',msg:m.msg,date:m.created_at,lu:!!m.lu}))}catch(e){return[]}},
async readMessage(id){await this.req('messages?id=eq.'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify({lu:true})})},
async delMessage(id){await this.req('messages?id=eq.'+encodeURIComponent(id),{method:'DELETE'})},
async saveSetting(k,v){await this.req('settings',{method:'POST',headers:this.H({'Prefer':'resolution=merge-duplicates'}),body:JSON.stringify({key:k,value:v})})},
async getSetting(k){try{const r=await this.req('settings?key=eq.'+encodeURIComponent(k)+'&select=value&limit=1');return r&&r[0]?r[0].value:null}catch(e){return null}},
async storageUsage(){try{const c=this.cfg();let off=0,total=0,n=0,page=true;while(page){const r=await fetch(c.url.replace(/\/$/,'')+'/storage/v1/object/list/product-photos',{method:'POST',headers:{'apikey':c.key,'Authorization':'Bearer '+c.key,'Content-Type':'application/json'},body:JSON.stringify({limit:100,offset:off})});if(!r.ok)break;const a=await r.json();if(!a||!a.length)break;a.forEach(o=>{total+=+(o.metadata&&o.metadata.size||o.size||0);n++});off+=a.length;page=a.length===100}return{n,mo:total/1048576}}catch(e){return null}},
async delOrder(num){await this.req('orders?num=eq.'+encodeURIComponent(num),{method:'DELETE'})},
queue(t,d){try{const q=JSON.parse(localStorage.getItem('bmb_outbox')||'[]');q.push({t,d});localStorage.setItem('bmb_outbox',JSON.stringify(q))}catch(e){}},
pending(){try{return JSON.parse(localStorage.getItem('bmb_outbox')||'[]').length}catch(e){return 0}},
async flushOut(){let q=[];try{q=JSON.parse(localStorage.getItem('bmb_outbox')||'[]')}catch(e){}if(!q.length||!this.on())return 0;const rest=[];for(const o of q){try{if(o.t==='product'){await this.saveProduct(o.d);try{const ps=JSON.parse(localStorage.getItem('bmb_products_v2')||'[]');const p=ps.find(x=>x.id===(o.d&&o.d.id));if(p&&p.dirty){delete p.dirty;localStorage.setItem('bmb_products_v2',JSON.stringify(ps))}}catch(x){}}else if(o.t==='delProduct')await this.delProduct(o.d);else if(o.t==='order')await this.pushOrder(o.d);else if(o.t==='delOrder')await this.delOrder(o.d);else if(o.t==='message')await this.pushMessage(o.d);else if(o.t==='msgRead')await this.readMessage(o.d);else if(o.t==='msgDel')await this.delMessage(o.d);else if(o.t==='customer')await this.pushCustomer(o.d)}catch(e){rest.push(o)}}try{localStorage.setItem('bmb_outbox',JSON.stringify(rest));if(!rest.length)localStorage.setItem('bmb_lastsync',Date.now())}catch(e){}return q.length-rest.length},
async pushCustomer(u){await this.req('customers',{method:'POST',headers:this.H({'Prefer':'resolution=merge-duplicates'}),body:JSON.stringify({tel:u.tel,name:u.name,email:u.email,pass:u.pass,addr:u.addr||''})})},
async fetchCustomers(){try{return (await this.req('customers?select=*&limit=500')).map(u=>({tel:u.tel,name:u.name,email:u.email,pass:u.pass,addr:u.addr||'',date:u.created_at?new Date(u.created_at).toLocaleDateString():''}))}catch(e){return[]}},
};
const Catalog={URL:'assets/catalog.json?v=23',
ORIG:{p1:{name:'Windbreaker Brazil 94',price:25000,old:32000,desc:'Coupe-vent Brazil 94, tissu déperlant, broderie poitrine.',cat:'windbreaker'},p2:{name:'Ensemble Nike Tech Fleece Noir',price:35000,old:42000,desc:'Haut + pantalon Tech Fleece, coupe regular.',cat:'nike'},p3:{name:'Ensemble Adidas Adicolor Noir',price:32000,old:38000,desc:'Trefoil brodé, bandes mythiques.',cat:'adidas'},p4:{name:'Windbreaker Brazil Retro 2002',price:22000,old:0,desc:'Edition retro 2002.',cat:'windbreaker'},p5:{name:'Bonnet BMB + Chaussettes',price:8000,old:10000,desc:'Pack accessoires.',cat:'accessoire'}},
SEED_IDS:['p1','p2','p3','p4','p5','p6','p7','p8'],
async load(){const r=await fetch(this.URL);if(!r.ok)throw 0;return await r.json()},
pristine(p){const o=this.ORIG[p.id];if(!o)return false;return p.name===o.name&&+p.price===o.price&&+(p.old||0)===o.old&&String(p.desc||'')===o.desc&&String(p.cat||'')===o.cat},
merge(ps,cat){let ch=false;const ids=new Set(cat.map(c=>c.id));let del=[];try{del=JSON.parse(localStorage.getItem('bmb_deleted')||'[]')}catch(e){}
const out=[];
for(const c of cat){if(del.includes(c.id))continue;const l=ps.find(p=>p.id===c.id);
if(!l){out.push(Object.assign({},c));ch=true}
else if(l.custom){out.push(l)}
else if(this.pristine(l)){const u=Object.assign({},l,{name:c.name,price:c.price,old:c.old,desc:c.desc,images:(c.images||[]).slice(),emoji:c.emoji||'👕'});if(JSON.stringify(u)!==JSON.stringify(l)){out.push(u);ch=true}else out.push(l)}
else{l.custom=1;out.push(l);ch=true}}
for(const p of ps){if(!ids.has(p.id)&&(p.custom||!this.SEED_IDS.includes(p.id)))out.push(p);else if(!ids.has(p.id))ch=true}
return{list:out,changed:ch}}};
