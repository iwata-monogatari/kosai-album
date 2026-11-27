const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photoHref = p => '/photos/' + encodeURIComponent(p.id) + '/';
const date = p => p.dateLabel || p.date || '撮影年不詳';

export function photoBanners(items, image, compact = false) {
  return `<div class="pf-banners">${items.filter(item => item.photo).map(item => `<article class="pf-banner">
    <a href="${e(item.path)}"><div class="pf-banner-image">${image(item.photo, true)}</div><div class="pf-banner-title"><span>${e(item.label)}</span>${compact ? '' : '<small>写真を見る</small>'}</div></a>
    ${compact ? '' : `<div class="pf-caption"><span>${e(date(item.photo))}</span><a href="${photoHref(item.photo)}#source">表紙写真・出典</a></div>`}
  </article>`).join('')}</div>`;
}

export function photoFront({city, area, hero, all, items, image, library='/library/', portrait='/oishi-portrait.jpg', extra=''}) {
  const collections = [...new Set(all.map(p => p.collection).filter(Boolean))];
  return `<div class="pf-home" data-photo-front="20261127" data-city="${e(city)}">
    <section class="pf-hero">
      <a class="pf-hero-link" href="${photoHref(hero)}"><figure>${image(hero, true, true)}</figure><h1>${e(hero.title)}</h1></a>
    </section>
    <form class="pf-search" action="/photos/" method="get" role="search"><label class="pf-sr" for="pf-query">写真を探す</label><div><input id="pf-query" type="search" name="q" placeholder="地名・駅名で写真を検索"><button type="submit">検索</button></div></form>
    <section class="pf-themes" id="photo-themes"><div class="pf-heading"><h2>写真から選ぶ</h2><a href="/photos/">すべての写真</a></div>${photoBanners(items,image,true)}</section>
    <details class="pf-more pf-sources"><summary>写真の年代・出典</summary><ul><li><a href="${photoHref(hero)}#source">${e(hero.title)}</a><span>${e(date(hero))}</span></li>${items.filter(item=>item.photo).map(item=>`<li><a href="${photoHref(item.photo)}#source">${e(item.label)}</a><span>${e(date(item.photo))}</span></li>`).join('')}</ul></details>
    <details class="pf-more"><summary>年代・資料・関連情報</summary><div class="pf-index"><p>収蔵写真 ${all.length.toLocaleString('ja-JP')}点</p><nav aria-label="年代別の写真">${[...new Set(all.map(p=>p.era).filter(Boolean))].map(era=>`<a href="/photos/?era=${encodeURIComponent(era)}">${e(era)}</a>`).join('')}</nav><nav aria-label="資料別の写真">${collections.map(name=>`<a href="/photos/?collection=${encodeURIComponent(name)}">${e(name)}</a>`).join('')}</nav>${extra}</div></details>
    <section class="pf-bottom"><a class="pf-invite" href="/okuru/"><h2>お持ちの写真を送る</h2></a></section>
  </div>`;
}
