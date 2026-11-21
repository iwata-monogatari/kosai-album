export const maxPackSize=32*1024*1024;
const hashPattern=/^[a-f0-9]{64}$/;
export function validRange(span){
  return !!span&&Number.isSafeInteger(span.offset)&&span.offset>=0&&Number.isSafeInteger(span.length)&&span.length>0&&
    span.offset+span.length<=maxPackSize&&hashPattern.test(span.sha256);
}
export function validPackId(id){return typeof id==='string'&&hashPattern.test(id);}

// Both the object name and the byte window come exclusively from the compiled catalogue.
export async function packedImage(bucket,photo,width,method,absent){
  const span=photo.imageRanges?.[width];
  if(!validPackId(photo.imagePack)||!validRange(span))return absent(503);
  const key='public-archive/packs/'+photo.imagePack+'.bin';
  const head=method==='HEAD';
  const object=head?await bucket.head(key):await bucket.get(key,{range:{offset:span.offset,length:span.length}});
  if(!object)return absent();
  const validSize=Number.isSafeInteger(object.size)&&object.size<=maxPackSize&&object.size>=span.offset+span.length;
  if(!validSize||(!head&&(!object.body||object.range?.offset!==span.offset||object.range?.length!==span.length))){
    if(object.body)await object.body.cancel();
    return absent(503);
  }
  return new Response(head?null:object.body,{headers:{
    'content-type':'image/webp','content-length':String(span.length),'cache-control':'no-store','etag':'"'+span.sha256+'"'
  }});
}
