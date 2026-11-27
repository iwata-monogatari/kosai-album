import {photoFront, photoBanners} from './photo-front.js';
import { renderAlbumFooter } from './album-footer.js';
import {albumHeader} from './album-header.js';
import books from '../data/library.json' with {type:'json'};
export const origin = 'https://kosaialb.atawi.link';
const site = '湖西懐かし写真館';
const lifehack = 'https://kosai.enshu-lifehack.com';
const readingList=links=>`<ul>${links.map(([path,label])=>`<li><a href="${lifehack+esc(path)}">${esc(label)}</a></li>`).join('')}</ul>`;
export const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const href = p => '/photos/'+encodeURIComponent(p.id)+'/';
const searchHref = (key,value) => '/photos/?'+new URLSearchParams({[key]:value});
const desc = '静岡県湖西市と旧新居町の昔の写真。新居関所と渡船場、白須賀宿・潮見坂、新所原・鷲津・新居町の駅舎、昭和・平成の空中写真を、年代や出典とともに見られます。';
const karteUrl = 'https://fudosan.atawi.link/?utm_source=kosaialb.atawi.link&utm_medium=referral&utm_campaign=jikka_karte';
export function consultation(position='home') {
 const link=(path,content)=>'https://fudosan.atawi.link'+path+'?utm_source=kosaialb.atawi.link&utm_medium=referral&utm_campaign=jikka_karte&utm_content='+position+'_'+content;
 return `<aside id="jikka-karte" class="karte-notice" aria-label="湖西の実家・空き家の相談"><div><span class="red-tag">思い出のある家の、これから。</span><h2>湖西の実家、売るか残すか。</h2><p>アルバムを片づけていて、家のことも気になったら。宅建士が価格の目安・確認したい点・次にすることを、無料の「実家カルテ」にまとめます。湖西市内の家は、ご家族が県外にお住まいでも依頼できます。</p><div class="consultation-actions"><a class="ink-button" href="${esc(link('/','apply'))}#apply">無料の実家カルテを依頼する</a><a href="${esc(link('/karte/sample/','sample'))}">届くレポートの見本を見る</a></div><p class="consultation-assurance">売却を決めていなくても利用できます。写真の寄稿と不動産相談は、別々に受け付けます。</p><p class="small-meta">富士ヶ丘サービス株式会社 ／ 宅地建物取引士 大石浩之<br><a href="tel:0538313308">電話で相談　0538-31-3308</a>（9〜18時／水曜・日曜は予約制）</p><a href="${esc(link('/karte/','area')+'&area='+encodeURIComponent('湖西市'))}">湖西市の実家・空き家相談を詳しく見る</a></div></aside>`;
}
const karteNotice=consultation();
const publicPages = ['/', '/photos/', '/features/kosai-station/', '/library/', '/creator/', '/about/', '/usage/', '/privacy/'];
export function layout(title,path,body,options={}) {
  const trackPage = !options.private && !path.startsWith('/photos/c-') && (publicPages.includes(path) || /^\/photos\/[\w-]+\/$/.test(path));
  const trackerTag = trackPage ? '<script defer src="/album-tracker.js" data-site="atawi-kosaialb"></script>' : '';
  const imageMeta = options.image?'<meta property="og:image" content="'+origin+esc(options.image)+'"><meta name="twitter:card" content="summary_large_image">'+(options.imageAlt?'<meta property="og:image:alt" content="'+esc(options.imageAlt)+'">':''):'';
  const karteFooter = options.private ? '' : `<a href="${esc(karteUrl+'&utm_content=footer')}">実家・空き家の相談｜ふじがおか実家カルテ</a>`;
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title===site||path==='/'?title:title+'｜'+site)}</title><meta name="description" content="${esc(options.description||desc)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(options.description||desc)}"><meta property="og:url" content="${origin+esc(path)}"><link rel="canonical" href="${origin+esc(path)}">${imageMeta}${options.private?'<meta name="robots" content="noindex,nofollow">':''}<link rel="icon" type="image/svg+xml" sizes="any" href="/mark.svg?v=20261119-gothic"><link rel="stylesheet" href="/style.css?v=20261119-gothic"><link rel="stylesheet" href="/album.css?v=20261121-kosai2"><link rel="stylesheet" href="/album-header.css?v=20261119-gothic">${options.script||''}${trackerTag}<link rel="stylesheet" href="/photo-front.css?v=20261127"></head><body><a class="skip" href="#main">本文へ</a>${albumHeader({site, mark:"湖", area:"湖西・新居", theme:"kosai", links:[["/photos/", "写真を探す"], ["/features/kosai-station/", "駅前のアルバム"], ["/library/", "資料をたどる"]], consult:'/consult/', path:path})}<main id="main">${body}</main><footer class="site-foot">${renderAlbumFooter({showAuthor: path !== '/'})}<div class="wrap footer-guide"><div><a class="brand" href="/">${site}</a><small>静岡県湖西市・旧新居町の地域写真アーカイブ</small></div><nav class="nav" aria-label="写真館のご案内">${path==='/'?'':`<a href="/creator/">大石浩之のプロフィール</a>`}<a href="/about/">写真館について</a><a href="/usage/">写真の利用</a><a href="/privacy/">個人情報</a><a href="/contact/">お問い合わせ</a><a href="https://iwataalb.atawi.link/">磐田懐かし写真館</a><a href="https://kosai.enshu-lifehack.com/">湖西ライフハック</a>${karteFooter}</nav></div></footer></body></html>`;
}
function media(p,w) {
  return p.version?`/media/${p.id}/${p.version}/${w}`:`/archive/${p.id}-${w}.webp`;
}
function photoImage(p,large=false) {
  const sizes=p.sizes||[480];
  return media(p,large?(sizes.includes(1280)?1280:sizes.at(-1)):sizes[0]);
}
function img(p,large=false,first=false) {
  return `<img src="${photoImage(p,large)}" width="${p.width||900}" height="${p.height||600}" alt="${esc(p.alt||p.title)}" ${first?'fetchpriority="high"':'loading="lazy"'}>`;
}
function photoDescription(p) {
  const context=[p.place,p.dateLabel].filter(value=>value&&!p.caption?.includes(value)).join('・');
  return [context,p.caption].filter(Boolean).join('。');
}
function imageMetadata(p) {
  const data={
    '@context':'https://schema.org',
    '@type':'ImageObject',
    contentUrl:origin+photoImage(p,true),
    name:p.title,
    description:p.caption,
    creditText:p.credit,
    license:/^https?:\/\//.test(p.licenseUrl||'')?p.licenseUrl:undefined
  };
  return '<script type="application/ld+json">'+JSON.stringify(data).replaceAll('<','\\u003c')+'</script>';
}
function sharePanel(path,title,label) {
  return `<details class="library-note album-share"><summary>${esc(label)}</summary>
    <p><label>共有用リンク<br><input type="url" readonly value="${esc(origin+path)}" style="width:min(100%, 32rem)"></label></p>
    <p><button type="button" data-copy disabled>リンクをコピー</button> <button type="button" data-share hidden>LINEなどで共有</button></p>
    <p class="small-meta" role="status"></p>
    <script>
    (() => {
      const panel=document.currentScript.closest('.album-share');
      const field=panel.querySelector('input'),copy=panel.querySelector('[data-copy]');
      const share=panel.querySelector('[data-share]'),status=panel.querySelector('[role="status"]');
      const url=field.value,title=${JSON.stringify(title).replaceAll('<','\\u003c')};
      copy.disabled=false;
      copy.addEventListener('click',async()=>{
        try {
          await navigator.clipboard.writeText(url);
          status.textContent='リンクをコピーしました。';
        } catch {
          field.focus();
          field.select();
          status.textContent='リンクを選択しました。端末のコピー操作で保存できます。';
        }
      });
      if(typeof navigator.share==='function' && (!navigator.canShare || navigator.canShare({url,title}))){
        share.hidden=false;
        share.addEventListener('click',async()=>{
          try { await navigator.share({url,title}); }
          catch(error) {
            if(error.name!=='AbortError')status.textContent='「リンクをコピー」で共有できます。';
          }
        });
      }
    })();
    </script></details>`;
}
const pathNav=label=>`<p class="crumb"><a href="/">写真館</a><span>／</span>${esc(label)}</p>`;
function card(p) {
  return `<article class="exhibit"><a class="plate" href="${href(p)}">${img(p)}</a><p class="small-meta">${esc(p.dateLabel)}　／　${esc(p.place)}</p><h3><a href="${href(p)}">${esc(p.title)}</a></h3><small>${esc(p.credit)}</small></article>`;
}
function section(name,aside,body) {
  return `<section class="exhibit-section"><div class="s-head"><h2>${esc(name)}</h2>${aside}</div>${body}</section>`;
}
const allLink='<a class="more" href="/photos/">写真一覧へ</a>';
const browseLinks = (key,values) => values.map(value=>`<a href="${esc(searchHref(key,value))}">${esc(value)}</a>`).join('');

const stationPath='/features/kosai-station/';
const topics = {
  '/features/washizu/': {
    label:'鷲津の町並み・製糸場',
    title:'鷲津の昔の写真｜鷲津駅・宮崎製糸場・浜名湖の桟橋',
    lead:'大正初期の鷲津停車場、1912年刊の資料に載る宮崎製糸場、湖岸の旅館と昭和初期の桟橋。静岡県湖西市・鷲津の駅、産業、水辺を出典付きの古写真でたどります。',
    groups:[
      ['鷲津停車場と駅前の町並み','大正初期と題記のある写真帖では、柵に沿う駅前の道と線路から広がる市街地が分かります。2008年の駅舎とも見比べられます。',
        ['shizulib-washizu-station-taisho','shizulib-washizu-panorama-taisho','washizu-2008']],
      ['浜名湖を背にした宮崎製糸場','『静岡県蚕糸業沿革史』掲載の外観と内景です。煙突のある工場と、機械の両側で働く人々が写ります。',
        ['ndl-miyazaki-lakeside-1912','ndl-miyazaki-workers-1912','ndl-kizu-silk-office-1912']],
      ['湖岸の旅館から昭和初期の桟橋へ','河井旅館の写真には湖岸の石積みと舟が残ります。1930年6月1日の桟橋の写真では、船が着く桟橋に人が集まっています。二つの写真は出典も撮影地点も異なります。',
        ['shizulib-kawai-lakeside','ndl-washizu-pier-1930']],
      ['木立の参道と本興寺','1914年刊の郡誌に載る参道と、2012年に撮影された山門です。撮影地点が異なるので、通りの奥行きと建物の違いを手掛かりに見られます。',
        ['ndl-honkoji-1914','commons-b3e8756d2bf6']]
    ],
    reading:[['/discover/honkouji/','本興寺の拝観と鷲津駅からの行き方'],['/discover/kosai-old-photos/','鷲津・湖西の昔の地図と写真の探し方']],
    filter:['q','鷲津']
  },
  '/features/shinjohara/': {
    label:'新所原駅の旧駅舎と天浜線',
    title:'新所原駅の昔の写真｜旧駅舎と天浜線、1989年から2017年',
    lead:'1989年12月の新所原駅、2011年に撮影された旧駅舎、橋上化後の2017年の駅。静岡県湖西市の新所原駅を、天竜浜名湖鉄道の車両やアスモ前駅の写真とともに見比べます。',
    groups:[
      ['1989年と2011年の新所原駅舎','1989年の駅前には、瓦屋根とキヨスク、タクシーが写っています。2011年の旧駅舎とホームでは、駅前とは別に線路側の景色を確認できます。',
        ['shinjohara-1989','commons-a136cf456007','commons-1b9fe359b410']],
      ['橋上化後の駅と南口','南北自由通路とJR橋上駅舎は2016年11月に供用が始まりました。2017年1月撮影の2枚で、建物と南側のようすを見比べられます。',
        ['shinjohara-2017-01','shinjohara-2017-02']],
      ['天浜線の車両とアスモ前駅','2005年・2008年・2013年の車両写真と、2009年の隣駅・アスモ前の記録です。車両の番号や窓の並び、駅ごとのホームの違いを見られます。',
        ['commons-17b58981e99b','commons-e7d1b3ea853e','shinjohara-th2103-2013','asumomae-2009-02']]
    ],
    sources:[['https://www.jec-info.co.jp/201612/685/','新所原駅南北自由通路および橋上駅舎の供用開始（電気技術開発）'],['https://www.tenhama.co.jp/about/station/shinjyohara/','新所原駅（天竜浜名湖鉄道）']],
    reading:[['/discover/tenhama/','天浜線の駅と立ち寄り先'],['/discover/kosai-mountains/','新所原周辺から湖西連峰をたどる'],['/discover/kosai-old-photos/','湖西の空中写真・地図の探し方']],
    filter:['q','新所原']
  },
  '/features/hamanako-waterfront/': {
    label:'浜名湖の漁と湖岸',
    title:'浜名湖の昔の漁と湖岸の写真｜囲目網・新居の漁労小屋・養殖棚',
    lead:'1930年に撮影された浜名湖の囲目網漁と鷲津の桟橋、1935年の新居の漁労小屋、2012年の養殖棚。湖西側の浜名湖と遠州灘に残された水辺の記録を、時代と出典を分けて紹介します。',
    groups:[
      ['1930年6月1日の浜名湖と鷲津の桟橋','同じ巡幸記録に、鷲津の桟橋と湖上で船が並ぶ漁の場面が掲載されています。囲目網は入出に伝わった漁法で、写真の湖上の撮影地点は分かっていません。',
        ['ndl-hamanako-kakome-fishing-1930','ndl-washizu-pier-1930']],
      ['1935年の新居海岸と漁労小屋','砂地に並ぶ小屋の背後にクロマツ林が見える県資料の写真です。大正初期の源太山からの眺望は、遠州灘側の砂浜と異なる、新居の湖側の眺めを伝えます。',
        ['arai-fishing-huts-1935','shizulib-gentayama-view-taisho']],
      ['養殖棚と新居の岸壁','2012年に新居側から撮影された養殖棚の写真と、岸壁・桟橋を写した撮影年不詳の空撮です。遠くの山並みや水際の構造を見られます。',
        ['commons-8dcf80a46256','commons-ef48cf33394e']]
    ],
    reading:[['/discover/kosai-food/','浜名湖の食・漁業を知る'],['/discover/hamanako-imagire/','浜名湖と今切口の見どころ'],['/discover/kaikokan/','新居の海湖館と海釣公園の利用案内']],
    filter:['q','浜名湖']
  },
  '/features/arai-shuku/': {
    label:'新居宿・新居関所',
    title:'新居宿・新居関所の古写真',
    notice:{
      id:'arai-photo-exhibition-2026',
      title:'新居関所史料館「写真でみる新居の近現代」',
      body:'2026年11月28日（土）〜12月25日（金）、9:00〜16:30（月曜休館）。新居関所史料館の開館50周年企画展で、図録などに残る明治から平成の新居を紹介します。会場の展示写真と、このページで見られる写真は別の案内です。',
      url:'https://www.city.kosai.shizuoka.jp/kosodate_kyoiku/bunka_shogaigakushu/3614.html',
      link:'湖西市公式で会期・入館案内を確認する'
    },
    lead:'新居関所の瓦屋根と松、渡船場の水辺、舟の前に建つ旅館・宝屋。湖西市の旧新居町に残る写真資料から、東海道の宿場をたどります。',
    groups:[
      ['新居関所の建物と庭','『静岡県浜名郡誌』と県の史跡資料を見比べると、塀越しの屋根や、庭に面した縁側の様子が分かります。',
        ['ndl-arai-sekisho-1914','shizulib-arai-sekisho-roof-1921','ndl-arai-sekisho-front-1941']],
      ['渡船場・新居の渡し・旅館の水辺','『新居町誌』に貼られた絵葉書には、渡船場の松と水上を行く舟が残ります。宝屋のガラス乾板写真では、水辺と宿の近さを見ることができます。',
        ['shizulib-arai-ferry-point-1913','shizulib-arai-ferry-1913','arai-takaraya-waterfront-glass-plate']],
      ['舟だまりと泉町通り','東海道の写真帖に収められた舟だまりと、泉町通りの絵葉書です。水辺の家並みと、道沿いに人が立つ通りの風景を見比べられます。',
        ['ndl-arai-1918','shizulib-izumicho-daily-1913','ndl-arai-anzai-site-1941']]
    ],
    reading:[
      ['/discover/arai-sekisho/','新居関所の見学案内・企画展'],
      ['/discover/arai-shuku/','今の新居宿を歩く'],
      ['/discover/kinokuniya/','旅籠・紀伊国屋資料館を訪ねる'],
      ['/discover/nakane-gardens/','新居の庭園と浜名川を訪ねる']
    ],
    filter:['q','新居']
  },
  '/features/shirasuka/': {
    label:'白須賀宿・潮見坂',
    title:'白須賀宿・潮見坂の昔の写真',
    lead:'大正・昭和初期の写真帖に残る白須賀の道、蚕業取締所の出張所、平成の潮見坂と遠州灘。街道・産業・海辺の景色を、出典の分かる写真でたどります。',
    groups:[
      ['大正・昭和初期の写真帖に残る道','1918年刊と1930年刊の東海道写真帖に掲載された「白須賀」です。道の勾配や木立、家並みを写真ごとに見比べられます。',
        ['ndl-shirasuka-1918','shizulib-shirasuka-road-1930']],
      ['白須賀の産業と海沿いの道','1912年刊の蚕糸業資料は、白須賀の出張所を伝えています。平成の写真には、遠州灘に沿って延びる道路と道の駅の風景が残ります。',
        ['ndl-shirasuka-silk-office-1912','flickr-40517530430','commons-536e43e46ebb']],
      ['遠州灘と白須賀の海岸','潮見坂近くの海岸と、県の資料に収められた白須賀海岸の写真です。県資料の写真は、資料の公開年と撮影年を区別して表示しています。',
        ['shirasuka-coast-2015','shizuoka-mizube-shirasuka','commons-3a5a5ce1ad59']]
    ],
    reading:[
      ['/discover/shirasuka-shuku/','白須賀宿と潮見坂を歩く'],
      ['/discover/shiomizaka/','道の駅潮見坂への行き方'],
      ['/discover/shirasuka-temples/','白須賀・境宿の寺社を訪ねる']
    ],
    filter:['q','白須賀']
  },
  '/features/aerial/': {
    label:'湖西市の空中写真',
    title:'湖西市の昔の空中写真・航空写真',
    lead:'終戦翌年の1946年から平成まで、国土地理院が公開する空中写真で浜名湖西岸を見比べます。鷲津、新居、白須賀、新所原、入出と知波田の撮影記録を地域別にたどれます。',
    groups:[
      ['鷲津周辺','古見を撮影中心とする1946年の原版など、浜名湖西岸の市街地を含む写真です。',
        ['kosai-gsi-21254','kosai-gsi-813328','kosai-gsi-1636079']],
      ['新居周辺','1946年・1976年・2008年の写真で、中之郷や旧新居町周辺を見比べられます。',
        ['kosai-gsi-464056','kosai-gsi-464189','kosai-gsi-464153']],
      ['白須賀周辺','遠州灘に面した白須賀の記録です。撮影中心が陸域外にある1946年の写真も含みます。',
        ['kosai-gsi-20760','kosai-gsi-279324','kosai-gsi-1636381']],
      ['新所原周辺','岡崎付近を撮影中心とする1948年の原版から、平成の新所原周辺までを比べます。',
        ['kosai-gsi-18449','kosai-gsi-813319','kosai-gsi-749629']],
      ['入出・知波田・大知波周辺','1946年に複数の地区を収めた原版と、後年の入出、知波田・大知波の記録を並べました。',
        ['kosai-gsi-9275','kosai-gsi-275664','kosai-gsi-703682']]
    ],
    reading:[
      ['/discover/hamanako-imagire/','浜名湖と今切口の見どころ'],
      ['/discover/chibata/','知波田・神座の散策案内'],
      ['/discover/hamana-uchiyama/','浜名・内山・中之郷を歩く']
    ],
    filter:['collection','空から見る湖西']
  },
  '/features/kosai-silk/': {
    label:'鷲津と岡崎の製糸・浜名湖れんが館',
    title:'湖西の製糸場の古写真｜宮崎製糸・岡崎共同揚返場と浜名湖れんが館',
    lead:'浜名湖れんが館は、旧宮崎製糸鷲津工場で繭を保管していた倉庫です。1912年刊の資料に残る鷲津の製糸場と岡崎の揚返場の写真を、外観と作業場に分けて見比べます。',
    groups:[
      ['鷲津の宮崎製糸場：湖畔の工場と作業場','湖西市の文化財資料によると、宮崎製糸鷲津工場が駅の西側にできたのは1904年です。外の写真では瓦屋根の工場と煙突の向こうに湖面が見え、屋内の写真では機械の列に沿って人々が作業しています。',[
        'ndl-miyazaki-lakeside-1912','ndl-miyazaki-workers-1912']],
      ['岡崎共同揚返場：田畑に面した建物と機械','同じ資料に掲載された別の施設です。岡崎では田畑に面した建物と、機械を並べた屋内の写真が対になっています。鷲津の工場写真とは別地点です。',[
        'ndl-okazaki-silk-exterior-1912','ndl-okazaki-silk-interior-1912']]
    ],
    context:'鷲津の浜名湖れんが館は工場の作業場そのものではなく、繭倉庫だった建物です。常時開館ではないため、見学を考えている方は湖西市の施設案内をご確認ください。',
    sources:[
      ['https://www.city.kosai.shizuoka.jp/material/files/group/22/bunkazai_1.pdf','湖西市の文化財資料「製糸業の発展」'],
      ['https://www.city.kosai.shizuoka.jp/material/files/group/22/bunkazai_9.pdf','湖西市の関連文化財群「旧宮崎製糸鷲津工場繭倉庫」'],
      ['https://www.city.kosai.shizuoka.jp/shiseijoho/chosha_shisetsuannai/3283.html','浜名湖れんが館の施設・見学案内（湖西市）'],
      ['https://dl.ndl.go.jp/pid/1054562/1/15','静岡県蚕糸業沿革史：宮崎製糸場（国立国会図書館）'],
      ['https://dl.ndl.go.jp/pid/1054562/1/14','静岡県蚕糸業沿革史：岡崎共同揚返場（国立国会図書館）']
    ],
    reading:[['/discover/kosai-old-photos/','湖西の古写真や郷土資料を調べる']],
    filter:['q','蚕糸']
  }
};
export const topicPaths=Object.keys(topics);
const topicLink=(path,label)=>`<a href="${path}">${esc(label)}</a>`;
function topicLinks() {
  return [...topicPaths.map(path=>topicLink(path,topics[path].label)),topicLink(stationPath,'新所原・鷲津・新居町の駅')].join('');
}
function topicForPhoto(photo) {
  if(photo.collection==='空から見る湖西')return '/features/aerial/';
  return topicPaths.find(path=>topics[path].groups.some(([, , ids])=>ids.includes(photo.id)));
}
export function topicPage(all,path) {
  const topic=topics[path];
  const byId=new Map(all.map(photo=>[photo.id,photo]));
  const groupsWithPhotos=topic.groups.map(([name,description,ids])=>[name,description,ids.map(id=>byId.get(id)).filter(Boolean)]);
  const cover=groupsWithPhotos.find(([, , photos])=>photos.length)?.[2][0];
  const dateNote=topic.filter[0]==='collection'
    ? '撮影年月日・撮影範囲・原版番号は各写真ページで確認できます。同じ地域名でも、写真によって撮影中心や範囲は異なります。'
    : '写真帖や郷土資料の刊行年と、写真の撮影年は区別しています。詳しい出典・利用条件は、各写真ページに記載しています。';
  return layout(topic.title,path,`<article class="wrap page-inner">
    ${pathNav(topic.label)}
    <h1>${esc(topic.title)}</h1>
    <p class="page-lead">${esc(topic.lead)}</p>
    <p>${dateNote}</p>
    ${topic.context ? `<p>${esc(topic.context)}</p>` : ''}
    ${topic.notice ? `<aside class="library-note" id="${esc(topic.notice.id)}"><h2>${esc(topic.notice.title)}</h2><p>${esc(topic.notice.body)}</p><p><a href="${esc(topic.notice.url)}">${esc(topic.notice.link)}</a></p></aside>` : ''}
    ${groupsWithPhotos.map(([name,description,photos])=>photos.length?section(name,'',`<p>${esc(description)}</p><div class="exhibit-grid">${photos.map(card).join('')}</div>`):'').join('')}
    <aside class="library-note">
      <h2>関連する写真と資料</h2>
      <p><a href="${esc(searchHref(...topic.filter))}">${esc(topic.label)}の写真を一覧から探す</a></p>
      <p><a href="/library/">原資料と出典の案内を見る</a></p>
      ${topic.sources ? `<ul>${topic.sources.map(([url,label])=>`<li><a href="${esc(url)}">${esc(label)}</a></li>`).join('')}</ul>` : ''}
    </aside>
    <aside class="library-note"><h2>湖西ライフハックで今のまちを訪ねる</h2>${readingList(topic.reading)}</aside>
    <nav class="browse-links" aria-label="ほかの写真特集">${topicPaths.filter(other=>other!==path).map(other=>topicLink(other,topics[other].label)).join('')}</nav>
    ${sharePanel(path,topic.title,'この特集を共有')}
  </article>`,{description:topic.lead,image:cover&&photoImage(cover,true),imageAlt:cover&&(cover.alt||cover.title)});
}
export function sitemap(all) {
  const pages=['/consult/','/','/creator/','/library/','/photos/',stationPath,'/okuru/','/about/','/usage/','/privacy/','/contact/',...topicPaths];
  const url=(path,image='')=>'<url><loc>'+esc(origin+path)+'</loc>'+image+'</url>';
  return '<?xml version="1.0" encoding="UTF-8"?>'
    +'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
    +pages.map(path=>url(path)).join('')
    +all.map(photo=>url(href(photo),'<image:image><image:loc>'+esc(origin+photoImage(photo,true))+'</image:loc></image:image>')).join('')
    +'</urlset>';
}

function homeSearch(count) {
  return `<section class="album-search-panel" aria-labelledby="album-search-heading">
    <div class="search-heading">
      <h2 id="album-search-heading">写真を探す</h2>
      <a href="/photos/">収蔵写真 ${count}点を見る </a>
    </div>
    <form method="get" action="/photos/" class="searchbar" role="search">
      <label class="sr-only" for="album-search">収蔵写真を探す</label>
      <input type="search" name="q" id="album-search" placeholder="地名・駅名・キーワード">
      <button type="submit">検索</button>
    </form>
    <div class="browse-index">
      <div><h3>地名から</h3><p>${browseLinks('q',['鷲津','新居','白須賀','新所原','入出','知波田','新所'])}</p></div>
      <div><h3>特集から</h3><p>${topicLinks()}</p></div>
      <div><h3>資料の時代から</h3><p>${browseLinks('era',['大正','昭和','平成'])}</p></div>
    </div>
  </section>`;
}
const colorUrl='/photos/?series=color';
const colorTitle='色の残る、昭和・平成の湖西';
const groups=['古写真帖','駅と鉄道の記憶','平成の風景','空から見る湖西','年代不詳の風景'];
const groupIntro=['新居の水辺、白須賀の街道。刊行された写真帖に残る風景。','鷲津・新所原・新居町。待ち合わせた駅前と線路沿いをたどります。','町並み、公共施設、浜辺。平成に記録された地域の風景。','戦後から平成へ。市街地や田畑、海岸・湖岸の移り変わりを上空から見比べます。','撮影年が分からない写真。公開資料の来歴と、確かめられた場所を記録します。'];

function colorFeature(colors) {
  if (!colors.length) return '';
  const picks=['shinjohara-1989','washizu-2008','araimachi-2008'].map(id=>colors.find(p=>p.id===id)).filter(Boolean);
  const lead=picks[0]||colors[0];
  const side=picks.slice(1);
  return `<section class="color-feature" aria-labelledby="color-feature-heading">
    <div class="color-feature-head">
      <h2 id="color-feature-heading">${colorTitle}</h2>
      <a class="ink-button" href="${colorUrl}">カラー写真 ${colors.length}点を見る </a>
    </div>
    <div class="color-feature-body${side.length?' has-side':''}">
      <article class="color-feature-lead">
        <a class="plate" href="${href(lead)}">${img(lead,true)}</a>
        <p class="small-meta">${esc(lead.dateLabel)}　／　${esc(lead.place)}</p>
        <h3><a href="${href(lead)}">${esc(lead.title)}</a></h3>
        <small>${esc(lead.credit)}</small>
      </article>
      ${side.length?`<div class="color-feature-side">${side.map(card).join('')}</div>`:''}
    </div>
  </section>`;
}

const relatedReading = {
  "ndl-arai-sekisho-1914": {
    "slug": "arai-sekisho",
    "title": "新居関所の歴史と見学案内"
  },
  "ndl-arai-1918": {
    "slug": "arai-shuku",
    "title": "新居宿の歴史と町歩き"
  },
  "ndl-shirasuka-1918": {
    "slug": "shirasuka-shuku",
    "title": "白須賀宿の歴史と町歩き"
  },
  "ndl-honkoji-1914": {
    "slug": "honkouji",
    "title": "本興寺の歴史と拝観案内"
  },
  "myoryuji-1933": {
    "slug": "utsuyama-myoryuji",
    "title": "宇津山・妙立寺の歴史"
  },
  "commons-ec4d74e23189": {"slug":"hamanako-imagire","title":"浜名湖と今切口の見どころ"},
  "commons-ef48cf33394e": {"slug":"kaikokan","title":"海湖館と新居弁天の利用案内"},
  "arai-takaraya-waterfront-glass-plate": {"slug":"arai-shuku","title":"新居宿のまち歩き"},
  "arai-fishing-huts-1935": {"slug":"kosai-food","title":"浜名湖・遠州灘の食と漁業"},
  "ndl-honkoji-hall-1941": {"slug":"honkouji","title":"本興寺の見どころと拝観案内"},
  "shizulib-shirasuka-road-1930": {"slug":"shirasuka-shuku","title":"白須賀宿と潮見坂を歩く"},
  "commons-536e43e46ebb": {"slug":"shiomizaka","title":"道の駅潮見坂への行き方"},
  "kosai-gsi-464056": {"slug":"hamana-uchiyama","title":"浜名・内山・中之郷を歩く"},
  "kosai-gsi-703682": {"slug":"chibata","title":"知波田・神座の散策案内"},
  "shinjohara-1989": {
    "slug": "tenhama",
    "title": "天浜線で訪ねる湖西のまち"
  }
};
const linkedPhotoGroups = [
  ["/discover/utsuyama-myoryuji/","妙立寺と宇津山城跡を訪ねる",["myoryuji-1933","commons-d3ebc9079d8d"]],
  ["/discover/tenhama/","天浜線の駅と、沿線の立ち寄り先",["shinjohara-1989","shinjohara-2017-01","shinjohara-2017-02","shinjohara-th2103-2013","chibata-2013","chibata-platform-2013","chibata-2009","chibata-2006","chibata-platform-2006","chibata-train-2013","omori-2009","omori-train-2013","asumomae-2009-01","asumomae-2009-02","commons-fd33040e01af","commons-a136cf456007","commons-1b9fe359b410","commons-b70a65e911a1","commons-ff49af222837","commons-17b58981e99b","commons-e7d1b3ea853e","commons-5e84973baa81"]],
  ["/life/start-living/public-transit/","湖西の今の鉄道・バスの使い方",["washizu-2008","washizu-2014-01","washizu-2014-02","washizu-2014-03","washizu-rain-2014","araimachi-2008","araimachi-platform-2008","araimachi-train-2006","commons-724cd24f1c2f","commons-912dc86ff174","commons-ad97bdddd4f3","commons-6fcbdd51c10d","commons-b7945dad8d07","commons-31072815755a","commons-efea3332563f","shizulib-washizu-station-taisho"]],
  ["/discover/chibata/","知波田と神座の歴史案内",["chibata-platform-2006","chibata-train-2013"]],
  ["/discover/shirasuka-shuku/","白須賀宿と潮見坂の現地案内",["shirasuka-coast-2015","shizuoka-mizube-shirasuka","commons-15cab21f33ea","commons-536e43e46ebb","commons-3a5a5ce1ad59","commons-e4ea0badcfc3","flickr-40517529550","flickr-40517530430","flickr-2827172546"]],
  ["/discover/shiomizaka/","道の駅潮見坂の立ち寄り方",["shirasuka-coast-2015"]],
  ["/discover/kosai-mountains/","湖西連峰の入口・コース選び",["shinjohara-view-2016","commons-ad1d6437323b","commons-4f462f7e4032","commons-811af7c66f1c","commons-4a39aa612075"]],
  ["/life/play-out/visit-library/","中央図書館の開館・利用方法",["library-2012","library-2017","library-books-2017","commons-fb7cdc0e9827","commons-88ff04a19ab8"]],
  ["/life/education/study-facilities/","図書館での学習場所と利用ルール",["library-books-2017","commons-fb7cdc0e9827","commons-88ff04a19ab8"]],
  ["/discover/arai-sekisho/","新居関所・史料館の見学案内",["arai-sekisho-2012","arai-sekisho-2016","arai-sekisho-interior-2016","arai-sekisho-entrance-2016","commons-3162dbcd9bb5","commons-069445586e06","commons-d18a65960d09","ndl-arai-sekisho-1914","shizulib-arai-sekisho-roof-1921","ndl-arai-pines-1911","ndl-arai-sekisho-front-1941","shizulib-arai-sekisho-street"]],
  ["/discover/kosai-old-photos/","湖西の空中写真と現地の地図を見比べる方法",["kosai-gsi-275664","kosai-gsi-2026061","kosai-gsi-391571","kosai-gsi-770737","kosai-gsi-703684","kosai-gsi-18450","kosai-gsi-278047","kosai-gsi-822508","kosai-gsi-429644","kosai-gsi-703113","kosai-gsi-749114","kosai-gsi-21254","kosai-gsi-279835","kosai-gsi-813328","kosai-gsi-426201","kosai-gsi-771319","kosai-gsi-1636079","kosai-gsi-706563","kosai-gsi-714107","kosai-gsi-257511","kosai-gsi-623165","kosai-gsi-655943","kosai-gsi-657303","kosai-gsi-246325","kosai-gsi-464065","kosai-gsi-244822","kosai-gsi-1636179","kosai-gsi-1636073"]],
  ["/discover/chibata/","知波田・神座周辺の歴史とまち歩き",["kosai-gsi-9275","kosai-gsi-275663","kosai-gsi-821290","kosai-gsi-390882","kosai-gsi-690083","kosai-gsi-703682","kosai-gsi-273343","kosai-gsi-273341","kosai-gsi-703077","kosai-gsi-757244","kosai-gsi-1635880"]],
  ["/discover/arai-shuku/","新居のまち歩きと歴史",["kosai-gsi-464056","kosai-gsi-464082","kosai-gsi-464189","kosai-gsi-464125","kosai-gsi-464071","kosai-gsi-464153","kosai-gsi-464142","kosai-gsi-464115","kosai-gsi-464107","kosai-gsi-464067","kosai-gsi-464163","kosai-gsi-464159","commons-ef48cf33394e"]],
  ["/discover/kosai-old-photos/","新所原・岡崎周辺の写真と地図の調べ方",["kosai-gsi-18449","kosai-gsi-277619","kosai-gsi-813319","kosai-gsi-685616","kosai-gsi-771317","kosai-gsi-749629","kosai-gsi-255181","kosai-gsi-269216","kosai-gsi-244820","kosai-gsi-749632"]],
  ["/discover/shirasuka-shuku/","白須賀・境宿の地形とまち歩き",["kosai-gsi-20760","kosai-gsi-279324","kosai-gsi-2026326","kosai-gsi-687160","kosai-gsi-96503","kosai-gsi-1636381","kosai-gsi-295573","kosai-gsi-301820","kosai-gsi-687159","kosai-gsi-245925","kosai-gsi-751218","kosai-gsi-752883"]],
  ["/discover/hamanako-imagire/","浜名湖と今切口の地形・水辺の案内",["commons-9fb57c7cd8f2","commons-206ede37200a","commons-ba1f28661778","commons-93a2cdbdb8e6","commons-4bdc0d95bed2","commons-2fb3020fba61","commons-34469ec2270c","commons-bb5a37d2b028"]],
  ["/discover/kaikokan/","海湖館・新居弁天の水辺の訪ね方",["commons-9fb57c7cd8f2","commons-206ede37200a","commons-93a2cdbdb8e6","commons-ef48cf33394e","shizulib-matsuyama-visitors"]],
  ["/discover/honkouji/","本興寺の建物・庭の見どころと拝観案内",["commons-b3e8756d2bf6","commons-882e78e68343","commons-255a5f7c1c2b","commons-57c205e274f4","ndl-honkoji-1914","ndl-honkoji-hall-1941","shizulib-honkoji-garden-people"]],
  ["/discover/arai-shuku/","旧東海道・新居宿のまち歩き",["commons-1e7ec3d5609a","shizulib-izumicho-street-1913","shizulib-arai-ferry-1913","shizulib-izumicho-daily-1913","shizulib-arai-ferry-point-1913","arai-takaraya-waterfront-glass-plate"]],
  ["/discover/kinokuniya/","旅籠を残す紀伊国屋資料館の案内",["commons-1e7ec3d5609a","arai-takaraya-waterfront-glass-plate"]],
  ["/life/play-out/parking-access/","湖西を訪ねる前の交通と駐車場の確認",["commons-34469ec2270c","commons-bb5a37d2b028","commons-f0e916a26c98","commons-edb0333b98db"]],
  ["/discover/shiomizaka/","道の駅潮見坂へのアクセスと立ち寄り方",["commons-536e43e46ebb","flickr-40517530430","flickr-2827172546","flickr-2888644455","commons-1da2e1c3a627"]],
  ["/discover/hamana-uchiyama/","浜名・内山・中之郷の地域案内",["kosai-gsi-464121","kosai-gsi-1636384"]],
  ["/discover/hamanako-imagire/","浜名湖と今切口を歩く",["commons-ef48cf33394e","commons-8dcf80a46256"]],
  ["/discover/komatsuro/","新居宿・小松楼の建築とまち歩き",["shizulib-izumicho-street-1913","shizulib-izumicho-daily-1913","arai-izumicho-2015"]],
  ["/discover/kosai-food/","浜名湖の漁業と湖西の食文化",["ndl-hamanako-kakome-fishing-1930","ndl-washizu-pier-1930","commons-8dcf80a46256","arai-fishing-huts-1935"]],
  ["/life/start-living/city-hall-branches/","現在の市役所・支所と手続き窓口",["cityhall-2008","commons-0362c5382030","commons-43458dc158d4"]],
  ["/life/play-out/sports-facilities/","アメニティプラザなどのスポーツ施設予約",["commons-1fad50513e8b"]],
  ["/life/play-out/swimming-pools/","アメニティプラザのプール利用案内",["commons-1fad50513e8b"]],
  ["/life/health-medical/find-hospitals/","市立湖西病院などの医療機関の確認先",["commons-103548e48356"]],
  ["/life/play-out/cultural-facilities/","湖西の文化施設の案内",["commons-9ed1fda325ae"]],
  ["/discover/hamana-uchiyama/","日ヶ崎周辺の浜名・内山・中之郷を訪ねる",["shizuoka-mizube-higasaki"]],
  ["/life/play-out/find-parks/","湖西の公園を行き先から探す",["shizuoka-mizube-higasaki"]],
  ["/discover/sakichi-toyoda/","豊田佐吉記念館の見学と発明の歴史",["commons-78d9a0f60c4e","commons-2544e130fd79"]],
  ["/discover/arai-temples/","新居の寺社と火防の信仰をたどる",["commons-a8a87bae3425","flickr-25678860421"]],
  ["/discover/kosai-festivals/","新居の手筒花火など湖西の祭りを読む",["flickr-25678860421"]],
  ["/discover/arai-shuku/","新居宿のまち歩き",["flickr-25678860421"]],
  ["/discover/arai-shuku/","新居宿の町並みと街道の案内",["commons-c6be73b2839f","shizulib-arai-waterfront-1930","arai-izumicho-2015","shizulib-arai-panorama-taisho","ndl-arai-anzai-site-1941","flickr-19031596254","flickr-19471375780","commons-04728399555e","commons-169ab80d215f"]],
  ["/discover/nakane-gardens/","新居の庭園・浜名川周辺の見どころ",["commons-04728399555e","flickr-1215265680"]],
  ["/discover/kosai-old-photos/","鷲津や周辺地区の郷土資料を探す方法",["ndl-miyazaki-workers-1912","ndl-miyazaki-lakeside-1912","ndl-kizu-silk-office-1912","ndl-okazaki-silk-exterior-1912","ndl-okazaki-silk-interior-1912","shizulib-kawai-lakeside","shizulib-kawai-interior","shizulib-washizu-panorama-taisho"]],
  ["/life/start-living/public-transit/","現在の鉄道・バスの利用案内",["arai-bus-2002","commons-e6d585613781","commons-b9edc6eafb0a"]],
  ["/discover/hamanako-imagire/","今切口・浜名湖西岸の地形と見どころ",["commons-ec4d74e23189","shizulib-gentayama-view-taisho"]],
  ["/discover/shirasuka-culture/","白須賀の町に伝わる学問と文化",["ndl-shirasuka-silk-office-1912","ndl-shirasuka-1918","shizulib-shirasuka-road-1930"]],
  ["/discover/shirasuka-shuku/","白須賀宿と潮見坂のまち歩き",["shizulib-shirasuka-road-1930"]],
];
const archiveGuideLinks = new Map();
for (const [path,label,ids] of linkedPhotoGroups) {
  for (const id of ids) {
    if (!archiveGuideLinks.has(id)) archiveGuideLinks.set(id,[]);
    archiveGuideLinks.get(id).push([path,label]);
  }
}

function historyReading(photo) {
  let heading = '湖西ライフハックで今の湖西を調べる';
  let links = [
    ['/discover/','観光・歴史・まち歩きの案内'],
    ['/#current-information','休館・受付期限などの最新情報'],
    ['/','湖西市の手続き・相談先を探す']
  ];
  if (photo) {
    heading = '写真の場所・背景を知る';
    const original = relatedReading[photo.id];
    links = original ? [['/discover/'+original.slug+'/',original.title]] : [];
    for (const link of archiveGuideLinks.get(photo.id) || []) {
      if (!links.some(([path])=>path===link[0])) links.push(link);
    }
    if (!links.length) return '';
  }
  return `<aside class="library-note history-reading" aria-label="湖西ライフハックへの案内"><h2>${heading}</h2>${readingList(links)}</aside>`;
}

export function home(all) {
  const hero=all.find(p=>p.id==='shinjohara-1989')||all[0];
  const byId=new Map(all.map(p=>[p.id,p]));
  const items=[{path:stationPath,label:'湖西の駅と鉄道',cover:'shinjohara-1989'},...Object.entries(topics).map(([path,item])=>({path,...item,cover:item.groups?.flatMap(g=>g[2])[0]}))].map(item=>({...item,photo:byId.get(item.cover)}));
  return layout('湖西懐かし写真館｜湖西市・旧新居町の昔の写真','/',photoFront({city:'kosai',area:'湖西・新居',hero,all,items,image:img,extra:historyReading()+sharePanel('/',site,'この写真館を共有')}),{image:media(hero,(hero.sizes||[480]).includes(1280)?1280:hero.sizes.at(-1))});
}
function norm(s) {return String(s||'').normalize('NFKC').toLowerCase();}
function tokens(q) {return norm(q).trim().split(/\s+/).filter(Boolean);}
function options(label,rows,key,current) {
  const vals=[...new Set(rows.map(p=>p[key]).filter(Boolean))];
  return `<label>${label}<select name="${key}"><option value="">すべて</option>${vals.map(v=>`<option ${v===current?'selected':''} value="${esc(v)}">${esc(v)}</option>`).join('')}</select></label>`;
}
function keywordField(q) {
  return `<label>キーワード<input type="search" name="q" value="${esc(q)}" placeholder="地名・駅名など"></label>`;
}
function filters(url,rows,fields) {
  const params=url.searchParams;
  return `<form class="filters" method="get">${keywordField(params.get('q'))}${fields.map(([key,label])=>options(label,rows,key,params.get(key))).join('')}<button>絞り込む</button><a href="${url.pathname}">条件を解除</a></form>`;
}
function albumFilters(params,rows,fields,color) {
  return `<form class="filters album-filters" method="get" action="/photos/" role="search" aria-labelledby="photo-filter-heading">
    <h2 id="photo-filter-heading">写真を絞り込む</h2>
    ${color?'<input type="hidden" name="series" value="color">':''}
    ${params.get('added')?`<input type="hidden" name="added" value="${esc(params.get('added'))}">`:''}
    ${params.get('batch')?`<input type="hidden" name="batch" value="${esc(params.get('batch'))}">`:''}
    ${keywordField(params.get('q'))}
    <div class="album-filter-options">
      ${fields.map(([key,label])=>options(label,rows,key,params.get(key))).join('')}
    </div>
    <div class="filter-actions"><button type="submit">この条件で探す</button><a href="${color?colorUrl:'/photos/'}">条件を解除</a></div>
  </form>`;
}
function albumPagination(params,page,pages) {
  if (pages<2) return '';
  const pageHref = number => {
    const query=new URLSearchParams(params);
    query.set('page',number);
    return `?${esc(query.toString())}`;
  };
  const visiblePages=[...new Set([1,page-1,page,page+1,pages])]
    .filter(number=>number>=1&&number<=pages).sort((a,b)=>a-b);
  const links=visiblePages.map((number,i)=>{
    const gap=number-visiblePages[i-1]>1?'<span class="page-gap" aria-hidden="true">…</span>':'';
    return gap+(number===page
      ? `<b aria-current="page" aria-label="${number}ページ目">${number}</b>`
      : `<a href="${pageHref(number)}" aria-label="${number}ページ目">${number}</a>`);
  }).join('');
  return `<nav class="album-pagination" aria-label="写真一覧のページ">
    <div class="page-links">${links}</div>
    <div class="pagination-actions">
      ${page>1?`<a class="page-previous" rel="prev" href="${pageHref(page-1)}">← 前のページ</a>`:''}
      ${page<pages?`<a class="ink-button page-next" rel="next" href="${pageHref(page+1)}">次のページ</a>`:''}
    </div>
  </nav>`;
}
function match(r,fields,params,text) {
  return fields.every(([key])=>!params.get(key)||params.get(key)===r[key])&&tokens(params.get('q')).every(k=>norm(text).includes(k));
}
export function listing(all,url) {
  const fields=[['collection','アルバム'],['era','資料の時代'],['theme','テーマ']];
  const params=url.searchParams;
  const color=params.get('series')==='color';
  const title=color?colorTitle:(params.get('added')||params.get('batch'))?'新たに収蔵した写真':'写真を探す';
  const rows=color?all.filter(p=>p.colorPeriod):all;
  const set=rows.filter(p=>(!params.get('added')||p.addedOn===params.get('added'))&&(!params.get('batch')||p.addedBatch===params.get('batch'))&&match(p,fields,params,[p.title,p.place,p.caption,p.dateLabel,p.era,p.theme,p.credit,p.collection,p.id].join(' ')));
  const size=24, pages=Math.max(1,Math.ceil(set.length/size));
  const page=Math.min(pages,Math.max(1,Math.floor(Number(params.get('page')))||1));
  const start=(page-1)*size;
  const pagePhotos=set.slice(start,start+size);
  const filtered=color||['q','collection','era','theme','added','batch'].some(key=>params.get(key));
  const path=!filtered&&page>1?'/photos/?page='+page:'/photos/';
  const pageTitle=filtered?title:'湖西市の昔の写真一覧'+(page>1?'（'+page+'ページ目）':'');
  return layout(pageTitle,path,`<div class="wrap page-inner album-listing">
    ${pathNav(title)}
    <h1>${title}</h1>
    ${color?'<p class="page-lead">昭和のカラー空中写真から、平成の駅前や町並みまで。地上写真と空中写真はテーマの選択で絞り込めます。各写真で撮影時期、出典、利用条件を確認できます。</p>':''}
    <a class="more album-series-link" href="${color?'/photos/':colorUrl}">${color?'すべての時代の写真へ':colorTitle}</a>
    ${!filtered&&page===1?`<nav class="browse-index" aria-label="写真の特集"><div><h2>特集から探す</h2><p>${topicLinks()}</p></div></nav>`:''}
    ${albumFilters(params,rows,fields,color)}
    <section class="album-results" aria-labelledby="photo-results-heading">
      <div class="album-results-head">
        <h2 id="photo-results-heading">写真一覧</h2>
        <p><strong>${set.length}点</strong>${set.length?`<span>${start+1}〜${start+pagePhotos.length}点を表示</span>`:''}</p>
      </div>
      ${set.length?`<div class="exhibit-grid">${pagePhotos.map(card).join('')}</div>`:'<p class="album-empty">該当する写真はありません。地名を短くするか、絞り込みを解除してください。</p>'}
      ${albumPagination(params,page,pages)}
    </section>
  </div>`);
}

function photoNavigation(siblings,index,p) {
  const jump = (photo,direction,label) => photo?`<a class="photo-jump photo-jump-${direction}" href="${href(photo)}" rel="${direction}"><span>${label}</span><strong>${esc(photo.title)}</strong></a>`:'';
  const next=index>=0?siblings[index+1]:null;
  const previous=index>0?siblings[index-1]:null;
  return `<nav class="next-photo" aria-label="同じアルバムの写真">
    <div class="photo-nav-head">
      <p>${esc(p.collection||'市民寄稿')}${index>=0?`<span>${index+1} / ${siblings.length}点</span>`:''}</p>
      ${p.colorPeriod?`<a class="more" href="${colorUrl}">カラー写真一覧へ</a>`:allLink}
    </div>
    ${previous||next?`<div class="photo-neighbors">${jump(previous,'prev','← 前の写真')}${jump(next,'next','次の写真')}</div>`:''}
  </nav>`;
}
export function detail(all,p) {
  const siblings=all.filter(x=>x.collection===p.collection),i=siblings.findIndex(x=>x.id===p.id);
  const strongest=media(p,p.sizes.at(-1));
  const topic=topicForPhoto(p);
  return layout(p.title,href(p),`<article class="wrap page-inner single">
    ${pathNav(p.collection||'市民寄稿')}
    <h1>${esc(p.title)}</h1>
    <div class="photo-title-meta"><p class="small-meta">${esc(p.dateLabel)}　／　${esc(p.place)}</p><a class="more" href="#source">出典・利用条件へ</a></div>
    <figure class="single-plate"><a href="${strongest}" aria-label="${esc(p.title)}を原寸で開く">${img(p,true,true)}</a><figcaption><span>${esc(p.credit)}</span><a href="${strongest}">画像を大きく見る</a></figcaption></figure>
    ${sharePanel(href(p),p.title,'この写真を共有')}
    ${photoNavigation(siblings,i,p)}
    <div class="photo-record">
      <div class="photo-story"><h2>この写真について</h2><p>${esc(p.caption)}</p>${p.memory?'<p>'+esc(p.memory)+'</p>':''}<p><a href="/contact/?photo=${encodeURIComponent(p.id)}">この写真について伝える</a></p></div>
      <section class="photo-source" aria-labelledby="photo-source-heading">
        <h2 id="photo-source-heading">出典・利用条件</h2>
        <dl id="source"><dt>場所・年代</dt><dd>${esc(p.place)} ／ ${esc(p.dateLabel)} ${esc(p.dateEvidence)}</dd><dt>出典・撮影者・提供者</dt><dd>${esc(p.credit)} ${p.source?'<a href="'+esc(p.source)+'">原資料</a>':''}</dd>${p.sourceTitle?'<dt>原作品名</dt><dd>'+esc(p.sourceTitle)+'</dd>':''}<dt>利用条件・加工</dt><dd>${p.licenseUrl?'<a href="'+esc(p.licenseUrl)+'">'+esc(p.license)+'</a>':esc(p.license||'提供者の許諾による掲載')}。${esc(p.change)} ${p.licenseUrl?.includes('/by-sa/')?'掲載画像にも、上記と同じ表示・継承ライセンスを適用します。':''} ${p.evidence?'<a href="'+esc(p.evidence)+'">掲載根拠</a>':''}</dd><dt>写真番号</dt><dd>${esc(p.id)}</dd></dl>
      </section>
    </div>
    ${topic?`<p><a class="more" href="${topic}">${esc(topics[topic].title)}をもっと見る</a></p>`:''}
    ${historyReading(p)}
    ${consultation('photo')}
    <p class="photo-maker small-meta">湖西懐かし写真館の作成者　<a href="/creator/">大石浩之について</a></p>
  </article>`,{description:photoDescription(p),image:photoImage(p,true),imageAlt:p.alt||p.title,script:imageMetadata(p)});
}
export function feature(all) {
 const stations=['新所原','鷲津','新居町','知波田','大森','アスモ前'];
 const cover=all.find(photo=>photo.id==='shinjohara-1989');
 const stationDescription='平成元年の新所原駅旧駅舎、2008年の鷲津駅・新居町駅、天竜浜名湖鉄道の知波田・大森・アスモ前。湖西市の駅舎と駅前を、撮影年と出典が分かる写真でたどります。';
 return layout('新所原・鷲津・新居町など湖西の昔の駅写真',stationPath,`<div class="wrap page-inner">${pathNav('駅前のアルバム')}<span class="red-tag">通学も、帰省も、この駅から。</span><h1>湖西の駅前アルバム｜新所原・鷲津・新居町</h1><p class="page-lead">平成元年の新所原駅旧駅舎から、鷲津・新居町の駅前、天竜浜名湖鉄道の小さな駅まで。写真に写る駅の名前と年代から、思い出をたどります。</p>${stations.map(name=>{const rows=all.filter(p=>p.collection==='駅と鉄道の記憶'&&(p.title+p.place).includes(name)).sort((a,b)=>a.year-b.year);return rows.length?section(name+'駅の記録','',`<div class="exhibit-grid">${rows.map(card).join('')}</div>`):''}).join('')}<section class="contribute-note"><h2>あなたのアルバムに、昔の駅前はありませんか。</h2><p>通勤の列車、待ち合わせた店、建て替わる前の駅舎。一枚から、覚えていることと一緒にお寄せください。</p><a class="ink-button" href="/okuru/">写真を寄稿・相談する</a></section><aside class="library-note"><h2>今の鉄道・バスで湖西を訪ねる</h2>${readingList([
  ['/discover/tenhama/','天浜線で訪ねる湖西のまち'],
  ['/life/start-living/public-transit/','湖西市のバス・鉄道・交通案内']
 ])}</aside>${consultation('station')}${sharePanel(stationPath,'湖西の駅前アルバム','この特集を共有')}</div>`,{description:stationDescription,image:cover&&photoImage(cover,true),imageAlt:cover&&(cover.alt||cover.title)});
}
export function library() {
 const sources=[['静岡県オープンデータ「静岡のみずべ100選」','白須賀海岸と浜名川・日ヶ崎地区親水公園。画像ファイルに付されたCC BYの表示と、県の利用規約を確認して掲載しています。撮影年は分からないため、公開年と区別しています。','https://opendata.pref.shizuoka.jp/dataset/fuji-160.html'],['湖西市「湖西市のあゆみ」','市制施行の祝賀アーチがある昭和47年の鷲津の街角や、二俣線などを掲載した公式の記録です。市の掲載写真は当館へ転載せず、原ページへご案内します。','https://www.city.kosai.shizuoka.jp/shiseijoho/shinoshokai/3187.html'],['国立国会図書館「錦絵と写真でめぐる日本の名所」','大正7年刊の写真帖に収められた新居・白須賀。撮影年と刊行年を区別し、原資料と公開区分を各写真ページに記載しています。','https://www.ndl.go.jp/landmarks/'],['国土地理院「地図・空中写真閲覧サービス」','戦後から平成までの湖西・新居周辺の空中写真。撮影年月日と原版番号を確認し、同じ写真を重複収録しないよう地域と時代で整理しています。','https://service.gsi.go.jp/map-photos/'],['Wikimedia Commons','撮影者が公開ライセンスで提供した駅や町並みの写真。一枚ごとに作者・日付・利用条件・原画像へのリンクを掲載しています。','https://commons.wikimedia.org/wiki/Category:Kosai,_Shizuoka']];
 return layout('写真の出典と資料案内','/library/',`<article class="wrap page-inner">${pathNav('資料をたどる')}<h1>記憶を、資料と一緒に残す。</h1><p class="page-lead">写真に写っていること。原資料で確かめられること。まだ分からないこと。それぞれを分けて、一枚の来歴を記録します。</p><div class="book-list">${sources.map(([title,body,url])=>`<section><h2>${title}</h2><p>${body}</p><a href="${url}">原資料を見る</a></section>`).join('')}</div><h2>お手元の写真も、地域の記録に</h2><p>撮影者や年代が分からない場合は、画像を添付せず、分かることからご相談ください。</p><a class="ink-button" href="/okuru/">写真の寄稿について見る</a></article>`);
}
export function consultPage() {
 return layout('湖西の実家・空き家の相談','/consult/',`<article class="wrap page-inner">${pathNav('実家・空き家の相談')}<span class="red-tag">湖西で暮らした家の、次の一歩。</span><h1>アルバムを残す。<br>家のこれからを考える。</h1><p class="page-lead">片づけで見つけた昔の写真をきっかけに、実家のことが気になった方へ。売却を決める前から、ご家族で考えるための資料を受け取れます。</p><div class="exhibit-grid"><section><h2>売るか、残すか迷っている</h2><p>価格の目安と、家を持ち続ける場合の確認点を知り、家族で話す材料に。</p></section><section><h2>相続した家が空いている</h2><p>名義や手元の資料、建物の状態など、確認する順番を整理します。</p></section><section><h2>遠方から実家が気になる</h2><p>物件が湖西市内なら、ご家族が市外・県外に住んでいても依頼できます。</p></section></div>${consultation('consult')}<h2>申込みの前に</h2><p>実家カルテは富士ヶ丘サービス株式会社のサービスです。湖西市内の物件の市町村・町名・番地（地番）と返信先をご用意ください。写真寄稿のフォームへ不動産の住所や相談内容を入力する必要はありません。</p><p>カルテ作成や必要な確認は無料です。仲介手数料や、外部事業者へ依頼する登記・測量・解体などの費用については、<a href="https://fudosan.atawi.link/#contact-flow">不動産サイトで条件をご確認ください</a>。</p><p><a href="/okuru/">写真について寄稿・相談する</a></p></article>`);
}
