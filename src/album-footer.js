const albumCities = {
  fukuroi: '袋井', morimachi: '森町', kakegawa: '掛川', hamamatsu: '浜松',
  kikugawa: '菊川', omaezaki: '御前崎', kosai: '湖西'
};

const footerStyle = `<style>
.album-promos{display:block;box-sizing:border-box;width:min(100%,76rem);margin:0 auto;padding:1.5rem clamp(1rem,3vw,2.5rem);font-family:system-ui,sans-serif;text-align:left;line-height:1.55;letter-spacing:normal}
.album-promos .ap-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:.75rem;margin:0;padding:0}
.album-promos .ap-card{display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;box-sizing:border-box;min-width:0;min-height:9rem;position:relative;overflow:hidden;gap:.35rem;padding:.95rem 1.1rem;border:1px solid #ffffff30;border-radius:.45rem;text-decoration:none;color:#fff;background:#174f46}
.album-promos .ap-firm{background:#203e54}.album-promos .ap-author{background:#673d30;padding-right:4.6rem}
.album-promos .ap-title{font-size:clamp(1.12rem,1.6vw,1.35rem);font-weight:750;line-height:1.38;color:inherit}
.album-promos .ap-label,.album-promos .ap-cta{font-size:.875rem;line-height:1.5;color:inherit}.album-promos .ap-cta{text-decoration:underline;text-underline-offset:.2em}
.album-promos .ap-portrait{position:absolute;right:.75rem;top:50%;transform:translateY(-50%);border-radius:.25rem;width:3.35rem;height:4.45rem;object-fit:cover;object-position:50% 25%}
.album-promos .ap-ad{background:#fffaf0;color:#322e26;border:1px solid #bba983}
.album-promos .ap-ad img{display:block;max-width:100%;max-height:7rem;object-fit:contain}
.album-promos .ap-enquiry{display:block;margin:.75rem 0 0;padding:.55rem .85rem;border:1px solid #b9aa94;border-radius:.35rem;background:#fffaf2;color:#332d23;font-size:1rem}
.album-promos .ap-enquiry summary{display:list-item;text-align:left;cursor:pointer;padding:.3rem 0;font-weight:700;color:inherit}
.album-promos .ap-enquiry p{margin:.55rem 0;color:inherit;font-size:1rem}.album-promos .ap-enquiry a{color:#164e48;text-decoration:underline;display:inline-block;padding:.35rem .5rem .35rem 0}
.album-promos a:focus-visible,.album-promos summary:focus-visible{outline:3px solid #e78c2b;outline-offset:3px}
.album-promos .ap-card:hover .ap-cta{text-decoration-thickness:2px}
</style>`;

function footerEscape(value) {
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function footerHttps(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; }
  catch { return ''; }
}

// A booked placement uses { advertiser, title, url, image? }; the image URL must use HTTPS.
function albumPromoFooter(city, placement = null) {
  const site = albumCities[city] + '懐かし写真館';
  const source = city + 'alb.atawi.link';
  function destination(url, slot) {
    const link = new URL(url);
    link.searchParams.set('utm_source', source);
    link.searchParams.set('utm_medium', 'referral');
    link.searchParams.set('utm_campaign', 'album_footer');
    link.searchParams.set('utm_content', slot);
    return footerEscape(link.href);
  }
  function banner(kind, url, label, title, action, portrait = '') {
    return `<a class="ap-card ap-${kind}" href="${destination(url, kind)}"><span class="ap-label">${label}</span><span class="ap-title">${title}</span><span class="ap-cta">${action}</span>${portrait}</a>`;
  }
  const portrait = (city === 'morimachi' ? '/images/' : '/') + 'oishi-portrait.jpg?v=2f69e9a64c27';
  const advertiserUrl = placement && footerHttps(placement.url);
  let paid = '';
  if (advertiserUrl && placement.advertiser && placement.title) {
    const image = footerHttps(placement.image);
    paid = `<a class="ap-card ap-ad" href="${footerEscape(advertiserUrl)}" rel="sponsored"><span class="ap-label">広告 ｜ ${footerEscape(placement.advertiser)}</span>${image ? '<img loading="lazy" alt="" src="' + footerEscape(image) + '">' : ''}<span class="ap-title">${footerEscape(placement.title)}</span><span class="ap-cta">広告主のサイトを見る</span></a>`;
  }
  return footerStyle + `<section class="album-promos" aria-label="住まいの相談・運営者のご案内・広告"><div class="ap-grid">
    ${banner('home','https://fudosan.atawi.link/karte/','不動産相談 ｜ 富士ヶ丘サービス','実家を売るか、残すか','ふじがおか実家カルテを見る')}
    ${banner('firm','https://www.fujigaoka-service.co.jp/','運営会社 PR ｜ 介護と不動産','富士ヶ丘サービス株式会社','会社の公式サイトを見る')}
    ${banner('author','https://oishi-hiroyuki.org/profile','写真館の作成者','大石浩之','プロフィールを読む','<img class="ap-portrait" src="'+portrait+'" width="54" height="71" loading="lazy" alt="">')}
    ${paid}
  </div><details class="ap-enquiry"><summary>${site}へのバナー広告掲載（有料）</summary>
  <p>この写真館のページ下部に、お店やサービスのバナーを掲載できます。ご希望の写真館名・掲載期間・リンク先をお知らせください。富士ヶ丘サービスが空き状況と料金をご案内します。</p>
  <p>ご用件には「${site}・バナー広告」とご記入ください。</p>
  <a href="${destination('https://oishi-hiroyuki.org/contact','ad_inquiry')}">広告掲載をフォームで相談する</a> <a href="tel:0538313308">電話で相談する（0538-31-3308）</a></details></section>`;
}

// Set this gallery's paid booking here after agreeing the placement with the advertiser.
const paidPlacement = null;
export const renderAlbumFooter = () => albumPromoFooter('kosai', paidPlacement);
