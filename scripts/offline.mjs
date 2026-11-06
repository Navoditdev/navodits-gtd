import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
      ),
    )
  ).flat();
}
const paths = (await files("dist")).filter((p) => !p.endsWith("sw.js"));
const hash = createHash("sha256");
for (const path of paths) hash.update(await readFile(path));
const cache = "navodit-gtd-" + hash.digest("hex").slice(0, 12);
const urls = paths.map((p) => "/" + p.replace(/^dist\//, ""));
// Cache only this static application shell. User tasks stay in browser storage.
await writeFile(
  "dist/sw.js",
  `const CACHE=${JSON.stringify(cache)};\nconst ASSETS=${JSON.stringify(urls)};\nself.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});\nself.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('navodit-gtd-')&&key!==CACHE).map(key=>caches.delete(key)))));});\nself.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.open(CACHE).then(cache=>cache.match('/index.html'))));return;}if(!ASSETS.includes(url.pathname))return;event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request))||fetch(event.request)));});\n`,
);
console.log(`Offline shell: ${urls.length} bundled files (${cache}).`);
