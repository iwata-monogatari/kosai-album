import {layout,consultation} from './gallery.js';

const official = 'https://oishi-hiroyuki.org';
const life = 'https://kosai.enshu-lifehack.com';
const description = '湖西懐かし写真館を作った大石浩之の紹介。磐田で育ち、不動産・介護の仕事と並行して、遠州の地名や町並みを調べ、記録しています。';

export function creatorPage() {
  const body = `<article class="wrap page-inner maker">
    <p class="crumb"><a href="/">湖西懐かし写真館</a><span>／</span>作成者紹介</p>
    <header class="maker-hero">
      <figure><img src="/oishi-portrait.jpg?v=2f69e9a64c27" width="444" height="444" alt="湖西懐かし写真館の作成者、大石浩之" fetchpriority="high"><figcaption>写真出典　<a href="${official}/profile">大石浩之公式プロフィール ↗</a></figcaption></figure>
      <div class="maker-intro"><p class="red-tag">湖西懐かし写真館を作った人</p><h1>大石 浩之</h1><p class="maker-reading">おおいし ひろゆき</p>
        <p>古い写真の端に写った店の名前を、まだ覚えている人がいる。湖西懐かし写真館は、そんな記憶と、後から確かめられる資料が出会う場所です。</p>
        <p>作成者の大石浩之は、磐田で育った宅地建物取引士。富士ヶ丘サービス株式会社の代表として住まいと介護の仕事を続けながら、遠州の歴史や暮らしをウェブに記録しています。</p>
        <a class="ink-button" href="${official}/">大石浩之の公式サイトへ ↗</a>
      </div>
    </header>
    <div class="maker-story"><section><h2>なぜ、まちの記憶を残すのか</h2>
      <p>大石が公式プロフィールで語っているのは、仕事のなかで出会った記憶のことです。不動産の書類を読むだけでは分からない家の来歴がある。高齢者向け住宅で昔の磐田を語ってくれる人がいる。そうした話を手がかりに、資料や現地で確かめたことを、あとから誰でも読めるように残したいと記しています。</p>
      <p>この写真館では、撮影年が分からない一枚には、何年に刊行された資料で見つかったのかを示しています。たとえば、大正7年刊の写真帖に載った新居の水辺。写真の下には、国立国会図書館の原資料を開けるリンクがあります。</p>
      <p><a href="/photos/ndl-arai-1918/">新居の一枚と、その出典を見る →</a></p><p><a href="${official}/profile#why-record">記録を続ける理由を、本人の言葉で読む ↗</a></p>
    </section><section class="maker-bio"><h2>大石浩之の歩み</h2><dl>
      <dt>磐田で育つ</dt><dd>5歳で磐田へ。東京で働いたのち、磐田に戻って事業を始めました。</dd>
      <dt>住まいと介護</dt><dd>袋井・磐田を中心とする不動産の売買仲介や空き家の活用に携わり、磐田市内で高齢者向け住宅を運営しています。</dd>
      <dt>学び</dt><dd>2003年に関西学院大学商学部を卒業。2023年には中央大学法学部の通信教育課程を卒業しました。</dd></dl>
      <a href="${official}/profile#career">公式プロフィールで経歴・資格を確認する ↗</a></section></div>
    <section class="exhibit-section"><div class="s-head"><h2>大石浩之の仕事を読む</h2><a href="${official}/projects">活動一覧 ↗</a></div>
      <div class="maker-works">
        <section><h3>地名から地域史へ</h3><p>「磐田物語」では、古写真や古地図、土地の名を手がかりに磐田の歴史を調べ、執筆しています。</p><a href="https://iwata-monogatari.net/">磐田物語を読む ↗</a></section>
        <section><h3>暮らしから市政へ</h3><p>公式サイトでは子育てや介護、公共施設について公的資料を調査。本人の地域への考えは、著書『この街、まだ詰んでない。』の要約版でも読めます。</p><a href="${official}/konomachi">著書の要約版を読む ↗</a></section>
        <section><h3>湖西で暮らす人へ</h3><p>湖西での日々の暮らしや、町へ出かけるときの地域情報を紹介しています。</p><a href="${life}/">湖西ライフハックを見る</a></section>
      </div></section>
    <section class="maker-return"><h2>湖西の写真を一緒に読み解く</h2><p>昔の店名や、写真が撮られた場所に心当たりのある方は、その一枚の「この写真について伝える」からお知らせください。ご自宅のアルバムについてもご相談いただけます。</p>
    <p><a href="/features/kosai-station/">湖西の駅の写真を見る →</a>　<a href="/okuru/">写真を寄稿・相談する →</a></p></section>
    ${consultation('creator')}<p class="small-meta">人物紹介・写真の出典　<a href="${official}/profile">大石浩之公式プロフィール</a> ／ <a href="${official}/projects">公式プロジェクト一覧</a></p>
  </article>`;
  const structured = {'@context':'https://schema.org','@type':'ProfilePage',url:'https://kosaialb.atawi.link/creator/',mainEntity:{'@type':'Person',name:'大石浩之',alternateName:'おおいし ひろゆき',url:official+'/',sameAs:[official+'/profile'],image:'https://kosaialb.atawi.link/oishi-portrait.jpg?v=2f69e9a64c27'}};
  return layout('写真館の作成者・大石浩之（おおいし ひろゆき）','/creator/',body,{description,image:'/oishi-portrait.jpg?v=2f69e9a64c27',script:'<script type="application/ld+json">'+JSON.stringify(structured)+'</script>'});
}
