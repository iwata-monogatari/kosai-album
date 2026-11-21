import { esc, layout } from "./gallery.js";

const operator = env => esc(env.OPERATOR_NAME || "湖西懐かし写真館 運営窓口");
function desk(env) {
  const email = String(env.OPERATOR_EMAIL || "").trim();
  const address = /^[^\s@<>"?]+@[^\s@<>"?]+\.[^\s@<>"?]+$/.test(email)
    ? ` ／ <a href="mailto:${esc(email)}">${esc(email)}</a>`
    : "";
  return `<p>運営・連絡先　${operator(env)}${address}　<a href="/contact/">お問い合わせ</a></p>`;
}

const types = ["image/jpeg", "image/png", "image/webp", ".zip", "application/zip", "application/x-zip-compressed"].join(",");
const introductoryText = `<div class="donation-intro">
    <p class="donation-kicker">昭和40〜60年代・平成初期の写真を特に募集しています</p>
    <h2>昔の湖西の写真、<br>お持ちですか。</h2>
    <p>商店街のお店、通学路、お祭りの日、家族で出かけた場所。ご自身やご家族が、当時の湖西を実際に撮った写真を探しています。<strong>当時の色が残るカラー写真を歓迎します。</strong></p>
    <p><strong>紙の写真・ネガ・アルバム・撮影したままのデジタル写真</strong>を、一枚からご相談ください。デジタル写真は、<strong>ZIPにまとめて寄稿</strong>できます。</p>
    <a class="button" href="#iw-form">写真を寄稿する・相談する ↓</a>
  </div>
  <section class="zip-notice" aria-labelledby="zip-title"><p class="donation-kicker">デジタル写真を、まとめて寄稿</p>
    <h2 id="zip-title">写真をZIPにまとめて<br>一度に送れます。</h2>
    <p>一枚ずつ選び直さず、複数の写真をZIPファイルにまとめてお送りください。写真の色や構図は変えず、できるだけ撮影当時のデータのままでお願いします。</p>
    <p><strong>ZIPは20 MiB（約21MB）まで、パスワードなし</strong>で受け付けます。フォルダー・メモを含め256項目、展開後の合計256 MiBまで。JPEG・PNG・WebPのほか、HEIC・TIFF・RAWの元写真もZIPに入れられます。分かる範囲で撮影者・場所・年代を書いたメモを添えていただけると助かります。</p>
    <p>ZIPの中身は非公開で保管し、運営担当者が写真ごとに確認します。送信しただけで一括公開されることはありません。容量を超える場合やZIPの作り方が分からない場合も、下の窓口からご相談ください。</p>
    <a class="button" href="#iw-form">ZIP・写真を送る ↓</a></section>
  <section class="pickup-notice" aria-labelledby="pickup-title">
    <p class="donation-kicker">アルバム何冊分でも、まずはご相談ください</p>
    <h2 id="pickup-title">紙写真・アルバムの<br>受け渡しを相談する。</h2>
    <p>紙の写真、ネガ、アルバムがたくさんある方、USBメモリーや外付けディスクなどに大量の写真データをお持ちの方は、<strong>受け取りや返却の方法を、運営担当者とご相談いただけます。</strong></p>
    <p>フォームでは画像を添付せず、写真の種類・おおよその量・地域をお知らせください。詳しい受け取り場所や日時、お預かりする範囲、原本や記録媒体の返却方法は、返信で一緒に確認します。</p>
    <a class="button" href="/okuru/?kind=consult#iw-form" data-intake-kind="consult">訪問での受け取りを相談する →</a>
  </section>
  <section class="donation-guide" aria-labelledby="wanted-title"><h2 id="wanted-title">こんな写真を探しています</h2>
    <ul class="wanted-photos"><li><strong>商店街・店先</strong>鷲津、新居、白須賀、新所原などのお店や買い物の風景</li><li><strong>毎日の暮らし</strong>通学路、学校、仕事場、農作業、家族のお出かけ</li><li><strong>お祭り・地域の行事</strong>屋台、運動会、盆踊り、町内の集まり</li><li><strong>まちの変化</strong>昔の駅や道路、バス、公園、建て替わる前の建物</li></ul>
    <h3>湖西の駅と鉄道の写真を探しています</h3><p>新所原駅の旧駅舎、鷲津や新居町の駅前、旧二俣線の沿線。昔の駅前のお店や通学の記憶も、覚えている範囲でお知らせください。</p>
    <p>対象は現在の湖西市域です。旧湖西市・旧新居町の写真を探しています。カラー写真を歓迎し、白黒写真もご相談いただけます。</p>
    <h3>日付や撮影した方が分からなくても、ご相談ください</h3><p>「昭和40年代ごろ」「新居のどこか」といった記憶も手掛かりになります。紙の写真をスマートフォンで撮った見本でも相談できます。撮影した方が不明な写真は、まず画像を添付せずご相談ください。RAW・HEICの元写真はZIPでまとめて送るか、容量が大きい場合は受け取りをご相談ください。</p>
    <h3>公開する前に、写真と説明を確認していただきます</h3><p>ご相談や送信だけで写真を公開することはありません。撮影者・権利者、写っている方への配慮、掲載する画像・説明・表示名を確認し、同意をいただいたものを展示します。匿名での掲載も相談できます。原本をお預かりする場合は、方法と返却日を事前に取り決めます。</p>
  </section>`;

function guidance() {
  return `<details class="section"><summary>受付から展示・取り下げまで</summary>
    <ol><li>写真と連絡先は非公開で受け付け、受付番号をお伝えします。</li>
    <li>運営担当者が、撮影場所・時期や、撮影者・権利者とのご関係を伺います。</li>
    <li>掲載したい写真・説明・表示名を権利者にお見せし、その版への同意をいただいたものを展示します。匿名表示も選べます。</li>
    <li>公開後の修正や取り下げは、写真番号またはそのページのURLを添えて<a href="/contact/">窓口へ</a>ご連絡ください。</li></ol>
    <p>紙写真の持ち込みや郵送をご希望の方は、先にご相談ください。原本をお預かりする場合には、枚数・預かり方法・返却先を事前に取り決めます。</p>
  </details>`;
}

function form(contact, env) {
  const key = String(env.TURNSTILE_SITE || "").trim();
  const enabled = key && !["0", "false"].includes(String(env.SUBMISSIONS_ENABLED ?? "true").toLowerCase());
  if (!enabled) {
    return `<div class="notice"><p>オンラインの受付は準備中です。</p>${env.OPERATOR_EMAIL ? desk(env) : ""}</div>`;
  }
  const photoFields = `<div class="field" data-for="photo">
        <label for="iw-file">写真または写真をまとめたZIP（必須）</label>
        <input id="iw-file" name="file" type="file" accept="${types}" aria-describedby="iw-file-help" required>
        <small id="iw-file-help">写真1枚はJPEG・PNG・WebP、10 MiB・4,000万画素以下。ZIPは20 MiB以下、パスワードなしでお願いします。大容量や紙写真は、画像なしでも相談できます。</small>
        <p class="notice" data-zip-preview hidden></p>
        <figure hidden data-preview><img alt="選択した写真の送信前の見本" style="max-height:16rem;width:auto;object-fit:contain"><figcaption>お手元の端末で表示している見本</figcaption></figure>
      </div>
      <div class="field" data-for="photo"><label for="iw-rights">撮影した方との関係（必須）</label>
        <select id="iw-rights" name="rights" required><option value="">選択してください</option><option value="self">自分が撮影した</option><option value="family">家族や別の方が撮影した</option><option value="unknown">分からない</option></select>
        <small>アルバムの持ち主と著作権を持つ方が異なることがあります。分かる範囲でお答えください。</small>
      </div>
      <div class="field" data-for="photo"><label for="iw-title">写真の題名・ZIP全体の内容（任意）</label><input id="iw-title" name="title" maxlength="120" placeholder="例：平成初めごろの鷲津駅前の写真20枚"></div>
      <div class="field"><label for="iw-place">撮影場所（任意）</label><input id="iw-place" name="place" maxlength="100" placeholder="例：鷲津、駅前のあたりのあたり"></div>
      <div class="field"><label for="iw-date">撮影年代（任意）</label><input id="iw-date" name="dateLabel" maxlength="100" placeholder="例：昭和40年代ごろ、不明"></div>
      <div class="field" data-for="photo"><label for="iw-memory">写真について覚えていること（任意）</label><textarea id="iw-memory" name="memory" maxlength="1200" rows="3"></textarea><small>ZIPの場合は全体のおおよその場所・年代で構いません。撮影した方が異なる写真は、分かる範囲でお知らせください。</small></div>
      <div class="field" data-for="photo"><label for="iw-display">掲載するときの表示名（任意）</label><input id="iw-display" name="displayName" maxlength="80" placeholder="例：匿名、屋号、氏名"><small>実際の掲載版で改めて確認します。</small></div>`;
  const contactFields = `<div class="field"><label for="iw-purpose">ご用件</label>
      <select id="iw-purpose" name="purpose"><option>写真・場所について補足する</option><option>掲載内容の訂正を求める</option><option>写真の取り下げを求める</option><option>利用条件について尋ねる</option><option>その他のお問い合わせ</option></select></div>
      <div class="field"><label for="iw-photo-id">対象の写真番号またはURL（任意）</label><input id="iw-photo-id" name="photoId" maxlength="250" placeholder="写真ページの「写真番号」またはURL"></div>`;
  const choices = contact ? '<input type="hidden" name="kind" value="contact">' : `<fieldset class="filter-group"><legend>送りたい内容（必須）</legend><div class="chips">
      <label class="chip"><input type="radio" name="kind" value="photo" checked>写真・ZIPを寄稿する</label>
      <label class="chip"><input type="radio" name="kind" value="consult">写真・大量データの受け取りを相談する</label>
    </div></fieldset>`;
  return `<form id="iw-form" class="form" method="post" action="/api/submissions" enctype="multipart/form-data" data-site-key="${esc(key)}">
    <noscript><p class="notice">受付にはJavaScriptが必要です。ブラウザで有効にしてからご利用ください。</p></noscript>
    <div id="iw-edit" class="photo-info"><h2 tabindex="-1" data-edit-title>${contact ? "お問い合わせ内容" : "提供・相談の受付"}</h2>
      ${choices}
      <div class="field"><label for="iw-email">返信用メール（必須・非公開）</label><input id="iw-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" required><small>写真の来歴や掲載内容の確認、相談・訂正などのご連絡に使います。</small></div>
      ${contact ? contactFields : photoFields}
      <div class="field"><label for="iw-note" data-note-label>${contact ? "お問い合わせ内容（必須）" : "運営担当者だけに伝えること（任意）"}</label>
        <textarea id="iw-note" name="note" rows="4" maxlength="2200" ${contact ? "required" : ""}></textarea><small>連絡先・ご相談・非公開メモはウェブ展示に掲載しません。</small></div>
      <div class="field"><p><a href="/privacy/" target="_blank" rel="noopener">個人情報の扱い（別タブ）</a> ／ <a href="/usage/" target="_blank" rel="noopener">写真の利用と掲載条件（別タブ）</a></p>
        <label><input type="checkbox" name="consent" value="1" required> 上記を読み、受付・確認・返信のための保存と利用に同意します。</label>
        <small>この送信だけで写真が公開されることはありません。</small></div>
      <p><button class="button" type="submit" data-next>内容を確認する</button></p>
    </div>
    <div id="iw-confirm" class="photo-info" hidden><h2 tabindex="-1">送信前の確認</h2><p>内容をご確認ください。「入力に戻る」で修正できます。</p>
      <dl class="photo-info" data-summary></dl><div data-challenge></div><p class="small" data-challenge-status role="status"></p>
      <div class="chips"><button type="button" class="button secondary" data-back>入力に戻る</button>
      <button type="submit" class="button" data-send disabled>この内容で送信する</button></div>
    </div>
    <p role="alert" class="notice" tabindex="-1" data-error hidden></p>
    <div id="iw-finish" class="photo-info" hidden><h2 tabindex="-1">受け付けました</h2><p>受付番号をお控えください。</p><p><strong data-receipt></strong></p><p>今後お問い合わせの際は、この番号をお知らせください。</p><a class="button secondary" href="/photos/">写真を見る</a></div>
  </form>`;
}

export function page(path, env = {}) {
  const key = path.replace(/\/+$/, "");
  const open = (title, body, withForm = false) => layout(title, key + "/",
    `<article class="wrap section"><h1>${title}</h1>${body}</article>`,
    withForm ? { script: '<script defer src="/forms.js"></script>' } : {});
  if (key === "/okuru") {
    return open("写真を寄稿する", introductoryText + guidance() + form(false, env), true);
  }
  if (key === "/contact") {
    return open("お問い合わせ・訂正・取り下げ",
      `<p>場所についての情報や、写真に心当たりのある方からのご連絡もお待ちしています。写っている方や権利者からのご相談は運営担当者が個別に確認します。</p>${form(true, env)}`, true);
  }
  if (key === "/about") {
    return open("この写真館について", `<div class="photo-info"><p>湖西懐かし写真館は、現在の湖西市にあたる地域で撮影された昔の写真を、町の名前や撮影時期からたどる民間の地域写真館です。旧湖西市・旧新居町を対象にしています。</p>
    <p><a href="/creator/">写真館の作成者・大石浩之の仕事と歩み →</a></p><h2>一枚の来歴を読む</h2><p>撮影時期が特定できないときは、刊行年や資料の年代幅を示します。国立国会図書館の資料、市民からの記憶、運営担当者が資料で確認した説明を区別して記録します。</p>
    <h2>町を一緒に記録する</h2><p>お店の名前、かつての通学路、橋や水路の変化。一枚にまつわる思い出は、写真番号と一緒にお知らせください。</p>
    <p><a href="/okuru/">写真を提供・相談する</a> ／ <a href="/usage/">写真の利用方法</a></p><h2>運営窓口</h2>${desk(env)}</div>`);
  }
  if (key === "/privacy") {
    return open("個人情報の扱い", `<div class="photo-info"><h2>不動産サイトへのリンク</h2><p>不動産サイトへのリンクには、この写真館からの訪問や案内の場所を示す参照用パラメーターを付けています。写真や寄稿フォームの入力内容はリンクに含めません。移動先の個人情報の扱いは、そのサイトの方針をご確認ください。</p><h2>寄稿とお問い合わせ</h2><p>写真とともにお預かりする連絡先や原本は、運営担当者が来歴を確認し、ご本人と掲載内容を相談するために管理します。</p>
    <h2>お預かりするものと利用目的</h2><p>返信先、写真、撮影者との関係、撮影場所や時期、思い出、相談内容を、受付・返信、来歴と権利の確認、掲載版の作成、訂正・取り下げへの対応に使います。公開するのは、別途確認を受けた画像・文面・表示名です。</p>
    <h2>保管と削除</h2><p>応募原本、連絡先、許諾の記録は非公開で管理し、業務を担当する運営者が確認します。見送り・辞退となった原本と連絡先は対応終了後90日以内の削除を基本とします。掲載中は許諾の内容と必要な連絡先を保持します。掲載の変更や削除のご相談は写真番号または受付番号を添えてお寄せください。</p>
    <h2>受付・配信に使うサービス</h2><p>ウェブサイトの配信・受付・データ保存にはCloudflareを利用します。フォーム送信前の迷惑投稿対策にはCloudflare Turnstileを使用します。応募原本や連絡先をGitHubのソースコードに登録しません。</p>
    <h2>ご本人からのご相談</h2><p>個人の特定につながる情報や掲載へのご心配は個別に承ります。必要に応じて公開を一時停止し、権利者や関係する方と確認します。第三者が既に端末へ保存した画像は、当館による配信停止後も残ることがあります。</p>${desk(env)}</div>`);
  }
  if (key === "/usage") {
    return open("写真の利用と掲載条件", `<div class="photo-info"><p>写真は一枚ずつ出典と利用条件が異なります。作品ページの「出典・撮影者・提供者」「利用条件・加工」をご覧ください。</p>
    <h2>公的資料・公開ライセンスの写真</h2><p>保護期間満了の資料は原資料の公開区分を示します。クリエイティブ・コモンズの写真は、表示された作者名・出典・ライセンスへのリンク・変更内容など、原作品ごとの条件に従ってください。空中写真の年代は資料の撮影期間を用います。</p>
    <h2>ご提供いただく写真</h2><p>著作権は権利者に残ります。本サイトは閲覧無料です。運営者の不動産サービスへの案内を掲載しています。写真の寄稿と不動産相談は別々に受け付けます。市民の方からの寄稿では、確認いただいた掲載版をここで保存・複製・一般公開するための無償・非独占の許諾を個別にお願いします。掲載名や必要な縮小・切り抜き・ぼかしは掲載前にご確認いただきます。</p><p>別途使用許諾を受けた写真は、権利者と取り決めた条件で掲載します。ここで閲覧できることが、第三者による画像の転載・再利用の許可を意味するものではありません。</p><p>市民からの提供写真を、SNSへの画像転載、募集チラシ、ほかの出版物に用いる場合には、各用途に応じて権利者の許諾を確認します。写真ページのURLはご家族などと共有いただけます。</p>
    <h2>写っている方への配慮</h2><p>顔、名札、表札、私生活が分かる場面には、写真の著作権とは別に注意を払います。撮影した方が不明なときは、まず画像の添付なしでご相談ください。</p>${desk(env)}</div>`);
  }
  return null;
}
