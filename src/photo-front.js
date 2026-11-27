const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photoHref = p => '/photos/' + encodeURIComponent(p.id) + '/';
const date = p => p.dateLabel || p.date || '撮影年不詳';

export function photoBanners(items, image) {
  return `<div class="pf-banners">${items.filter(item => item.photo).map(item => `<article class="pf-banner">
    <a href="${e(item.path)}"><div class="pf-banner-image">${image(item.photo, true)}</div><div class="pf-banner-title"><span>${e(item.label)}</span><small>写真を見る</small></div></a>
    <div class="pf-caption"><span>${e(date(item.photo))}</span><a href="${photoHref(item.photo)}#source">表紙写真・出典</a></div>
  </article>`).join('')}</div>`;
}

export function photoFront({city, area, hero, all, items, image, library='/library/', portrait='/oishi-portrait.jpg', extra=''}) {
  const collections = [...new Set(all.map(p => p.collection).filter(Boolean))];
  return `<div class="pf-home" data-photo-front="20261127" data-city="${e(city)}">
    <section class="pf-hero">
      <figure><a href="${photoHref(hero)}">${image(hero, true, true)}</a><figcaption>${e(date(hero))}<a href="${photoHref(hero)}#source">写真の出典</a></figcaption></figure>
      <div class="pf-hero-note"><h1>${e(hero.title)}</h1><a class="pf-button" href="${photoHref(hero)}">この写真を見る</a></div>
    </section>
    <form class="pf-search" action="/photos/" method="get" role="search"><label for="pf-query">写真を探す</label><div><input id="pf-query" type="search" name="q" placeholder="地名・駅名・学校名"><button type="submit">検索</button></div><a href="/photos/">収蔵写真 ${all.length.toLocaleString('ja-JP')}点</a></form>
    <section class="pf-themes" id="photo-themes"><div class="pf-heading"><h2>場所・テーマから選ぶ</h2></div>${photoBanners(items,image)}</section>
    <details class="pf-more"><summary>年代・資料・関連情報</summary><div class="pf-index"><nav aria-label="年代別の写真">${[...new Set(all.map(p=>p.era).filter(Boolean))].map(era=>`<a href="/photos/?era=${encodeURIComponent(era)}">${e(era)}</a>`).join('')}</nav><nav aria-label="資料別の写真">${collections.map(name=>`<a href="/photos/?collection=${encodeURIComponent(name)}">${e(name)}</a>`).join('')}</nav>${extra}</div></details>
    <section class="pf-bottom"><a class="pf-invite" href="/okuru/"><h2>写真を寄稿する</h2><p>紙の写真・ネガ・アルバムもご相談ください。</p><strong>寄稿の方法を見る</strong></a></section>
  </div>`;
}
