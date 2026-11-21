const supplied=location.hash.slice(1);
history.replaceState(null,'',location.pathname);
document.querySelector('#exchange')?.addEventListener('click',async()=>{
 const msg=document.querySelector('#review-message');
 try{const r=await fetch('/review/exchange',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:supplied})});if(!r.ok)throw Error();location.assign('/review/preview')}catch{msg.textContent='リンクを確認できません。受け取ったメールから開き直してください。'}
});
