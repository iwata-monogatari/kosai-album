import {albumHeader} from './album-header.js';
import books from '../data/library.json' with {type:'json'};
export const origin = 'https://kosaialb.atawi.link';
const site = '湖西懐かし写真館';
export const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const href = p => '/photos/'+encodeURIComponent(p.id)+'/';
const searchHref = (key,value) => '/photos/?'+new URLSearchParams({[key]:value});
const desc = '新居の舟だまり、白須賀の街道、鷲津・新所原の駅前。湖西市と旧新居町の昔の写真を、地域と年代、出典からたどる写真館。写真の寄稿と実家・空き家の相談も受け付けています。';
const karteUrl = 'https://fudosan.atawi.link/?utm_source=kosaialb.atawi.link&utm_medium=referral&utm_campaign=jikka_karte';
export function consultation(position='home') {
 const link=(path,content)=>'https://fudosan.atawi.link'+path+'?utm_source=kosaialb.atawi.link&utm_medium=referral&utm_campaign=jikka_karte&utm_content='+position+'_'+content;
 return `<aside id="jikka-karte" class="karte-notice" aria-label="湖西の実家・空き家の相談"><div><span class="red-tag">思い出のある家の、これから。</span><h2>湖西の実家、売るか残すか。</h2><p>アルバムを片づけていて、家のことも気になったら。宅建士が価格の目安・確認したい点・次にすることを、無料の「実家カルテ」にまとめます。湖西市内の家は、ご家族が県外にお住まいでも依頼できます。</p><div class="consultation-actions"><a class="ink-button" href="${esc(link('/','apply'))}#apply">無料の実家カルテを依頼する</a><a href="${esc(link('/karte/sample/','sample'))}">届くレポートの見本を見る</a></div><p class="consultation-assurance">売却を決めていなくても利用できます。写真の寄稿と不動産相談は、別々に受け付けます。</p><p class="small-meta">富士ヶ丘サービス株式会社 ／ 宅地建物取引士 大石浩之<br><a href="tel:0538313308">電話で相談　0538-31-3308</a>（9〜18時／水曜・日曜は予約制）</p><a href="${esc(link('/karte/','area')+'&area='+encodeURIComponent('湖西市'))}">湖西市の実家・空き家相談を詳しく見る</a></div></aside>`;
}
const karteNotice=consultation();
const publicPages = ['/', '/photos/', '/features/kosai-station/', '/library/', '/creator/', '/about/', '/usage/', '/privacy/'];
export function layout(title,path,body,options={}) {
  const trackPage = !options.private && (publicPages.includes(path) || /^\/photos\/[\w-]+\/$/.test(path));
  const trackerTag = '';
  const karteFooter = options.private ? '' : `<a href="${esc(karteUrl+'&utm_content=footer')}">実家・空き家の相談｜ふじがおか実家カルテ</a>`;
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title===site?site:title+'｜'+site)}</title><meta name="description" content="${esc(options.description||desc)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(options.description||desc)}"><meta property="og:url" content="${origin+esc(path)}"><link rel="canonical" href="${origin+esc(path)}">${options.image?'<meta property="og:image" content="'+origin+esc(options.image)+'">':''}${options.private?'<meta name="robots" content="noindex,nofollow">':''}<link rel="icon" type="image/svg+xml" sizes="any" href="/mark.svg?v=20261119-gothic"><link rel="stylesheet" href="/style.css?v=20261119-gothic"><link rel="stylesheet" href="/album.css?v=20261121-kosai2"><link rel="stylesheet" href="/album-header.css?v=20261119-gothic">${options.script||''}${trackerTag}</head><body><a class="skip" href="#main">本文へ</a>${albumHeader({site, mark:"湖", area:"湖西・新居", theme:"kosai", links:[["/photos/", "写真を探す"], ["/features/kosai-station/", "駅前のアルバム"], ["/library/", "資料をたどる"]], consult:'/consult/', path:path})}<main id="main">${body}</main><footer class="site-foot"><div class="wrap footer-guide"><div><a class="brand" href="/">${site}</a><small>静岡県湖西市・旧新居町の地域写真アーカイブ</small></div><nav class="nav" aria-label="写真館のご案内"><a href="/creator/">大石浩之のプロフィール</a><a href="/about/">写真館について</a><a href="/usage/">写真の利用</a><a href="/privacy/">個人情報</a><a href="/contact/">お問い合わせ</a><a href="https://iwataalb.atawi.link/">磐田懐かし写真館</a><a href="https://kosai.enshu-lifehack.com/">湖西ライフハック</a>${karteFooter}</nav></div></footer></body></html>`;
}
function media(p,w) {
  return p.version?`/media/${p.id}/${p.version}/${w}`:`/archive/${p.id}-${w}.webp`;
}
function img(p,large=false,first=false) {
  const ws=p.sizes||[480],w=large?(ws.includes(1280)?1280:ws.at(-1)):ws[0];
  return `<img src="${media(p,w)}" width="${p.width||900}" height="${p.height||600}" alt="${esc(p.alt||p.title)}" ${first?'fetchpriority="high"':'loading="lazy"'}>`;
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
  "shinjohara-1989": {
    "slug": "tenhama",
    "title": "天浜線で訪ねる湖西のまち"
  }
};
function historyReading(photo) {
 const article=photo&&relatedReading[photo.id];
 return `<aside class="library-note history-reading"><h2>写真から、まちの歴史と今へ。</h2><p>${article?'写真に写る場所の背景や、今訪ねるときの情報は、湖西ライフハックの読み物でも紹介しています。':'写真で気になった新居・白須賀の宿場、寺社、浜名湖の風景。湖西ライフハックで歴史や訪問前の情報を読み、今のまちを歩く手がかりにしてみませんか。'}</p><a class="more" href="https://kosai.enshu-lifehack.com/discover/${article?article.slug+'/':''}">${article?esc(article.title):'湖西の観光・歴史・地域情報を読む'}</a></aside>`;
}

export function home(all) {
  const hero=all.find(p=>p.id==='shinjohara-1989')||all[0];
  const cover=hero?`<section class="front-cover"><figure><a href="${href(hero)}">${img(hero,true,true)}</a><figcaption>${esc(hero.dateLabel)}　／　${esc(hero.place)} <a href="${href(hero)}#source">出典</a></figcaption></figure><div class="cover-note"><span class="red-tag">平成元年の、新所原から</span><h1>${hero.id==='shinjohara-1989'?'あの駅から、<br>湖西の記憶。':esc(hero.title)}</h1><p class="hero-title">${esc(hero.title)}</p><p>${esc(hero.caption)}</p><a class="ink-button" href="${href(hero)}">この一枚をひらく </a></div></section>`:'';
  const picks=['ndl-arai-1918','shinjohara-1989','arai-izumicho-2015','kosai-gsi-813328'];
  const tiles=groups.map((g,i)=>{
    const set=all.filter(p=>p.collection===g);if(!set.length)return '';
    const p=set.find(p=>p.id===picks[i])||set[0];
    return `<a class="collection" href="${esc(searchHref('collection',g))}"><div class="plate">${img(p)}</div><div class="collection-caption"><small>${set.length}点</small><h3>${g}</h3><p>${groupIntro[i]}</p></div><span class="collection-arrow" aria-hidden="true">→</span></a>`;
  }).join('');
  const colors=all.filter(p=>p.colorPeriod);
  const pickIds=['ndl-arai-1918','ndl-shirasuka-1918','myoryuji-1933'];
  const highlights=pickIds.map(id=>all.find(p=>p.id===id)).filter(Boolean);
  const batch=all.map(p=>p.addedBatch).filter(Boolean).sort().at(-1);
  const additions=all.filter(p=>batch?p.addedBatch===batch:p.addedOn==='2026-11-21');
  const additionsUrl=batch?searchHref('batch',batch):searchHref('added','2026-11-21');
  const newPicks=[];
  for(const type of ['古写真帖','駅と鉄道の記憶','平成の風景','空から見る湖西']) {
    const p=additions.find(p=>p.collection===type); if(p&&newPicks.length<3)newPicks.push(p);
  }
  for(const p of additions)if(newPicks.length<3&&!newPicks.includes(p))newPicks.push(p);
  const oldPhotosLink=`<a class="more" href="${esc(searchHref('collection','古写真帖'))}">古写真帖へ</a>`;
  return layout(site,'/',`<div class="wrap collection-home">
    ${cover}
    ${homeSearch(all.length)}
    ${additions.length?section('新たに収蔵した写真',`<a class="more" href="${esc(additionsUrl)}">追加した${additions.length}点を見る</a>`,`<div class="exhibit-grid">${newPicks.map(card).join('')}</div>`):''}
    ${colorFeature(colors)}
    ${karteNotice}
    ${section('資料別のアルバム',allLink,`<div class="collection-grid">${tiles}</div>`)}
    ${section('古写真帖をひらく',oldPhotosLink,`<div class="exhibit-grid memories-grid">${highlights.map(card).join('')}</div>`)}
    ${historyReading()}
    <div class="two-notes">
      <section class="library-note">
        <h2>写真の向こうにある資料</h2>
        <p>市制施行の鷲津の街角や、二俣線の記録。湖西市の公式資料と、収蔵写真の出典をたどれます。</p>
        <a class="more" href="/library/">原資料への案内を見る</a>
      </section>
      <section class="contribute-note">
        <h2>昔の湖西の写真、お持ちですか。</h2>
        <p>鷲津の店先、新居のお祭り、白須賀や入出の暮らし。紙のアルバムも一枚からご相談いただけます。</p>
        <a class="ink-button" href="/okuru/">写真を寄稿する・相談する </a>
      </section>
    </div>
    <aside class="maker-strip">
      <img src="/oishi-portrait.jpg?v=2f69e9a64c27" alt="" width="64" height="64" loading="lazy">
      <div><strong>湖西懐かし写真館の作成者　大石浩之</strong><p>住まいと介護の現場から、遠州の歴史を記録する活動へ。</p></div>
      <a href="/creator/">大石浩之を知る</a>
    </aside>
  </div>`,{image:hero&&media(hero,hero.sizes.at(-1))});
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
  return layout(title,'/photos/',`<div class="wrap page-inner album-listing">
    ${pathNav(title)}
    <h1>${title}</h1>
    ${color?'<p class="page-lead">昭和のカラー空中写真から、平成の駅前や町並みまで。地上写真と空中写真はテーマの選択で絞り込めます。各写真で撮影時期、出典、利用条件を確認できます。</p>':''}
    <a class="more album-series-link" href="${color?'/photos/':colorUrl}">${color?'すべての時代の写真へ':colorTitle}</a>
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
  return layout(p.title,href(p),`<article class="wrap page-inner single">
    ${pathNav(p.collection||'市民寄稿')}
    <h1>${esc(p.title)}</h1>
    <div class="photo-title-meta"><p class="small-meta">${esc(p.dateLabel)}　／　${esc(p.place)}</p><a class="more" href="#source">出典・利用条件へ</a></div>
    <figure class="single-plate"><a href="${strongest}" aria-label="${esc(p.title)}を原寸で開く">${img(p,true,true)}</a><figcaption><span>${esc(p.credit)}</span><a href="${strongest}">画像を大きく見る</a></figcaption></figure>
    ${photoNavigation(siblings,i,p)}
    <div class="photo-record">
      <div class="photo-story"><h2>この写真について</h2><p>${esc(p.caption)}</p>${p.memory?'<p>'+esc(p.memory)+'</p>':''}<p><a href="/contact/?photo=${encodeURIComponent(p.id)}">この写真について伝える</a></p></div>
      <section class="photo-source" aria-labelledby="photo-source-heading">
        <h2 id="photo-source-heading">出典・利用条件</h2>
        <dl id="source"><dt>場所・年代</dt><dd>${esc(p.place)} ／ ${esc(p.dateLabel)} ${esc(p.dateEvidence)}</dd><dt>出典・撮影者・提供者</dt><dd>${esc(p.credit)} ${p.source?'<a href="'+esc(p.source)+'">原資料</a>':''}</dd>${p.sourceTitle?'<dt>原作品名</dt><dd>'+esc(p.sourceTitle)+'</dd>':''}<dt>利用条件・加工</dt><dd>${p.licenseUrl?'<a href="'+esc(p.licenseUrl)+'">'+esc(p.license)+'</a>':esc(p.license||'提供者の許諾による掲載')}。${esc(p.change)} ${p.licenseUrl?.includes('/by-sa/')?'掲載画像にも、上記と同じ表示・継承ライセンスを適用します。':''} ${p.evidence?'<a href="'+esc(p.evidence)+'">掲載根拠</a>':''}</dd><dt>写真番号</dt><dd>${esc(p.id)}</dd></dl>
      </section>
    </div>
    ${relatedReading[p.id]?historyReading(p):''}
    ${consultation('photo')}
    <p class="photo-maker small-meta">湖西懐かし写真館の作成者　<a href="/creator/">大石浩之について</a></p>
  </article>`,{description:p.caption,image:strongest});
}
export function feature(all) {
 const stations=['新所原','鷲津','新居町','知波田','大森','アスモ前'];
 return layout('駅前のアルバム','/features/kosai-station/',`<div class="wrap page-inner">${pathNav('駅前のアルバム')}<span class="red-tag">通学も、帰省も、この駅から。</span><h1>湖西の駅前アルバム</h1><p class="page-lead">平成元年の新所原駅旧駅舎から、鷲津・新居町の駅前、天竜浜名湖鉄道の小さな駅まで。写真に写る駅の名前と年代から、思い出をたどります。</p>${stations.map(name=>{const rows=all.filter(p=>p.collection==='駅と鉄道の記憶'&&(p.title+p.place).includes(name)).sort((a,b)=>a.year-b.year);return rows.length?section(name+'駅の記録','',`<div class="exhibit-grid">${rows.map(card).join('')}</div>`):''}).join('')}<section class="contribute-note"><h2>あなたのアルバムに、昔の駅前はありませんか。</h2><p>通勤の列車、待ち合わせた店、建て替わる前の駅舎。一枚から、覚えていることと一緒にお寄せください。</p><a class="ink-button" href="/okuru/">写真を寄稿・相談する</a></section>${historyReading({id:'shinjohara-1989'})}${consultation('station')}</div>`);
}
export function library() {
 const sources=[['静岡県オープンデータ「静岡のみずべ100選」','白須賀海岸と浜名川・日ヶ崎地区親水公園。画像ファイルに付されたCC BYの表示と、県の利用規約を確認して掲載しています。撮影年は分からないため、公開年と区別しています。','https://opendata.pref.shizuoka.jp/dataset/fuji-160.html'],['湖西市「湖西市のあゆみ」','市制施行の祝賀アーチがある昭和47年の鷲津の街角や、二俣線などを掲載した公式の記録です。市の掲載写真は当館へ転載せず、原ページへご案内します。','https://www.city.kosai.shizuoka.jp/shiseijoho/shinoshokai/3187.html'],['国立国会図書館「錦絵と写真でめぐる日本の名所」','大正7年刊の写真帖に収められた新居・白須賀。撮影年と刊行年を区別し、原資料と公開区分を各写真ページに記載しています。','https://www.ndl.go.jp/landmarks/'],['国土地理院「地図・空中写真閲覧サービス」','戦後から平成までの湖西・新居周辺の空中写真。撮影年月日と原版番号を確認し、同じ写真を重複収録しないよう地域と時代で整理しています。','https://service.gsi.go.jp/map-photos/'],['Wikimedia Commons','撮影者が公開ライセンスで提供した駅や町並みの写真。一枚ごとに作者・日付・利用条件・原画像へのリンクを掲載しています。','https://commons.wikimedia.org/wiki/Category:Kosai,_Shizuoka']];
 return layout('写真の出典と資料案内','/library/',`<article class="wrap page-inner">${pathNav('資料をたどる')}<h1>記憶を、資料と一緒に残す。</h1><p class="page-lead">写真に写っていること。原資料で確かめられること。まだ分からないこと。それぞれを分けて、一枚の来歴を記録します。</p><div class="book-list">${sources.map(([title,body,url])=>`<section><h2>${title}</h2><p>${body}</p><a href="${url}">原資料を見る</a></section>`).join('')}</div><h2>お手元の写真も、地域の記録に</h2><p>撮影者や年代が分からない場合は、画像を添付せず、分かることからご相談ください。</p><a class="ink-button" href="/okuru/">写真の寄稿について見る</a></article>`);
}
export function consultPage() {
 return layout('湖西の実家・空き家の相談','/consult/',`<article class="wrap page-inner">${pathNav('実家・空き家の相談')}<span class="red-tag">湖西で暮らした家の、次の一歩。</span><h1>アルバムを残す。<br>家のこれからを考える。</h1><p class="page-lead">片づけで見つけた昔の写真をきっかけに、実家のことが気になった方へ。売却を決める前から、ご家族で考えるための資料を受け取れます。</p><div class="exhibit-grid"><section><h2>売るか、残すか迷っている</h2><p>価格の目安と、家を持ち続ける場合の確認点を知り、家族で話す材料に。</p></section><section><h2>相続した家が空いている</h2><p>名義や手元の資料、建物の状態など、確認する順番を整理します。</p></section><section><h2>遠方から実家が気になる</h2><p>物件が湖西市内なら、ご家族が市外・県外に住んでいても依頼できます。</p></section></div>${consultation('consult')}<h2>申込みの前に</h2><p>実家カルテは富士ヶ丘サービス株式会社のサービスです。湖西市内の物件の市町村・町名・番地（地番）と返信先をご用意ください。写真寄稿のフォームへ不動産の住所や相談内容を入力する必要はありません。</p><p>カルテ作成や必要な確認は無料です。仲介手数料や、外部事業者へ依頼する登記・測量・解体などの費用については、<a href="https://fudosan.atawi.link/#contact-flow">不動産サイトで条件をご確認ください</a>。</p><p><a href="/okuru/">写真について寄稿・相談する</a></p></article>`);
}
