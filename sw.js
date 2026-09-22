const CACHE='shtrend-v22';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-apple-180.png'];
self.addEventListener('install',e=>{self.skipWaiting();
  // HTTP 캐시 우회해서 최신본으로 채움
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(a=>
    fetch(a,{cache:'no-store'}).then(r=>r.ok&&c.put(a,r)).catch(()=>{})))));});
self.addEventListener('activate',e=>{e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  if(e.request.mode==='navigate'||u.pathname.endsWith('index.html')){
    // 네트워크 우선 + HTTP 캐시 우회(GitHub Pages 10분 캐시로 옛 버전이 뜨던 문제)
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{
        if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));}return r;})
      .catch(()=>caches.match('./index.html')));return;}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});
