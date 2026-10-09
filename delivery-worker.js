/* Cache static original assets only. Room APIs and commands always use the network. */
'use strict';
// 212 menu caches + 111 battle packs already exceed the old 220-file limit.
// Leave room for HUD, audio and the active build without cycling out menu art.
const CACHE='takeover-delivery-assets-v1',VERSION='4d5bf4f92ed803c8',MAX_FILES=768;
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const current=await caches.open(CACHE);for(const name of await caches.keys())if(name.startsWith('takeover-delivery-')&&name!==CACHE){const old=await caches.open(name);for(const key of await old.keys())if(!await current.match(key))await current.put(key,await old.match(key));await caches.delete(name);}await self.clients.claim();})()));
const store=async(request,response)=>{if(!response.ok||response.type==='opaque')return;try{const cache=await caches.open(CACHE);await cache.put(request,response.clone());const keys=await cache.keys();for(let i=0;i<keys.length-MAX_FILES;i++)await cache.delete(keys[i]);}catch{/* A cache write failure must not discard a downloaded resource. */}};
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 if(request.mode==='navigate'&&(url.pathname==='/'||url.pathname==='/index.html')){
  const key=new Request(self.location.origin+'/'),network=fetch(request).then(async response=>{await store(key,response);return response;});event.waitUntil(network.then(()=>{}).catch(()=>{}));
  event.respondWith((async()=>{const cached=await caches.match(key,{cacheName:CACHE});if(!cached)return network;const current=(await cached.clone().text()).includes('name="game-build" content="'+VERSION+'"');if(!current)return network.catch(()=>cached);const fresh=await Promise.race([network.catch(()=>null),new Promise(resolve=>setTimeout(()=>resolve(null),500))]);return fresh||cached;})());return;
 }
 if(!url.pathname.startsWith('/assets/')&&!['/game-shell.js','/game-shell.css'].includes(url.pathname))return;
 event.respondWith((async()=>{const cached=await caches.match(request,{cacheName:CACHE});if(cached)return cached;const response=await fetch(request);await store(request,response);return response;})());
});
