import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import worker from '../src/index.js';
import photos from '../data/photos.json' with {type:'json'};
assert.equal(new Set(photos.map(p=>p.id)).size,photos.length,'duplicate photo IDs');
const allPaths=['/','/photos/','/features/kosai-station/','/library/','/consult/','/creator/','/about/','/usage/','/privacy/','/okuru/','/contact/',...photos.map(p=>'/photos/'+p.id+'/')];
for(const photo of photos){
 for(const field of ['title','place','dateLabel','caption','source','credit','license','licenseUrl'])assert.ok(photo[field],photo.id+' missing '+field);
 for(const size of photo.sizes)assert.ok((await stat(`public/archive/${photo.id}-${size}.webp`)).size>100,photo.id);
}
const canonicalOrigin='https://kosaialb.atawi.link';
let checkedLinks=0;
for(const path of allPaths){
 const response=await worker.fetch(new Request(canonicalOrigin+path),{TURNSTILE_SITE:'test-public-key'});
 assert.equal(response.status,200,path);
 const html=await response.text();
 assert.ok(html.includes('湖西懐かし写真館'),path);
 assert.ok(!/袋井懐かし写真館|浅羽|木原|ふくろい|湖西駅/.test(html),path+' residual template content');
 for(const match of html.matchAll(/href="(\/[^"]*)"/g)){
  const target=new URL(match[1].replaceAll('&amp;','&'),canonicalOrigin).pathname;
  if(target.startsWith('/photos/')&&!target.startsWith('/photos/?'))assert.ok(allPaths.includes(target),path+' broken '+target);
  checkedLinks++;
 }
 if(path.startsWith('/photos/')&&path!='/photos/'){
  assert.ok(html.includes('utm_content=photo_apply'),path+' missing consultation');
  assert.ok(html.includes('出典・利用条件'),path);
 }
}
const search=await worker.fetch(new Request(canonicalOrigin+'/photos/?q='+encodeURIComponent('新居')),{}),body=await search.text();
assert.ok(body.includes('舟の集まる新居の水辺'));
const sitemap=await (await worker.fetch(new Request(canonicalOrigin+'/sitemap.xml'),{})).text();
assert.equal((sitemap.match(/<url>/g)||[]).length,allPaths.length);
console.log(JSON.stringify({photos:photos.length,imageVariants:photos.reduce((n,p)=>n+p.sizes.length,0),pages:allPaths.length,checkedLinks,search:'pass',sitemap:'pass'}));
