const MiB=1048576;
export const zipLimit=20*MiB;
const images=new Set('jpg jpeg jpe jfif png webp heic heif tif tiff dng arw srf sr2 crw cr2 cr3 nef nrw raf orf rw2 pef ptx srw x3f rwl 3fr fff iiq dcr kdc mrw raw erf mef mos'.split(' '));
const notes=new Set(['txt','csv','pdf']);
function invalid(message='ZIPの構造を確認できません。通常のZIP形式で作り直してください。'){
  throw Object.assign(new Error(message),{status:400});
}
export function inspectZip(bytes,name){
  const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const u16=i=>dv.getUint16(i,true),u32=i=>dv.getUint32(i,true);
  const fits=(i,n,end)=>i>=0 && n>=0 && i+n<=end;
  function extra(start,length){
    const end=start+length;
    while(start<end){
      if(!fits(start,4,end))invalid();
      const id=u16(start),len=u16(start+2);
      if(id===1||id===0x9901||id===0x7075||!fits(start+4,len,end))invalid('ZIP64・暗号化・別名付きZIPには対応していません。');
      start+=4+len;
    }
  }
  if(bytes.length<22||bytes.length>zipLimit)invalid();
  const last=bytes.length-22;
  let end=last;
  while(end>=Math.max(0,last-65535)&&(u32(end)!==0x06054b50||end+22+u16(end+20)!==bytes.length))end--;
  if(end<Math.max(0,last-65535)||u16(end+4)||u16(end+6))invalid();
  const entries=u16(end+10),start=u32(end+16);
  if(entries!==u16(end+8)||!entries||entries>256)invalid('ZIPはフォルダーを含め256項目までです。');
  if(start+u32(end+12)!==end)invalid();
  const ranges=[],names=new Set();
  let cursor=start,total=0,photos=0;
  for(let ix=0;ix<entries;ix++){
    if(!fits(cursor,46,end)||u32(cursor)!==0x02014b50)invalid();
    const flags=u16(cursor+8),method=u16(cursor+10),crc=u32(cursor+16),packed=u32(cursor+20),size=u32(cursor+24);
    const nl=u16(cursor+28),el=u16(cursor+30),cl=u16(cursor+32),local=u32(cursor+42);
    if(flags & ~0x80e || ![0,8].includes(method) || u16(cursor+34))invalid('暗号化・分割ZIPには対応していません。無圧縮またはDeflateのZIPをお選びください。');
    if(!nl||nl>2048||!fits(cursor+46,nl+el+cl,end)||packed===0xffffffff||size===0xffffffff)invalid();
    const raw=bytes.subarray(cursor+46,cursor+46+nl);
    let filename;
    try {filename=new TextDecoder(flags&0x800?'utf-8':(raw.every(b=>b<128)?'utf-8':'shift_jis'),{fatal:true}).decode(raw);}
    catch {invalid('ZIP内のファイル名を読み取れません。UTF-8形式で保存してください。');}
    const folder=filename.endsWith('/');
    const parts=(folder?filename.slice(0,-1):filename).split('/');
    if(parts.some(part=>!part||part==='.'||part==='..'||/[\\:\x00-\x1f\x7f<>|"*?]/u.test(part)||/[ .]$/.test(part)||/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part)))invalid('ZIP内のパスまたはファイル名をご確認ください。');
    const normalized=filename.normalize('NFC').toLowerCase().replace(/\/$/,'');
    if(names.has(normalized))invalid('ZIP内に同じ名前の項目があります。');
    names.add(normalized);
    const attr=u32(cursor+38),unixKind=(attr>>>28)&15;
    if((unixKind&&unixKind!==(folder?4:8))||(attr&0x400))invalid('リンクや特殊なファイルを含むZIPは受け付けていません。');
    const leaf=parts.at(-1).toLowerCase(),ext=leaf.includes('.')?leaf.split('.').at(-1):'';
    const sidecar=leaf==='.ds_store'||leaf.startsWith('._')&&(images.has(ext)||notes.has(ext)||parts[0]==='__MACOSX'&&!leaf.includes('.',1));
    if(!folder&&!sidecar&&!images.has(ext)&&!notes.has(ext))invalid('ZIP内の写真・メモ以外のファイルを取り除いてください。');
    if(!folder&&!sidecar&&parts[0]!=='__MACOSX'&&images.has(ext)&&size>0)photos++;
    if(folder&&size!==0||method===0&&packed!==size)invalid();
    total+=size;
    if(total>256*MiB||size>MiB&&size>200*Math.max(1,packed))invalid('ZIPの展開後容量または圧縮率が上限を超えています。');
    extra(cursor+46+nl,el);
    if(!fits(local,30,start)||u32(local)!==0x04034b50||u16(local+6)!==flags||u16(local+8)!==method||u16(local+26)!==nl)invalid();
    const lextra=u16(local+28),data=local+30+nl+lextra;
    if(!fits(data,packed,start)||!raw.every((b,i)=>bytes[local+30+i]===b))invalid();
    extra(local+30+nl,lextra);
    let next=data+packed;
    if(flags&8){
      if(fits(next,4,start)&&u32(next)===0x08074b50)next+=4;
      if(!fits(next,12,start)||u32(next)!==crc||u32(next+4)!==packed||u32(next+8)!==size)invalid();
      next+=12;
    }else if(u32(local+14)!==crc||u32(local+18)!==packed||u32(local+22)!==size)invalid();
    ranges.push([local,next]);
    cursor+=46+nl+el+cl;
  }
  ranges.sort((a,b)=>a[0]-b[0]);
  if(cursor!==end||ranges[0][0]!==0||ranges.at(-1)[1]!==start||ranges.some(([pos],i)=>i&&pos!==ranges[i-1][1]))invalid();
  if(!photos)invalid('ZIPには写真を1枚以上入れてください。');
  return {kind:'zip',name:String(name||'original.zip').split(/[\\/]/).at(-1).replace(/[\x00-\x1f\x7f]/g,'').slice(0,240),bytes:bytes.length,entries,photos,uncompressedBytes:total};
}
