import {layout,esc} from './gallery.js';
import {stmt} from './intake.js';
export async function desk(db,id){
 const p=await stmt(db,'SELECT s.kind,s.state,s.rights,c.email,c.content FROM submissions s LEFT JOIN private_contacts c ON c.sid=s.id WHERE s.id=?',id).first();
 if(!p)return null;
 const editions=(await stmt(db,'SELECT id,metadata,decision,decided FROM editions WHERE sid=? ORDER BY rowid DESC',id).all()).results;
 const current=await stmt(db,'SELECT version,state FROM publications WHERE id=?','c-'+id).first();
 const field=(name,label)=>'<p><label>'+label+'<br><input name="'+name+'" required maxlength="2000"></label></p>';
 const api='/api/admin/';
 const action=(op,label,extra='')=>`<form data-desk method="post" action="${api+op+'/'+id}">${extra}<button>${label}</button></form>`;
 const version=editions[0], prior=current?current.version+':'+current.state:'';
 const content=JSON.parse(p.content||'{}'),zip=content.attachment?.kind==='zip'?content.attachment:null;
 const children=zip?(await stmt(db,'SELECT id,state FROM submissions WHERE request_key LIKE ? ORDER BY created,id','zip:'+id+':%').all()).results:[];
 const zipForm=zip?`<h2>非公開の一括受付</h2><p>${esc(zip.name)} ／ ${Number(zip.entries)}項目（写真名 ${Number(zip.photos)}件）／ ZIP ${Number(zip.bytes).toLocaleString('ja-JP')} バイト・展開後の申告合計 ${Number(zip.uncompressedBytes).toLocaleString('ja-JP')} バイト</p>
 <p>未検査の原本です。ファイル名と構造を確認して受け付けました。内容は担当端末で確認してください。</p>
 ${p.state==='received'?`<p><a href="${api+'original/'+id}">非公開のZIP原本をダウンロード</a></p>
 <form data-desk data-children method="post" action="${api+'child/'+id}" enctype="multipart/form-data">
 <p>担当端末で安全を確認し、写真を選んでください。HEIC・RAWなどはJPEG・PNG・WebPに変換してから取り込めます。各写真は個別の受付になり、権利確認と掲載版への同意をそれぞれ記録します。</p>
 <p><label>取り込む写真（複数可・各10 MiBまで）<input name="file" type="file" accept="image/jpeg,image/png,image/webp" multiple required></label></p>
 <p><label><input type="checkbox" name="checked" value="1" required>ZIP原本を担当端末で検査し、写真の内容を確認しました</label></p><button>選んだ写真を個別に受け付ける</button></form>`:''}
 <h3>取り込んだ写真の受付</h3>${children.length?'<ul>'+children.map(c=>'<li><a href="/admin/'+esc(c.id)+'/">'+esc(c.id)+'</a>　'+esc(c.state)+'</li>').join('')+'</ul>':'<p>取り込み済みの写真はありません。</p>'}`: '';
 const form=`<details><summary>掲載見本を登録して確認リンクを発行する</summary><form data-desk data-edition method="post" action="${api+'edition/'+id}" enctype="multipart/form-data"><p>担当端末で原本を完全に開き、顔・表札等を確認してから、位置情報を含まないWebPとして書き出してください。</p>
 ${field('proof','確認した権利者・送付先・来歴（非公開）')}${Object.entries({title:'写真の題名',place:'撮影場所',district:'地区',theme:'テーマ',dateLabel:'年代表示と根拠',alt:'画像の説明',caption:'公開する説明文',credit:'提供者の公開名',change:'切り抜き・ぼかしなどの加工内容'}).map(([k,v])=>field(k,v)).join('')}
 <p><label>時代 <select name="era"><option>昭和</option><option>平成</option><option>明治・大正</option><option>年代不明</option></select></label></p><p><label>西暦の下限 <input name="yearMin" type="number"></label> <label>上限 <input name="yearMax" type="number"></label></p>
 ${[480,1280,2560].map((w,i)=>'<p><label>長辺'+w+'px以下のWebP <input type="file" accept="image/webp" name="'+w+'" '+(!i?'required':'')+'></label></p>').join('')}<button>この版の確認リンクを発行</button></form></details>`;
 return layout('受付内容','/admin/',`<section class="wrap section"><a href="/admin/">受付台帳に戻る</a><h1>受付内容</h1><p>番号　${esc(id)}　状態　${esc(p.state)}</p><p>返信先　${esc(p.email)}</p><p>撮影者との関係　${esc(p.rights)}</p>${[content.title,content.place,content.dateLabel,content.note].filter(Boolean).map(v=>'<p>'+esc(v)+'</p>').join('')}
 ${content.parentReceipt?'<p>元のZIP受付　<a href="/admin/'+esc(content.parentReceipt)+'/">'+esc(content.parentReceipt)+'</a> ／ '+esc(content.archiveName)+' ／ 取り込み名 '+esc(content.importedName)+'</p>':''}
 ${zip?zipForm:p.kind==='photo'&&p.state==='received'?'<p><a href="'+api+'original/'+id+'">非公開原本を取得</a></p>'+form:''}
 <h2>掲載版と許諾の記録</h2>${editions.length?editions.map(e=>'<p>'+esc(JSON.parse(e.metadata).title)+' ／ '+esc(e.id)+' ／ '+esc(e.decision||'返答待ち')+' '+(e.decided?new Date(e.decided*1000).toISOString():'')+'</p>').join(''):'<p>掲載版はまだありません。</p>'}
 ${version?.decision==='agree'&&p.state==='received'&&current?.state!=='withdrawn'?action('publish','同意済みの最新版を公開','<input type="hidden" name="version" value="'+esc(version.id)+'"><input type="hidden" name="expected" value="'+esc(prior)+'">'):''}
 ${current?.state==='public'?action('hold','審査のため一時非表示にする'):''}${current&&current.state!=='withdrawn'?action('withdraw','恒久的に取り下げる'):''}${p.state==='received'&&current?.state!=='public'?action('reject','対応を終了し削除期限を設定'):''}
 <p role="status" id="desk-status"></p></section>`,{private:true,script:'<script defer src="/desk.js"></script>'});
}
