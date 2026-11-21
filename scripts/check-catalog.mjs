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
const added=await (await worker.fetch(new Request(canonicalOrigin+'/photos/?added=2026-11-21'),{})).text();
assert.ok(added.includes('白須賀海岸の波打ち際（撮影年不詳）'),'new additions filter missing prefectural photo');
assert.ok(!added.includes('/photos/ndl-arai-1918/'),'new additions filter includes an earlier photo');
const latestBatch=photos.map(p=>p.addedBatch).filter(Boolean).sort().at(-1);
if(latestBatch){
 const batchPhotos=photos.filter(p=>p.addedBatch===latestBatch);
 const batchPath='/photos/?batch='+encodeURIComponent(latestBatch);
 const batchHtml=await (await worker.fetch(new Request(canonicalOrigin+batchPath),{})).text();
 assert.ok(batchHtml.includes(`<strong>${batchPhotos.length}点</strong>`),'batch count differs');
 assert.ok(!batchHtml.includes('/photos/ndl-arai-1918/'),'batch includes original archive');
 assert.ok(!batchHtml.includes('/photos/shizuoka-mizube-shirasuka/'),'batch includes previous release');
 assert.ok(batchHtml.includes(`name="batch" value="${latestBatch}"`),'batch lost when submitting a search');
 const last=batchPhotos.at(-1);
 const exactQuery=await (await worker.fetch(new Request(canonicalOrigin+batchPath+'&q='+encodeURIComponent(last.id)),{})).text();
 assert.ok(exactQuery.includes(`<strong>1点</strong>`)&&exactQuery.includes('/photos/'+last.id+'/'),'batch search cannot find the last addition');
 const endPage=await (await worker.fetch(new Request(canonicalOrigin+batchPath+'&page='+Math.ceil(batchPhotos.length/24)),{})).text();
 assert.ok(endPage.includes('/photos/'+last.id+'/'),'pagination omits the last addition');
}
const unknown=await (await worker.fetch(new Request(canonicalOrigin+'/photos/?era='+encodeURIComponent('年代不詳')),{})).text();
assert.ok(unknown.includes('撮影年不詳（2013年公開資料）'),'publication year must not become shooting year');
const sitemap=await (await worker.fetch(new Request(canonicalOrigin+'/sitemap.xml'),{})).text();
assert.equal((sitemap.match(/<url>/g)||[]).length,allPaths.length);
console.log(JSON.stringify({photos:photos.length,imageVariants:photos.reduce((n,p)=>n+p.sizes.length,0),pages:allPaths.length,checkedLinks,search:'pass',sitemap:'pass'}));
