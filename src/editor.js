import catalog from './catalog.js';
import {desk} from './desk.js';
import {layout,esc} from './gallery.js';
import {json,now,digest,random,stmt,reject,boundedForm,dimensions,readPhoto} from './intake.js';
const day=86400;
const use='閲覧無料・広告なしの湖西懐かし写真館で掲載版を保存・複製・公衆送信する無償・非独占の許諾。著作権は権利者に残り、他媒体への転載は含みません。';
const html=(title,body,script='')=>new Response(layout(title,'/review/','<section class="wrap section"><h1>'+esc(title)+'</h1>'+body+'</section>',{private:true,script}),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer'}});
const cookie='__Host-kosai-review';
export async function review(req,env,path){
 if(path==='/review/'&&req.method==='GET')return html('掲載内容の確認','<p>編集部からお送りした確認リンクで開いてください。掲載見本を見るときは下のボタンを押してください。</p><button id="exchange">掲載見本を開く</button><p role="status" id="review-message"></p>','<script defer src="/review.js"></script>');
 if(path==='/review/exchange'&&req.method==='POST'){
 const {token}=await req.json();if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))reject('確認リンクをご確認ください。',403);
 const session=random();const row=await stmt(env.DB,'UPDATE editions SET session_hash=?,session_expires=? WHERE token_hash=? AND expires>? AND decision IS NULL RETURNING id',await digest(session),now()+1800,await digest(token),now()).first();if(!row)reject('使用済みまたは期限切れの確認リンクです。',403);
 return json({ok:true},200,{'set-cookie':cookie+'='+session+'; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=1800'})
 }
 const raw=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookie+'='))?.slice(cookie.length+1)||'';
 const ed=raw&&await stmt(env.DB,'SELECT * FROM editions WHERE session_hash=? AND session_expires>? AND expires>? AND decision IS NULL',await digest(raw),now(),now()).first();
 if(!ed)reject('確認リンクを開き直してください。',403);const p=JSON.parse(ed.metadata);
 if(path==='/review/image'&&req.method==='GET'){const obj=await env.EDITIONS.get(ed.id+'/'+p.sizes.at(-1));return obj?new Response(obj.body,{headers:{'content-type':'image/webp','cache-control':'no-store'}}):new Response(null,{status:404})}
 if(path==='/review/preview'&&req.method==='GET')return html('掲載見本',`<img src="/review/image" style="max-width:100%" alt="${esc(p.alt)}"><h2>${esc(p.title)}</h2><p>${esc(p.place)}　${esc(p.dateLabel)}</p><p>${esc(p.caption)}</p><p>提供名　${esc(p.credit)}</p><p>加工　${esc(p.change)}</p><p>掲載条件　${esc(use)}</p><p>対象版　${esc(ed.id)}</p><form method="post" action="/review/decision"><button name="decision" value="agree">この内容で掲載に同意</button> <button name="decision" value="revise">修正を希望</button> <button name="decision" value="decline">辞退する</button></form>`);
 if(path==='/review/decision'&&req.method==='POST'){const choice=(await boundedForm(req,2048)).get('decision');if(!['agree','revise','decline'].includes(choice))reject('選択をご確認ください。');
 const r=await stmt(env.DB,'UPDATE editions SET decision=?,decided=?,session_hash=NULL,token_hash=NULL WHERE id=? AND decision IS NULL AND session_hash=? AND expires>? RETURNING id',choice,now(),ed.id,await digest(raw),now()).first();if(!r)reject('この確認は終了しました。',409);
 if(choice==='decline')await stmt(env.DB,"UPDATE submissions SET state='declined',deadline=? WHERE id=? AND state='received' AND NOT EXISTS(SELECT 1 FROM publications WHERE id=? AND state='public')",now()+90*day,ed.sid,'c-'+ed.sid).run();
 return html('お返事を受け付けました','<p>'+({agree:'この版への掲載同意を記録しました。',revise:'修正のご希望を記録しました。',decline:'辞退のお申し出を記録しました。'}[choice])+'</p>')}
 reject('ページが見つかりません。',404)
}
async function editor(req,env){
 const ticket=(req.headers.get("cookie")||"").match(/(?:^|; *)__Host-kosai-operator=([a-f0-9]{64})(?:;|$)/)?.[1];
 if(ticket && await stmt(env.DB,"SELECT 1 FROM operator_sessions WHERE session_hash=? AND expires>?",await digest(ticket),now()).first())return "cloudflare-operator";
 reject('運営者ログインが必要です。',403);
}
export async function admin(req,env,path){
 const actor=await editor(req,env),db=env.DB;
 if(path==='/admin/archive/'&&req.method==='GET')return html('資料写真の一時停止・取り下げ','<form method="post" action="/api/admin/archive-stop"><p><label>写真番号 <input name="id" required></label></p><p><label>理由 <input name="reason" required></label></p><p><label>操作 <select name="state"><option value="held">一時停止</option><option value="withdrawn">恒久的に取り下げ</option></select></label></p><button>この写真の配信を停止する</button></form>');
 if(path==='/api/admin/archive-stop'&&req.method==='POST'){const f=await boundedForm(req,4096),id=f.get('id'),st=f.get('state'),reason=String(f.get('reason')||'').trim();
 if(!catalog.some(p=>p.id===id)||!['held','withdrawn'].includes(st)||!reason)reject('写真番号・理由を確認してください。');
 await stmt(db,"INSERT INTO archive_stops VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,at=excluded.at,actor=excluded.actor,reason=excluded.reason WHERE archive_stops.state!='withdrawn'",id,st,now(),actor,reason).run();
 return html('配信を停止しました','<p><a href="/admin/">受付台帳へ戻る</a></p>')}
 const item=path.match(/^\/admin\/([a-f0-9-]{36})\/$/);if(item&&req.method==='GET'){const content=await desk(db,item[1]);if(!content)reject('受付が見つかりません。',404);return new Response(content,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}})}
 if(req.method==='GET'&&path==='/admin/'){const {results}=await db.prepare('SELECT id,kind,state,created FROM submissions ORDER BY created DESC LIMIT 100').all();return html('写真の受付台帳','<ul>'+results.map(r=>'<li><a href="/admin/'+r.id+'/">'+esc(r.id)+'</a>　'+esc(r.kind)+'　'+esc(r.state)+'</li>').join('')+'</ul><p><a href="/admin/archive/">資料写真の配信停止</a></p><p>受付番号を開くと、内容の確認・掲載見本の登録・公開状態の変更ができます。</p>')}
 const match=path.match(/^\/api\/admin\/(item|original|child|edition|publish|hold|withdraw|reject)\/([a-f0-9-]{36})$/);if(!match)reject('該当する操作はありません。',404);
 const [,op,id]=match,s=await stmt(db,'SELECT * FROM submissions WHERE id=?',id).first();if(!s)reject('受付が見つかりません。',404);
 if(req.method==='GET'&&op==='item')return json({submission:{id,kind:s.kind,state:s.state,rights:s.rights},private:await stmt(db,'SELECT email,content FROM private_contacts WHERE sid=?',id).first(),versions:(await stmt(db,'SELECT id,proof,issued,decision,decided,metadata FROM editions WHERE sid=?',id).all()).results});
 const contact=await stmt(db,'SELECT email,content FROM private_contacts WHERE sid=?',id).first();
 const content=JSON.parse(contact?.content||'{}'),isZip=content.attachment?.kind==='zip';
 if(req.method==='GET'&&op==='original'&&s.original_key){const o=await env.ORIGINALS.get(s.original_key);if(!o)reject('原本がありません。',404);return new Response(o.body,{headers:{'content-type':'application/octet-stream','content-disposition':isZip?'attachment; filename="original.zip"':'attachment; filename="original"','cache-control':'no-store'}})}
 if(req.method!=='POST')reject('投稿操作が必要です。',405);
 const audit=evt=>stmt(db,'INSERT INTO audit_events(sid,event,actor,at) VALUES(?,?,?,?)',id,evt,actor,now());
 if(op==='child'){
   if(!isZip||s.state!=='received'||!contact)reject('取り込み可能なZIP受付をご確認ください。',409);
   const form=await boundedForm(req,10*1048576+65536),file=form.get('file');
   if(form.get('checked')!=='1'||form.getAll('file').length!==1)reject('原本を端末で確認して写真を1枚選んでください。');
   const {bytes,mime}=await readPhoto(file),sha=await digest(bytes);
   const key='zip:'+id+':'+sha,hash=await digest(key);
   const childId=[hash.slice(0,8),hash.slice(8,12),hash.slice(12,16),hash.slice(16,20),hash.slice(20,32)].join('-');
   const objectKey='original/'+childId;
   await stmt(db,`INSERT OR IGNORE INTO submissions(id,request_key,fingerprint,kind,state,original_key,rights,created,deadline)
     SELECT ?,?,?,'photo','saving',?,?,?,? WHERE EXISTS(SELECT 1 FROM submissions WHERE id=? AND state='received')`,childId,key,sha,objectKey,s.rights,now(),now()+day,id).run();
   const child=await stmt(db,'SELECT state,request_key FROM submissions WHERE id=?',childId).first();
   if(!child||child.request_key!==key||!['saving','received'].includes(child.state))reject('子受付の状態をご確認ください。',409);
   if(child.state==='received')return json({id:childId,existing:true});
   const inherited={title:content.title,place:content.place,dateLabel:content.dateLabel,note:content.note,parentReceipt:id,
     archiveName:content.attachment.name,importedName:String(file.name||'').split(/[\\/]/).at(-1).slice(0,240)};
   await env.ORIGINALS.put(objectKey,bytes,{httpMetadata:{contentType:mime}});
   const pending="EXISTS(SELECT 1 FROM submissions WHERE id=? AND state='saving') AND EXISTS(SELECT 1 FROM submissions WHERE id=? AND state='received')";
   await db.batch([
     stmt(db,'INSERT OR IGNORE INTO private_contacts(sid,email,content) SELECT ?,?,? WHERE '+pending,childId,contact.email,JSON.stringify(inherited),childId,id),
     stmt(db,'INSERT INTO audit_events(sid,event,actor,at) SELECT ?,?,?,? WHERE '+pending,childId,'import from '+id,actor,now(),childId,id),
     stmt(db,"UPDATE submissions SET state='received',deadline=NULL WHERE id=? AND state='saving' AND EXISTS(SELECT 1 FROM submissions WHERE id=? AND state='received')",childId,id)
   ]);
   if((await stmt(db,'SELECT state FROM submissions WHERE id=?',childId).first())?.state!=='received')reject('親受付の状態が変わりました。',409);
   return json({id:childId},201);
 }
 if(isZip&&(op==='edition'||op==='publish'))reject('ZIPから個別の写真を取り込み、子受付ごとに権利と掲載版の同意を確認してください。',409);
 if(op==='edition'){
 if(s.kind!=='photo'||s.state!=='received')reject('写真受付の状態をご確認ください。',409);
 const f=await boundedForm(req,12*1048576),proof=String(f.get('proof')||'').trim(),m=JSON.parse(String(f.get('metadata')||'{}')),p={};
 if(!proof||proof.length>2000)reject('権利者の立場・送付先・来歴を確認してください。');
 for(const k of ['title','place','district','era','dateLabel','alt','theme','caption','credit','change']){if(typeof m[k]!=='string'||!m[k].trim()||m[k].length>2000)reject('公開項目をご確認ください（'+k+'）。');p[k]=m[k].trim()}
 const version=crypto.randomUUID(),sizes=[],hashes={},files=[];
 for(const size of [480,1280,2560]){const fimg=f.get(String(size));if(!fimg||!fimg.size)continue;const b=new Uint8Array(await fimg.arrayBuffer());const [type,w,h]=dimensions(b);
 if(type!=='image/webp'||Math.max(w,h)>size||b.length>6*1048576)reject('表示用WebPのサイズをご確認ください。');const dv=new DataView(b.buffer);
 for(let i=12;i+8<=b.length;){const key=String.fromCharCode(...b.slice(i,i+4));if(!['VP8 ','VP8L','VP8X','ALPH'].includes(key))reject('メタデータを除去した静止画像を使用してください。');const len=dv.getUint32(i+4,true);i+=8+len+(len%2);if(i>b.length)reject('掲載画像が壊れています。')}
 files.push([size,b]);sizes.push(size);hashes[size]=await digest(b);p.width=w;p.height=h}
 if(!sizes.includes(480))reject('一覧用の画像が必要です。');
 Object.assign(p,{id:'c-'+id,version,sizes,yearMin:Number.isInteger(m.yearMin)?m.yearMin:null,yearMax:Number.isInteger(m.yearMax)?m.yearMax:null,type:'地上写真',license:use,aliases:[],hashes});
 const token=random();for(const [w,b] of files)await env.EDITIONS.put(version+'/'+w,b);
 await db.batch([stmt(db,'UPDATE editions SET token_hash=NULL,session_hash=NULL WHERE sid=?',id),stmt(db,'INSERT INTO editions(id,sid,metadata,proof,issued,token_hash,expires) VALUES(?,?,?,?,?,?,?)',version,id,JSON.stringify(p),proof,now(),await digest(token),now()+7*day),audit('edition '+version)]);
 return json({version,review:'https://'+env.PUBLIC_HOST+'/review/#'+token})}
 if(op==='publish'){const f=await boundedForm(req,4096),version=f.get('version'),expected=f.get('expected')||'',ed=await stmt(db,"SELECT metadata FROM editions WHERE id=? AND sid=? AND decision='agree'",version,id).first();
 if(!ed||s.state!=='received')reject('この版の掲載同意をご確認ください。',409);for(const size of JSON.parse(ed.metadata).sizes)if(!await env.EDITIONS.head(version+'/'+size))reject('掲載用画像が不足しています。',409);
 const r=await stmt(db,`INSERT INTO publications(id,version,state) SELECT ?,?,'public' WHERE EXISTS(SELECT 1 FROM submissions WHERE id=? AND state='received') AND EXISTS(SELECT 1 FROM editions WHERE id=? AND decision='agree' AND sid=? AND rowid=(SELECT MAX(rowid) FROM editions WHERE sid=?)) AND COALESCE((SELECT version||':'||state FROM publications WHERE id=?),'')=? ON CONFLICT(id) DO UPDATE SET version=excluded.version,state='public' WHERE publications.state!='withdrawn' RETURNING id`,'c-'+id,version,id,version,id,id,'c-'+id,expected).first();if(!r)reject('状態が変わりました。受付を開き直してください。',409);await audit('publish '+version).run();return json({ok:true})}
 if(op==='hold'||op==='withdraw'){const state=op==='hold'?'held':'withdrawn';const r=await stmt(db,"UPDATE publications SET state=? WHERE id=? AND state!='withdrawn' RETURNING id",state,'c-'+id).first();if(!r)reject('公開状態をご確認ください。',409);await audit(op).run();return json({ok:true})}
 if(op==='reject'){const r=await stmt(db,"UPDATE submissions SET state='rejected',deadline=? WHERE id=? AND state='received' AND NOT EXISTS(SELECT 1 FROM publications WHERE id=? AND state='public') RETURNING id",now()+90*day,id,'c-'+id).first();if(!r)reject('公開状態をご確認ください。',409);await db.batch([stmt(db,'UPDATE editions SET token_hash=NULL,session_hash=NULL WHERE sid=?',id),audit('reject')]);return json({ok:true})}
 reject('該当する操作はありません。',404)
}
