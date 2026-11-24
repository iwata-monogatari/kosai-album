import {creatorPage} from './creator.js';
import retention from '../ops/retention.js';
import {operatorLogin} from './operator.js';
import catalog from './catalog.js';
import {packedImage} from './archive-pack.js';
import {home,listing,detail,feature,topicPaths,topicPage,library,consultPage,layout,esc,origin} from './gallery.js';
import {intake,json,stmt} from './intake.js';
import {admin,review} from './editor.js';
import {page} from './forms.js';
const catalogById = new Map(catalog.map(photo => [photo.id, photo]));
const html=(s,status=200)=>new Response(s,{status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
const absent=(status=404)=>html(layout('写真を表示できません','/photos/','<div class="wrap section"><h1>このページは表示できません</h1><a href="/photos/">写真一覧へ戻る</a></div>',{private:true}),status);
async function serve(req,env){
 const u=new URL(req.url),path=u.pathname;
 if(![env.PUBLIC_HOST||'kosaialb.atawi.link','localhost','127.0.0.1'].includes(u.hostname)){
 if(/^\/(?:review|admin|api|media|okuru|contact)(?:\/|$)/.test(path)||!['GET','HEAD'].includes(req.method))return absent();return Response.redirect(origin+path,302)}
 if(!['GET','HEAD'].includes(req.method)&&req.headers.get('origin')!==u.origin)return json({error:'送信元を確認できません。'},403);
 if(path==='/api/submissions'&&req.method==='POST')return intake(req,env);
 if(path==='/admin/login/'||path==='/admin/session')return operatorLogin(req,env,path);
 if(path.startsWith('/admin/')||path.startsWith('/api/admin/'))return admin(req,env,path);
 if(path.startsWith('/review/'))return review(req,env,path);
 if(!['GET','HEAD'].includes(req.method))return json({error:'この操作は受け付けていません。'},405);
 const media=path.match(/^\/media\/(c-[a-f0-9-]+)\/([a-f0-9-]+)\/(480|1280|2560)$/);
 if(media){const [,id,v,w]=media,r=await stmt(env.DB,"SELECT state,version FROM publications WHERE id=?",id).first();if(r?.state!=='public'||r.version!==v)return absent(r?.state==='withdrawn'?410:404);
 const o=await env.EDITIONS.get(v+'/'+w);return o?new Response(o.body,{headers:{'content-type':'image/webp','cache-control':'no-store'}}):absent()}
 if(path==='/robots.txt')return new Response('User-agent: *\nDisallow: /admin/\nDisallow: /api/\nDisallow: /review/\nSitemap: '+origin+'/sitemap.xml',{headers:{'content-type':'text/plain'}});
 const archive=path.match(/^\/archive\/([\w-]+)-(480|1280|2560)\.webp$/);
 if(archive){
   const [,id,width]=archive;
   const photo=catalogById.get(id);
   if(!photo||!photo.sizes.includes(Number(width)))return absent();
   const db=env.DB?.withSession?env.DB.withSession('first-primary'):env.DB;
   if(photo.storage==='r2'&&!db)return absent(503);
   const stop=db&&await stmt(db,'SELECT state FROM archive_stops WHERE id=?',id).first();
   if(stop)return absent(stop.state==='withdrawn'?410:404);
   if(photo.storage==='r2'){
     if(!env.EDITIONS||!/^[a-f0-9]{64}$/.test(photo.imageRevision))return absent(503);
     if(photo.imagePack!==undefined||photo.imageRanges!==undefined)return packedImage(env.EDITIONS,photo,width,req.method,absent);
     const key='public-archive/'+id+'/'+photo.imageRevision+'/'+width+'.webp';
     const object=req.method==='HEAD'?await env.EDITIONS.head(key):await env.EDITIONS.get(key);
     if(!object)return absent();
     const headers=new Headers({'content-type':'image/webp','cache-control':'no-store','content-length':String(object.size)});
     if(object.httpEtag)headers.set('etag',object.httpEtag);
     return new Response(req.method==='HEAD'?null:object.body,{headers});
   }
   const asset=await env.ASSETS.fetch(req);
   const headers=new Headers(asset.headers);
   headers.set('cache-control','no-store');
   return new Response(asset.body,{status:asset.status,headers});
 }
 if(path==='/robots.txt')return new Response('User-agent: *\nDisallow: /admin/\nDisallow: /api/\nDisallow: /review/\nSitemap: '+origin+'/sitemap.xml',{headers:{'content-type':'text/plain'}});
 if(path==='/creator')return Response.redirect(origin+'/creator/',301);
 if(path==='/consult/')return html(consultPage());
 if(path==='/creator/')return html(creatorPage());
 if(path==='/album-header.css')return env.ASSETS.fetch(req);
 if(path==='/album-tracker.js')return env.ASSETS.fetch(req);
 if(path==='/oishi-portrait.jpg')return env.ASSETS.fetch(req);
 const extra=page(path,env);if(extra)return html(extra);
 if(path==='/library/')return html(library(u));
 const id=path.match(/^\/photos\/([\w-]+)\/$/)?.[1];
 const isTopic=topicPaths.includes(path);
 if(!id&&!isTopic&&!['/','/photos/','/features/kosai-station/','/sitemap.xml'].includes(path)){
 if(/^\/(?:(?:gallery|desk|review|forms)\.js|style\.css|mark\.svg|operator\.js|album\.css)$/.test(path))return env.ASSETS.fetch(req);return absent()}
 const db=env.DB?.withSession?env.DB.withSession('first-primary'):env.DB;
 const live=db?(await db.prepare("SELECT e.metadata FROM publications p JOIN editions e ON e.id=p.version WHERE p.state='public' AND e.decision='agree' ORDER BY e.issued DESC").all()).results.map(r=>JSON.parse(r.metadata)):[];
 const stops=db?(await db.prepare('SELECT id,state FROM archive_stops').all()).results:[],blocked=new Map(stops.map(r=>[r.id,r.state]));
 const available=blocked.size?catalog.filter(p=>!blocked.has(p.id)):catalog;
 const all=live.length?available.concat(live):available;if(id&&blocked.has(id))return absent(blocked.get(id)==='withdrawn'?410:404);if(path==='/')return html(home(all));if(path==='/photos/')return html(listing(all,u));if(path==='/features/kosai-station/')return html(feature(all));
 if(isTopic)return html(topicPage(all,path));
 if(path==='/sitemap.xml'){const paths=['/consult/','/','/creator/','/library/','/photos/','/features/kosai-station/','/okuru/','/about/','/usage/','/privacy/','/contact/',...topicPaths,...all.map(p=>'/photos/'+p.id+'/')];return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(p=>'<url><loc>'+origin+esc(p)+'</loc></url>').join('')+'</urlset>',{headers:{'content-type':'application/xml','cache-control':'no-store'}})}
 const p=catalogById.get(id)||live.find(p=>p.id===id);if(p)return html(detail(all,p,u));const gone=db&&id.startsWith('c-')&&await stmt(db,"SELECT 1 FROM publications WHERE id=? AND state='withdrawn'",id).first();return absent(gone?410:404)
}
export default {scheduled:retention.scheduled,async fetch(req,env){let r;try{r=await serve(req,env)}catch(e){r=json({error:e.status?e.message:'処理を完了できませんでした。入力を保ったまま、もう一度お試しください。'},e.status||503)}
 const h=new Headers(r.headers);h.set('x-content-type-options','nosniff');h.set('referrer-policy','no-referrer');h.set('x-frame-options','DENY');return new Response(req.method==='HEAD'?null:r.body,{status:r.status,headers:h})}};
