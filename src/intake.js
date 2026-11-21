import {inspectZip,zipLimit} from './zip.js';
export const now=()=>Math.floor(Date.now()/1000);
export const json=(v,status=200,headers={})=>Response.json(v,{status,headers:{'cache-control':'no-store',...headers}});
export function reject(message,status=400){throw Object.assign(new Error(message),{status})}
export async function digest(v){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',typeof v==='string'?new TextEncoder().encode(v):v))].map(b=>b.toString(16).padStart(2,'0')).join('')}
export const random=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
export const stmt=(db,sql,...values)=>db.prepare(sql).bind(...values);
export async function boundedForm(req,limit){
 if(!req.body||Number(req.headers.get('content-length'))>limit)reject('受付できる容量を超えています。',413);
 let bytes=0;
 const reader=req.body.getReader();
 const stream=new ReadableStream({async pull(controller){
   const {done,value}=await reader.read();
   if(done){controller.close();return}
   bytes+=value.byteLength;
   if(bytes>limit){controller.error(new Error('size'));await reader.cancel();return}
   controller.enqueue(value);
 },cancel(reason){return reader.cancel(reason)}});
 try{return await new Response(stream,{headers:{'content-type':req.headers.get('content-type')||''}}).formData()}
 catch{if(bytes>limit)reject('受付できる容量を超えています。',413);reject('フォームの内容を読み取れません。')}
}
export function dimensions(a){
 const dv=new DataView(a.buffer,a.byteOffset,a.byteLength),name=(n,l)=>String.fromCharCode(...a.slice(n,n+l));
 if(a.length>32&&name(1,3)==='PNG'&&a[0]===137&&dv.getUint32(4)===0x0d0a1a0a&&name(12,4)==='IHDR')return ['image/png',dv.getUint32(16),dv.getUint32(20)];
 if(a.length>30&&name(0,4)==='RIFF'&&name(8,4)==='WEBP'&&dv.getUint32(4,true)+8===a.length){const kind=name(12,4);if(kind==='VP8X')return ['image/webp',1+(a[24]|a[25]<<8|a[26]<<16),1+(a[27]|a[28]<<8|a[29]<<16)];if(kind==='VP8 '&&a[23]===157&&a[24]===1&&a[25]===42)return ['image/webp',dv.getUint16(26,true)&16383,dv.getUint16(28,true)&16383];if(kind==='VP8L'&&a[20]===47){const b=dv.getUint32(21,true);return ['image/webp',1+(b&16383),1+((b>>>14)&16383)]}}
 if(a[0]===255&&a[1]===216){let i=2;while(i+9<a.length&&a[i]===255){while(a[i]===255)i++;const m=a[i++];if(m===218||m===217)break;const len=dv.getUint16(i);if(len<2||i+len>a.length)break;if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(m))return ['image/jpeg',dv.getUint16(i+5),dv.getUint16(i+3)];i+=len}}
 reject('写真を読み取れません。JPEG・PNG・WebPをお選びください。');
}
export async function readPhoto(file){
 if(!file||typeof file.arrayBuffer!=='function'||!file.size||file.size>10*1048576)reject('10 MiB以下の写真を1枚選んでください。');
 const bytes=new Uint8Array(await file.arrayBuffer());
 const [mime,w,h]=dimensions(bytes);
 if(!w||!h||w*h>40000000)reject('写真は4,000万画素以下でお願いします。');
 if(file.type&&file.type!==mime)reject('拡張子と画像形式をご確認ください。');
 return {bytes,mime};
}
export async function intake(req,env){
 const f=await boundedForm(req,zipLimit+65536);
 function field(name,max=300,required=false){const v=f.get(name)||'';if(typeof v!=='string'||v.length>max||(required&&!v.trim()))reject('入力をご確認ください（'+name+'）。');return v.trim()}
 const kind=field('kind',10,true),email=field('email',254,true).toLowerCase(),key=field('requestKey',128,true),rights=field('rights',20)||'unknown',note=field('note',8000),title=field('title',240),place=field('place',240),dateLabel=field('dateLabel',200);
 if(!['photo','consult','contact'].includes(kind)||!['self','family','unknown'].includes(rights)||!/^[-\w]{20,128}$/.test(key)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||field('consent',8)!=='1'||(kind!=='photo'&&!note))reject('必須項目と受付への同意をご確認ください。');
 const file=f.get('file');let bytes=null,mime=null,attachment;
 if(kind==='photo'){
   if(f.getAll('file').length!==1||!file||typeof file.arrayBuffer!=='function'||!file.size)reject('写真またはZIPを1個選んでください。');
   const prefix=new Uint8Array(await file.slice(0,4).arrayBuffer());
   if(/\.zip$/i.test(file.name)||/^(?:application\/(?:x-zip-compressed|zip)|multipart\/x-zip)$/i.test(file.type)||prefix[0]===80&&prefix[1]===75){
     if(file.size>zipLimit)reject('ZIPは20 MiB以下でお送りください。',413);
     bytes=new Uint8Array(await file.arrayBuffer());attachment=inspectZip(bytes,file.name);mime='application/zip';
   }else ({bytes,mime}=await readPhoto(file));
 }
 const metadata=JSON.stringify({title,place,dateLabel,note,attachment}),fp=await digest(JSON.stringify([kind,email,rights,metadata,bytes?await digest(bytes):'']));
 const db=env.DB, read=()=>stmt(db,'SELECT * FROM submissions WHERE request_key=?',key).first();
 let row=await read();
 if(row&&row.fingerprint!==fp)reject('入力内容が変わりました。新しい受付としてお送りください。',409);
 if(row&&row.state!=='saving')return json({id:row.id});
 const token=field('cf-turnstile-response',2048,true),check=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token})}).then(r=>r.json());
 if(!check.success||check.hostname!==env.PUBLIC_HOST||check.action!=='submit')reject('確認の有効期限が切れました。もう一度確認して送信してください。',422);
 if(!row){const id=crypto.randomUUID(),obj=bytes?'original/'+id:null;
 await stmt(db,"INSERT OR IGNORE INTO submissions(id,request_key,fingerprint,kind,state,original_key,rights,created,deadline) VALUES(?,?,?,?,'saving',?,?,?,?)",id,key,fp,kind,obj,rights,now(),now()+86400).run();row=await read()}
 if(!row||row.fingerprint!==fp)reject('受付内容が一致しません。',409);
 if(row.state==='saving'){if(bytes)await env.ORIGINALS.put(row.original_key,bytes,{httpMetadata:{contentType:mime}});
 await db.batch([stmt(db,'INSERT OR IGNORE INTO private_contacts VALUES(?,?,?)',row.id,email,metadata),stmt(db,"UPDATE submissions SET state='received',deadline=NULL WHERE id=? AND state='saving'",row.id)])}
 return json({id:row.id},201);
}
