import {layout} from './gallery.js';
import {now, digest, random, stmt, json, reject, boundedForm} from './intake.js';
export async function operatorLogin(request,env,path) {
  if (path==='/admin/login/' && request.method==='GET') {
    const body='<section class="wrap section"><h1>運営者ログイン</h1><form method="post" action="/admin/session" class="field"><label for="ticket">運営用コード</label><input id="ticket" name="ticket" type="password" autocomplete="off" required><button class="button">台帳を開く</button></form></section>';
    return new Response(layout('運営者ログイン',path,body,{private:true}),{headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-store'}});
  }
  if(path!=='/admin/session'||request.method!=='POST')return json({error:'ページがありません。'},404);
  const ticket=(await boundedForm(request,2048)).get('ticket');
  if(typeof ticket!=='string'||!/^[a-f0-9]{64}$/.test(ticket))reject('運営用コードをご確認ください。',403);
  const session=random();
  const row=await stmt(env.DB,'UPDATE operator_sessions SET session_hash=?,expires=? WHERE ticket_hash=? AND session_hash IS NULL AND expires>? RETURNING expires',await digest(session),now()+28800,await digest(ticket),now()).first();
  if(!row)reject('使用済みまたは期限切れの運営用コードです。',403);
  return new Response(null,{status:303,headers:{location:'/admin/','cache-control':'no-store','set-cookie':'__Host-kosai-operator='+session+'; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800'}});
}
