const V='bmb-v42';
self.addEventListener('install',()=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;let u;try{u=new URL(e.request.url)}catch(x){return}if(u.origin!==location.origin)return;
if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(ch=>ch.put(e.request,c)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))}else{e.respondWith(caches.match(e.request).then(h=>{if(h)return h;return fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(ch=>ch.put(e.request,c)).catch(()=>{});return r}).catch(()=>undefined)}))}});
