document.querySelectorAll('form[data-desk]').forEach(form=>form.addEventListener('submit',async e=>{
 e.preventDefault();
 const status=document.querySelector('#desk-status'),button=form.querySelector('button');
 if(!confirm(button.textContent+'操作を行いますか？'))return;
 button.disabled=true;const data=new FormData(form);
 try{
 if(form.hasAttribute('data-children')){
   const files=data.getAll('file');
   for(let index=0;index<files.length;index++){
     const file=files[index],one=new FormData();
     one.set('file',file);one.set('checked',data.get('checked'));
     status.textContent=(index+1)+' / '+files.length+'　'+file.name+' を取り込み中';
     const response=await fetch(form.action,{method:'POST',body:one}),result=await response.json();
     if(!response.ok)throw Error(file.name+'　'+(result.error||'取り込みに失敗しました。')+' 完了分は受付済みです。同じ写真を選んで再開できます。');
   }
   location.reload();return;
 }
 if(form.hasAttribute('data-edition')){const meta={};for(const key of ['title','place','district','theme','dateLabel','alt','caption','credit','change','era','yearMin','yearMax']){const raw=data.get(key);meta[key]=key.startsWith('year')?(raw?Number(raw):null):raw;data.delete(key)}data.set('metadata',JSON.stringify(meta))}
 const r=await fetch(form.action,{method:'POST',body:data}),j=await r.json();if(!r.ok)throw Error(j.error||'処理に失敗しました。');
 if(j.review){status.textContent='確認した権利者に、この版のリンクを個別にお送りください。 '+j.review;status.scrollIntoView()}else location.reload()
 }catch(err){status.textContent=err.message;status.scrollIntoView()}finally{button.disabled=false}
}));
