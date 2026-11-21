import assert from 'node:assert/strict';
import {crc32,deflateRawSync} from 'node:zlib';
import {inspectZip} from '../src/zip.js';

// Ordinary single-disk members, with optionally deflated contents and Japanese names.
function archive(members){
  const local=[],central=[];let offset=0;
  for(const [name,data,deflate=false] of members){
    const filename=Buffer.isBuffer(name)?name:Buffer.from(name);
    const plain=Buffer.from(data),body=deflate?deflateRawSync(plain):plain;
    const lh=Buffer.alloc(30),ch=Buffer.alloc(46),flags=Buffer.isBuffer(name)?0:0x800;
    lh.writeUInt32LE(0x04034b50);lh.writeUInt16LE(20,4);lh.writeUInt16LE(flags,6);lh.writeUInt16LE(deflate?8:0,8);
    lh.writeUInt32LE(crc32(plain),14);lh.writeUInt32LE(body.length,18);lh.writeUInt32LE(plain.length,22);lh.writeUInt16LE(filename.length,26);
    ch.writeUInt32LE(0x02014b50);ch.writeUInt16LE(20,4);lh.copy(ch,6,4,28);ch.writeUInt32LE(offset,42);
    local.push(lh,filename,body);central.push(ch,filename);offset+=lh.length+filename.length+body.length;
  }
  const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(members.length,8);
  end.writeUInt16LE(members.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...local,cd,end]);
}
export async function checkZip({request,common,form,image,bytes,auth,env,p}){
  const sample=archive([['写真/',Buffer.alloc(0)],['写真/磐田.webp',bytes,true],[Buffer.from('94d693632e6a7067','hex'),bytes],['メモ.txt','履歴'],['__MACOSX/._磐田.jpg','metadata'],['.DS_Store','meta']]);
  const checked=inspectZip(sample,'まち.zip');assert.equal(checked.entries,6);assert.equal(checked.photos,2);assert.equal(checked.bytes,sample.length);
  assert.equal(checked.uncompressedBytes,bytes.length*2+Buffer.byteLength('履歴metadatameta'));
  for(const members of [[['memo.txt','hello']],[['._photo.jpg','metadata']],[['sample.exe','']],Array.from({length:257},(_,i)=>[i+'.jpg','x'])]){
    assert.throws(()=>inspectZip(archive(members),'invalid.zip'),e=>e.status===400);
  }
  for(const invalid of [sample.subarray(0,20),Buffer.alloc(24),sample.subarray(0,sample.length-1)])assert.throws(()=>inspectZip(invalid,'invalid.zip'),e=>e.status===400);
  const one={...common,requestKey:crypto.randomUUID(),file:new File([sample],'まち.zip',{type:'application/zip'})};
  const first=await request('/api/submissions',form(one));assert.equal(first.status,201,await first.clone().text());
  const {id}=await first.json(),api=(op,sid=id)=>'/api/admin/'+op+'/'+sid;
  assert.equal((await (await request('/api/submissions',form(one))).json()).id,id);
  assert.equal((await request(api('original'))).status,403);
  const download=await request(api('original'),null,auth);assert.equal(download.status,200);
  assert.match(download.headers.get('content-disposition'),/attachment; filename="original.zip"/);
  assert.deepEqual(Buffer.from(await download.arrayBuffer()),sample);
  const original=await (await request(api('item'),null,auth)).json();
  assert.deepEqual(JSON.parse(original.private.content).attachment,checked);
  const parentDesk=await (await request('/admin/'+id+'/',null,auth)).text();assert.match(parentDesk,/未検査の原本/);assert(!parentDesk.includes('data-edition'));
  assert.equal((await request(api('edition'),form({}),auth)).status,409);
  assert.equal((await request(api('publish'),form({}),auth)).status,409);
  assert.equal((await request('/photos/c-'+id+'/')).status,404);
  const childForm=()=>form({file:image,checked:'1'});
  assert.equal((await request(api('child'),childForm())).status,403);
  const siblings=await Promise.all([request(api('child'),childForm(),auth),request(api('child'),childForm(),auth)]);
  assert(siblings.every(r=>r.ok));const child=(await siblings[0].json()).id;assert.equal((await siblings[1].json()).id,child);
  const repeat=await request(api('child'),childForm(),auth);assert.equal((await repeat.json()).id,child);
  const childItem=await (await request(api('item',child),null,auth)).json();assert.equal(childItem.private.email,one.email);
  assert.equal(JSON.parse(childItem.private.content).parentReceipt,id);assert.equal(childItem.submission.rights,one.rights);
  const second=await (await request(api('child'),form({file:new File([await (await import('node:fs/promises')).readFile('public/archive/ndl-arai-1918-1280.webp')],'second.webp',{type:'image/webp'}),checked:'1'}),auth)).json();
  assert(second.id&&second.id!==child);
  const page=await (await request('/admin/'+id+'/',null,auth)).text();assert(page.includes(child)&&page.includes(second.id));
  const res=await request(api('edition',child),form({proof:'テスト用来歴',metadata:JSON.stringify(p),'480':image}),auth);
  assert.equal(res.status,200,await res.clone().text());const {version,review}=await res.json();
  assert.equal((await request(api('publish',child),form({version}),auth)).status,409);
  const exchange=await request('/review/exchange',JSON.stringify({token:review.split('#')[1]}),{'content-type':'application/json'});
  const cookie={cookie:exchange.headers.get('set-cookie').split(';')[0]};
  assert.equal((await request('/review/decision',form({decision:'agree'}),cookie)).status,200);
  assert.equal((await request(api('publish',child),form({version}),auth)).status,200);
  assert.equal((await request('/photos/c-'+child+'/')).status,200);
  for(const sid of [id,second.id])assert.equal((await request('/photos/c-'+sid+'/')).status,404);
  assert.equal((await request(api('publish',second.id),form({version}),auth)).status,409);
  console.log('PASS ZIP intake, private access, Japanese names, Mac metadata, archive checks, child replay and individual publishing consent.');
}

